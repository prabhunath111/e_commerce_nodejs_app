// Small helper functions to create JWT tokens
const jwt = require('jsonwebtoken');

// ACCESS token  -> short life (15 min). Sent with EVERY API request.
const generateAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  });

// REFRESH token -> long life (7 days). Used ONLY to get a new access token.
const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  });

module.exports = { generateAccessToken, generateRefreshToken };
