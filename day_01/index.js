// Load environment variable (.env)
import 'dotenv/config';
import express from 'express'
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// Database
import { DBConnection } from './src/config/DBContext.js';

// Routers
import authRouter from './src/routes/authenRT.routes.js';
import profileRouter from './src/routes/profile.routes.js';
import productRouter from './src/routes/product.routes.js';
import categoryRouter from './src/routes/categories.routes.js';
import cartRouter from './src/routes/cart.routes.js';

// Swagger
import { setupSwagger } from './src/config/swagger.js';

const app = express()

// Call to [Connection database]
DBConnection();

// Parse cookies
app.use(cookieParser());

// Parse JSON && form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files(images)
app.use('/images', express.static(path.join(process.cwd(), 'images')));

// CORS configuration
app.use(cors({
  origin: '*', // Cho phép tất cả domain truy cập
  method: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // cho phép gửi cookie
}))

// Set-up Swagger
setupSwagger(app);

// API routes
app.use('/api/authen', authRouter); // [authenRT.routes.js]
app.use('/api/profile', profileRouter); // [profile.routes.js]
app.use('/api/enhancedProduct', productRouter) // [product.routes.js]
app.use('/api/enhancedcategories', categoryRouter) // [categories.routes.js]
app.use('/api/cart', cartRouter) // [cart.routes.js]

// Root route (health check: kiểm tra sức khỏe + API Infor)
app.get('/', (req, res) => {
  res.json({
    message: "SDN302 API is running!",
    swagger: "/api-docs",
    endpoint: {
      authen: '/api/authen',
      profile: '/api/profile',
      enhancedProduct: '/api/enhancedProduct',
      enhancedcategories: '/api/enhancedcategories',
      cart: '/api/cart',
    }
  });
});

// User PORT from Vercel environment || fallback to 3000
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
