// day_01/src/config/swagger.js
import swaggerJSDoc from "swagger-jsdoc";
import path from "path";

// --- Cấu hình swagger-jsdoc ---
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Products API",
      version: "1.0.0",
      description: "API documentation for Product management",
    },
    servers: [
      { url: "http://localhost:3000", description: "Local server" },
      { url: "https://sdn302-server-nodejs.vercel.app", description: "Vercel serverless" }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
      }
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    path.join(process.cwd(), "day_01/src/routes/*.js"),
    path.join(process.cwd(), "day_01/src/model/*.js"),
  ],
};

// --- Tạo JSON spec từ swagger-jsdoc ---
const swaggerSpec = swaggerJSDoc(options);

// --- Hàm setup Swagger ---
export const setupSwagger = (app) => {
  // 1. Serve JSON schema cho Swagger UI
  app.get("/api/swagger.json", (req, res) => res.json(swaggerSpec));

  // 2. Serve HTML Swagger UI bằng CDN (khuyến nghị cho Vercel)
  app.get("/api/docs", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Products API Documentation</title>
        <!-- CSS Swagger UI từ CDN -->
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
        <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5/favicon-32x32.png" sizes="32x32" />
        <style>
          html { box-sizing: border-box; overflow-y: scroll; }
          *, *:before, *:after { box-sizing: inherit; }
          body { margin: 0; background: #fafafa; }
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <!-- JS Swagger UI từ CDN -->
        <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
        <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
        <script>
          window.onload = () => {
            const ui = SwaggerUIBundle({
              url: "/api/swagger.json", // JSON endpoint
              dom_id: "#swagger-ui",
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              layout: "StandaloneLayout"
            });
            window.ui = ui;
          };
        </script>
      </body>
      </html>
    `);
  });

  console.log("Swagger UI setup complete via CDN");
  console.log("Number of paths found:", Object.keys(swaggerSpec.paths || {}).length);
};
