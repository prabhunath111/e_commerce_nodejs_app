const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

// Helper: format cart nicely and calculate total price
const formatCart = (cart) => {
  const items = cart.items
    .filter((item) => item.product) // ignore products that were deleted
    .map((item) => ({
      product: item.product,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    }));
  const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0);
  return { items, totalItems: items.length, totalPrice };
};

// ---------------------------------------------------------------
// GET /api/cart   (protected) -> my cart
// ---------------------------------------------------------------
exports.getMyCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price');

  if (!cart) {
    return res.json({ success: true, cart: { items: [], totalItems: 0, totalPrice: 0 } });
  }
  res.json({ success: true, cart: formatCart(cart) });
});

// ---------------------------------------------------------------
// POST /api/cart/add   (protected)   body: { productId, quantity? }
// ---------------------------------------------------------------
exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, message: 'productId is required' });
  }
  if (quantity < 1) {
    return res.status(400).json({ success: false, message: 'quantity must be at least 1' });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  // Find the user's cart, or create a new one
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  // If product already in cart -> increase quantity, else add new item
  const existingItem = cart.items.find((item) => item.product.toString() === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  await cart.populate('items.product', 'name price');

  res.status(201).json({ success: true, message: 'Added to cart', cart: formatCart(cart) });
});

// ---------------------------------------------------------------
// DELETE /api/cart/remove/:productId   (protected)
// ---------------------------------------------------------------
exports.removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart is empty' });
  }

  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  await cart.save();
  await cart.populate('items.product', 'name price');

  res.json({ success: true, message: 'Removed from cart', cart: formatCart(cart) });
});
