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

  parsed.forEach((a, i) => {
    console.log(`${i+1}. [${a.slug}]`);
    console.log(`   h1Title:  ${a.h1Title}`);
    console.log(`   seoTitle: ${a.seoTitle}`);
    console.log(`   date:     ${a.publishDate} | cat: ${a.category}`);
  });
}

run().catch(console.error);
