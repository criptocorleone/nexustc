import fs from 'fs';
import path from 'path';

async function run() {
  console.log('Fetching old sitemap...');
  const res = await fetch('https://nexustc.com.br/sitemap.xml');
  const xml = await res.text();
  const oldUrls = [...xml.matchAll(/<loc>(https:\/\/nexustc\.com\.br\/insights\/[^<]+)<\/loc>/g)].map(m => m[1]);

  console.log(`Total insights URLs in old sitemap: ${oldUrls.length}`);

  // Check files in src/content/blog
  const blogDir = path.resolve('src/content/blog');
  const mdFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''));
  console.log(`Total markdown files in src/content/blog: ${mdFiles.length}`);

  // Check generated html files in dist/insights
  const distInsightsDir = path.resolve('dist/insights');
  const distDirs = fs.readdirSync(distInsightsDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== 'categoria')
    .map(d => d.name);
  console.log(`Total generated HTML folders in dist/insights: ${distDirs.length}`);

  const comparison = [];
  let allMatched = true;

  for (let i = 0; i < oldUrls.length; i++) {
    const oldUrl = oldUrls[i];
    const slug = oldUrl.replace('https://nexustc.com.br/insights/', '');
    const newUrl = `https://nexustc.com.br/insights/${slug}`;
    const mdExists = fs.existsSync(path.join(blogDir, `${slug}.md`));
    const distHtmlExists = fs.existsSync(path.join(distInsightsDir, slug, 'index.html'));

    const match = mdExists && distHtmlExists;
    if (!match) allMatched = false;

    comparison.push({
      index: i + 1,
      slug,
      oldUrl,
      newUrl,
      mdExists,
      distHtmlExists,
      match: match ? 'OK' : 'FAIL'
    });
  }

  console.log('\n--- VERIFICATION RESULT ---');
  console.log(`All 37 URLs match: ${allMatched}`);
  console.log(JSON.stringify(comparison, null, 2));

  // Check if any extra
  const extraInDist = distDirs.filter(d => !oldUrls.some(u => u.endsWith(`/${d}`)));
  console.log('Extra in dist:', extraInDist);
}

run().catch(console.error);
