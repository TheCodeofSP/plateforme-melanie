require("dotenv").config();
const crypto = require("node:crypto");

const app = require("../src/app");
const connectDatabase = require("../src/config/db");
const { API_VERSION } = require("../src/config/app.constants");

module.exports = async function handler(req, res) {
  try {
    await connectDatabase();
    return app(req, res);
  } catch (error) {
    const requestId = req.headers["x-request-id"] || crypto.randomUUID();
    console.error(
      `[${requestId}] Connexion MongoDB impossible:`,
      error.message,
    );
    res.setHeader("X-Request-ID", requestId);
    res.setHeader("X-API-Version", API_VERSION);
    return res.status(503).json({
      success: false,
      code: "DATABASE_UNAVAILABLE",
      message: "Le service est temporairement indisponible.",
      details: null,
      requestId,
    });
  }
};
