const asyncHandler = require('../utils/asyncHandler');

// GET /api/users/me   (protected) -> profile of the logged-in user
// req.user was set by the "protect" middleware, so no DB call is needed here
exports.getMe = asyncHandler(async (req, res) => {
  const { _id, username, email, createdAt } = req.user;
  res.json({ success: true, user: { id: _id, username, email, createdAt } });
});
