// Wraps async controllers so we don't need try/catch in every function.
// If something throws, the error goes to our central error handler.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
