require("dotenv").config();

const mongoose = require("mongoose");

const env = require("../config/env");

const collectionRenames = [
  ["contributorapplications", "intervenantapplications"],
  ["contributorexitrequests", "intervenantexitrequests"],
];

async function collectionExists(database, collectionName) {
  const collections = await database
    .listCollections({ name: collectionName }, { nameOnly: true })
    .toArray();

  return collections.length > 0;
}

async function renameCollection(database, oldName, newName) {
  const oldCollectionExists = await collectionExists(database, oldName);

  if (!oldCollectionExists) {
    console.log(
      `ℹ️ Collection ${oldName} absente : aucune migration nécessaire.`,
    );
    return;
  }

  const newCollectionExists = await collectionExists(database, newName);

  if (newCollectionExists) {
    throw new Error(
      `Migration interrompue : les collections ${oldName} et ${newName} existent toutes les deux.`,
    );
  }

  await database.collection(oldName).rename(newName);

  console.log(`✅ Collection ${oldName} renommée en ${newName}.`);
}

async function assertCollectionRenamesAreSafe(database) {
  for (const [oldName, newName] of collectionRenames) {
    const oldCollectionExists = await collectionExists(database, oldName);
    const newCollectionExists = await collectionExists(database, newName);

    if (oldCollectionExists && newCollectionExists) {
      throw new Error(
        `Migration interrompue : les collections ${oldName} et ${newName} existent toutes les deux.`,
      );
    }
  }
}

async function migrateIntervenantRole() {
  await mongoose.connect(env.MONGO_URI);

  const database = mongoose.connection.db;

  await assertCollectionRenamesAreSafe(database);

  const usersResult = await database
    .collection("users")
    .updateMany({ role: "CONTRIBUTOR" }, { $set: { role: "INTERVENANT" } });

  console.log(
    `✅ ${usersResult.modifiedCount} compte(s) migré(s) vers le rôle INTERVENANT.`,
  );

  const actionMappings = {
    CONTRIBUTOR_APPLICATION_APPROVED: "INTERVENANT_APPLICATION_APPROVED",
    CONTRIBUTOR_APPLICATION_DECLINED: "INTERVENANT_APPLICATION_DECLINED",
    CONTRIBUTOR_EXIT_APPROVED: "INTERVENANT_EXIT_APPROVED",
    CONTRIBUTOR_EXIT_DECLINED: "INTERVENANT_EXIT_DECLINED",
    CONTRIBUTOR_ROLE_REVOKED: "INTERVENANT_ROLE_REVOKED",
  };

  for (const [oldAction, newAction] of Object.entries(actionMappings)) {
    await database
      .collection("adminactionlogs")
      .updateMany({ action: oldAction }, { $set: { action: newAction } });
  }

  await database
    .collection("adminactionlogs")
    .updateMany(
      { "previousState.role": "CONTRIBUTOR" },
      { $set: { "previousState.role": "INTERVENANT" } },
    );

  await database
    .collection("adminactionlogs")
    .updateMany(
      { "newState.role": "CONTRIBUTOR" },
      { $set: { "newState.role": "INTERVENANT" } },
    );

  await database
    .collection("adminactionlogs")
    .updateMany(
      { "relatedDocument.model": "ContributorApplication" },
      { $set: { "relatedDocument.model": "IntervenantApplication" } },
    );

  await database
    .collection("adminactionlogs")
    .updateMany(
      { "relatedDocument.model": "ContributorExitRequest" },
      { $set: { "relatedDocument.model": "IntervenantExitRequest" } },
    );

  for (const [oldName, newName] of collectionRenames) {
    await renameCollection(database, oldName, newName);
  }

  console.log("✅ Migration du profil intervenant terminée.");
}

migrateIntervenantRole()
  .catch((error) => {
    console.error("❌ Migration impossible :", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
