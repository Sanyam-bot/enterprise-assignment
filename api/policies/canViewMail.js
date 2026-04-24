// Composite policy:
// A user can view mail if:
// - they are an admin OR
// - they own the mail resource.

const isAdmin = require("./isAdmin");
const ownsResource = require("./ownsResource");

module.exports = function canViewMail(user, mail) {
  return isAdmin(user) || ownsResource(user, mail);
};