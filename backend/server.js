import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import healthRoutes from './routes/healthRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Initialize MongoDB connection
if (process.env.MONGO_URI) {
  connectDB();
} else {
  console.warn('[Warning] MONGO_URI is not defined in environment variables.');
}

const app = express();

// Middleware
const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: [frontendOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/health', healthRoutes);

// Root test endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Fitness Tracker API is running',
    healthCheck: '/api/health'
  });
});

// Central Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] Fitness Tracker API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

export default app;
