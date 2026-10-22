const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, default: '' },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    category: { type: String, required: true,},
    image: { type: String, required: true},
    rating: {
       rate: { type: Number, default: 0, min: 0,  max: 5 },
      count: {
        type: Number,
        default: 0,
        validate: { validator: Number.isInteger, message: 'Count must be an integer' },
      },
      },

    // Reference to the user who created the product (relationship)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
