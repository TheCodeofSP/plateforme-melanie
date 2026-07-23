require("dotenv").config();
const fs = require("node:fs/promises");
const path = require("node:path");
const mongoose = require("mongoose");
const connectDatabase = require("../config/db");
const audit = require("../services/dataAudit.service");

async function run() {
  await connectDatabase();
  const report = await audit.run();
  const reportDirectory = path.resolve(process.cwd(), ".reports");
  await fs.mkdir(reportDirectory, { recursive: true });
  const file = path.join(
    reportDirectory,
    `data-audit-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
  );
  await fs.writeFile(file, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  for (const check of report.checks) {
    const icon =
      check.count === 0 ? "✅" : check.severity === "CRITICAL" ? "❌" : "⚠️";
    console.log(`${icon} ${check.key}: ${check.count}`);
  }
  console.log(`Rapport : ${file}`);
  await mongoose.connection.close();
  if (report.summary.critical > 0) process.exitCode = 1;
}

run().catch(async (error) => {
  console.error("❌ Audit impossible :", error.message);
  await mongoose.connection.close();
  process.exit(1);
});
