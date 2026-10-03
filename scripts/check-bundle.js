import https from 'https';
import fs from 'fs';

https.get('https://nexustc.com.br/assets/index-BGkrpM1v.js', (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    fs.writeFileSync('scripts/old-bundle.js', data);
    console.log('Saved old-bundle.js, length:', data.length);
    const matches = data.match(/assets\/[^"'\s\)]+\.(?:png|webp|svg|jpg)/gi) || [];
    console.log('All image assets in bundle:', [...new Set(matches)]);
    const lgpdMatches = matches.filter(m => /lgpd/i.test(m));
    console.log('LGPD matches:', lgpdMatches);
  });
});
