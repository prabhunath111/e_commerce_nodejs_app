const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');

// ---------------------------------------------------------------
// POST /api/auth/signup   body: { username, email, password }
// ---------------------------------------------------------------
exports.signup = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'username, email and password are required' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  // Password is hashed automatically in the User model (pre-save hook)
  const user = await User.create({ username, email, password });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken; // save it so we can verify later
  await user.save();

  res.status(201).json({
    success: true,
    message: 'Signup successful',
    user: { id: user._id, username: user.username, email: user.email },
    accessToken,
    refreshToken,
  });
});

// ---------------------------------------------------------------
// POST /api/auth/login   body: { email, password }
// ---------------------------------------------------------------
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'email and password are required' });
  }

  // password has select:false, so we must ask for it explicitly
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    // Same message for both cases -> attacker can't know which one was wrong
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  res.json({
    success: true,
    message: 'Login successful',
    user: { id: user._id, username: user.username, email: user.email },
    accessToken,
    refreshToken,
  });
});

// ---------------------------------------------------------------
// POST /api/auth/refresh-token   body: { refreshToken }
// Gives a NEW access token (and a new refresh token = "rotation")
// ---------------------------------------------------------------
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'refreshToken is required' });
  }

  // 1. Verify signature + expiry of the refresh token
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token. Please login again.' });
  }

  // 2. Compare with the one saved in DB (so logged-out / old tokens are rejected)
  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token not recognised. Please login again.' });
  }

  // 3. Issue new tokens and replace the old refresh token
  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);
  user.refreshToken = newRefreshToken;
  await user.save();

  res.json({ success: true, accessToken: newAccessToken, refreshToken: newRefreshToken });
});

// ---------------------------------------------------------------
// POST /api/auth/logout   (protected)
// Removes the refresh token from DB so it can't be used again
// ---------------------------------------------------------------
exports.logout = asyncHandler(async (req, res) => {
  req.user.refreshToken = null;
  await req.user.save();
  res.json({ success: true, message: 'Logged out successfully' });
});
