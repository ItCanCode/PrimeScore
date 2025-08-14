
import express from 'express';

import corsMiddleware from './src/middleware/cors.js';
import userRoutes from './src/routes/userRoutes.js';
import authRoutes from "./src/routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(corsMiddleware);
app.use(express.json());

// Routes

app.use('/api/users', userRoutes);


app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Landing page !' });
});

//AUTHENTICATION

app.use("/auth", authRoutes);

// Error handling
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
