function createConflictError(message) {
  const error = new Error(message);

  error.statusCode = 409;

  return error;
}

function createBadRequestError(message) {
  const error = new Error(message);

  error.statusCode = 400;

  return error;
}

function createAuthenticationError({ message, code, statusCode, details }) {
  const error = new Error(message);

  error.code = code;
  error.statusCode = statusCode;

  if (details) {
    error.details = details;
  }

  return error;
}

module.exports = {
  createConflictError,
  createBadRequestError,
  createAuthenticationError,
};
