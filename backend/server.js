// backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;


const dotenv = require('dotenv');

app.use(express.json());
const allowedOrigins = [
  'https://prime-score.vercel.app', 
  
  'http://localhost:5173'            
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);//postman or curl 
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));



const userRoutes = require('./routes/userRoutes'); 
app.use('/api/users', userRoutes);

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});


app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal Server Error' });
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
