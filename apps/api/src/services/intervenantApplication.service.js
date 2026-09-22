const mongoose = require("mongoose");

const User = require("../models/User");

const ProfessionalProfile = require("../models/ProfessionalProfile");

const AdminActionLog = require("../models/AdminActionLog");

const IntervenantApplication = require("../models/IntervenantApplication");
const { scheduleDeletion } = require("./applicationDocument.service");
const ApplicationDocument = require("../models/ApplicationDocument");
const {
  createNotification,
  createManagementNotification,
} = require("./notification.service");
const notificationDelivery = require("./notificationDelivery.service");

const {
  submitIntervenantApplicationSchema,
} = require("../validations/intervenantApplication.validation");

function createApplicationError(message, code, statusCode, details) {
  const error = new Error(message);

  error.code = code;
  error.statusCode = statusCode;

  if (details) {
    error.details = details;
  }

  return error;
}

function normalizeLink(value) {
  return value || null;
}

async function createIntervenantApplication(userId) {
  const existingApplication = await IntervenantApplication.findOne({
    user: userId,
    status: {
      $in: ["DRAFT", "PENDING"],
    },
  });

  if (existingApplication) {
    throw createApplicationError(
      "Une demande en cours existe déjà.",
      "INTERVENANT_APPLICATION_ALREADY_EXISTS",
      409,
    );
  }

  const previousApplication = await IntervenantApplication.findOne({
    user: userId,
    status: "DECLINED",
  }).sort({
    decidedAt: -1,
  });

  const application = await IntervenantApplication.create({
    user: userId,

    professionalName: previousApplication?.professionalName || "",

    profession: previousApplication?.profession || "",

    specialties: previousApplication?.specialties || [],

    presentation: previousApplication?.presentation || "",

    motivations: previousApplication?.motivations || "",

    links: {
      website: previousApplication?.links?.website || null,

      instagram: previousApplication?.links?.instagram || null,

      linkedin: previousApplication?.links?.linkedin || null,
    },

    supportingDocument: previousApplication?.supportingDocument || undefined,
  });

  return application;
}

async function updateIntervenantApplication({
  userId,
  applicationId,
  changes,
}) {
  const application = await IntervenantApplication.findOne({
    _id: applicationId,
    user: userId,
    status: "DRAFT",
  });

  if (!application) {
    throw createApplicationError(
      "Ce brouillon n’existe pas ou ne peut plus être modifié.",
      "INTERVENANT_APPLICATION_NOT_EDITABLE",
      404,
    );
  }

  const editableFields = [
    "professionalName",
    "profession",
    "specialties",
    "presentation",
    "motivations",
  ];

  editableFields.forEach((field) => {
    if (changes[field] !== undefined) {
      application[field] = changes[field];
    }
  });

  if (changes.links) {
    if (changes.links.website !== undefined) {
      application.links.website = normalizeLink(changes.links.website);
    }

    if (changes.links.instagram !== undefined) {
      application.links.instagram = normalizeLink(changes.links.instagram);
    }

    if (changes.links.linkedin !== undefined) {
      application.links.linkedin = normalizeLink(changes.links.linkedin);
    }
  }

  await application.save();

  await createManagementNotification({
    scope: "ACCOUNTS",
    type: "ADMIN_INTERVENANT_APPLICATION",
    title: "Nouvelle demande d’intervenante",
    message: "Une nouvelle demande d’intervenante doit être examinée.",
    targetType: "INTERVENANT_APPLICATION",
    targetId: application._id,
    actionPath: `/admin/intervenant-applications/${application._id}`,
    deduplicationKey: `admin-intervenant-application:${application._id}`,
  });

  return application;
}

async function submitIntervenantApplication({ userId, applicationId }) {
  const application = await IntervenantApplication.findOne({
    _id: applicationId,
    user: userId,
    status: "DRAFT",
  });

  if (!application) {
    throw createApplicationError(
      "Ce brouillon n’existe pas ou a déjà été soumis.",
      "INTERVENANT_APPLICATION_NOT_EDITABLE",
      404,
    );
  }

  const validation = submitIntervenantApplicationSchema.safeParse({
    professionalName: application.professionalName,

    profession: application.profession,

    specialties: application.specialties,

    presentation: application.presentation,

    motivations: application.motivations,

    links: application.links,
  });

  if (!validation.success) {
    throw createApplicationError(
      "La demande est incomplète.",
      "INTERVENANT_APPLICATION_INCOMPLETE",
      400,
      {
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
    );
  }

  application.status = "PENDING";
  application.submittedAt = new Date();
  application.adminComment = null;

  await application.save();

  return application;
}

async function getIntervenantApplications(userId) {
  const applications = await IntervenantApplication.find({
    user: userId,
  })
    .sort({
      createdAt: -1,
    })
    .lean();
  const documents = await ApplicationDocument.find({
    application: { $in: applications.map((item) => item._id) },
    status: { $in: ["PENDING", "ACTIVE"] },
  })
    .select(
      "application originalName mimeType size status confirmedAt createdAt",
    )
    .lean();
  return applications.map((application) => ({
    ...application,
    documents: documents.filter(
      (document) =>
        document.application.toString() === application._id.toString(),
    ),
  }));
}

async function cancelIntervenantApplication({ userId, applicationId }) {
  const application = await IntervenantApplication.findOne({
    _id: applicationId,
    user: userId,
    status: "DRAFT",
  });

  if (!application) {
    throw createApplicationError(
      "Ce brouillon n’existe pas ou ne peut plus être annulé.",
      "INTERVENANT_APPLICATION_NOT_CANCELLABLE",
      404,
    );
  }

  application.status = "CANCELLED";

  await application.save();

  return application;
}

async function getPendingIntervenantApplications() {
  return IntervenantApplication.find({
    status: "PENDING",
  })
    .populate("user", "firstName lastName email pseudonym role")
    .sort({
      submittedAt: 1,
    })
    .lean();
}

async function getIntervenantApplicationForAdmin(applicationId) {
  const application = await IntervenantApplication.findById(applicationId)
    .populate("user", "firstName lastName email pseudonym role accountStatus")
    .lean();

  if (!application) {
    throw createApplicationError(
      "Cette demande n’existe pas.",
      "INTERVENANT_APPLICATION_NOT_FOUND",
      404,
    );
  }

  const documents = await ApplicationDocument.find({
    application: applicationId,
    status: { $in: ["PENDING", "ACTIVE"] },
  })
    .select("originalName mimeType size status confirmedAt createdAt")
    .lean();
  return { ...application, documents };
}

async function decideIntervenantApplication({
  applicationId,
  adminId,
  decision,
  comment,
}) {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const application = await IntervenantApplication.findOne({
        _id: applicationId,
        status: "PENDING",
      }).session(session);

      if (!application) {
        throw createApplicationError(
          "Cette demande n’existe pas ou a déjà été traitée.",
          "INTERVENANT_APPLICATION_NOT_PENDING",
          404,
        );
      }

      const user = await User.findById(application.user).session(session);

      if (!user || user.accountStatus !== "ACTIVE") {
        throw createApplicationError(
          "Le compte associé n’est pas actif.",
          "INTERVENANT_ACCOUNT_NOT_ACTIVE",
          400,
        );
      }

      const now = new Date();
      const previousRole = user.role;

      application.decidedAt = now;
      application.decidedBy = adminId;
      application.adminComment = comment;

      if (decision === "APPROVE") {
        application.status = "APPROVED";
        user.role = "INTERVENANT";

        await application.save({
          session,
        });

        await user.save({
          session,
        });

        await ProfessionalProfile.findOneAndUpdate(
          {
            user: user._id,
          },
          {
            $set: {
              draftVersion: {
                professionalName: application.professionalName,
                displayedFirstName: user.firstName,
                displayedLastName: user.lastName,
                profession: application.profession,
                specialties: application.specialties,
                shortPresentation: application.presentation.slice(0, 500),
                biography: application.presentation,
                photo: null,
                website: application.links.website,
              },
              publishedVersion: null,
              publicationStatus: "DRAFT",
              reviewStatus: "NOT_SUBMITTED",

              isActive: true,
              activatedAt: now,
              deactivatedAt: null,

              sourceApplication: application._id,
            },
          },
          {
            new: true,
            upsert: true,
            session,
            setDefaultsOnInsert: true,
          },
        );

        await AdminActionLog.create(
          [
            {
              admin: adminId,
              targetUser: user._id,

              action: "INTERVENANT_APPLICATION_APPROVED",

              comment,

              previousState: {
                role: previousRole,
                applicationStatus: "PENDING",
              },

              newState: {
                role: "INTERVENANT",
                applicationStatus: "APPROVED",
              },

              relatedDocument: {
                model: "IntervenantApplication",
                id: application._id,
              },
            },
          ],
          {
            session,
          },
        );

        return;
      }

      application.status = "DECLINED";

      await application.save({
        session,
      });

      await AdminActionLog.create(
        [
          {
            admin: adminId,
            targetUser: user._id,

            action: "INTERVENANT_APPLICATION_DECLINED",

            comment,

            previousState: {
              role: previousRole,
              applicationStatus: "PENDING",
            },

            newState: {
              role: previousRole,
              applicationStatus: "DECLINED",
            },

            relatedDocument: {
              model: "IntervenantApplication",
              id: application._id,
            },
          },
        ],
        {
          session,
        },
      );
    });
  } finally {
    await session.endSession();
  }

  await scheduleDeletion(applicationId);

  const decided = await IntervenantApplication.findById(applicationId);
  if (decided) {
    const notification = await createNotification({
      recipient: decided.user,
      type: "INTERVENANT_APPLICATION_STATUS",
      title:
        decision === "APPROVE"
          ? "Demande d’intervenante acceptée"
          : "Décision concernant ta demande",
      message:
        decision === "APPROVE"
          ? "Ta demande d’intervenante a été acceptée."
          : `Ta demande n’a pas été acceptée.${comment ? ` — ${comment}` : ""}`,
      targetType: "INTERVENANT_APPLICATION",
      targetId: decided._id,
      actionPath: "/profile/intervenant-application",
      mandatory: true,
      deduplicationKey: `intervenant-decision:${decided._id}`,
      emailHandledExternally: true,
    });
    await notificationDelivery.queue({
      notification: notification?._id,
      recipient: decided.user,
      category: "PERSONAL_ADMINISTRATION",
      mandatory: true,
      title: notification.title,
      message: notification.message,
      actionPath: "/profile/intervenant-application",
      idempotencyKey: `intervenant-decision:${decided._id}`,
    });
  }

  return getIntervenantApplicationForAdmin(applicationId);
}

module.exports = {
  createIntervenantApplication,
  updateIntervenantApplication,
  submitIntervenantApplication,
  getIntervenantApplications,
  cancelIntervenantApplication,
  getPendingIntervenantApplications,
  getIntervenantApplicationForAdmin,
  decideIntervenantApplication,
};
