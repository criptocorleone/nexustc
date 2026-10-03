import fs from 'fs';
import path from 'path';

const patterns = [
  { name: 'fidelidade', regex: /\bfidelidade\b/i },
  { name: 'multa', regex: /\bmulta[s]?\b/i },
  { name: 'amarra', regex: /\bamarra[s]?\b/i },
  { name: 'amarramos', regex: /\bamarramos\b/i },
  { name: 'mês a mês', regex: /\bm[eê]s\s+a\s+m[eê]s\b/i },
  { name: 'encerramento livre', regex: /\bencerramento\s+livre\b/i },
  { name: 'cancelamento', regex: /\bcancelamento\b/i },
  { name: 'zero meses / 0 meses', regex: /\b(zero|0)\s+meses\b/i },
  { name: 'contrato punitivo / sem contrato', regex: /\b(sem\s+contrato|contratos?\s+punitivos?)\b/i },
  { name: 'preso a contrato', regex: /\bpres[oa]\s+a\s+contrato/i }
];

function scanDir(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
        scanDir(fullPath, results);
      }
    } else if (entry.isFile() && /\.(astro|md|ts|js|json|css)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        for (const p of patterns) {
          if (p.regex.test(line)) {
            // Check if it's hotel guest cancellation policy
            const isHotelPolicy = /política(s)? de cancelamento/i.test(line);
            results.push({
              file: path.relative(process.cwd(), fullPath).replace(/\\/g, '/'),
              line: idx + 1,
              term: p.name,
              isHotelPolicy,
              snippet: line.trim()
            });
            break;
          }
        }
      });
    }
  }
  return results;
}

const found = scanDir(path.resolve('src'));
console.log(`Total exact matches: ${found.length}`);
for (const item of found) {
  console.log(`[${item.file}:${item.line}] (${item.term}) ${item.isHotelPolicy ? '[HOTEL GUEST POLICY]' : ''}`);
  console.log(`   "${item.snippet}"\n`);
}
