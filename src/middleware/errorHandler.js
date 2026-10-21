// Central place to handle all errors so responses look the same everywhere
const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Duplicate key (e.g. email already exists)
  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: 'Duplicate value: already exists' });
  }
  // Mongoose validation error (required field missing, etc.)
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ success: false, message });
  }
  // Invalid ObjectId like /products/abc
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }

  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server error' });
};

module.exports = errorHandler;
