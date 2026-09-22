const CrmContact = require("../../models/CrmContact");
const CrmTag = require("../../models/CrmTag");
const CrmNote = require("../../models/CrmNote");
const CrmTask = require("../../models/CrmTask");
const CrmTimelineEvent = require("../../models/CrmTimelineEvent");
const CrmMergeLog = require("../../models/CrmMergeLog");
const User = require("../../models/User");
const QuizParticipant = require("../../models/QuizParticipant");
const QuizAttempt = require("../../models/QuizAttempt");
const CommunicationRecipient = require("../../models/CommunicationRecipient");
const DashboardAccessLog = require("../../models/DashboardAccessLog");
const { createNotification } = require("../notification.service");

function dashboardError(message, code, statusCode = 400) {
  return Object.assign(new Error(message), { code, statusCode });
}
const normalizeEmail = (email) => email.trim().toLowerCase();
function ageRange(dateOfBirth) {
  if (!dateOfBirth) return null;
  const age = Math.floor(
    (Date.now() - new Date(dateOfBirth).getTime()) / 31557600000,
  );
  if (age < 18) return "15_17";
  if (age < 25) return "18_24";
  if (age < 35) return "25_34";
  if (age < 45) return "35_44";
  if (age < 60) return "45_59";
  return "60_PLUS";
}
async function timeline(contact, type, summary, actor = null, related = {}) {
  return CrmTimelineEvent.create({
    contact,
    type,
    summary,
    actor: actor?._id || actor,
    relatedModel: related.model || null,
    relatedId: related.id || null,
    metadata: related.metadata || null,
  });
}
async function quizData(participantId) {
  if (!participantId) return {};
  const attempt = await QuizAttempt.findOne({
    participant: participantId,
    status: "COMPLETED",
  })
    .sort({ completedAt: -1 })
    .lean();
  return attempt
    ? {
        currentSpmProfile: attempt.selectedProfile,
        currentContraception: attempt.participantInfo.contraception,
        latestQuizAt: attempt.completedAt,
      }
    : {};
}
async function syncIdentity({
  user = null,
  participant = null,
  source = null,
}) {
  if (user && !user.email) user = await User.findById(user);
  if (participant && !participant.email)
    participant = await QuizParticipant.findById(participant);
  const email = normalizeEmail(user?.email || participant?.email || "");
  if (!email) return null;
  let contact = await CrmContact.findOne({
    $or: [{ primaryEmail: email }, { emailAliases: email }],
    deletedAt: null,
    mergedInto: null,
  });
  const qData = await quizData(participant?._id);
  if (!contact)
    contact = new CrmContact({
      primaryEmail: email,
      firstName: user?.firstName || participant?.firstName,
      lastName: user?.lastName || null,
      user: user?._id || null,
      quizParticipant: participant?._id || null,
      sources: [],
      ...qData,
    });
  if (user) {
    contact.user = user._id;
    contact.firstName = user.firstName;
    contact.lastName = user.lastName;
    contact.lastActivityAt = user.lastLoginAt || contact.lastActivityAt;
  }
  if (participant) {
    contact.quizParticipant = participant._id;
    Object.assign(contact, qData);
  }
  if (source && !contact.sources.some((item) => item.type === source))
    contact.sources.push({ type: source, occurredAt: new Date() });
  await contact.save();
  return contact;
}
async function create(admin, data) {
  const email = normalizeEmail(data.email);
  const existing = await CrmContact.findOne({
    $or: [{ primaryEmail: email }, { emailAliases: email }],
    deletedAt: null,
    mergedInto: null,
  });
  if (existing)
    throw dashboardError(
      "Un contact utilise déjà cette adresse.",
      "CRM_CONTACT_DUPLICATE",
      409,
      { contactId: existing._id },
    );
  const contact = await CrmContact.create({
    primaryEmail: email,
    firstName: data.firstName,
    lastName: data.lastName || null,
    phone: data.phone || null,
    status: data.status,
    priority: data.priority,
    tags: data.tagIds,
    sources: [{ type: data.source, detail: data.sourceDetail || null }],
    marketingConsent: data.marketingConsent
      ? {
          ...data.marketingConsent,
          occurredAt: data.marketingConsent.occurredAt || new Date(),
        }
      : { granted: false },
  });
  await timeline(
    contact._id,
    "CONTACT_CREATED",
    "Contact créé manuellement.",
    admin,
  );
  return contact;
}
function listFilter(query) {
  const filter = { deletedAt: null, mergedInto: null };
  if (query.q) {
    const q = new RegExp(query.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ firstName: q }, { lastName: q }, { primaryEmail: q }];
  }
  if (query.kind === "MEMBER") filter.user = { $ne: null };
  if (query.kind === "PROSPECT") {
    filter.user = null;
    filter.quizParticipant = { $ne: null };
  }
  if (query.kind === "MANUAL") {
    filter.user = null;
    filter.quizParticipant = null;
  }
  if (query.status) filter.status = query.status;
  if (query.spmProfile) filter.currentSpmProfile = query.spmProfile;
  if (query.contraception) filter.currentContraception = query.contraception;
  if (query.priority) filter.priority = query.priority;
  if (query.tag) filter.tags = query.tag;
  if (query.inactiveDays)
    filter.lastActivityAt = {
      $lte: new Date(Date.now() - query.inactiveDays * 86400000),
    };
  if (query.dateFrom || query.dateTo)
    filter.createdAt = {
      ...(query.dateFrom && { $gte: new Date(query.dateFrom) }),
      ...(query.dateTo && { $lte: new Date(query.dateTo) }),
    };
  return filter;
}
async function list(query) {
  const filter = listFilter(query);
  const sort =
    query.sort === "OLDEST"
      ? { createdAt: 1 }
      : query.sort === "LAST_ACTIVITY"
        ? { lastActivityAt: -1 }
        : query.sort === "PRIORITY"
          ? { priority: -1, createdAt: -1 }
          : { createdAt: -1 };
  const [contacts, total] = await Promise.all([
    CrmContact.find(filter)
      .populate("tags", "name color archivedAt")
      .sort(sort)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
    CrmContact.countDocuments(filter),
  ]);
  const pressure = await CommunicationRecipient.aggregate([
    {
      $match: {
        user: { $in: contacts.map((c) => c.user).filter(Boolean) },
        sentAt: { $gte: new Date(Date.now() - 30 * 86400000) },
      },
    },
    { $group: { _id: "$user", count: { $sum: 1 }, last: { $max: "$sentAt" } } },
  ]);
  const pressureMap = new Map(pressure.map((item) => [String(item._id), item]));
  return {
    contacts: contacts.map((contact) => {
      const p = pressureMap.get(String(contact.user));
      const count = p?.count || 0;
      return {
        ...contact,
        communicationPressure: {
          count30Days: count,
          level: count >= 5 ? "HIGH" : count >= 2 ? "MODERATE" : "LOW",
          warning: p?.last
            ? Date.now() - new Date(p.last).getTime() < 7 * 86400000
            : false,
        },
        kind: contact.user
          ? "MEMBER"
          : contact.quizParticipant
            ? "PROSPECT"
            : "MANUAL",
      };
    }),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      pages: Math.ceil(total / query.limit),
    },
  };
}
async function detail(admin, id) {
  const contact = await CrmContact.findOne({
    _id: id,
    deletedAt: null,
    mergedInto: null,
  })
    .populate("tags", "name color archivedAt")
    .populate(
      "user",
      "firstName lastName pseudonym email dateOfBirth role accountStatus lastLoginAt createdAt",
    )
    .lean();
  if (!contact)
    throw dashboardError("Contact introuvable.", "CRM_CONTACT_NOT_FOUND", 404);
  const [notes, tasks, history] = await Promise.all([
    CrmNote.find({ contact: id, deletedAt: null })
      .sort({ pinned: -1, createdAt: -1 })
      .lean(),
    CrmTask.find({ contact: id }).sort({ dueAt: -1 }).lean(),
    CrmTimelineEvent.find({ contact: id })
      .sort({ occurredAt: -1 })
      .limit(200)
      .lean(),
  ]);
  await DashboardAccessLog.insertMany([
    {
      admin: admin._id,
      action: "VIEW_CONTACT_HISTORY",
      targetType: "CrmContact",
      targetId: id,
    },
    ...(notes.length
      ? [
          {
            admin: admin._id,
            action: "VIEW_PRIVATE_NOTES",
            targetType: "CrmContact",
            targetId: id,
          },
        ]
      : []),
  ]);
  return {
    contact: {
      ...contact,
      ageRange: ageRange(contact.user?.dateOfBirth),
      birthDate: contact.user?.dateOfBirth || null,
    },
    notes,
    tasks,
    history,
  };
}
async function update(admin, id, data) {
  const contact = await CrmContact.findOne({
    _id: id,
    deletedAt: null,
    mergedInto: null,
  });
  if (!contact)
    throw dashboardError("Contact introuvable.", "CRM_CONTACT_NOT_FOUND", 404);
  const previousStatus = contact.status;
  for (const key of ["firstName", "lastName", "phone", "status", "priority"])
    if (data[key] !== undefined) contact[key] = data[key];
  if (data.tagIds) contact.tags = data.tagIds;
  if (data.marketingConsent)
    contact.marketingConsent = {
      ...data.marketingConsent,
      occurredAt: data.marketingConsent.occurredAt || new Date(),
    };
  if (contact.status === "NE_PAS_CONTACTER") {
    contact.doNotContact = true;
    contact.marketingConsent.granted = false;
  }
  await contact.save();
  if (previousStatus !== contact.status)
    await timeline(
      id,
      "STATUS_CHANGED",
      `Statut modifié : ${contact.status}.`,
      admin,
      { metadata: { previousStatus, newStatus: contact.status } },
    );
  return contact;
}
async function remove(admin, id) {
  const contact = await CrmContact.findOne({ _id: id, deletedAt: null });
  if (!contact)
    throw dashboardError("Contact introuvable.", "CRM_CONTACT_NOT_FOUND", 404);
  const hasHistory =
    contact.user ||
    contact.quizParticipant ||
    (await CrmTimelineEvent.exists({
      contact: id,
      type: { $ne: "CONTACT_CREATED" },
    }));
  if (hasHistory)
    throw dashboardError(
      "Ce contact doit être anonymisé.",
      "CRM_CONTACT_REQUIRES_ANONYMIZATION",
      409,
    );
  contact.deletedAt = new Date();
  await contact.save();
  return true;
}
async function anonymize(admin, id) {
  const contact = await CrmContact.findOne({ _id: id, deletedAt: null });
  if (!contact)
    throw dashboardError("Contact introuvable.", "CRM_CONTACT_NOT_FOUND", 404);
  contact.primaryEmail = `anonymized-${contact._id}@deleted.invalid`;
  contact.emailAliases = [];
  contact.firstName = "Contact";
  contact.lastName = "anonymisé";
  contact.phone = null;
  contact.marketingConsent = { granted: false };
  contact.doNotContact = true;
  contact.tags = [];
  contact.anonymizedAt = new Date();
  await contact.save();
  await Promise.all([
    CrmNote.deleteMany({ contact: id }),
    CrmTask.deleteMany({ contact: id }),
  ]);
  await timeline(id, "CONTACT_ANONYMIZED", "Contact anonymisé.", admin);
  return contact;
}
async function addNote(admin, contactId, data) {
  const note = await CrmNote.create({
    contact: contactId,
    author: admin._id,
    ...data,
  });
  await timeline(contactId, "NOTE_ADDED", "Note privée ajoutée.", admin, {
    model: "CrmNote",
    id: note._id,
  });
  return note;
}
async function updateNote(admin, id, data) {
  const note = await CrmNote.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { $set: data },
    { new: true },
  );
  if (!note)
    throw dashboardError("Note introuvable.", "CRM_NOTE_NOT_FOUND", 404);
  return note;
}
async function deleteNote(admin, id) {
  const note = await CrmNote.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { $set: { deletedAt: new Date() } },
    { new: true },
  );
  if (!note)
    throw dashboardError("Note introuvable.", "CRM_NOTE_NOT_FOUND", 404);
  await timeline(note.contact, "NOTE_DELETED", "Note privée supprimée.", admin);
  return true;
}
async function createTag(admin, data) {
  try {
    return await CrmTag.create({
      ...data,
      normalizedName: data.name.toLowerCase(),
      createdBy: admin._id,
    });
  } catch (e) {
    if (e.code === 11000)
      throw dashboardError(
        "Cette étiquette existe déjà.",
        "CRM_TAG_DUPLICATE",
        409,
      );
    throw e;
  }
}
async function updateTag(id, data) {
  const changes = { ...data };
  if (data.name) changes.normalizedName = data.name.toLowerCase();
  const tag = await CrmTag.findByIdAndUpdate(
    id,
    { $set: changes },
    { new: true },
  );
  if (!tag)
    throw dashboardError("Étiquette introuvable.", "CRM_TAG_NOT_FOUND", 404);
  return tag;
}
async function createTask(admin, contactId, data) {
  const task = await CrmTask.create({
    contact: contactId,
    createdBy: admin._id,
    ...data,
  });
  await timeline(
    contactId,
    "TASK_CREATED",
    `Relance créée : ${task.title}.`,
    admin,
    { model: "CrmTask", id: task._id },
  );
  return task;
}
async function updateTask(admin, id, data) {
  const task = await CrmTask.findById(id);
  if (!task)
    throw dashboardError("Relance introuvable.", "CRM_TASK_NOT_FOUND", 404);
  if (data.dueAt && +new Date(data.dueAt) !== +task.dueAt)
    task.dateHistory.push({
      previousDueAt: task.dueAt,
      newDueAt: data.dueAt,
      changedBy: admin._id,
    });
  Object.assign(task, data);
  await task.save();
  return task;
}
async function completeTask(admin, id, data) {
  const task = await CrmTask.findById(id);
  if (!task)
    throw dashboardError("Relance introuvable.", "CRM_TASK_NOT_FOUND", 404);
  task.status = "COMPLETED";
  task.completedAt = new Date();
  task.result = data.result;
  task.resultNote = data.resultNote || null;
  await task.save();
  if (data.result === "DO_NOT_CONTACT")
    await CrmContact.updateOne(
      { _id: task.contact },
      {
        $set: {
          status: "NE_PAS_CONTACTER",
          doNotContact: true,
          "marketingConsent.granted": false,
        },
      },
    );
  await timeline(
    task.contact,
    "TASK_COMPLETED",
    `Relance terminée : ${task.title}.`,
    admin,
    { model: "CrmTask", id: task._id, metadata: data },
  );
  return task;
}
async function snoozeTask(admin, id, dueAt) {
  return updateTask(admin, id, { dueAt, status: "SNOOZED" });
}
async function merge(admin, data) {
  const [primary, merged] = await Promise.all([
    CrmContact.findById(data.primaryContactId),
    CrmContact.findById(data.mergedContactId),
  ]);
  if (!primary || !merged || primary.mergedInto || merged.mergedInto)
    throw dashboardError("Fusion impossible.", "CRM_MERGE_INVALID", 409);
  const log = await CrmMergeLog.create({
    primaryContact: primary._id,
    mergedContact: merged._id,
    performedBy: admin._id,
    primaryBefore: primary.toObject(),
    mergedBefore: merged.toObject(),
  });
  const originalPrimaryEmail = primary.primaryEmail;
  Object.assign(primary, data.values);
  primary.emailAliases = [
    ...new Set(
      [
        ...primary.emailAliases,
        ...merged.emailAliases,
        originalPrimaryEmail,
        merged.primaryEmail,
      ].filter((email) => email !== primary.primaryEmail),
    ),
  ];
  primary.sources = [...primary.sources, ...merged.sources];
  primary.tags = [
    ...new Set([...primary.tags.map(String), ...merged.tags.map(String)]),
  ];
  primary.user ||= merged.user;
  primary.quizParticipant ||= merged.quizParticipant;
  merged.primaryEmail = `merged-${merged._id}@deleted.invalid`;
  merged.mergedInto = primary._id;
  merged.doNotContact = true;
  await Promise.all([
    primary.save(),
    merged.save(),
    CrmNote.updateMany(
      { contact: merged._id },
      { $set: { contact: primary._id } },
    ),
    CrmTask.updateMany(
      { contact: merged._id },
      { $set: { contact: primary._id } },
    ),
    CrmTimelineEvent.updateMany(
      { contact: merged._id },
      { $set: { contact: primary._id } },
    ),
  ]);
  await timeline(
    primary._id,
    "CONTACTS_MERGED",
    "Deux fiches ont été fusionnées.",
    admin,
    { model: "CrmMergeLog", id: log._id },
  );
  return { contact: primary, mergeLog: log };
}
async function restoreMerge(admin, id) {
  const log = await CrmMergeLog.findOne({ _id: id, restoredAt: null });
  if (!log)
    throw dashboardError(
      "Fusion non restaurable.",
      "CRM_MERGE_NOT_RESTORABLE",
      409,
    );
  await Promise.all([
    CrmContact.replaceOne({ _id: log.primaryContact }, log.primaryBefore),
    CrmContact.replaceOne({ _id: log.mergedContact }, log.mergedBefore),
  ]);
  log.restoredAt = new Date();
  log.restoredBy = admin._id;
  await log.save();
  return log;
}
async function notifyDueTasks() {
  const tasks = await CrmTask.find({
    status: { $in: ["TODO", "SNOOZED"] },
    dueAt: { $lte: new Date() },
    $expr: { $ne: ["$notifiedForDueAt", "$dueAt"] },
  })
    .populate("createdBy contact")
    .limit(100);
  for (const task of tasks) {
    await createNotification({
      recipient: task.createdBy._id,
      type: "ADMIN_TECHNICAL_INCIDENT",
      nature: "MANAGEMENT",
      category: "ADMIN_ACCOUNTS",
      title: "Relance arrivée à échéance",
      message: `${task.title} — ${task.contact.firstName}`,
      targetType: "USER",
      targetId: task.contact.user || task.createdBy._id,
      actionPath: `/admin/dashboard/contacts/${task.contact._id}`,
      deduplicationKey: `crm-task-due:${task._id}:${task.dueAt.getTime()}`,
    });
    task.notifiedForDueAt = task.dueAt;
    await task.save();
  }
  return { processed: tasks.length, failed: 0 };
}
module.exports = {
  dashboardError,
  ageRange,
  syncIdentity,
  create,
  list,
  detail,
  update,
  remove,
  anonymize,
  addNote,
  updateNote,
  deleteNote,
  createTag,
  updateTag,
  createTask,
  updateTask,
  completeTask,
  snoozeTask,
  merge,
  restoreMerge,
  notifyDueTasks,
  timeline,
};
