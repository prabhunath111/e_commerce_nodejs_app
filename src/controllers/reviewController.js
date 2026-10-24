const mongoose = require('mongoose');
const Product = require('../models/Product');
const Review = require('../models/Review');
const asyncHandler = require('../utils/asyncHandler');

exports.getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ success: false, message: 'Invalid productId' });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const reviews = await Review.find({ product: productId })
    .populate('user', 'username')
    .sort({ createdAt: -1 });

  res.json({ success: true, reviews });
});

exports.createReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment = '' } = req.body;

  if (!productId || rating === undefined) {
    return res.status(400).json({ success: false, message: 'productId and rating are required' });
  }
  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ success: false, message: 'Invalid productId' });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'rating must be an integer from 1 to 5' });
  }
  if (typeof comment !== 'string') {
    return res.status(400).json({ success: false, message: 'comment must be a string' });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const existingReview = await Review.findOne({ user: req.user._id, product: productId });
  if (existingReview) {
    return res.status(409).json({ success: false, message: 'You have already reviewed this product' });
  }

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    rating,
    comment,
  });

  res.status(201).json({ success: true, message: 'Review created', review });
});

exports.updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;

  if (!mongoose.isValidObjectId(reviewId)) {
    return res.status(400).json({ success: false, message: 'Invalid reviewId' });
  }
  if (rating === undefined && comment === undefined) {
    return res.status(400).json({ success: false, message: 'rating or comment is required' });
  }
  if (rating !== undefined && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    return res.status(400).json({ success: false, message: 'rating must be an integer from 1 to 5' });
  }
  if (comment !== undefined && typeof comment !== 'string') {
    return res.status(400).json({ success: false, message: 'comment must be a string' });
  }

  const updates = {};
  if (rating !== undefined) updates.rating = rating;
  if (comment !== undefined) updates.comment = comment;

  const review = await Review.findOneAndUpdate(
    { _id: reviewId, user: req.user._id },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  res.json({ success: true, message: 'Review updated', review });
});

exports.deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  if (!mongoose.isValidObjectId(reviewId)) {
    return res.status(400).json({ success: false, message: 'Invalid reviewId' });
  }

  const review = await Review.findOneAndDelete({ _id: reviewId, user: req.user._id });
  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  res.json({ success: true, message: 'Review deleted' });
});
