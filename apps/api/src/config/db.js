const mongoose = require("mongoose");

const env = require("./env");

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2) {
    await mongoose.connection.asPromise();
    return mongoose.connection;
  }

  try {
    await mongoose.connect(env.MONGO_URI);

    console.log("✅ MongoDB connecté");
    return mongoose.connection;
  } catch (error) {
    console.error("❌ Erreur MongoDB :", error.message);

    throw error;
  }
}

module.exports = connectDatabase;
