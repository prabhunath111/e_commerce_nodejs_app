const Favorite = require('../models/Favorite');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

exports.getFavorites = asyncHandler(async (req, res) => {
  const favorite = await Favorite.findOne({ user: req.user._id }).populate(
    'products',
    'title price image'
  );

  res.json({ success: true, favorites: favorite ? favorite.products : [] });
});

exports.addFavorite = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ success: false, message: 'productId is required' });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const favorite = await Favorite.findOneAndUpdate(
    { user: req.user._id },
    { $addToSet: { products: product._id } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate('products', 'title price image');

  res.json({ success: true, message: 'Added to favorites', favorites: favorite.products });
});

exports.removeFavorite = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const favorite = await Favorite.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { products: productId } },
    { new: true }
  ).populate('products', 'title price image');

  if (!favorite) {
    return res.status(404).json({ success: false, message: 'Favorites not found' });
  }

  res.json({ success: true, message: 'Removed from favorites', favorites: favorite.products });
});
