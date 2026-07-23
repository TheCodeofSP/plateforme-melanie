require("dotenv").config();
const mongoose = require("mongoose");
const connectDatabase = require("../config/db");
const MigrationRecord = require("../models/MigrationRecord");
const { EXPECTED_MIGRATIONS } = require("../config/migrations.constants");

async function run() {
  await connectDatabase();
  for (const migration of EXPECTED_MIGRATIONS) {
    await MigrationRecord.findOneAndUpdate(
      { name: migration.name, version: migration.version },
      {
        $setOnInsert: {
          ...migration,
          status: "HISTORICAL",
          summary: "Migration exécutée avant la mise en place du registre.",
          executedAt: new Date(),
        },
      },
      { upsert: true },
    );
  }
  console.log(
    `✅ ${EXPECTED_MIGRATIONS.length} migration(s) historique(s) enregistrée(s).`,
  );
  await mongoose.connection.close();
}

run().catch(async (error) => {
  console.error("❌ Enregistrement des migrations impossible :", error.message);
  await mongoose.connection.close();
  process.exit(1);
});
