const express = require('express');
const router = express.Router();
const { signup, login, refreshToken, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);

module.exports = router;
