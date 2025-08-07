// backend/index.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'https://prime-score.vercel.app', 
  
  'http://localhost:5173'            
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
