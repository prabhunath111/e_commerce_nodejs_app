const express = require('express');
const {
  getFavorites,
  addFavorite,
  removeFavorite,
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getFavorites);
router.post('/', addFavorite);
router.delete('/:productId', removeFavorite);

module.exports = router;
