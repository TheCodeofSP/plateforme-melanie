function authorizeRoles(...allowedRoles) {
  return function authorizationMiddleware(
    req,
    res,
    next,
  ) {
    if (!req.auth?.user) {
      const error = new Error(
        "Authentification requise.",
      );

      error.code = "AUTHENTICATION_REQUIRED";
      error.statusCode = 401;

      return next(error);
    }

    if (
      !allowedRoles.includes(req.auth.user.role)
    ) {
      const error = new Error(
        "Tu n’as pas l’autorisation d’effectuer cette action.",
      );

      error.code = "FORBIDDEN";
      error.statusCode = 403;

      return next(error);
    }

    next();
  };
}

module.exports = authorizeRoles;