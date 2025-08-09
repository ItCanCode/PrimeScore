// src/controllers/authController.js
const authService = require('../services/authService');

exports.verifyUser = async (req, res) => {
  const idToken = req.headers.authorization?.split(' ')[1];  // Bearer token

  if (!idToken) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  try {
    const decodedUser = await authService.verifyIdToken(idToken);
    res.status(200).json({ success: true, user: decodedUser });

  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};


exports.login = async (req, res) => {
  const idToken = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"

  if (!idToken) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const user = await authService.verifyIdToken(idToken);

    // Optionally, create a session or custom token, or save to DB

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name || null,
      },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};


