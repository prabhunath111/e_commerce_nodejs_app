const express = require('express');
const router = express.Router();
const { createProduct, getProducts } = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.get('/', getProducts);              // public: anyone can view products
router.post('/', protect, createProduct);  // protected: must be logged in

module.exports = router;
