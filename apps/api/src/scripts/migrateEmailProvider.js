require("dotenv").config();
const mongoose = require("mongoose");
const connectDatabase = require("../config/db");

async function run() {
  await connectDatabase();
  const participants = mongoose.connection.collection("quizparticipants");
  const accessLogs = mongoose.connection.collection("quizadminaccesslogs");

  const renamed = await participants.updateMany(
    { brevoSync: { $exists: true }, marketingSync: { $exists: false } },
    { $rename: { brevoSync: "marketingSync" } },
  );
  const cleaned = await participants.updateMany(
    { brevoSync: { $exists: true }, marketingSync: { $exists: true } },
    { $unset: { brevoSync: "" } },
  );
  const logs = await accessLogs.updateMany(
    { action: "BREVO_RETRY_REQUESTED" },
    { $set: { action: "MARKETING_SYNC_RETRY_REQUESTED" } },
  );

  console.log(
    `✅ Migration email terminée : ${renamed.modifiedCount} participante(s) migrée(s), ` +
    `${cleaned.modifiedCount} doublon(s) nettoyé(s), ${logs.modifiedCount} journal(aux) renommé(s).`,
  );
  await mongoose.connection.close();
}

run().catch(async (error) => {
  console.error("❌ Migration email impossible :", error.message);
  await mongoose.connection.close();
  process.exit(1);
});
