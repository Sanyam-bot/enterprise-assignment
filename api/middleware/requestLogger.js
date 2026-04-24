const { v4: uuidv4 } = require("uuid");

// Generate a stable request ID for each request and log a concise trace line.

module.exports = function requestLogger(req, res, next) {
  req.requestId = uuidv4();
  console.log(`REQUEST ${req.requestId} ${req.method} ${req.originalUrl}`);
  next();
};