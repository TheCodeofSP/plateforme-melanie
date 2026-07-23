const test = require("node:test");
const assert = require("node:assert/strict");

const constants = require("../src/config/notification.constants");
const validation = require("../src/validations/notification.validation");
const template = require("../src/templates/notifications/notification.template");
const mention = require("../src/services/safePlace/mention.service");

test("les notifications distinguent les deux natures validées", () => {
  assert.deepEqual(constants.NOTIFICATION_NATURES, ["PERSONAL", "MANAGEMENT"]);
});

test("les six périmètres administratifs sont stables", () => {
  assert.deepEqual(constants.MANAGEMENT_SCOPES, [
    "ACCOUNTS",
    "RESOURCES",
    "SAFE_PLACE",
    "WEBINARS",
    "COMMUNICATIONS",
    "TECHNICAL",
  ]);
});

test("la liste charge dix notifications par défaut", () => {
  const parsed = validation.listSchema.parse({});
  assert.equal(parsed.limit, 10);
  assert.equal(parsed.sort, "NEWEST");
});

test("les préférences acceptent les quatre combinaisons de canaux", () => {
  for (const channels of [
    { platform: true, email: true },
    { platform: true, email: false },
    { platform: false, email: true },
    { platform: false, email: false },
  ]) {
    assert.equal(
      validation.preferenceSchema.safeParse({
        categories: { RESOURCES: channels },
      }).success,
      true,
    );
  }
});

test("la prévisualisation refuse un chemin externe", () => {
  assert.equal(
    validation.previewSchema.safeParse({
      title: "Test",
      message: "Message",
      actionPath: "https://example.com",
    }).success,
    false,
  );
});

test("le template email échappe le contenu utilisateur", () => {
  const rendered = template({
    title: "<script>Test</script>",
    message: "<b>Contenu</b>",
    actionUrl: "https://example.com",
  });
  assert.equal(rendered.htmlContent.includes("<script>"), false);
  assert.equal(rendered.htmlContent.includes("&lt;script&gt;"), true);
});

test("les mentions sont dédupliquées et normalisées", () => {
  assert.deepEqual(
    [...mention.extract("Bonjour @Marie puis encore @marie et @Autre")],
    ["marie", "autre"],
  );
});
