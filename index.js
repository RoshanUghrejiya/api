import dotenv from 'dotenv';
// Load environment variables
dotenv.config({ path: '../.env' }); // Relative to where index.js runs
import express from 'express';
import mongoose from 'mongoose';

import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import postRoutes from './routes/post.route.js';
import commentRoutes from './routes/comment.route.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import cors from 'cors';






// MongoDB connection
const mongoUri = 'mongodb+srv://vishalughrejiya67:tellybeats67@cluster0.0lcdwms.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Retrieve the MongoDB URI
console.log('Mongo URI:', mongoUri);

if (!mongoUri) {
  console.error('Error: MongoDB URI (MONGO) is not defined in the .env file.');
  process.exit(1); // Exit the application if the URI is missing
}

mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB is connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });



// Initialize Express application
const app = express();

// Allow requests from your frontend
app.use(cors({
  origin: '*', // You can specify other domains or '*' for all domains
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Your other middleware and routes

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/post', postRoutes);
app.use('/api/comment', commentRoutes);

// Serve static files
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '/client/dist')));

// Fallback route for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}!`);
});

