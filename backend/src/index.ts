import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectRedis } from './config/redis';
import { authenticateJWT, authorizeRoles } from './middleware/auth.middleware';
import { createProduct, getProducts } from './controllers/product.controller';
import { processCheckout } from './controllers/checkout.controller';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes Hooking Layer
app.get('/api/products', authenticateJWT, getProducts);
app.post('/api/products', authenticateJWT, authorizeRoles('Admin', 'Manager'), createProduct);
app.post('/api/checkout', authenticateJWT, authorizeRoles('Cashier', 'Manager', 'Admin'), processCheckout);

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('📦 MongoDB Connected Safely');
    
    await connectRedis();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Distributed Engine Running on Port ${PORT}`));
  } catch (err) {
    console.error('Fatal initialization failure:', err);
    process.exit(1);
  }
};

startServer();