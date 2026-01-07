import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Products API",
            version: "1.0.0",
            description: "API documentation for Product management",
        },

        servers: [
            {
                url: "http://localhost:3000",
                description: "Local server"
            }
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },

        security: [
            { bearerAuth: [] }
        ],
    },

    // "swagger-jsdoc" will scan these files for annotations
    apis: ["./src/routes/*.js", "./src/model/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};