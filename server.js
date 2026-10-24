// ---------------------------------------------------------------
// server.js  ->  the ENTRY POINT of our app. Run with: npm run dev
// ---------------------------------------------------------------
require('dotenv').config(); // loads values from .env into process.env

const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const productRoutes = require('./src/routes/productRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const favoriteRoutes = require('./src/routes/favoriteRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');

const app = express();

// ---------- Global middlewares ----------
app.use(cors());          // allow frontend apps from other origins to call us
app.use(express.json());  // lets us read JSON from req.body

// ---------- Routes ----------
app.get('/', (req, res) => res.json({ message: 'API is running 🚀' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);

// ---------- 404 handler (no route matched) ----------
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ---------- Central error handler (must be LAST) ----------
app.use(errorHandler);

// ---------- Start server only after DB is connected ----------
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
});
