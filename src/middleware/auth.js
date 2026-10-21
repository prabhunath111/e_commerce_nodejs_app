// AUTH MIDDLEWARE = a security guard placed before protected routes.
// It checks the access token and attaches the logged-in user to req.user
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    // 1. Header format -> Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];

    // 2. Verify signature + expiry
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // 3. Make sure the user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    req.user = user; // available in the next controller
    next();
  } catch (error) {
    // Frontend can use this message to know it must call the refresh API
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Access token expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = { protect };
