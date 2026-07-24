function errorMiddleware(error, req, res, next) {
  const statusCode =
    error.statusCode || error.status || 500;

  const message =
    statusCode >= 500
      ? "Une erreur interne est survenue."
      : error.message ||
        "Une erreur interne est survenue.";

  let details = error.details;
  if (error.code === "VALIDATION_ERROR" && Array.isArray(details)) {
    details = details.reduce((fields, issue) => {
      const field = issue.field || "_root";
      fields[field] ||= [];
      fields[field].push(issue.message);
      return fields;
    }, {});
  }

  if (statusCode >= 500) {
    console.error(`[${req.requestId || "no-request-id"}]`, error.stack || error.message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    code: error.code || (statusCode >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR"),
    details: details || null,
    requestId: req.requestId || null,
  });
}

module.exports = errorMiddleware;
