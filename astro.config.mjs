import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

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
    })
  ]
});
