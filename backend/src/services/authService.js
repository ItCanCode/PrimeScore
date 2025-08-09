// src/services/authService.js
const admin = require('../config/firebaseAdmin');

exports.verifyIdToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;  // contains user info like uid, email, etc.
  } catch (error) {
    throw new Error('Invalid token');
  }
};


