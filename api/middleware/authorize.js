// Generic authorization middleware that accepts a policy function.
// The policy function will receive (user, resource) and must return true/false.

module.exports = function authorize(policy) {
  return (req, res, next) => {
    const user = req.user;
    const resource = req.mail;

    if (!user) {
      const err = new Error("Authentication is required.");
      err.name = "Unauthorized";
      err.statusCode = 401;
      return next(err);
    }

    const allowed = Boolean(policy(user, resource));
    if (allowed) {
      return next();
    }

    const err = new Error("User does not have permission to access this resource.");
    err.name = "Forbidden";
    err.statusCode = 403;
    return next(err);
  };
};