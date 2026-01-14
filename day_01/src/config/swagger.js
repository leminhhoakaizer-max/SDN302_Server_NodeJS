import swaggerJSDoc from "swagger-jsdoc";
import path from "path";

// --- Cấu hình swagger-jsdoc ---
const options = {
  definition: {
    openapi: "3.0.0", // OpenAPI session
    info: {
      title: "Products API",
      version: "1.0.0",
      description: "API documentation for Product management",
    },
    // List servlet run API (local && Vercel)
    servers: [
      { url: "http://localhost:3000", description: "Local server" },
      { url: "https://sdn302-server-nodejs.vercel.app", description: "Vercel serverless" }
    ],
    components: {
        // JWT Bearer cho bảo mật API
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
      }
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    // process.cwd(): đường dẫn hiện tại của project Node
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

  // 2. Serve HTML Swagger UI bằng CDN (Content Delivery Network)
  // CSS + JS từ CDN của Swagger UI (unpkg.com/swagger-ui-dist)
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
              dom_id: "#swagger-ui", // container để render UI
              deepLinking: true, // tạo URL trực tiếp tới từng endpoint
              // layout và behavior mặc định.
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              // giao diện đầy đủ, menu điều hướng, search, v.v.
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
