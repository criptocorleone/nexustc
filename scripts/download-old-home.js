import https from 'https';
import fs from 'fs';

https.get('https://nexustc.com.br', (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    fs.writeFileSync('scripts/old-home.html', data);
    console.log('Saved old-home.html, length:', data.length);
    // Find all assets
    const matches = data.match(/assets\/[^"'\s]+/g) || [];
    console.log('All assets:', matches);
  });
});
