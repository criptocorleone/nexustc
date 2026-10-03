import https from 'https';

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function check() {
  const jsUrl = 'https://nexustc.com.br/index-BGkrpM1v.js';
  const jsContent = await fetchText(jsUrl);
  console.log('JS content length:', jsContent.length);

  // find any mentions of lgpd
  let pos = 0;
  while ((pos = jsContent.toLowerCase().indexOf('lgpd', pos)) !== -1) {
    console.log('Found lgpd at:', pos, jsContent.slice(Math.max(0, pos - 100), pos + 100));
    pos += 4;
  }
}

check();
