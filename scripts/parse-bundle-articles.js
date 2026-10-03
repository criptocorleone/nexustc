async function run() {
  const res = await fetch('https://nexustc.com.br/assets/index-BGkrpM1v.js');
  const js = await res.text();
  
  const arrayStart = js.indexOf('ib=[');
  // Find where ib ends
  // Let's extract from ib=[ to where the array closes
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let escape = false;
  let endIdx = -1;

  for (let i = arrayStart + 3; i < js.length; i++) {
    const c = js[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === '\\') {
      escape = true;
      continue;
    }
    if (inString) {
      if (c === stringChar) {
        inString = false;
      }
    } else {
      if (c === '"' || c === "'" || c === '`') {
        inString = true;
        stringChar = c;
      } else if (c === '[') {
        depth++;
      } else if (c === ']') {
        depth--;
        if (depth === 0) {
          endIdx = i + 1;
          break;
        }
      }
    }
  }

  console.log('Array boundaries:', arrayStart + 3, endIdx);
  const arraySnippet = js.substring(arrayStart + 3, endIdx);
  // Parse with Function / eval in sandbox
  const parsed = new Function(`return ${arraySnippet};`)();
  console.log('Total articles parsed from bundle:', parsed.length);
  console.log('Keys of first article:', Object.keys(parsed[0]));
  console.log('First article summary:', {
    id: parsed[0].id,
    slug: parsed[0].slug,
    publishDate: parsed[0].publishDate,
    category: parsed[0].category,
    seoTitle: parsed[0].seoTitle,
    h1Title: parsed[0].h1Title,
    contentItemsCount: parsed[0].content ? parsed[0].content.length : 0
  });

  // Check unique categories
  const categories = [...new Set(parsed.map(a => a.category))];
  console.log('Categories across articles:', categories);

  // Check if any have image or other fields
  const allKeys = [...new Set(parsed.flatMap(a => Object.keys(a)))];
  console.log('All possible keys across articles:', allKeys);
}

run().catch(console.error);
