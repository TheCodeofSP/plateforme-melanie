const { v2: cloudinary } = require("cloudinary");
const env = require("../../config/env");
const DashboardExport = require("../../models/DashboardExport");
const DashboardAccessLog = require("../../models/DashboardAccessLog");
const CrmContact = require("../../models/CrmContact");
const CrmNote = require("../../models/CrmNote");
const QuizAttempt = require("../../models/QuizAttempt");
const WebinarRegistration = require("../../models/WebinarRegistration");
const CommunicationRecipient = require("../../models/CommunicationRecipient");
const Resource = require("../../models/Resource");
const { dashboardError } = require("./crm.service");

const DEFINITIONS = {
  CONTACTS: [
    "firstName",
    "lastName",
    "email",
    "phone",
    "kind",
    "status",
    "priority",
    "spmProfile",
    "contraception",
    "marketingConsent",
    "sources",
    "createdAt",
    "privateNotes",
  ],
  MEMBERS: [
    "firstName",
    "lastName",
    "email",
    "status",
    "spmProfile",
    "contraception",
    "createdAt",
  ],
  PROSPECTS: [
    "firstName",
    "email",
    "status",
    "spmProfile",
    "contraception",
    "marketingConsent",
    "createdAt",
  ],
  QUIZ_RESULTS: [
    "firstName",
    "email",
    "profile",
    "contraception",
    "age",
    "completedAt",
    "scores",
  ],
  WEBINAR_REGISTRATIONS: ["webinar", "session", "email", "status", "createdAt"],
  WEBINAR_ATTENDANCE: [
    "webinar",
    "session",
    "email",
    "status",
    "attendanceMarkedAt",
  ],
  COMMUNICATION_RECIPIENTS: [
    "communication",
    "email",
    "status",
    "sentAt",
    "deliveredAt",
    "openedAt",
    "clickedAt",
  ],
  RESOURCES: [
    "title",
    "slug",
    "status",
    "visibility",
    "views",
    "likes",
    "comments",
    "downloads",
  ],
};
const escapeCsv = (value) => {
  const text =
    value == null
      ? ""
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);
  return `"${text.replaceAll('"', '""')}"`;
};
function validateColumns(input) {
  const available = DEFINITIONS[input.population];
  const invalid = input.columns.filter((column) => !available.includes(column));
  if (invalid.length)
    throw dashboardError(
      `Colonnes indisponibles : ${invalid.join(", ")}.`,
      "DASHBOARD_EXPORT_COLUMNS_INVALID",
      400,
    );
  if (input.columns.includes("privateNotes") && !input.includePrivateNotes)
    throw dashboardError(
      "La colonne de notes nécessite une confirmation explicite.",
      "DASHBOARD_EXPORT_PRIVATE_NOTES_CONFIRMATION_REQUIRED",
      400,
    );
}
async function rows(input, limit = null) {
  validateColumns(input);
  let result = [];
  if (["CONTACTS", "MEMBERS", "PROSPECTS"].includes(input.population)) {
    const filter = { deletedAt: null, mergedInto: null, anonymizedAt: null };
    if (input.population === "MEMBERS") filter.user = { $ne: null };
    if (input.population === "PROSPECTS") {
      filter.user = null;
      filter.quizParticipant = { $ne: null };
    }
    const contacts = await CrmContact.find(filter)
      .populate("user", "email")
      .limit(limit || 100000)
      .lean();
    const notes = input.includePrivateNotes
      ? await CrmNote.find({
          contact: { $in: contacts.map((c) => c._id) },
          deletedAt: null,
        }).lean()
      : [];
    result = contacts.map((c) => ({
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.primaryEmail,
      phone: c.phone,
      kind: c.user ? "MEMBER" : c.quizParticipant ? "PROSPECT" : "MANUAL",
      status: c.status,
      priority: c.priority,
      spmProfile: c.currentSpmProfile,
      contraception: c.currentContraception,
      marketingConsent: c.marketingConsent?.granted,
      sources: c.sources?.map((s) => s.type),
      createdAt: c.createdAt,
      privateNotes: notes
        .filter((n) => String(n.contact) === String(c._id))
        .map((n) => n.text),
    }));
  } else if (input.population === "QUIZ_RESULTS") {
    const attempts = await QuizAttempt.aggregate([
      { $match: { status: "COMPLETED" } },
      { $sort: { participant: 1, completedAt: -1 } },
      { $group: { _id: "$participant", row: { $first: "$$ROOT" } } },
      { $limit: limit || 100000 },
      {
        $lookup: {
          from: "quizparticipants",
          localField: "_id",
          foreignField: "_id",
          as: "participant",
        },
      },
      { $unwind: "$participant" },
    ]);
    result = attempts.map(({ row, participant }) => ({
      firstName: participant.firstName,
      email: participant.email,
      profile: row.selectedProfile,
      contraception: row.participantInfo.contraception,
      age: row.participantInfo.age,
      completedAt: row.completedAt,
      scores: row.scores,
    }));
  } else if (
    ["WEBINAR_REGISTRATIONS", "WEBINAR_ATTENDANCE"].includes(input.population)
  ) {
    const registrations = await WebinarRegistration.find(
      input.population === "WEBINAR_ATTENDANCE"
        ? { status: { $in: ["PRESENT", "ABSENT"] } }
        : {},
    )
      .populate("user", "email")
      .populate("webinar", "title")
      .populate("session", "startsAt")
      .limit(limit || 100000)
      .lean();
    result = registrations.map((r) => ({
      webinar: r.webinar?.title,
      session: r.session?.startsAt,
      email: r.user?.email,
      status: r.status,
      createdAt: r.createdAt,
      attendanceMarkedAt: r.attendanceMarkedAt,
    }));
  } else if (input.population === "COMMUNICATION_RECIPIENTS") {
    const recipients = await CommunicationRecipient.find()
      .populate("communication", "internalTitle")
      .limit(limit || 100000)
      .lean();
    result = recipients.map((r) => ({
      communication: r.communication?.internalTitle,
      email: r.email,
      status: r.status,
      sentAt: r.sentAt,
      deliveredAt: r.deliveredAt,
      openedAt: r.openedAt,
      clickedAt: r.clickedAt,
    }));
  } else if (input.population === "RESOURCES") {
    const resources = await Resource.find()
      .limit(limit || 100000)
      .lean();
    result = resources.map((r) => ({
      title: r.publishedVersion?.title || r.workingVersion?.title,
      slug: r.slug,
      status: r.publicationStatus,
      visibility: r.finalVisibility,
      views: r.counters?.views,
      likes: r.counters?.likes,
      comments: r.counters?.comments,
      downloads: r.counters?.downloads,
    }));
  }
  return result;
}
function csv(input, data) {
  return `\uFEFF${input.columns.map(escapeCsv).join(";")}\n${data.map((row) => input.columns.map((column) => escapeCsv(row[column])).join(";")).join("\n")}`;
}
async function preview(input) {
  const data = await rows(input, 6);
  return {
    availableColumns: DEFINITIONS[input.population],
    selectedColumns: input.columns,
    sample: data.slice(0, 5),
    estimatedAtLeast: data.length > 5 ? 6 : data.length,
  };
}
async function create(admin, input) {
  validateColumns(input);
  const job = await DashboardExport.create({
    requestedBy: admin._id,
    population: input.population,
    filters: {
      ...input.filters,
      includePrivateNotes: input.includePrivateNotes,
    },
    columns: input.columns,
    expiresAt: new Date(Date.now() + 86400000),
  });
  await DashboardAccessLog.create({
    admin: admin._id,
    action: "EXPORT_CREATED",
    targetType: "DashboardExport",
    targetId: job._id,
  });
  return job;
}
function configure() {
  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET
  )
    throw dashboardError(
      "Cloudinary doit être configuré pour les exports.",
      "DASHBOARD_EXPORT_STORAGE_NOT_CONFIGURED",
      503,
    );
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}
async function process(limit = 5) {
  configure();
  const jobs = await DashboardExport.find({
    status: "PENDING",
    expiresAt: { $gt: new Date() },
  }).limit(limit);
  let failed = 0;
  for (const job of jobs) {
    job.status = "PROCESSING";
    await job.save();
    try {
      const input = {
        population: job.population,
        filters: job.filters,
        columns: job.columns,
        includePrivateNotes: Boolean(job.filters.includePrivateNotes),
      };
      const data = await rows(input);
      const content = csv(input, data);
      const publicId = `${env.CLOUDINARY_FOLDER_PREFIX}/dashboard-exports/${job._id}`;
      await cloudinary.uploader.upload(
        `data:text/csv;base64,${Buffer.from(content).toString("base64")}`,
        { resource_type: "raw", type: "authenticated", public_id: publicId },
      );
      job.status = "READY";
      job.rowCount = data.length;
      job.file.publicId = publicId;
      job.readyAt = new Date();
    } catch (e) {
      job.status = "FAILED";
      job.error = e.message.slice(0, 1000);
      failed += 1;
    }
    await job.save();
  }
  return { processed: jobs.length, failed };
}
async function download(admin, id) {
  configure();
  const job = await DashboardExport.findOne({
    _id: id,
    requestedBy: admin._id,
    status: "READY",
    expiresAt: { $gt: new Date() },
  });
  if (!job)
    throw dashboardError(
      "Export indisponible.",
      "DASHBOARD_EXPORT_NOT_AVAILABLE",
      404,
    );
  return {
    url: cloudinary.utils.private_download_url(job.file.publicId, "csv", {
      resource_type: "raw",
      type: "authenticated",
      expires_at: Math.floor(Date.now() / 1000) + 300,
      attachment: true,
    }),
    expiresIn: 300,
  };
}
async function remove(admin, id) {
  const job = await DashboardExport.findOne({
    _id: id,
    requestedBy: admin._id,
  });
  if (!job)
    throw dashboardError(
      "Export introuvable.",
      "DASHBOARD_EXPORT_NOT_FOUND",
      404,
    );
  if (job.file.publicId) {
    configure();
    await cloudinary.uploader.destroy(job.file.publicId, {
      resource_type: "raw",
      type: "authenticated",
      invalidate: true,
    });
  }
  await job.deleteOne();
  return true;
}
async function cleanup() {
  const jobs = await DashboardExport.find({ expiresAt: { $lte: new Date() } });
  for (const job of jobs) {
    try {
      if (job.file.publicId) {
        configure();
        await cloudinary.uploader.destroy(job.file.publicId, {
          resource_type: "raw",
          type: "authenticated",
          invalidate: true,
        });
      }
    } finally {
      await job.deleteOne();
    }
  }
  return { processed: jobs.length, failed: 0 };
}
module.exports = {
  DEFINITIONS,
  preview,
  create,
  process,
  download,
  remove,
  cleanup,
};
