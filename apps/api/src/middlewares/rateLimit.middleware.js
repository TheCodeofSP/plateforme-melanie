function createRateLimit({
  windowMs = 15 * 60 * 1000,
  max = 300,
  code = "RATE_LIMIT_EXCEEDED",
} = {}) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = `${req.ip}:${req.baseUrl}`;
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now)
      hits.set(key, { count: 1, resetAt: now + windowMs });
    else {
      entry.count += 1;
      if (entry.count > max) {
        res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
        return res
          .status(429)
          .json({
            success: false,
            code,
            message: "Trop de requêtes. Réessaie dans quelques minutes.",
          });
      }
    }
    if (hits.size > 10000)
      for (const [storedKey, value] of hits)
        if (value.resetAt <= now) hits.delete(storedKey);
    return next();
  };
}
module.exports = createRateLimit;
