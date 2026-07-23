const crypto = require("crypto");

const jwt = require("jsonwebtoken");

const env = require("../config/env");

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateAccessToken({ userId, sessionId }) {
  return jwt.sign(
    {
      sub: userId.toString(),
      sessionId: sessionId.toString(),
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: "15m",
    },
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

module.exports = {
  generateToken,
  hashToken,
  generateAccessToken,
  verifyAccessToken,
};
