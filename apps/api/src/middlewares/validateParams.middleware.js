function validateParams(schema) {
  return function paramsValidationMiddleware(req, res, next) {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Les paramètres envoyés sont invalides.",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    req.params = result.data;

    next();
  };
}

module.exports = validateParams;
