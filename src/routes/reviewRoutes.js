const express = require('express');
const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/:productId', getProductReviews);
router.post('/', createReview);
router.patch('/:reviewId', updateReview);
router.delete('/:reviewId', deleteReview);

module.exports = router;
