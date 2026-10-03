import fs from 'fs';
import path from 'path';

const additionalPatterns = [
  { name: 'carência', regex: /\bcar[eê]ncia\b/i },
  { name: 'rescisão / rescisória', regex: /\brescis[aãõo]/i },
  { name: 'sem trava / sem amarras', regex: /\bsem\s+(travas?|amarras?|v[ií]nculo)/i },
  { name: 'a qualquer momento', regex: /\ba\s+qualquer\s+momento\b/i },
  { name: 'ficar preso', regex: /\bfic(ar|a)\s+pres[oa]\b/i },
  { name: 'compromisso de permanência', regex: /\bperman[eê]ncia\b/i }
];

function scanDir(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
        scanDir(fullPath, results);
      }
    } else if (entry.isFile() && /\.(astro|md|ts|js)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        for (const p of additionalPatterns) {
          if (p.regex.test(line)) {
            results.push({
              file: path.relative(process.cwd(), fullPath).replace(/\\/g, '/'),
              line: idx + 1,
              term: p.name,
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
console.log(`Total additional matches: ${found.length}`);
for (const item of found) {
  console.log(`[${item.file}:${item.line}] (${item.term})`);
  console.log(`   "${item.snippet}"\n`);
}
