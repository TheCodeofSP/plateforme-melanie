function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const error = new Error("Les paramètres de recherche sont invalides.");
      error.statusCode = 400; error.code = "VALIDATION_ERROR";
      error.details = result.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message }));
      return next(error);
    }
    req.validatedQuery = result.data; return next();
  };
}
module.exports = validateQuery;
