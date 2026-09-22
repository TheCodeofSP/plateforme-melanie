require("dotenv").config();
const fs = require("fs");
const path = require("path");
const connectDB = require("../config/db");
const User = require("../models/User");
const Resource = require("../models/Resource");
const {
  completeResourceVersionSchema,
} = require("../validations/resource.validation");
const { uniqueSlug } = require("../services/resources/resource.service");

function argument(name) {
  const prefix = `--${name}=`;
  return process.argv.find((x) => x.startsWith(prefix))?.slice(prefix.length);
}

async function main() {
  const file = process.argv[2];
  const adminEmail = argument("admin");
  if (!file || !adminEmail)
    throw new Error(
      "Usage : npm run import:resources -- ressources.json --admin=admin@exemple.fr",
    );
  const absolute = path.resolve(file);
  const rows = JSON.parse(fs.readFileSync(absolute, "utf8"));
  if (!Array.isArray(rows))
    throw new Error("Le fichier JSON doit contenir un tableau.");
  await connectDB();
  const admin = await User.findOne({
    email: adminEmail.toLowerCase(),
    role: "ADMIN",
    accountStatus: "ACTIVE",
  });
  if (!admin) throw new Error("Administratrice active introuvable.");
  const report = { created: 0, skipped: 0, errors: [] };
  for (const [index, row] of rows.entries()) {
    try {
      if (!row.externalImportKey)
        throw new Error("externalImportKey est obligatoire.");
      if (await Resource.exists({ externalImportKey: row.externalImportKey })) {
        report.skipped += 1;
        continue;
      }
      const result = completeResourceVersionSchema.safeParse(row.content);
      if (!result.success)
        throw new Error(
          result.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; "),
        );
      const status = row.status || "DRAFT";
      const published = status !== "DRAFT";
      await Resource.create({
        owner: admin._id,
        authorRole: "ADMIN",
        externalImportKey: row.externalImportKey,
        slug: published ? await uniqueSlug(result.data.title) : undefined,
        workingVersion: published ? undefined : result.data,
        publishedVersion: published ? result.data : undefined,
        finalVisibility: published
          ? row.visibility || result.data.proposedVisibility
          : null,
        publicationStatus: status,
        reviewStatus: published ? "APPROVED" : "NOT_SUBMITTED",
        scheduledFor:
          status === "SCHEDULED" ? new Date(row.scheduledFor) : null,
        firstPublishedAt: published
          ? status === "SCHEDULED"
            ? new Date(row.scheduledFor)
            : new Date()
          : null,
        lastPublishedAt: published
          ? status === "SCHEDULED"
            ? new Date(row.scheduledFor)
            : new Date()
          : null,
      });
      report.created += 1;
    } catch (error) {
      report.errors.push({
        line: index + 1,
        externalImportKey: row.externalImportKey,
        message: error.message,
      });
    }
  }
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.errors.length ? 1 : 0);
}
main().catch((error) => {
  console.error(`Import impossible : ${error.message}`);
  process.exit(1);
});
