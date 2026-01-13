import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

// Global variable
//    |_ [__dirname]: URL tuyệt đối chứa folder
//    |_ [__filename]: URL tuyệt đối Javascript thực thi
// [Node.js] ko có sẵn [__dirname]
//    |_ [import.meta.url] => file URL
//    |_ [fileURLToPath] => convert sang path 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Swagger configuration
 * Works for BOTH:
 *  - Local development
 *  - Vercel Serverless
 */
const options = {
    // "Definiton": mô tả chung của OpenAPI
    definition: {
        openapi: "3.0.0", // latest version
        info: {
            title: "Products API",
            version: "1.0.0",  // API version
            description: "API documentation for Product management",
        },

        // Location URL path => run API khi deploy production
        // Choose "dropdown" run với SERVER nào
        servers: [
            {
                url: "http://localhost:3000",
                description: "Local server"
            },
            {
                url: "http://sdn302-server-nodejs.vercel.app",
                description: "Production server (Vercel)"
            }
        ],

        // Security Schemes
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",  // HTTP: authentication     
                    scheme: "bearer",  // Bearer Token
                    bearerFormat: "JWT" // JWT Fomat
                }
            }
        },

        // Default security
        security: [
            { bearerAuth: [] }
        ],
    },

    // Scan file
    apis: [
        path.join(process.cwd(), "day_01/src/routes/*.js"),
        path.join(process.cwd(), "day_01/src/model/*.js"),
    ],
};

// [swagger-jsdoc]: auto generate Swagger JSON => ko cần create: swagger.json
// [app.get("/swagger.json"...]: expose nó qua endpoint
const swaggerSpec = swaggerJSDoc(options);

// Debug
console.log('Swagger spec generated: ', Object.keys(swaggerSpec));
console.log('Number of paths found: ', Object.keys(swaggerSpec.paths || {}).length);

// Setup swagger middleware
export const setupSwagger = (app) => {
    app.use(
        '/api/docs',
        swaggerUi.serve,
        swaggerUi.setup(null, {
            explorer: true,
            swaggerOptions: {
                url: '/api/swagger.json', // QUAN TRỌNG
                validatorUrl: null,
            },
        })
    );

    app.get('/api/swagger.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(swaggerSpec);
    });
};