import fs from 'fs';

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
  const art = parsed.find(a => a.slug === 'quanto-tempo-seo-leva-para-dar-resultado');
  console.log('--- OLD ARTICLE DATA ---');
  console.log('seoTitle:', art.seoTitle);
  console.log('h1Title:', art.h1Title);
  console.log('publishDate:', art.publishDate);
  console.log('category:', art.category);
  console.log('content items count:', art.content.length);
  console.log('\n--- CONTENT SAMPLE (first 10) ---');
  art.content.slice(0, 10).forEach((c, i) => console.log(`[${i}]`, c));
}

run().catch(console.error);
