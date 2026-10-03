import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function copySitemap() {
  return {
    name: 'copy-sitemap',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const distPath = fileURLToPath(dir);
        const indexPath = path.join(distPath, 'sitemap-index.xml');
        const sitemapPath = path.join(distPath, 'sitemap.xml');
        if (fs.existsSync(indexPath)) {
          fs.copyFileSync(indexPath, sitemapPath);
        }
      }
    }
  };
}

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://nexustc.com.br',
  trailingSlash: 'never',
  redirects: {
    '/blog': '/insights',
    '/pre-analise': '/#contato',
    '/solucoes/criacao-de-sites': '/solucoes/otimizacao-de-conversao',
    '/privacidade': '/politica-de-privacidade',
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => {
        // Excluir 404 e páginas que eventualmente tenham noindex
        return !page.includes('/404');
      }
    }),
    copySitemap()
  ]
});
