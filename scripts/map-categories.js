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

  const toMigrate = parsed.filter(a => !existingSlugs.includes(a.slug));
  console.log(`Total to migrate: ${toMigrate.length}`);

  function getCategory(a) {
    const s = a.slug.toLowerCase();
    const t = (a.h1Title + ' ' + a.seoTitle).toLowerCase();
    
    // Check CRO / Conversion
    if (s.includes('taxa-de-conversao') || s.includes('landing-page') || s.includes('cro') || s.includes('perde-cotacoes') || s.includes('nao-gera-clientes')) {
      return 'cro';
    }
    // Check Google Ads / Tráfego Pago
    if (s.includes('google-ads') || s.includes('trafego-pago') || s.includes('lgpdsolution')) {
      return 'google-ads';
    }
    // Default to SEO
    return 'seo';
  }

  toMigrate.forEach((a, i) => {
    const cat = getCategory(a);
    console.log(`${i+1}. [${cat}] ${a.slug} (${a.publishDate}) - "${a.h1Title}"`);
  });
}

run().catch(console.error);
