import fs from 'fs';
import path from 'path';

// HTML to Markdown converter
function htmlToMarkdown(html) {
  if (!html) return '';

  let md = html;

  // Tables
  md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (match, tableInner) => {
    let tableMd = '\n\n';
    
    // Extract thead headers
    const thMatches = [...tableInner.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)];
    if (thMatches.length > 0) {
      const headers = thMatches.map(m => cleanInline(m[1]).trim());
      tableMd += '| ' + headers.join(' | ') + ' |\n';
      tableMd += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
    }

    // Extract tbody rows
    const trMatches = [...tableInner.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    for (const tr of trMatches) {
      const tdMatches = [...tr[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];
      if (tdMatches.length > 0) {
        const cells = tdMatches.map(m => cleanInline(m[1]).trim().replace(/\n/g, ' '));
        tableMd += '| ' + cells.join(' | ') + ' |\n';
      }
    }

    return tableMd + '\n';
  });

  // Headings
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (m, c) => `\n\n## ${cleanInline(c).trim()}\n\n`);
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (m, c) => `\n\n### ${cleanInline(c).trim()}\n\n`);
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (m, c) => `\n\n#### ${cleanInline(c).trim()}\n\n`);

  // Lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (m, listContent) => {
    const items = [...listContent.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      .map(item => `- ${cleanInline(item[1]).trim()}`)
      .join('\n');
    return `\n\n${items}\n\n`;
  });

  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (m, listContent) => {
    let idx = 1;
    const items = [...listContent.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      .map(item => `${idx++}. ${cleanInline(item[1]).trim()}`)
      .join('\n');
    return `\n\n${items}\n\n`;
  });

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (m, c) => {
    return `\n\n> ${cleanInline(c).trim()}\n\n`;
  });

  // Paragraphs
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (m, c) => {
    return `\n\n${cleanInline(c).trim()}\n\n`;
  });

  // Clean remaining tags
  md = cleanInline(md);

  // Normalize newlines
  md = md.replace(/\n{3,}/g, '\n\n').trim();

  return md;
}

function cleanInline(str) {
  if (!str) return '';
  let s = str;

  // Links: <a href="url" ...>text</a> -> [text](url)
  s = s.replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (m, url, text) => {
    return `[${cleanInline(text).trim()}](${url})`;
  });

  // Strong / b
  s = s.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (m, tag, text) => {
    return `**${cleanInline(text).trim()}**`;
  });

  // Em / i
  s = s.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (m, tag, text) => {
    return `*${cleanInline(text).trim()}*`;
  });

  // Code
  s = s.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (m, text) => {
    return `\`${text}\``;
  });

  // Br
  s = s.replace(/<br\s*\/?>/gi, '\n');

  // Remove any leftover HTML tags
  s = s.replace(/<\/?[^>]+(>|$)/g, '');

  // HTML entities
  s = s.replace(/&amp;/g, '&');
  s = s.replace(/&quot;/g, '"');
  s = s.replace(/&#39;/g, "'");
  s = s.replace(/&lt;/g, '<');
  s = s.replace(/&gt;/g, '>');
  s = s.replace(/&nbsp;/g, ' ');

  return s;
}

// Category mapper for schema enum: 'seo' | 'google-ads' | 'cro'
function mapCategory(art) {
  const s = art.slug.toLowerCase();
  if (
    s.includes('taxa-de-conversao') ||
    s.includes('landing-page') ||
    s.includes('cro') ||
    s.includes('perde-cotacoes') ||
    s.includes('meu-site-nao-gera-clientes')
  ) {
    return 'cro';
  }
  if (
    s.includes('google-ads') ||
    s.includes('trafego-pago') ||
    s.includes('lgpdsolution')
  ) {
    return 'google-ads';
  }
  return 'seo';
}

function escapeYamlString(str) {
  if (!str) return '""';
  // Use JSON.stringify for safe YAML double-quoted string
  return JSON.stringify(str);
}

async function main() {
  const batchArg = process.argv.find(arg => arg.startsWith('--batch='));
  const batchNum = batchArg ? parseInt(batchArg.split('=')[1], 10) : 1;

  console.log(`Starting migration for batch ${batchNum}...`);

  // 1. Fetch sitemap to preserve exact order
  const sitemapRes = await fetch('https://nexustc.com.br/sitemap.xml');
  const sitemapXml = await sitemapRes.text();
  const sitemapSlugs = [...sitemapXml.matchAll(/<loc>https:\/\/nexustc\.com\.br\/insights\/([^<]+)<\/loc>/g)].map(m => m[1]);

  // 2. Fetch bundle with complete articles
  const jsRes = await fetch('https://nexustc.com.br/assets/index-BGkrpM1v.js');
  const js = await jsRes.text();
  const arrayStart = js.indexOf('ib=[');
  let depth = 0, inString = false, stringChar = '', escape = false, endIdx = -1;
  for (let i = arrayStart + 3; i < js.length; i++) {
    const c = js[i];
    if (escape) { escape = false; continue; }
    if (c === '\\') { escape = true; continue; }
    if (inString) {
      if (c === stringChar) inString = false;
    } else {
      if (c === '"' || c === "'" || c === '`') { inString = true; stringChar = c; }
      else if (c === '[') depth++;
      else if (c === ']') { depth--; if (depth === 0) { endIdx = i + 1; break; } }
    }
  }
  const allArticles = new Function('return ' + js.substring(arrayStart + 3, endIdx))();
  const articleMap = new Map(allArticles.map(a => [a.slug, a]));

  // 3. Exclude the original 3 pilot articles to have a deterministic list of 34
  const initial3 = [
    'seo-ou-google-ads-por-onde-comecar',
    'quanto-tempo-seo-leva-para-dar-resultado',
    'como-calcular-taxa-de-conversao-site',
  ];

  const all34Missing = sitemapSlugs.filter(slug => !initial3.includes(slug));
  console.log(`Total missing to migrate: ${all34Missing.length}`);

  // Determine slice for this batch
  let batchSlugs = [];
  if (batchNum === 1) {
    batchSlugs = all34Missing.slice(0, 10);
  } else if (batchNum === 2) {
    batchSlugs = all34Missing.slice(10, 20);
  } else if (batchNum === 3) {
    batchSlugs = all34Missing.slice(20, 30);
  } else if (batchNum === 4) {
    batchSlugs = all34Missing.slice(30);
  } else if (process.argv.includes('--all')) {
    batchSlugs = all34Missing;
  }

  console.log(`Processing ${batchSlugs.length} articles for batch ${batchNum}:`);

  const outputDir = path.join(process.cwd(), 'src/content/blog');

  const migrated = [];
  for (const slug of batchSlugs) {
    const art = articleMap.get(slug);
    if (!art) {
      console.error(`Article data not found for slug: ${slug}`);
      continue;
    }

    const title = art.h1Title || art.seoTitle;
    const description = art.metaDescription;
    const pubDate = art.publishDate;
    const category = mapCategory(art);
    const bodyMd = htmlToMarkdown(art.content.join('\n'));

    const frontmatter = [
      '---',
      `title: ${escapeYamlString(title)}`,
      `description: ${escapeYamlString(description)}`,
      `pubDate: ${pubDate}`,
      `category: "${category}"`,
      `author: "ricardo-zago"`,
      '---',
      '',
      bodyMd,
      ''
    ].join('\n');

    const filePath = path.join(outputDir, `${slug}.md`);
    fs.writeFileSync(filePath, frontmatter, 'utf8');

    migrated.push({
      slug,
      title,
      category,
      pubDate,
      length: bodyMd.length
    });
    console.log(`  ✓ Migrated: [${category}] ${slug} (${pubDate}) - "${title.substring(0, 50)}..."`);
  }

  console.log(`\nBatch ${batchNum} completed: ${migrated.length} articles created.`);
}

main().catch(console.error);
