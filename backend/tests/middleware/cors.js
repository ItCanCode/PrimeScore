import cors from 'cors'

const allowedOrigins = [
  'https://prime-score.vercel.app',
  'http://localhost:5173'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow requests with no origin (Postman, curl)
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // allowed origin
    } else {
      callback(new Error('Not allowed by CORS')); // blocked origin
    }
  }
};

export default cors(corsOptions);
