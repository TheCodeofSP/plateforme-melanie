require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Resource = require("../models/Resource");
const User = require("../models/User");
const rows = require("../data/editorialResources.seed");
const { completeResourceVersionSchema } = require("../validations/resource.validation");
const { uniqueSlug } = require("../services/resources/resource.service");

const applyChanges = process.argv.includes("--apply");

function publicationDate(content, fallback = new Date()) {
  return content.originalPublishedAt ? new Date(content.originalPublishedAt) : fallback;
}

function printPlan(action, content) {
  const access = content.proposedVisibility === "MEMBERS_ONLY" ? "privée" : "publique";
  console.log(`- ${action} · ${access} · ${content.title}`);
}

async function createResource(row, content, admin) {
  const publishedAt = publicationDate(content);

  if (!applyChanges) {
    printPlan("À créer", content);
    return;
  }

  await Resource.create({
    owner: admin._id,
    authorRole: "ADMIN",
    externalImportKey: row.externalImportKey,
    fixtureKey: `editorial:${row.externalImportKey}`,
    slug: await uniqueSlug(content.title),
    publicationStatus: "PUBLISHED",
    reviewStatus: "APPROVED",
    publishedVersion: content,
    workingVersion: undefined,
    finalVisibility: content.proposedVisibility,
    firstPublishedAt: publishedAt,
    lastPublishedAt: publishedAt,
  });

  printPlan("Créée", content);
}

async function updateResource(resource, row, content) {
  if (!applyChanges) {
    printPlan("À mettre à jour", content);
    return;
  }

  resource.externalImportKey = row.externalImportKey;
  resource.fixtureKey = `editorial:${row.externalImportKey}`;
  resource.publicationStatus = "PUBLISHED";
  resource.reviewStatus = "APPROVED";
  resource.publishedVersion = content;
  resource.workingVersion = undefined;
  resource.finalVisibility = content.proposedVisibility;
  resource.scheduledFor = null;
  resource.unpublishedAt = null;
  resource.archivedAt = null;
  resource.firstPublishedAt = resource.firstPublishedAt || publicationDate(content);
  resource.lastPublishedAt = resource.lastPublishedAt || publicationDate(content);

  await resource.save();
  printPlan("Mise à jour", content);
}

async function run() {
  await connectDB();

  const admin = await User.findOne({
    role: "ADMIN",
    accountStatus: "ACTIVE",
  }).sort({ createdAt: 1 });

  if (!admin) {
    throw new Error(
      "Aucune administratrice active. Crée ou active le compte de Mélanie avant ce peuplement.",
    );
  }

  const summary = { created: 0, updated: 0 };

  console.log(
    applyChanges
      ? "Application du catalogue éditorial…"
      : "Prévisualisation uniquement : aucune donnée ne sera modifiée.",
  );

  for (const row of rows) {
    const content = completeResourceVersionSchema.parse(row.content);
    const existing = await Resource.findOne({
      externalImportKey: row.externalImportKey,
    });

    if (existing) {
      await updateResource(existing, row, content);
      summary.updated += 1;
    } else {
      await createResource(row, content, admin);
      summary.created += 1;
    }
  }

  console.log(
    applyChanges
      ? `✅ Catalogue éditorial synchronisé : ${summary.created} création(s), ${summary.updated} mise(s) à jour.`
      : `ℹ️ Prévisualisation terminée : ${summary.created} création(s) et ${summary.updated} mise(s) à jour prévues. Relance avec --apply pour confirmer.`,
  );
}

run()
  .catch((error) => {
    console.error(`❌ Synchronisation impossible : ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
