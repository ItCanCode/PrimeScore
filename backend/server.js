import express from 'express';
import corsMiddleware from './src/middleware/cors.js';
import userRoutes from './src/routes/userRoutes.js';
import authRoutes from "./src/routes/authRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import matchRoutes from './src/routes/matchRoutes.js';
import displayRoutes from './src/routes/displayRoutes.js';
import managerRoutes from "./src/routes/managerRoutes.js";
import feedRoutes from "./src/routes/feedRoutes.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(corsMiddleware);
// const authRoutes = require('./src/routes/authRoutes.js'); 
// const adminRoutes=require('./src/routes/adminRoutes.js')
// const allowedOrigins = [
//   'https://prime-score.vercel.app', 
//   'http://localhost:5173'       
// ];


// const logger = require('./src/middleware/logger');
// app.use(logger);

app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/admin',adminRoutes);
app.use('/api',matchRoutes)
app.use('/api/manager',managerRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/display', displayRoutes);
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

// app.get('/', (req, res) => {
//   res.json({ message: 'Landing page !' });
// });

//AUTHENTICATION

app.use("/auth", authRoutes);

// Error handling
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal Server Error' });
});

const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
