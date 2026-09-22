require("dotenv").config();

const assert = require("node:assert/strict");
const test = require("node:test");
const mongoose = require("mongoose");

const testUri = process.env.MONGO_TEST_URI;
process.env.MONGO_URI ||=
  testUri || "mongodb://127.0.0.1:27017/plateforme_melanie_test";
process.env.NODE_ENV = "test";
process.env.APP_ENV = "test";
process.env.CLIENT_URL ||= "http://localhost:5173";
process.env.EMAIL_MODE = "capture";
process.env.EMAIL_CONTACT_SYNC_ENABLED = "false";
process.env.RESEND_API_KEY ||= "integration-test-key";
process.env.RESEND_FROM_EMAIL ||= "test@example.org";
process.env.RESEND_FROM_NAME ||= "Mélanie Dizet";
process.env.RESEND_DEVELOPMENT_RECIPIENT ||= "capture@example.org";
process.env.JWT_ACCESS_SECRET ||= "a".repeat(64);

const { ACCOUNT_TOKEN_TYPES } = require("../../src/config/auth.constants");
const AccountToken = require("../../src/models/AccountToken");
const User = require("../../src/models/User");
const fixtures = require("../../src/services/fixture.service");
const { hashToken } = require("../../src/services/token.service");
const {
  assertAutomatedTestDatabase,
} = require("../../src/utils/databaseSafety");

if (testUri) {
  assertAutomatedTestDatabase({
    testUri,
    mainUri: process.env.MONGO_URI,
    allowReset: process.env.ALLOW_TEST_DATABASE_RESET === "true",
  });
}

const integrationTest = testUri ? test : test.skip;

const app = require("../../src/app");

let server;
let base;

test.before(async () => {
  if (!testUri) return;
  await mongoose.connect(testUri);
  await fixtures.reset();
  await fixtures.seed();
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  if (!testUri) return;
  await fixtures.reset();
  await new Promise((resolve) => server.close(resolve));
  await mongoose.connection.close();
});

async function createAccountToken({ email, token, type }) {
  const user = await User.findOne({ email });
  assert.ok(user, `Fixture absente pour ${email}`);
  await AccountToken.updateMany(
    { user: user._id, type, usedAt: null },
    { $set: { usedAt: new Date() } },
  );
  await AccountToken.create({
    user: user._id,
    type,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });
  return user;
}

async function consumeLoginLink(email, suffix = "default") {
  const token = hashToken(`integration:${email}:${suffix}:${Date.now()}`);
  await createAccountToken({
    email,
    token,
    type: ACCOUNT_TOKEN_TYPES.LOGIN_LINK,
  });
  const response = await fetch(`${base}/api/auth/login-link`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token }),
  });
  const cookies = response.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
  return { response, cookies, token };
}

integrationTest(
  "le parcours administratrice ouvre les routes système protégées",
  async () => {
    const { response, cookies } = await consumeLoginLink(
      "admin.fixture@example.test",
      "admin",
    );
    assert.equal(response.status, 200);
    const status = await fetch(`${base}/api/admin/system/status`, {
      headers: { cookie: cookies },
    });
    assert.equal(status.status, 200);
    const body = await status.json();
    assert.equal(body.success, true);
    assert.equal(body.data.environment, "test");
    assert.equal(body.data.database.connected, true);
  },
);

integrationTest(
  "une membre ne peut pas consulter l’état technique",
  async () => {
    const { response, cookies } = await consumeLoginLink(
      "member1.fixture@example.test",
      "member",
    );
    assert.equal(response.status, 200);
    const status = await fetch(`${base}/api/admin/system/status`, {
      headers: { cookie: cookies },
    });
    assert.equal(status.status, 403);
  },
);

integrationTest(
  "un lien de connexion ne peut être consommé qu’une fois",
  async () => {
    const { response, token } = await consumeLoginLink(
      "member2.fixture@example.test",
      "single-use",
    );
    assert.equal(response.status, 200);
    const replay = await fetch(`${base}/api/auth/login-link`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    });
    assert.equal(replay.status, 400);
  },
);

integrationTest(
  "deux consommations simultanées ne créent qu’une connexion",
  async () => {
    const token = hashToken(`integration:concurrency:${Date.now()}`);
    await createAccountToken({
      email: "member3.fixture@example.test",
      token,
      type: ACCOUNT_TOKEN_TYPES.LOGIN_LINK,
    });
    const request = () =>
      fetch(`${base}/api/auth/login-link`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
    const responses = await Promise.all([request(), request()]);
    assert.deepEqual(responses.map(({ status }) => status).sort(), [200, 400]);
  },
);

integrationTest(
  "la validation email active le compte et refuse la réutilisation",
  async () => {
    const token = hashToken(`integration:verification:${Date.now()}`);
    const user = await createAccountToken({
      email: "pending.email.fixture@example.test",
      token,
      type: ACCOUNT_TOKEN_TYPES.EMAIL_VERIFICATION,
    });
    const verify = () =>
      fetch(`${base}/api/auth/verify-email`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
    assert.equal((await verify()).status, 200);
    assert.equal((await verify()).status, 400);
    const refreshedUser = await User.findById(user._id);
    assert.equal(refreshedUser.accountStatus, "ACTIVE");
    assert.ok(refreshedUser.emailVerifiedAt);
  },
);
