require("dotenv").config();
const mongoose = require("mongoose");
const env = require("../config/env");
const fixtures = require("../services/fixture.service");
const {
  assertAutomatedTestDatabase,
  assertStagingDatabase,
} = require("../utils/databaseSafety");

async function run() {
  const target = process.argv
    .find((arg) => arg.startsWith("--target="))
    ?.split("=")[1];
  const resetRequested = process.argv.includes("--reset");
  let uri;
  if (target === "test") {
    assertAutomatedTestDatabase({
      testUri: env.MONGO_TEST_URI,
      mainUri: env.MONGO_URI,
      allowReset: env.ALLOW_TEST_DATABASE_RESET,
    });
    uri = env.MONGO_TEST_URI;
  } else if (target === "staging") {
    assertStagingDatabase({
      uri: env.MONGO_URI,
      allowReset: env.ALLOW_STAGING_RESET,
      confirmation: env.STAGING_RESET_CONFIRMATION,
      reset: resetRequested,
    });
    uri = env.MONGO_URI;
  } else {
    throw new Error("La cible doit être test ou staging.");
  }
  await mongoose.connect(uri);
  if (resetRequested || target === "test") {
    const removed = await fixtures.reset();
    console.log(`🧹 Fixtures supprimées : ${removed.usersRemoved} compte(s).`);
  }
  if (!resetRequested) {
    const result = await fixtures.seed();
    console.log(
      `✅ Fixtures ${target} prêtes : ${result.users} compte(s), ${result.profiles} profils SPM.`,
    );
  }
  await mongoose.connection.close();
}

run().catch(async (error) => {
  console.error("❌ Gestion des fixtures impossible :", error.message);
  await mongoose.connection.close();
  process.exit(1);
});
