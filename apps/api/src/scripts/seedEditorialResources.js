require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Resource = require("../models/Resource");
const User = require("../models/User");
const rows = require("../data/editorialResources.seed");
const {
  completeResourceVersionSchema,
} = require("../validations/resource.validation");
const { uniqueSlug } = require("../services/resources/resource.service");

async function run() {
  await connectDB();
  const admin = await User.findOne({
    role: "ADMIN",
    accountStatus: "ACTIVE",
  }).sort({ createdAt: 1 });
  if (!admin)
    throw new Error(
      "Aucune administratrice active. Crée ou active le compte de Mélanie avant ce peuplement.",
    );
  let created = 0;
  let skipped = 0;
  for (const row of rows) {
    if (await Resource.exists({ externalImportKey: row.externalImportKey })) {
      skipped += 1;
      continue;
    }
    const content = completeResourceVersionSchema.parse(row.content);
    const now = new Date();
    await Resource.create({
      owner: admin._id,
      authorRole: "ADMIN",
      externalImportKey: row.externalImportKey,
      fixtureKey: `editorial:${row.externalImportKey}`,
      slug: await uniqueSlug(content.title),
      publicationStatus: "PUBLISHED",
      reviewStatus: "APPROVED",
      publishedVersion: content,
      finalVisibility: content.proposedVisibility,
      firstPublishedAt: now,
      lastPublishedAt: now,
    });
    created += 1;
  }
  console.log(
    `✅ Ressources éditoriales : ${created} créée(s), ${skipped} déjà présente(s).`,
  );
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(`❌ Peuplement impossible : ${error.message}`);
  await mongoose.disconnect();
  process.exit(1);
});
