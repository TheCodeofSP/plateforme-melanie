function notFoundMiddleware(req, res) {
  res.status(404).json({
    success: false,
    message: `Route introuvable : ${req.method} ${req.originalUrl}`,
    code: "ROUTE_NOT_FOUND",
    details: null,
    requestId: req.requestId || null,
  });
}

module.exports = notFoundMiddleware;
