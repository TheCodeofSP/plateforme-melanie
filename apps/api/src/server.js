require("dotenv").config();

const mongoose = require("mongoose");

const app = require("./app");
const connectDatabase = require("./config/db");
const env = require("./config/env");

let server;

async function startServer() {
  try {
    await connectDatabase();

    server = app.listen(env.PORT, () => {
      console.log(`🚀 Serveur lancé sur le port ${env.PORT}`);
    });
  } catch (error) {
    console.error("❌ Impossible de démarrer le serveur :", error.message);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`\n🛑 Signal ${signal} reçu. Arrêt du serveur...`);

  if (server) {
    server.close(async () => {
      await mongoose.connection.close();

      console.log("✅ Serveur et connexion MongoDB arrêtés proprement");
      process.exit(0);
    });

    return;
  }

  await mongoose.connection.close();
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer();
