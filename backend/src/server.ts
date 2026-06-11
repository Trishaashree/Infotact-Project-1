// import express from 'express';
// import cors from 'cors';
// import productRoutes from './routes/product';
// import orderRoutes from './routes/order';

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Wire Up Routers
// app.use('/api/products', productRoutes);
// app.use('/api/orders', orderRoutes);

// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`===========================================================`);
//   console.log(`🚀 NO-DATABASE OMNICHANNEL POS SERVER RUNNING ACTIVE`);
//   console.log(`📡 Endpoint Target: http://localhost:${PORT}`);
//   console.log(`💾 State Mode: Strict Node.js In-Memory Volatile Array Tables`);
//   console.log(`===========================================================`);
// });

import express from 'express';
import cors from 'cors';
import productRoutes from './routes/product';
import orderRoutes from './routes/order';
import authRoutes from './routes/auth'; // 1. Import Auth

const app = express();
app.use(cors());
app.use(express.json());

// Wire Up Routers
app.use('/api/auth', authRoutes); // 2. Hook up Auth endpoints
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`===========================================================`);
  console.log(`🚀 NO-DATABASE OMNICHANNEL POS SERVER RUNNING ACTIVE`);
  console.log(`📡 Endpoint Target: http://localhost:${PORT}`);
  console.log(`===========================================================`);
});