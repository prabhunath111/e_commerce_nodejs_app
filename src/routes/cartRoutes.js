const express = require('express');
const router = express.Router();
const { getMyCart, addToCart, removeFromCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect); // every cart route needs login

router.get('/', getMyCart);
router.post('/add', addToCart);
router.delete('/remove/:productId', removeFromCart);

module.exports = router;
