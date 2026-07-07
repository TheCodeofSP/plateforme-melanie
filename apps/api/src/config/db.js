const mongoose = require("mongoose");

async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connecté");
  } catch (error) {
    console.error("❌ Erreur MongoDB");
    console.error(error.message);

    process.exit(1);
  }
}

module.exports = connectDatabase;