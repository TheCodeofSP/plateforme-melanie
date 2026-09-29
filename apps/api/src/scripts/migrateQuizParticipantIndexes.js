require("dotenv").config();

const mongoose = require("mongoose");

const env = require("../config/env");
const QuizParticipant = require("../models/QuizParticipant");

async function migrate() {
  await mongoose.connect(env.MONGO_URI);

  const collection = QuizParticipant.collection;
  const indexes = await collection.indexes();
  const userIndex = indexes.find(
    (index) => index.key?.user === 1 && Object.keys(index.key).length === 1,
  );

  await collection.updateMany(
    { user: null },
    { $unset: { user: "", linkedAt: "" } },
  );

  if (userIndex) {
    await collection.dropIndex(userIndex.name);
  }

  await collection.createIndex(
    { user: 1 },
    {
      name: "user_1",
      unique: true,
      partialFilterExpression: { user: { $type: "objectId" } },
    },
  );

  console.log(
    "✅ Index QuizParticipant corrigé : plusieurs participantes sans compte sont maintenant autorisées.",
  );
}

migrate()
  .catch((error) => {
    console.error("❌ Migration impossible :", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
