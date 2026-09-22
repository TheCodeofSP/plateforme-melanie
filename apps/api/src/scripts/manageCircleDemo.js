require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const SafePlaceCategory = require("../models/SafePlaceCategory");
const SafePlacePost = require("../models/SafePlacePost");
const User = require("../models/User");
const rows = require("../data/circleDemo.seed");

const prefix = "circle-demo-2026:";

async function cleanup() {
  const result = await SafePlacePost.deleteMany({
    fixtureKey: { $regex: `^${prefix}` },
  });
  console.log(`🧹 Discussions de recette supprimées : ${result.deletedCount}.`);
}

async function seed() {
  let created = 0;
  let skipped = 0;
  for (const [index, row] of rows.entries()) {
    const fixtureKey = `${prefix}${index + 1}`;
    if (await SafePlacePost.exists({ fixtureKey })) {
      skipped += 1;
      continue;
    }
    const [category, author] = await Promise.all([
      SafePlaceCategory.findOne({ slug: row.categorySlug, status: "ACTIVE" }),
      User.findOne({
        fixtureKey: row.fixtureUser,
        accountStatus: "ACTIVE",
      }).select("+fixtureKey"),
    ]);
    if (!category)
      throw new Error(
        `Catégorie absente : ${row.categorySlug}. Lance d’abord npm run seed:safe-place.`,
      );
    if (!author)
      throw new Error(
        `Compte de recette absent : ${row.fixtureUser}. Lance d’abord npm run seed:staging.`,
      );
    await SafePlacePost.create({
      fixtureKey,
      author: author._id,
      category: category._id,
      title: row.title,
      content: row.content,
      isPinned: Boolean(row.pinned),
      pinnedAt: row.pinned ? new Date() : null,
      pinnedBy: row.pinned ? author._id : null,
      lastActivityAt: new Date(),
    });
    await SafePlaceCategory.updateOne(
      { _id: category._id },
      { $inc: { "counters.posts": 1 } },
    );
    created += 1;
  }
  console.log(
    `✅ Discussions de recette : ${created} créée(s), ${skipped} déjà présente(s).`,
  );
}

async function run() {
  await connectDB();
  if (process.argv.includes("--cleanup")) await cleanup();
  else await seed();
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(`❌ Gestion des discussions impossible : ${error.message}`);
  await mongoose.disconnect();
  process.exit(1);
});
