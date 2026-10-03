import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../src/content/blog');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();

const articles = files.map(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const parts = content.split('---');
  const fm = parts[1] || '';
  const lines = fm.split('\n');
  const data = {};
  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx !== -1) {
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      data[key] = val;
    }
  }
  const slug = f.replace('.md', '');
  const title = data.title || '';
  const category = data.category || '';
  const description = data.description || '';

  // Determine suggested servicoRelacionado
  let servico = 'seo';
  let justificativa = '';

  if (category === 'google-ads' || slug.includes('google-ads') || slug.includes('trafego-pago') || slug.includes('case-lgpdsolution')) {
    servico = 'midia-paga';
    justificativa = 'Mídia paga / Google Ads';
  } else if (category === 'cro' || slug.includes('conversao') || slug.includes('landing-page') || slug.includes('perde-cotacoes') || slug.includes('nao-gera-clientes')) {
    servico = 'cro';
    justificativa = 'CRO / Landing page / Conversão no site';
  } else if (slug === 'seo-ou-google-ads-por-onde-comecar') {
    // Both, but category is seo, often starting with SEO or can be SEO
    servico = 'seo';
    justificativa = 'Comparativo SEO vs Ads (porta de entrada orgânica)';
  } else if (slug === 'case-esg-solutions-leads-b2b') {
    // Let's check what case-esg-solutions is about: SEO or Ads or CRO?
    servico = 'seo';
    justificativa = 'Case B2B de captação orgânica';
  } else {
    servico = 'seo';
    justificativa = 'SEO / Presença no Google / Maps / Local / IA';
  }

  return {
    slug,
    title,
    category,
    servico,
    justificativa
  };
});

for (let i = 0; i < articles.length; i++) {
  const a = articles[i];
  console.log(`${i + 1}. \`${a.slug}\` | **${a.servico}** | ${a.category} | ${a.title}`);
}
