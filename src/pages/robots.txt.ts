import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const isProduction = import.meta.env.PUBLIC_SITE_ENV === 'production';
  const siteUrl = site ? site.toString().replace(/\/$/, '') : 'https://nexustc.com.br';

  if (!isProduction) {
    return new Response(
      `User-agent: *\nDisallow: /\n`,
      {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      }
    );
  }

  return new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\nSitemap: ${siteUrl}/sitemap-index.xml\n`,
    {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    }
  );
};
