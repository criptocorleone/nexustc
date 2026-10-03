import fs from 'fs';

const files = [
  'dist/index.html',
  'dist/solucoes/consultoria-seo/index.html',
  'dist/solucoes/gestao-de-google-ads/index.html',
  'dist/solucoes/otimizacao-de-conversao/index.html',
  'dist/segmentos/index.html',
  'dist/segmentos/startups-e-saas/index.html',
  'dist/segmentos/web3/index.html',
  'dist/autor/ricardo-zago/index.html',
  'dist/insights/seo-ou-google-ads-por-onde-comecar/index.html',
  'dist/sobre/index.html',
  'dist/contato/index.html',
];

files.forEach((file) => {
  if (!fs.existsSync(file)) {
    console.log(`MISSING: ${file}`);
    return;
  }
  const html = fs.readFileSync(file, 'utf8');
  const matches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  console.log(`\n=== ${file} (${matches.length} schemas) ===`);
  matches.forEach((m, idx) => {
    try {
      const data = JSON.parse(m[1]);
      const type = data['@type'];
      const detail = data.name || data.headline || (data.itemListElement ? `${data.itemListElement.length} items` : '');
      console.log(`  [${idx + 1}] @type: ${type} | ${detail}`);
    } catch (err) {
      console.error(`  [${idx + 1}] JSON PARSE ERROR: ${err.message}`);
    }
  });
});
