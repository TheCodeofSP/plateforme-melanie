require("dotenv").config();
const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const { assertAutomatedTestDatabase } = require("../../src/utils/databaseSafety");

const testUri = process.env.MONGO_TEST_URI;
assertAutomatedTestDatabase({
  testUri,
  mainUri: process.env.MONGO_URI,
  allowReset: process.env.ALLOW_TEST_DATABASE_RESET === "true",
});
process.env.MONGO_URI = "mongodb://127.0.0.1:27017/not-used-by-integration-tests";
process.env.NODE_ENV = "test";
process.env.APP_ENV = "test";
process.env.EMAIL_MODE = "capture";
process.env.EMAIL_CONTACT_SYNC_ENABLED = "false";

const fixtures = require("../../src/services/fixture.service");
const app = require("../../src/app");

let server;
test.before(async () => {
  await mongoose.connect(testUri);
  await fixtures.reset();
  await fixtures.seed(process.env.FIXTURE_PASSWORD);
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
});

test.after(async () => {
  await fixtures.reset();
  await new Promise((resolve) => server.close(resolve));
  await mongoose.connection.close();
});

async function login(base, email) {
  const response = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email,
      password: process.env.FIXTURE_PASSWORD,
      rememberMe: false,
    }),
  });
  assert.equal(response.status, 200);
  return response.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
}

test("le parcours administratrice ouvre les routes système protégées", async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const cookies = await login(base, "admin.fixture@example.test");
  const status = await fetch(`${base}/api/admin/system/status`, {
    headers: { cookie: cookies },
  });
  assert.equal(status.status, 200);
  const body = await status.json();
  assert.equal(body.success, true);
  assert.equal(body.data.environment, "test");
  assert.equal(body.data.database.connected, true);
});

test("une membre ne peut pas consulter l’état technique", async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const cookies = await login(base, "member1.fixture@example.test");
  const status = await fetch(`${base}/api/admin/system/status`, {
    headers: { cookie: cookies },
  });
  assert.equal(status.status, 403);
});
