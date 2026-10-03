import fs from 'fs';

async function main() {
  const res = await fetch('https://nexustc.com.br/assets/index-BGkrpM1v.js');
  const js = await res.text();

  function dumpSection(keyword, label) {
    console.log(`\n=================== ${label} ===================`);
    let idx = js.indexOf(keyword);
    if (idx !== -1) {
      console.log(js.substring(Math.max(0, idx - 100), idx + 3500));
    } else {
      console.log('Not found:', keyword);
    }
  }

  dumpSection('Consultoria de SEO para Empresas', 'SEO SCHEMA & COPY');
  dumpSection('Gestão de Google Ads para', 'GOOGLE ADS COPY');
  dumpSection('Otimização de Conversão para', 'CRO COPY');
}

main();
