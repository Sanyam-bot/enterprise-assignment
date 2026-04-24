const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "CHANGE_ME_BEFORE_SUBMISSION";

// Validate Authorization: Bearer <token> and attach decoded claims to req.user.

module.exports = function authenticateJWT(req, res, next) {
  const authHeader = req.get("authorization");

  if (!authHeader) {
    const err = new Error("Missing Authorization header.");
    err.name = "Unauthorized";
    err.statusCode = 401;
    return next(err);
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
    const err = new Error("Authorization header must be in the format: Bearer <token>.");
    err.name = "Unauthorized";
    err.statusCode = 401;
    return next(err);
  }

  try {
    const payload = jwt.verify(parts[1], SECRET);
    req.user = payload;
    return next();
  } catch (verifyErr) {
    const err = new Error("Invalid or expired authentication token.");
    err.name = "Unauthorized";
    err.statusCode = 401;
    return next(err);
  }
};