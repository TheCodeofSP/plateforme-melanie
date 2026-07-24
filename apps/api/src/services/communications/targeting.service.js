const User = require("../../models/User");
const QuizParticipant = require("../../models/QuizParticipant");
const WebinarRegistration = require("../../models/WebinarRegistration");
const CommunicationSuppression = require("../../models/CommunicationSuppression");
const CrmContact = require("../../models/CrmContact");
const preferenceService = require("./preference.service");

async function selectedUsers(target) {
  const hasAutomaticCriteria = Boolean(target.roles?.length || target.spmProfiles?.length || target.webinar);
  const filter = { accountStatus: "ACTIVE" };
  if (target.roles?.length) filter.role = { $in: target.roles };
  if (target.spmProfiles?.length) filter.currentSpmProfile = { $in: target.spmProfiles };
  if (target.webinar) {
    const userIds = await WebinarRegistration.find({ webinar: target.webinar, ...(target.webinarStatuses?.length ? { status: { $in: target.webinarStatuses } } : {}) }).distinct("user");
    filter._id = { $in: userIds.filter(Boolean) };
  }
  const users = hasAutomaticCriteria ? await User.find(filter).select("email firstName role currentSpmProfile accountStatus").lean() : [];
  if (target.manualUsers?.length) {
    const manual = await User.find({ _id: { $in: target.manualUsers }, accountStatus: "ACTIVE" }).select("email firstName role currentSpmProfile accountStatus").lean();
    const ids = new Set(users.map((user) => String(user._id)));
    users.push(...manual.filter((user) => !ids.has(String(user._id))));
  }
  return users;
}

async function selectedQuizContacts(communication, target) {
  if (communication.channel !== "EMAIL") return [];
  const byId = new Map();
  if (target.includeQuizContacts && !target.webinar && !target.roles?.length) {
    const filter = {};
    if (target.spmProfiles?.length) filter.currentSpmProfile = { $in: target.spmProfiles.filter((profile) => profile !== "NON_DEFINI") };
    if (target.quizFrom || target.quizTo) filter.createdAt = { ...(target.quizFrom && { $gte: target.quizFrom }), ...(target.quizTo && { $lte: target.quizTo }) };
    const items = await QuizParticipant.find(filter).select("email firstName user currentSpmProfile").lean();
    for (const item of items) byId.set(String(item._id), item);
  }
  if (target.manualQuizParticipants?.length) {
    const manual = await QuizParticipant.find({ _id: { $in: target.manualQuizParticipants } }).select("email firstName user currentSpmProfile").lean();
    for (const item of manual) byId.set(String(item._id), item);
  }
  return [...byId.values()];
}

async function resolve(communication) {
  const target = communication.targeting || {};
  const [users, quiz] = await Promise.all([selectedUsers(target), selectedQuizContacts(communication, target)]);
  const map = new Map();
  let duplicates = 0;
  for (const item of quiz) {
    const email = preferenceService.normalize(item.email);
    if (map.has(email)) duplicates += 1;
    else map.set(email, { email, firstName: item.firstName, quizParticipant: item._id, user: item.user, role: item.user ? "MEMBER" : "QUIZ_CONTACT", spmProfile: item.currentSpmProfile || "NON_DEFINI" });
  }
  for (const user of users) {
    const email = preferenceService.normalize(user.email);
    if (map.has(email)) duplicates += 1;
    map.set(email, { email, firstName: user.firstName, user: user._id, role: user.role, spmProfile: user.currentSpmProfile || "NON_DEFINI" });
  }
  if (target.manualCrmContacts?.length && communication.channel === "EMAIL") {
    const contacts = await CrmContact.find({ _id: { $in: target.manualCrmContacts }, deletedAt: null, mergedInto: null, anonymizedAt: null }).lean();
    for (const contact of contacts) {
      const email = preferenceService.normalize(contact.primaryEmail);
      if (map.has(email)) duplicates += 1;
      else map.set(email, { email, firstName: contact.firstName, user: contact.user, quizParticipant: contact.quizParticipant, crmContact: contact._id, role: contact.user ? "MEMBER" : contact.quizParticipant ? "QUIZ_CONTACT" : "CRM_CONTACT", spmProfile: contact.currentSpmProfile || "NON_DEFINI", crmMarketingConsent: contact.marketingConsent?.granted, doNotContact: contact.doNotContact });
    }
  }
  const crmRows = await CrmContact.find({ primaryEmail: { $in: [...map.keys()] }, deletedAt: null, mergedInto: null }).select("primaryEmail doNotContact").lean();
  const blockedCrm = new Set(crmRows.filter((row) => row.doNotContact).map((row) => preferenceService.normalize(row.primaryEmail)));
  const suppressions = new Set((await CommunicationSuppression.find({ email: { $in: [...map.keys()] }, active: true }).distinct("email")).map(preferenceService.normalize));
  const included = [], excludedConsent = [], excludedTechnical = [];
  for (const person of map.values()) {
    if (suppressions.has(person.email) || blockedCrm.has(person.email) || person.doNotContact || (communication.channel === "IN_APP" && !person.user)) { excludedTechnical.push(person); continue; }
    if (communication.type !== "ADMINISTRATIVE") {
      if (person.role === "CRM_CONTACT") {
        if (!person.crmMarketingConsent) { excludedConsent.push(person); continue; }
      } else {
        const preference = await preferenceService.ensure({ email: person.email, user: person.user, quizParticipant: person.quizParticipant, source: person.user ? "ACCOUNT" : "QUIZ" });
        if (!preferenceService.accepts(preference, communication.preferenceCategory)) { excludedConsent.push(person); continue; }
      }
    }
    included.push(person);
  }
  const profiles = {};
  for (const person of included) profiles[person.spmProfile] = (profiles[person.spmProfile] || 0) + 1;
  return { included, excludedConsent, excludedTechnical, duplicates, breakdown: { members: included.filter((x) => x.role === "MEMBER").length, intervenants: included.filter((x) => x.role === "INTERVENANT").length, admins: included.filter((x) => x.role === "ADMIN").length, quizContacts: included.filter((x) => x.role === "QUIZ_CONTACT").length, profiles } };
}

module.exports = { resolve, selectedUsers, selectedQuizContacts };
