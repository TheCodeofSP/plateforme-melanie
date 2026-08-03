const authenticate = require("./authenticate.middleware");

function sessionStatus(req, res, next) {
  if (!req.cookies.accessToken) {
    return next();
  }

  return authenticate(req, res, next);
}

module.exports = sessionStatus;