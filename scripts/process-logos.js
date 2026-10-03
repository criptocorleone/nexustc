import fs from 'fs';
import path from 'path';
import https from 'https';
import sharp from 'sharp';

const logos = [
  { url: 'https://nexustc.com.br/assets/anad-D9egBJra.png', name: 'anad', alt: 'ANAD' },
  { url: 'https://nexustc.com.br/assets/colegio-brasileiro-islamico-CfhsTM71.png', name: 'colegio-brasileiro-islamico', alt: 'Colégio Brasileiro Islâmico' },
  { url: 'https://nexustc.com.br/assets/colegio-sion-aruja-B39T92uG.png', name: 'colegio-sion-aruja', alt: 'Colégio Sion Arujá' },
  { url: 'https://nexustc.com.br/assets/colegio-sion-ipiranga-ej9GCJiA.png', name: 'colegio-sion-ipiranga', alt: 'Colégio Sion Ipiranga' },
  { url: 'https://nexustc.com.br/assets/cyber-insurance-BP8F6xYw.png', name: 'cyber-insurance', alt: 'Cyber Insurance' },
  { url: 'https://nexustc.com.br/assets/esg-solutions-5j3pxF0z.png', name: 'esg-solutions', alt: 'ESG Solutions' },
  { url: 'https://nexustc.com.br/assets/k2a-partners-BxxAl-b2.png', name: 'k2a', alt: 'K2A Technology Solutions' },
  { url: 'https://nexustc.com.br/assets/lgpd-solution-BeQNnAKm.png', name: 'lgpd-solution', alt: 'LGPD Solution' },
  { url: 'https://nexustc.com.br/assets/pe-de-brinquedo-DfhnHFi_.png', name: 'pe-de-brinquedo', alt: 'Pé de Brinquedo' },
  { url: 'https://nexustc.com.br/assets/the-chosen-D0tPaPb-.png', name: 'the-chosen', alt: 'The Chosen' },
];

const destDir = path.resolve('public/clientes');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchBuffer(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function run() {
  console.log('Downloading and converting logos...');

  for (const item of logos) {
    try {
      console.log(`Downloading ${item.name} from ${item.url}...`);
      let buf;
      try {
        buf = await fetchBuffer(item.url);
      } catch (err) {
        console.warn(`Failed initial URL for ${item.name}: ${err.message}. Trying to inspect https://nexustc.com.br...`);
        const homeHtml = (await fetchBuffer('https://nexustc.com.br')).toString();
        // find asset pattern
        const regex = new RegExp(`/assets/${item.name.replace(/-/g, '[-_a-zA-Z0-9]*')}[^"']*\\.png`, 'i');
        const match = homeHtml.match(regex);
        if (match) {
          const newUrl = `https://nexustc.com.br${match[0]}`;
          console.log(`Found alternative URL for ${item.name}: ${newUrl}`);
          buf = await fetchBuffer(newUrl);
        } else {
          throw err;
        }
      }

      // Save PNG
      const pngPath = path.join(destDir, `${item.name}.png`);
      fs.writeFileSync(pngPath, buf);
      console.log(`Saved PNG: ${pngPath} (${buf.length} bytes)`);

      // Convert to WebP preserving transparency
      const webpPath = path.join(destDir, `${item.name}.webp`);
      await sharp(buf)
        .webp({ quality: 90, alphaQuality: 100, lossless: false })
        .toFile(webpPath);
      const webpStat = fs.statSync(webpPath);
      console.log(`Converted WebP: ${webpPath} (${webpStat.size} bytes)`);

    } catch (err) {
      console.error(`Error processing ${item.name}:`, err.message);
    }
  }

  console.log('Done processing logos.');
}

run();
