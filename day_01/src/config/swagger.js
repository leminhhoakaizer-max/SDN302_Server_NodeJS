// day_01/src/config/swagger.js
import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import swaggerUiDist from "swagger-ui-dist";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const swaggerSpec = swaggerJSDoc(options);

// --- Hàm setup Swagger ---
export const setupSwagger = (app) => {

  // 1. Serve JSON schema
  app.get("/api/swagger.json", (req, res) => res.json(swaggerSpec));

  // 2. Serve static files Swagger UI (CSS/JS)
  const swaggerDistPath = swaggerUiDist.getAbsoluteFSPath();
  app.use("/api/docs/static", express.static(swaggerDistPath));

  // 3. Serve HTML cho Swagger UI
  app.get("/api/docs", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Swagger UI</title>
        <link rel="stylesheet" type="text/css" href="/api/docs/static/swagger-ui.css" />
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="/api/docs/static/swagger-ui-bundle.js"></script>
        <script src="/api/docs/static/swagger-ui-standalone-preset.js"></script>
        <script>
          window.onload = () => {
            const ui = SwaggerUIBundle({
              url: "/api/swagger.json",
              dom_id: "#swagger-ui",
              presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
              layout: "StandaloneLayout",
              deepLinking: true
            });
            window.ui = ui;
          };
        </script>
      </body>
      </html>
    `);
  });

  console.log("Swagger UI setup complete: /api/docs, JSON: /api/swagger.json");
  console.log("Number of paths found: ", Object.keys(swaggerSpec.paths || {}).length);
};
