const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const app = fs.readFileSync(path.join(root, "src/app.js"), "utf8");
const quizRoutes = fs.readFileSync(
  path.join(root, "src/routes/quiz/adminQuiz.routes.js"),
  "utf8",
);
const systemRoutes = fs.readFileSync(
  path.join(root, "src/routes/system.routes.js"),
  "utf8",
);
const documentation = fs.readFileSync(
  path.join(root, "docs/API_FRONTEND.md"),
  "utf8",
);

const contracts = [
  [app, 'app.use("/api/admin/system"', "montage système"],
  [quizRoutes, "retry-marketing-sync", "relance marketing neutre"],
  [systemRoutes, '"/status"', "état système"],
  [systemRoutes, '"/checks"', "contrôles externes"],
  [systemRoutes, '"/email-dispatches"', "journal email"],
  [documentation, "/api/admin/system/status", "documentation état système"],
  [documentation, "/api/admin/system/checks", "documentation contrôles"],
  [
    documentation,
    "/api/admin/system/email-dispatches",
    "documentation journal email",
  ],
  [documentation, "retry-marketing-sync", "documentation relance marketing"],
];
const missing = contracts.filter(
  ([content, needle]) => !content.includes(needle),
);
if (missing.length) {
  for (const [, , label] of missing)
    console.error(`❌ Contrat manquant : ${label}`);
  process.exit(1);
}

const forbiddenFiles = [];
function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(file);
    else if (
      entry.name.endsWith(".js") &&
      ![
        "migrateEmailProvider.js",
        "checkApiContract.js",
        "checkConfiguration.js",
      ].some((name) => file.endsWith(name))
    ) {
      if (/brevo/i.test(fs.readFileSync(file, "utf8")))
        forbiddenFiles.push(path.relative(root, file));
    }
  }
}
visit(path.join(root, "src"));
if (forbiddenFiles.length) {
  console.error(
    `❌ Références Brevo interdites : ${forbiddenFiles.join(", ")}`,
  );
  process.exit(1);
}
console.log("✅ Contrat API V1 et indépendance du fournisseur vérifiés.");
