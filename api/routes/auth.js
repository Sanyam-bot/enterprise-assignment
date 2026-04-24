const express = require("express");
const jwt = require("jsonwebtoken");
const users = require("../data/users");

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "CHANGE_ME_BEFORE_SUBMISSION";

// POST /login
// Body: { username, password }
// On success: return a JWT that includes { userId, role } as claims.
router.post("/login", (req, res, next) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    const err = new Error("Username and password are required.");
    err.name = "BadRequest";
    err.statusCode = 400;
    return next(err);
  }

  const user = users.find((u) => u.username === username);

  if (!user || user.password !== password) {
    const err = new Error("Invalid username or password.");
    err.name = "Unauthorized";
    err.statusCode = 401;
    return next(err);
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role
    },
    SECRET,
    { expiresIn: "1h" }
  );

  return res.json({ token });
});

module.exports = router;