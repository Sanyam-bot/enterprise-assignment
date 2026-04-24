// Centralized error handler.
// This should be the LAST app.use(...) in server.js.

function categoryFromStatus(statusCode) {
  if (statusCode === 400) return "BadRequest";
  if (statusCode === 401) return "Unauthorized";
  if (statusCode === 403) return "Forbidden";
  if (statusCode === 404) return "NotFound";
  if (statusCode === 429) return "TooManyRequests";
  return "InternalServerError";
}

module.exports = function errorHandler(err, req, res, next) {
  const requestId = req.requestId || null;

  let statusCode = Number.isInteger(err && err.statusCode) ? err.statusCode : 500;
  let error = categoryFromStatus(statusCode);
  let message = statusCode >= 500
    ? "An unexpected error occurred."
    : "Request failed.";

  // Handle malformed JSON payloads from express.json().
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    statusCode = 400;
    error = "BadRequest";
    message = "Malformed JSON request body.";
  } else if (err) {
    if (typeof err.name === "string" && err.name !== "Error") {
      error = err.name;
    }
    if (typeof err.message === "string" && err.message && statusCode < 500) {
      message = err.message;
    }
  }

  if (statusCode >= 500) {
    error = "InternalServerError";
    message = "An unexpected error occurred.";
  }

  if (statusCode === 429 && Number.isFinite(err && err.retryAfter)) {
    res.set("Retry-After", String(err.retryAfter));
  }

  console.error(`Unhandled error for request ${requestId}`, err);

  res.status(statusCode).json({
    error,
    message,
    statusCode,
    requestId,
    timestamp: new Date().toISOString()
  });
};