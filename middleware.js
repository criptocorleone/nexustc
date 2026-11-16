export const config = {
  matcher: [
    '/insights/onde-tem-mais-brasileiros-nos-estados-unidos',
    '/insights/onde-tem-mais-brasileiros-nos-estados-unidos/',
  ],
};

export default function middleware(request) {
  const url = new URL(request.url);
  if (
    url.pathname === '/insights/onde-tem-mais-brasileiros-nos-estados-unidos' ||
    url.pathname === '/insights/onde-tem-mais-brasileiros-nos-estados-unidos/'
  ) {
    return new Response(
      `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>410 Gone - Conteúdo Descontinuado | Nexus TC</title>
  <meta name="robots" content="noindex, nofollow" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #faf9f7; color: #0f0f12; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; box-sizing: border-box; }
    .card { background: #ffffff; border: 1px solid #e7e5e1; border-radius: 12px; padding: 36px; max-width: 520px; width: 100%; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .badge { display: inline-block; font-size: 13px; font-weight: 600; font-family: monospace; color: #dc2626; background: #fee2e2; padding: 4px 10px; border-radius: 999px; margin-bottom: 16px; letter-spacing: 0.05em; }
    h1 { font-size: 22px; margin: 0 0 12px; font-weight: 600; line-height: 1.3; }
    p { font-size: 15px; color: #56555c; margin: 0 0 24px; line-height: 1.6; }
    a { display: inline-block; background: #6d4aff; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 999px; font-weight: 500; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">HTTP 410 GONE</span>
    <h1>Conteúdo Descontinuado</h1>
    <p>Este artigo foi removido permanentemente e não está mais disponível no site da Nexus TC.</p>
    <a href="/insights">Ver artigos disponíveis no Blog</a>
  </div>
</body>
</html>`,
      {
        status: 410,
        statusText: 'Gone',
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=86400, s-maxage=604800',
        },
      }
    );
  }
}
