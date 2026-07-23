const crypto = require("node:crypto");
const requestContext = require("../utils/requestContext");
const { API_VERSION } = require("../config/app.constants");

function validRequestId(value) {
  return typeof value === "string" && /^[a-zA-Z0-9._:-]{8,128}$/.test(value);
}

module.exports = function requestContextMiddleware(req, res, next) {
  const incoming = req.get("x-request-id");
  const requestId = validRequestId(incoming) ? incoming : crypto.randomUUID();
  req.requestId = requestId;
  res.set("X-Request-ID", requestId);
  res.set("X-API-Version", API_VERSION);
  requestContext.run({ requestId }, next);
};
