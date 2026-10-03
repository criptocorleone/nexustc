import fs from 'fs';
import path from 'path';

function scan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
        scan(full);
      }
    } else if (entry.isFile() && /\.(astro|md|ts|js|json|html)$/.test(entry.name)) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, i) => {
        if (/\bGEO\b/.test(l)) {
          console.log(`[${path.relative(process.cwd(), full)}:${i+1}] ${l.trim()}`);
        }
      });
    }
  }
}

scan(path.resolve('src'));
