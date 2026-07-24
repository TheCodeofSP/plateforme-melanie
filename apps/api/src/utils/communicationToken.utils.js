const jwt = require("jsonwebtoken"); const env = require("../config/env");
function signUnsubscribe(email) { return jwt.sign({ purpose: "COMMUNICATION_UNSUBSCRIBE", email: email.trim().toLowerCase() }, env.JWT_ACCESS_SECRET, { expiresIn: "3y" }); }
function verifyUnsubscribe(token) { const payload = jwt.verify(token, env.JWT_ACCESS_SECRET); if (payload.purpose !== "COMMUNICATION_UNSUBSCRIBE" || !payload.email) throw new Error("Jeton invalide."); return payload.email; }
module.exports = { signUnsubscribe, verifyUnsubscribe };
