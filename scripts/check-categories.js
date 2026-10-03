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
  
  const existingSlugs = [
    'seo-ou-google-ads-por-onde-comecar',
    'quanto-tempo-seo-leva-para-dar-resultado',
    'como-calcular-taxa-de-conversao-site'
  ];
  for (const slug of existingSlugs) {
    const art = parsed.find(a => a.slug === slug);
    console.log(slug, '-> old category:', art ? art.category : 'not found');
  }

  console.log('\nAll categories and their count:');
  const catCount = {};
  for (const a of parsed) {
    catCount[a.category] = (catCount[a.category] || 0) + 1;
  }
  console.log(catCount);
}
run().catch(console.error);
