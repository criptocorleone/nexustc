import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../src/content/blog');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

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
  return {
    slug: f.replace('.md', ''),
    title: data.title || '',
    category: data.category || '',
    description: data.description || ''
  };
});

console.log(JSON.stringify(articles, null, 2));
