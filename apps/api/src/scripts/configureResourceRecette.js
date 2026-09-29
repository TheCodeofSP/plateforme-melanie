require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Resource = require("../models/Resource");
const rows = require("../data/resourceRecette.config.json");
const apply = process.argv.includes("--apply");

async function run() {
  await connectDB();
  const missing = [];
  let updated = 0;
  for (const row of rows) {
    const resource = await Resource.findOne({ externalImportKey: row.externalImportKey });
    if (!resource?.publishedVersion) {
      missing.push(row.externalImportKey);
      continue;
    }
    const changes = {
      finalVisibility: row.visibility,
      "publishedVersion.proposedVisibility": row.visibility,
      "publishedVersion.recommendedSpmProfiles": row.recommendedSpmProfiles,
    };
    if (resource.workingVersion) {
      changes["workingVersion.proposedVisibility"] = row.visibility;
      changes["workingVersion.recommendedSpmProfiles"] = row.recommendedSpmProfiles;
    }
    if (apply)
      await Resource.updateOne({ _id: resource._id }, { $set: changes }, { runValidators: true });
    updated += 1;
    console.log(
      `${apply ? "MAJ" : "Prévu"} · ${row.visibility} · ${row.title} · ${row.recommendedSpmProfiles.join(", ") || "aucun profil ciblé"}`,
    );
  }
  console.log(
    `${updated} ressource(s) ${apply ? "mises à jour" : "à mettre à jour"}. ${missing.length} absente(s).`,
  );
  if (missing.length) {
    console.log("Clés absentes :", missing.join(", "));
    process.exitCode = 1;
  }
  if (!apply)
    console.log("Prévisualisation : aucune modification. Utiliser --apply pour appliquer ce plan.");
}
run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
