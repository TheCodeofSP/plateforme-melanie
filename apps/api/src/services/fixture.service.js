const bcrypt = require("bcrypt");
const User = require("../models/User");
const ConsentRecord = require("../models/ConsentRecord");
const QuizParticipant = require("../models/QuizParticipant");
const QuizAttempt = require("../models/QuizAttempt");
const QuizConsentRecord = require("../models/QuizConsentRecord");
const IntervenantApplication = require("../models/IntervenantApplication");
const ProfessionalProfile = require("../models/ProfessionalProfile");
const SafePlaceCategory = require("../models/SafePlaceCategory");
const SafePlacePost = require("../models/SafePlacePost");
const SafePlaceSuspension = require("../models/SafePlaceSuspension");
const Resource = require("../models/Resource");
const Webinar = require("../models/Webinar");
const WebinarSession = require("../models/WebinarSession");
const Communication = require("../models/Communication");
const Notification = require("../models/Notification");
const CrmContact = require("../models/CrmContact");
const DOCUMENT_VERSIONS = require("../config/documentVersions");

const PREFIX = "stabilization-v1:";
const profiles = [
  ["BOULE_DE_NERFS", "PILL"],
  ["CROQUE_TOUT", "HORMONAL_IUD"],
  ["DOUCE_MELANCOLIE", "IMPLANT"],
  ["GONFLEE_A_BLOC", "NONE"],
];

async function upsertUser(key, data, passwordHash) {
  return User.findOneAndUpdate(
    { fixtureKey: `${PREFIX}${key}` },
    {
      $set: data,
      $setOnInsert: { fixtureKey: `${PREFIX}${key}`, passwordHash },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).select("+fixtureKey");
}

async function ensureLegalConsents(users) {
  for (const user of users) {
    for (const type of ["TERMS", "PRIVACY_POLICY"]) {
      if (!await ConsentRecord.exists({ user: user._id, type, granted: true })) {
        await ConsentRecord.create({
          user: user._id,
          type,
          version: DOCUMENT_VERSIONS[type],
          granted: true,
          acceptedAt: new Date(),
        });
      }
    }
  }
}

async function seed(password) {
  const passwordHash = await bcrypt.hash(password, 12);
  const common = {
    lastName: "Fixture",
    dateOfBirth: new Date("1990-01-01"),
    accountStatus: "ACTIVE",
    emailVerifiedAt: new Date(),
  };
  const admin = await upsertUser("admin", {
    ...common, email: "admin.fixture@example.test", firstName: "Admin",
    pseudonym: "admin-fixture", role: "ADMIN",
  }, passwordHash);
  const members = [];
  for (let index = 0; index < profiles.length; index += 1) {
    const [profile] = profiles[index];
    members.push(await upsertUser(`member-${index + 1}`, {
      ...common,
      email: `member${index + 1}.fixture@example.test`,
      firstName: `Membre${index + 1}`,
      pseudonym: `membre-fixture-${index + 1}`,
      role: "MEMBER",
      currentSpmProfile: profile,
      quizCompleted: true,
    }, passwordHash));
  }
  const memberWithoutQuiz = await upsertUser("member-no-quiz", {
    ...common, email: "member.noquiz.fixture@example.test", firstName: "Sansquiz",
    pseudonym: "sans-quiz-fixture", role: "MEMBER",
  }, passwordHash);
  const minor = await upsertUser("member-minor", {
    ...common, email: "minor.fixture@example.test", firstName: "Mineure",
    pseudonym: "mineure-fixture", role: "MEMBER", dateOfBirth: new Date("2010-01-01"),
  }, passwordHash);
  const suspended = await upsertUser("member-suspended", {
    ...common, email: "suspended.fixture@example.test", firstName: "Suspendue",
    pseudonym: "suspendue-fixture", role: "MEMBER",
  }, passwordHash);
  const intervenant = await upsertUser("intervenant", {
    ...common, email: "intervenant.fixture@example.test", firstName: "Intervenante",
    pseudonym: "intervenante-fixture", role: "INTERVENANT",
  }, passwordHash);
  const pendingIntervenant = await upsertUser("intervenant-pending", {
    ...common, email: "pending.intervenant.fixture@example.test", firstName: "Candidate",
    pseudonym: "candidate-fixture", role: "MEMBER",
  }, passwordHash);
  const users = [admin, ...members, memberWithoutQuiz, minor, suspended, intervenant, pendingIntervenant];
  await ensureLegalConsents(users);

  await SafePlaceSuspension.findOneAndUpdate(
    { fixtureKey: `${PREFIX}suspension` },
    { $set: { user: suspended._id, suspendedBy: admin._id, reason: "Suspension fictive de recette.", status: "ACTIVE" }, $setOnInsert: { fixtureKey: `${PREFIX}suspension` } },
    { upsert: true },
  );

  const approvedApplication = await IntervenantApplication.findOneAndUpdate(
    { fixtureKey: `${PREFIX}application-approved` },
    { $set: { user: intervenant._id, professionalName: "Cabinet Fixture", profession: "Professionnelle de santé", specialties: ["Cycle menstruel"], presentation: "Profil fictif de recette.", motivations: "Recette de la plateforme.", status: "APPROVED", submittedAt: new Date(), decidedAt: new Date(), decidedBy: admin._id }, $setOnInsert: { fixtureKey: `${PREFIX}application-approved` } },
    { upsert: true, new: true },
  );
  await IntervenantApplication.findOneAndUpdate(
    { fixtureKey: `${PREFIX}application-pending` },
    { $set: { user: pendingIntervenant._id, professionalName: "Candidate Fixture", profession: "Intervenante", specialties: ["Bien-être"], presentation: "Candidature fictive.", motivations: "Recette de validation.", status: "PENDING", submittedAt: new Date() }, $setOnInsert: { fixtureKey: `${PREFIX}application-pending` } },
    { upsert: true },
  );
  const profileVersion = {
    professionalName: "Cabinet Fixture",
    displayedFirstName: "Intervenante",
    displayedLastName: "Fixture",
    profession: "Professionnelle de santé",
    specialties: ["Cycle menstruel"],
    shortPresentation: "Profil professionnel fictif.",
    biography: "Biographie fictive destinée à la recette de la plateforme.",
  };
  await ProfessionalProfile.findOneAndUpdate(
    { fixtureKey: `${PREFIX}professional-profile` },
    { $set: { user: intervenant._id, sourceApplication: approvedApplication._id, draftVersion: profileVersion, publishedVersion: profileVersion, publicationStatus: "PUBLISHED", reviewStatus: "APPROVED", approvedAt: new Date(), approvedBy: admin._id, isActive: true }, $setOnInsert: { fixtureKey: `${PREFIX}professional-profile` } },
    { upsert: true },
  );

  for (let index = 0; index < profiles.length; index += 1) {
    const [profile, contraception] = profiles[index];
    const user = members[index];
    const participant = await QuizParticipant.findOneAndUpdate(
      { fixtureKey: `${PREFIX}quiz-participant-${index + 1}` },
      { $set: { email: user.email, firstName: user.firstName, user: user._id, linkedAt: new Date(), currentSpmProfile: profile }, $setOnInsert: { fixtureKey: `${PREFIX}quiz-participant-${index + 1}` } },
      { upsert: true, new: true },
    );
    const scores = Object.fromEntries(profiles.map(([name]) => [name, name === profile ? 10 : 2]));
    const attempt = await QuizAttempt.findOneAndUpdate(
      { fixtureKey: `${PREFIX}quiz-attempt-${index + 1}` },
      { $set: { participant: participant._id, userSnapshot: user._id, quizVersion: "1.0", status: "COMPLETED", answers: [], participantInfo: { age: 30 + index, contraception }, scores, calculatedProfiles: [profile], selectedProfile: profile, completedAt: new Date(), resultEmail: { status: "SENT", sentAt: new Date(), attempts: 1 } }, $setOnInsert: { fixtureKey: `${PREFIX}quiz-attempt-${index + 1}` } },
      { upsert: true, new: true },
    );
    participant.latestAttempt = attempt._id;
    await participant.save();
    for (const type of ["SPM_DATA_PROCESSING", "QUIZ_RESULT_EMAIL", "MARKETING_COMMUNICATIONS", "PERSONAL_CONTACT"]) {
      await QuizConsentRecord.findOneAndUpdate(
        { attempt: attempt._id, type },
        { $setOnInsert: { participant: participant._id, attempt: attempt._id, type, granted: true, textVersion: DOCUMENT_VERSIONS[type], acceptedAt: new Date() } },
        { upsert: true },
      );
    }
  }

  const category = await SafePlaceCategory.findOneAndUpdate(
    { fixtureKey: `${PREFIX}safe-place-category` },
    { $set: { name: "Catégorie de recette", slug: "categorie-recette-stabilisation", description: "Catégorie fictive pour les parcours de recette.", displayOrder: 999, status: "ACTIVE" }, $setOnInsert: { fixtureKey: `${PREFIX}safe-place-category` } },
    { upsert: true, new: true },
  );
  await SafePlacePost.findOneAndUpdate(
    { fixtureKey: `${PREFIX}safe-place-post` },
    { $set: { author: members[0]._id, category: category._id, title: "Publication fictive de recette", content: "Cette publication permet de tester le parcours du Safe Place.", status: "VISIBLE" }, $setOnInsert: { fixtureKey: `${PREFIX}safe-place-post` } },
    { upsert: true },
  );

  await Resource.findOneAndUpdate(
    { fixtureKey: `${PREFIX}resource` },
    { $set: { owner: admin._id, authorRole: "ADMIN", slug: "ressource-recette-stabilisation", publicationStatus: "PUBLISHED", reviewStatus: "APPROVED", publishedVersion: { title: "Ressource fictive de recette", description: "Contenu fictif pour tester le frontend.", format: "ARTICLE", categories: ["CYCLE_MENSTRUEL"], recommendedSpmProfiles: ["BOULE_DE_NERFS"], durationMinutes: 5, proposedVisibility: "PUBLIC", blocks: [{ type: "PARAGRAPH", text: "Contenu fictif de démonstration." }], sourceMode: "TEXT" }, workingVersion: { title: "Ressource fictive de recette" }, finalVisibility: "PUBLIC", firstPublishedAt: new Date(), lastPublishedAt: new Date() }, $setOnInsert: { fixtureKey: `${PREFIX}resource` } },
    { upsert: true },
  );

  const webinar = await Webinar.findOneAndUpdate(
    { fixtureKey: `${PREFIX}webinar` },
    { $set: { title: "Webinaire fictif de recette", slug: "webinaire-recette-stabilisation", shortDescription: "Webinaire destiné aux tests.", description: "Description fictive du webinaire de recette.", host: admin._id, recommendedProfiles: ["BOULE_DE_NERFS"], status: "PUBLISHED", publishedAt: new Date() }, $setOnInsert: { fixtureKey: `${PREFIX}webinar` } },
    { upsert: true, new: true },
  );
  await WebinarSession.findOneAndUpdate(
    { fixtureKey: `${PREFIX}webinar-session` },
    { $set: { webinar: webinar._id, startsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), durationMinutes: 60, capacity: 20, status: "SCHEDULED" }, $setOnInsert: { fixtureKey: `${PREFIX}webinar-session` } },
    { upsert: true },
  );

  await Communication.findOneAndUpdate(
    { fixtureKey: `${PREFIX}communication` },
    { $set: { internalTitle: "Communication fictive de recette", type: "PLATFORM_NEWS", channel: "IN_APP", notificationTitle: "Actualité de recette", notificationMessage: "Communication fictive destinée au frontend.", preferenceCategory: "PLATFORM_NEWS", targeting: { roles: ["MEMBER"] }, status: "DRAFT", createdBy: admin._id }, $setOnInsert: { fixtureKey: `${PREFIX}communication` } },
    { upsert: true },
  );
  await Notification.findOneAndUpdate(
    { fixtureKey: `${PREFIX}notification` },
    { $set: { recipient: members[0]._id, nature: "PERSONAL", category: "RESOURCES", type: "RESOURCE_PUBLISHED", title: "Notification fictive", message: "Une ressource fictive est disponible.", actionPath: "/resources/ressource-recette-stabilisation" }, $setOnInsert: { fixtureKey: `${PREFIX}notification` } },
    { upsert: true },
  );
  for (let index = 0; index < profiles.length; index += 1) {
    await CrmContact.findOneAndUpdate(
      { fixtureKey: `${PREFIX}crm-${index + 1}` },
      { $set: { primaryEmail: `prospect${index + 1}.fixture@example.test`, firstName: `Prospect${index + 1}`, lastName: "Fixture", status: "NOUVEAU", sources: [{ type: "QUIZ_PUBLIC" }], marketingConsent: { granted: true, occurredAt: new Date(), source: "FIXTURE" }, currentSpmProfile: profiles[index][0], currentContraception: profiles[index][1] }, $setOnInsert: { fixtureKey: `${PREFIX}crm-${index + 1}` } },
      { upsert: true },
    );
  }

  return { users: users.length, profiles: profiles.length, prefix: PREFIX };
}

async function reset() {
  const users = await User.find({ fixtureKey: new RegExp(`^${PREFIX}`) }).select("_id +fixtureKey").lean();
  const userIds = users.map((user) => user._id);
  await Promise.all([
    ConsentRecord.deleteMany({ user: { $in: userIds } }),
    QuizConsentRecord.deleteMany({ participant: { $in: await QuizParticipant.find({ fixtureKey: new RegExp(`^${PREFIX}`) }).distinct("_id") } }),
    SafePlaceSuspension.deleteMany({ fixtureKey: new RegExp(`^${PREFIX}`) }),
    ProfessionalProfile.deleteMany({ fixtureKey: new RegExp(`^${PREFIX}`) }),
    IntervenantApplication.deleteMany({ fixtureKey: new RegExp(`^${PREFIX}`) }),
    QuizAttempt.deleteMany({ fixtureKey: new RegExp(`^${PREFIX}`) }),
    QuizParticipant.deleteMany({ fixtureKey: new RegExp(`^${PREFIX}`) }),
    SafePlacePost.deleteMany({ fixtureKey: new RegExp(`^${PREFIX}`) }),
    SafePlaceCategory.deleteMany({ fixtureKey: new RegExp(`^${PREFIX}`) }),
    Resource.deleteMany({ fixtureKey: new RegExp(`^${PREFIX}`) }),
    WebinarSession.deleteMany({ fixtureKey: new RegExp(`^${PREFIX}`) }),
    Webinar.deleteMany({ fixtureKey: new RegExp(`^${PREFIX}`) }),
    Communication.deleteMany({ fixtureKey: new RegExp(`^${PREFIX}`) }),
    Notification.deleteMany({ fixtureKey: new RegExp(`^${PREFIX}`) }),
    CrmContact.deleteMany({ fixtureKey: new RegExp(`^${PREFIX}`) }),
  ]);
  await User.deleteMany({ _id: { $in: userIds } });
  return { usersRemoved: userIds.length };
}

module.exports = { seed, reset, PREFIX };
