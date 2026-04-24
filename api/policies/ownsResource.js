// For the mail API, the resource will be req.mail.
// Returns true if mail.userId === user.userId.

module.exports = function ownsResource(user, mail) {
  if (!user || !mail) {
    return false;
  }

  return Number(mail.userId) === Number(user.userId);
};