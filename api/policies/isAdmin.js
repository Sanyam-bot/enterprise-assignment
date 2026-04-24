// Returns true if the user has the "admin" role.

module.exports = function isAdmin(user) {
  return Boolean(user && user.role === "admin");
};