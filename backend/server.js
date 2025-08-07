// backend/index.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'https://prime-score.vercel.app'
}));
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
