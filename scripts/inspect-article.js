async function run() {
  const url = 'https://nexustc.com.br/insights/negocio-brasileiro-marlborough-ma';
  const res = await fetch(url);
  const html = await res.text();
  console.log('HTML length:', html.length);

  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  console.log('Title:', titleMatch ? titleMatch[1] : null);

  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  console.log('Description:', descMatch ? descMatch[1] : null);

  const jsonLdRegex = /<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
  let ldMatch;
  while ((ldMatch = jsonLdRegex.exec(html)) !== null) {
    console.log('--- JSON-LD ---');
    console.log(ldMatch[1]);
  }

  const articleMatch = html.match(/<article[\s\S]*?<\/article>/i);
  if (articleMatch) {
    console.log('Found <article>, length:', articleMatch[0].length);
    console.log('Sample:', articleMatch[0].substring(0, 1000));
  } else {
    const mainMatch = html.match(/<main[\s\S]*?<\/main>/i);
    console.log('Found <main>, length:', mainMatch ? mainMatch[0].length : 0);
    console.log('Sample:', mainMatch ? mainMatch[0].substring(0, 1000) : null);
  }
}

run().catch(console.error);
