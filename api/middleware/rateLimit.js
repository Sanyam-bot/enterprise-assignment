// Very simple in-memory rate limiter for demo purposes.
// Requirements (from assignment spec):
// - Track requests per IP OR per user (token), your choice.
// - Limit to RATE_LIMIT_MAX requests per RATE_LIMIT_WINDOW_SECONDS.
// - When exceeded, produce an error (429 Too Many Requests) via next(err).
// - Include a Retry-After header in the final response (set that in errorHandler).

const windowMs = (parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS, 10) || 60) * 1000;
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX, 10) || 5;

const buckets = new Map();
// shape: key -> { count, windowStart }

module.exports = function rateLimit(req, res, next) {
  const key = req.ip || "unknown";
  const now = Date.now();

  let bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart >= windowMs) {
    bucket = { count: 0, windowStart: now };
  }

  bucket.count += 1;
  buckets.set(key, bucket);

  if (bucket.count > maxRequests) {
    const retryAfter = Math.max(
      1,
      Math.ceil((windowMs - (now - bucket.windowStart)) / 1000)
    );

    const err = new Error("Rate limit exceeded. Please try again later.");
    err.name = "TooManyRequests";
    err.statusCode = 429;
    err.retryAfter = retryAfter;
    return next(err);
  }

  next();
};