function databaseName(uri) {
  try {
    return new URL(uri).pathname.replace(/^\//, "").split("?")[0];
  } catch {
    return "";
  }
}

function assertAutomatedTestDatabase({ testUri, mainUri, allowReset }) {
  const name = databaseName(testUri);
  if (!testUri) throw new Error("MONGO_TEST_URI est obligatoire.");
  if (testUri === mainUri)
    throw new Error(
      "MONGO_TEST_URI ne doit jamais être identique à MONGO_URI.",
    );
  if (!name.endsWith("_automated_test")) {
    throw new Error(
      "La base automatisée doit se terminer par _automated_test.",
    );
  }
  if (!allowReset)
    throw new Error("ALLOW_TEST_DATABASE_RESET=true est obligatoire.");
  return name;
}

function assertStagingDatabase({
  uri,
  allowReset = false,
  confirmation = null,
  reset = false,
}) {
  const name = databaseName(uri);
  if (!name.endsWith("_staging")) {
    throw new Error("La base staging doit se terminer par _staging.");
  }
  if (reset) {
    if (!allowReset)
      throw new Error("ALLOW_STAGING_RESET=true est obligatoire.");
    if (confirmation !== "RESET_PLATEFORME_MELANIE_STAGING") {
      throw new Error(
        "La confirmation de réinitialisation staging est invalide.",
      );
    }
  }
  return name;
}

module.exports = {
  databaseName,
  assertAutomatedTestDatabase,
  assertStagingDatabase,
};
