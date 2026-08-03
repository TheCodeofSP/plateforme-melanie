const test = require("node:test");
const assert = require("node:assert/strict");

Object.assign(process.env, {
  NODE_ENV: "test",
  MONGO_URI: "mongodb://127.0.0.1:27017/unused-smoke-test",
  CLIENT_URL: "http://localhost:5173",
  EMAIL_PROVIDER: "resend",
  EMAIL_MODE: "capture",
  EMAIL_CONTACT_SYNC_ENABLED: "false",
  RESEND_API_KEY: "re_test",
  RESEND_FROM_EMAIL: "onboarding@resend.dev",
  RESEND_FROM_NAME: "Tests",
  RESEND_DEVELOPMENT_RECIPIENT: "developer@example.org",
  JWT_ACCESS_SECRET:
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789__",
  CRON_SECRET: "abcdefghijklmnopqrstuvwxyz0123456789",
  RESEND_WEBHOOK_SECRET: "whsec_abcdefghijklmnopqrstuvwxyz0123456789",
});

const app = require("../src/app");

test("l’API répond et protège les tâches Vercel", async () => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  try {
    const { port } = server.address();
    const health = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.equal(health.status, 200);
    assert.equal(health.headers.get("x-api-version"), "1.0.0");
    assert.match(health.headers.get("x-request-id"), /^[a-f\d-]{36}$/);
    const healthBody = await health.json();
    assert.equal(healthBody.status, "OK");
    assert.equal(healthBody.version, "1.0.0");
    const cron = await fetch(
      `http://127.0.0.1:${port}/api/internal/cron/publish-resources`,
    );
    assert.equal(cron.status, 401);
    assert.equal((await cron.json()).code, "INVALID_CRON_SECRET");
    const charter = await fetch(
      `http://127.0.0.1:${port}/api/safe-place/charter`,
    );
    assert.equal(charter.status, 200);
    assert.equal((await charter.json()).charter.title, "Charte du Safe Place");
    const safePlace = await fetch(
      `http://127.0.0.1:${port}/api/safe-place/categories`,
    );
    assert.equal(safePlace.status, 401);
    const session = await fetch(`http://127.0.0.1:${port}/api/auth/me`);
    assert.equal(session.status, 200);
    assert.equal((await session.json()).user, null);
    const preferences = await fetch(
      `http://127.0.0.1:${port}/api/communication-preferences/me`,
    );
    assert.equal(preferences.status, 401);
    const webhook = await fetch(
      `http://127.0.0.1:${port}/api/webhooks/resend/communications`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "email.delivered" }),
      },
    );
    assert.equal(webhook.status, 401);
    const dashboard = await fetch(
      `http://127.0.0.1:${port}/api/admin/dashboard/overview`,
    );
    assert.equal(dashboard.status, 401);
    const system = await fetch(
      `http://127.0.0.1:${port}/api/admin/system/status`,
    );
    assert.equal(system.status, 401);
    const missing = await fetch(
      `http://127.0.0.1:${port}/api/route-inexistante`,
      {
        headers: { "x-request-id": "frontend-request-1234" },
      },
    );
    const missingBody = await missing.json();
    assert.equal(missingBody.code, "ROUTE_NOT_FOUND");
    assert.equal(missingBody.requestId, "frontend-request-1234");
    assert.equal("stack" in missingBody, false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
