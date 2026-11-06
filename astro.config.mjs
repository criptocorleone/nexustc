import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { visit } from 'unist-util-visit';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function rehypeTableWrap() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'table' && parent && (!parent.properties?.className || !parent.properties.className.includes('ds-table-wrap'))) {
        const wrapper = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['ds-table-wrap'] },
          children: [node]
        };
        parent.children[index] = wrapper;
      }
    });
  };
}

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
  markdown: {
    rehypePlugins: [rehypeTableWrap]
  },
  redirects: {
    '/blog': '/insights',
    '/pre-analise': '/#contato',
    '/solucoes/criacao-de-sites': '/solucoes/otimizacao-de-conversao',
    '/privacidade': '/politica-de-privacidade',
  },
  integrations: [
    mdx({
      rehypePlugins: [rehypeTableWrap]
    }),
    sitemap({
      filter: (page) => {
        // Excluir 404 e páginas que eventualmente tenham noindex
        return !page.includes('/404');
      }
    }),
    copySitemap()
  ]
});
