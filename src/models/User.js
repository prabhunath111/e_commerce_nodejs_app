// A MODEL = the shape of the data stored in a MongoDB collection
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, minlength: 3 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    // select:false => password is NOT returned in queries unless we ask for it
    password: { type: String, required: true, minlength: 6, select: false },

    // We store the latest refresh token so we can verify / revoke it later
    refreshToken: { type: String, select: false, default: null },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// Runs automatically BEFORE saving: hash the password (never store plain text!)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return; // only hash when password changed
  this.password = await bcrypt.hash(this.password, 10); // 10 = salt rounds
});

// Helper method: compare plain password with the hashed one
userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
