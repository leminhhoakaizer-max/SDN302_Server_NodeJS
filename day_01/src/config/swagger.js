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

// Swagger Options
const options = {
    // "Definiton": mô tả chung của OpenAPI
    definition: {
        openapi: "3.0.0", // latest version
        info: {
            title: "Products API",
            version: "1.0.0",   // API version
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
                    type: "http",       // HTTP: authentication
                    scheme: "bearer",   // Bearer Token
                    bearerFormat: "JWT" // JWT Fomat
                }
            }
        },

        // Default security
        security: [
            { bearerAuth: [] }
        ],
    },

    // "swagger-jsdoc": Scan(quét) [comment/anotations] JSDoc có trong các files dưới
    apis: [
        // Use [path.join + __dirname]: Run cả Local && Vecel
        path.join(__dirname, "../routes/*.js"),
        path.join(__dirname, "../model/*.js"),

        // Fallback(dự phòng) => build trên Vecel
        "./src/routes/*.js", "./src/model/*.js"
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
    // Option cho swagger UI
    const swaggerOptions = {
        explorer: true, // Bật search API 
        swaggerOptions: {
            validatorUrl: null, // turnOff validator => Tránh CORS error
        },
    };

    // Access to
    //  |_ Local server: http://localhost:3000/api-docs
    //  |_ Vecel production: http://sdn302-server-nodejs.vercel.app
    app.use(
        '/api-docs', 
        swaggerUi.serve, 
        swaggerUi.setup(swaggerSpec, swaggerOptions)
    );

    // Export Swagger JSON: rất quan trọng khi deploy
    //      |_ Use for fontend
    //      |_ Use for Postman/Swagger Hub
    //      |_ Debug khi swagger UI error
    app.get("/swagger.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.status(200).json(swaggerSpec);
    });
};

// Explain:
// CORS (Cross Origin Resoucre Sharing): cơ chế bảo mật của trình duyệt
// Tránh CORS error: 
//      |_ enable broswers chia sẻ tài nguyên giữa các resources
//      |_ Frontend giao tiếp với Backend khác domain 1 cách an toàn  