const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

// ---------------------------------------------------------------
// POST /api/products   (protected)
// body: { name, price, description?, stock? }
// ---------------------------------------------------------------
exports.createProduct = asyncHandler(async (req, res) => {
  const { name, price, description, stock } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ success: false, message: 'name and price are required' });
  }

  const product = await Product.create({
    name,
    price,
    description,
    stock,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, message: 'Product created', product });
});

// ---------------------------------------------------------------
// GET /api/products?page=1   -> 10 products per page
// ---------------------------------------------------------------
exports.getProducts = asyncHandler(async (req, res) => {
  const LIMIT = 10;
  const page = Math.max(parseInt(req.query.page) || 1, 1); // default page 1
  const skip = (page - 1) * LIMIT;
  // page 1 -> skip 0, page 2 -> skip 10, page 3 -> skip 20 ...

  const [products, totalProducts] = await Promise.all([
    Product.find().sort({ createdAt: -1 }).skip(skip).limit(LIMIT),
    Product.countDocuments(),
  ]);

  const totalPages = Math.ceil(totalProducts / LIMIT);

  res.json({
    success: true,
    currentPage: page,
    totalPages,
    totalProducts,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    products,
  });
});
