const html = (specUrl) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = function() {
        const ui = SwaggerUIBundle({
          url: '${specUrl}',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis],
          layout: 'BaseLayout',
          deepLinking: true
        });
        window.ui = ui;
      };
    </script>
  </body>
</html>`;

export default function handler(req, res) {
  // In Vercel the api route lives under /api/docs => spec URL should be /api/swagger.json
  const specUrl = '/api/swagger.json';
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html(specUrl));
}
