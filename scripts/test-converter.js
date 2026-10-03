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

async function run() {
  const res = await fetch('https://nexustc.com.br/assets/index-BGkrpM1v.js');
  const js = await res.text();
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
  const parsed = new Function('return ' + js.substring(arrayStart + 3, endIdx))();

  const art = parsed.find(a => a.slug === 'como-aparecer-google-brasileiro-framingham-boston');
  const md = htmlToMarkdown(art.content.join('\n'));
  console.log('--- MARKDOWN RESULT SAMPLE (first 1500 chars) ---');
  console.log(md.substring(0, 1500));
  console.log('\n--- FIND TABLE IN MARKDOWN ---');
  const tableIdx = md.indexOf('|');
  if (tableIdx !== -1) {
    console.log(md.substring(tableIdx, tableIdx + 500));
  } else {
    console.log('No table found in markdown!');
  }
}

run().catch(console.error);
