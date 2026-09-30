require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Resource = require("../models/Resource");
const rows = require("../data/resourceRecette.config.json");
const { getRecetteKeys, getRecetteChanges } = require("../utils/resource-recette.utils");
const apply = process.argv.includes("--apply");

async function run() {
  await connectDB();
  const missing = [];
  let updated = 0;
  for (const row of rows) {
    const resources = await Resource.find({ externalImportKey: { $in: getRecetteKeys(row) } });
    if (!resources.length) {
      missing.push(row.externalImportKey);
      continue;
    }
    // Apply to every explicitly identified copy, including legacy V3 imports.
    for (const resource of resources) {
      const changes = getRecetteChanges(resource, row);
      if (!Object.keys(changes).length) {
        missing.push(resource.externalImportKey);
        continue;
      }
      if (apply) {
        await Resource.updateOne({ _id: resource._id }, { $set: changes }, { runValidators: true });
        const saved = await Resource.findById(resource._id).lean();
        for (const [path, expected] of Object.entries(changes)) {
          const actual = path.split(".").reduce((value, key) => value?.[key], saved);
          if (JSON.stringify(actual) !== JSON.stringify(expected))
            throw new Error(`Vérification échouée : ${resource.externalImportKey} · ${path}`);
        }
      }
      updated += 1;
      console.log(
        `${apply ? "MAJ vérifiée" : "Prévu"} · ${resource.externalImportKey} · ${row.visibility} · ${row.title} · ${row.recommendedSpmProfiles.join(", ") || "aucun profil ciblé"}`,
      );
    }
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
