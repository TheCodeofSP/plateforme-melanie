const attemptsByAddress = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function quizRateLimit(req, res, next) {
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const recent = (attemptsByAddress.get(key) || []).filter((timestamp) => now - timestamp < WINDOW_MS);

  if (recent.length >= MAX_ATTEMPTS) {
    return res.status(429).json({ success: false, code: "QUIZ_RATE_LIMITED", message: "Trop de tentatives ont été envoyées. Réessaie dans quelques minutes." });
  }

  recent.push(now);
  attemptsByAddress.set(key, recent);
  next();
}

module.exports = quizRateLimit;
