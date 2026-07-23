function responseContractMiddleware(req, res, next) {
  const sendJson = res.json.bind(res);

  res.json = (body) => {
    if (res.statusCode < 400 || !body || typeof body !== "object") {
      return sendJson(body);
    }

    const normalized = { ...body };
    delete normalized.stack;
    normalized.success = false;
    normalized.message ||= "La requête n'a pas pu être traitée.";
    normalized.code ||=
      res.statusCode >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR";
    normalized.details ??= null;
    normalized.requestId ||= req.requestId || null;
    return sendJson(normalized);
  };

  next();
}

module.exports = responseContractMiddleware;
