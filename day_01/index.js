import 'dotenv/config';

import express from 'express'
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { DBConnection } from './src/config/DBContext.js';
import authRouter from './src/routes/authenRT.routes.js';
import profileRouter from './src/routes/profile.routes.js';
import productRouter from './src/routes/product.routes.js';
import categoryRouter from './src/routes/categories.routes.js';
import cartRouter from './src/routes/cart.routes.js';

import { setupSwagger } from './src/config/swagger.js';

const app = express()

// Call to [Connection database]
DBConnection();

// Middleware for parsing request body
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files(images)
app.use('/images', express.static(path.join(process.cwd(), 'images')));

app.use(cors({
  origin: '*', // Cho phép tất cả domain truy cập
  method: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // cho phép gửi cookie
}))

// Set-up Swagger
setupSwagger(app);

app.use('/api/authen', authRouter); // [authenRT.routes.js]
app.use('/api/profile', profileRouter); // [profile.routes.js]
app.use('/api/enhancedProduct', productRouter) // [product.routes.js]
app.use('/api/enhancedcategories', categoryRouter) // [categories.routes.js]
app.use('/api/cart', cartRouter) // [cart.routes.js]
// Routes
app.get('/', (req, res) => {
  res.send('Home pages')
})

// Start server
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;

