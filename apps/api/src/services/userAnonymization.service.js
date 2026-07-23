const mongoose = require("mongoose");

const User = require("../models/User");
const Session = require("../models/Session");
const AccountToken = require("../models/AccountToken");
const ConsentRecord = require("../models/ConsentRecord");
const ParentalAuthorization = require("../models/ParentalAuthorization");
const EmailChangeRequest = require("../models/EmailChangeRequest");
const IntervenantApplication = require("../models/IntervenantApplication");
const ProfessionalProfile = require("../models/ProfessionalProfile");
const IntervenantExitRequest = require("../models/IntervenantExitRequest");
const AdminActionLog = require("../models/AdminActionLog");
const Resource = require("../models/Resource");
const ResourceAnalyticsEvent = require("../models/ResourceAnalyticsEvent");
const QuizParticipant = require("../models/QuizParticipant");
const QuizAttempt = require("../models/QuizAttempt");
const QuizConsentRecord = require("../models/QuizConsentRecord");
const QuizAdminAccessLog = require("../models/QuizAdminAccessLog");
const ApplicationDocument = require("../models/ApplicationDocument");
const MediaAsset = require("../models/MediaAsset");
const SafePlacePost = require("../models/SafePlacePost");
const SafePlaceComment = require("../models/SafePlaceComment");
const SafePlaceReaction = require("../models/SafePlaceReaction");
const SafePlaceReport = require("../models/SafePlaceReport");
const SafePlaceContentRevision = require("../models/SafePlaceContentRevision");
const SafePlaceSuspension = require("../models/SafePlaceSuspension");
const Notification = require("../models/Notification");
const NotificationPreference = require("../models/NotificationPreference");
const NotificationDetail = require("../models/NotificationDetail");
const NotificationDelivery = require("../models/NotificationDelivery");
const WebinarRegistration = require("../models/WebinarRegistration");
const WebinarSession = require("../models/WebinarSession");
const WebinarQuestion = require("../models/WebinarQuestion");
const WebinarEvaluation = require("../models/WebinarEvaluation");
const WebinarReplayView = require("../models/WebinarReplayView");
const CommunicationRecipient = require("../models/CommunicationRecipient");
const CommunicationPreference = require("../models/CommunicationPreference");
const CommunicationWorkflowLog = require("../models/CommunicationWorkflowLog");
const CommunicationResubscribeToken = require("../models/CommunicationResubscribeToken");
const CrmContact = require("../models/CrmContact");
const CrmNote = require("../models/CrmNote");
const CrmTask = require("../models/CrmTask");

const { generateToken } = require("./token.service");

const { hashPassword } = require("./password.service");
const { syncQuizMarketingContact } = require("./marketingContact.service");

async function anonymizeUserById(userId) {
  const anonymousPasswordHash = await hashPassword(generateToken());

  const session = await mongoose.startSession();

  let anonymizedUser;
  let quizContactToRemove = null;
  const userNotificationIds = await Notification.find({
    recipient: userId,
  }).distinct("_id");
  const crmContact = await CrmContact.findOne({ user: userId }).select("_id");
  let webinarSessionsToPromote = [];
  let communicationEmailToRemove = null;

  try {
    await session.withTransaction(async () => {
      const user = await User.findById(userId)
        .select("+passwordHash")
        .session(session);

      if (!user) {
        const error = new Error("Ce compte n’existe pas.");

        error.code = "USER_NOT_FOUND";
        error.statusCode = 404;

        throw error;
      }

      if (user.accountStatus === "ANONYMIZED") {
        const error = new Error("Ce compte est déjà anonymisé.");

        error.code = "USER_ALREADY_ANONYMIZED";
        error.statusCode = 400;

        throw error;
      }

      const userIdString = user._id.toString();
      const originalEmail = user.email;
      communicationEmailToRemove = originalEmail;
      const hasAuthoredResources = await Resource.exists({
        owner: user._id,
      }).session(session);
      const quizParticipant = await QuizParticipant.findOne({
        user: user._id,
      }).session(session);
      const professionalProfile = await ProfessionalProfile.findOne({
        user: user._id,
      }).session(session);
      const safePlacePosts = await SafePlacePost.find({
        author: user._id,
      }).session(session);
      const isolatedSafePlacePostIds = safePlacePosts
        .filter((post) => post.counters.comments === 0)
        .map((post) => post._id);
      const preservedSafePlacePosts = safePlacePosts.filter(
        (post) => post.counters.comments > 0,
      );
      const safePlaceImageIds = safePlacePosts.flatMap((post) =>
        post.images.map((image) => image.media),
      );
      const safePlaceReactions = await SafePlaceReaction.find({
        user: user._id,
      })
        .session(session)
        .lean();
      const webinarRegistrations = await WebinarRegistration.find({
        user: user._id,
        status: { $in: ["REGISTERED", "WAITLISTED"] },
      })
        .session(session)
        .lean();
      const webinarCounterOps = webinarRegistrations.map((registration) => ({
        updateOne: {
          filter: { _id: registration.session },
          update: {
            $inc: {
              [`counters.${registration.status === "REGISTERED" ? "registered" : "waitlisted"}`]:
                -1,
            },
          },
        },
      }));
      webinarSessionsToPromote = webinarRegistrations
        .filter((registration) => registration.status === "REGISTERED")
        .map((registration) => registration.session);
      const postReactionOps = safePlaceReactions
        .filter((reaction) => reaction.targetType === "POST")
        .map((reaction) => ({
          updateOne: {
            filter: { _id: reaction.targetId },
            update: { $inc: { [`counters.reactions.${reaction.type}`]: -1 } },
          },
        }));
      const commentReactionOps = safePlaceReactions
        .filter((reaction) => reaction.targetType === "COMMENT")
        .map((reaction) => ({
          updateOne: {
            filter: { _id: reaction.targetId },
            update: { $inc: { [`counters.reactions.${reaction.type}`]: -1 } },
          },
        }));
      if (quizParticipant)
        quizContactToRemove = {
          email: quizParticipant.email,
          firstName: quizParticipant.firstName,
        };

      user.email = `anonymized-${userIdString}@deleted.invalid`;

      user.firstName = "Membre";
      user.lastName = "anonymisée";

      user.pseudonym = `membre-supprimee-${userIdString.slice(-8)}`;

      user.dateOfBirth = new Date("1970-01-01T00:00:00.000Z");

      user.passwordHash = anonymousPasswordHash;

      user.role = "MEMBER";
      user.accountStatus = "ANONYMIZED";
      user.emailVerifiedAt = null;
      user.currentSpmProfile = "NON_DEFINI";
      user.quizCompleted = false;
      user.lastLoginAt = null;
      user.anonymizedAt = new Date();

      await user.save({
        session,
      });

      await Promise.all([
        Session.deleteMany(
          {
            user: user._id,
          },
          {
            session,
          },
        ),

        AccountToken.deleteMany(
          {
            user: user._id,
          },
          {
            session,
          },
        ),

        ConsentRecord.deleteMany(
          {
            user: user._id,
          },
          {
            session,
          },
        ),

        ParentalAuthorization.deleteMany(
          {
            user: user._id,
          },
          {
            session,
          },
        ),

        EmailChangeRequest.deleteMany(
          {
            user: user._id,
          },
          {
            session,
          },
        ),

        IntervenantApplication.deleteMany(
          {
            user: user._id,
          },
          {
            session,
          },
        ),

        ApplicationDocument.updateMany(
          { owner: user._id, status: { $ne: "DELETED" } },
          { $set: { deleteAfter: new Date() } },
          { session },
        ),

        hasAuthoredResources
          ? ProfessionalProfile.updateOne(
              { user: user._id },
              {
                $set: {
                  draftVersion: {
                    professionalName: "Ancienne intervenante",
                    displayedFirstName: "",
                    displayedLastName: "",
                    profession:
                      professionalProfile?.publishedVersion?.profession ||
                      "Professionnelle",
                    specialties: [],
                    shortPresentation: "",
                    biography: "",
                    photo: null,
                    website: null,
                  },
                  publishedVersion: {
                    professionalName: "Ancienne intervenante",
                    displayedFirstName: "",
                    displayedLastName: "",
                    profession:
                      professionalProfile?.publishedVersion?.profession ||
                      "Professionnelle",
                    specialties: [],
                    shortPresentation: "",
                    biography: "",
                    photo: null,
                    website: null,
                  },
                  publicationStatus: "HIDDEN",
                  reviewStatus: "APPROVED",
                  isActive: false,
                  deactivatedAt: new Date(),
                  hiddenAt: new Date(),
                  lastAdminComment: null,
                },
              },
              { session },
            )
          : ProfessionalProfile.deleteMany({ user: user._id }, { session }),

        ResourceAnalyticsEvent.updateMany(
          { user: user._id },
          {
            $set: { user: null, spmProfile: "NON_DEFINI" },
            $unset: { dedupeKey: "" },
          },
          { session },
        ),

        quizParticipant
          ? QuizAttempt.deleteMany(
              { participant: quizParticipant._id },
              { session },
            )
          : Promise.resolve(),

        quizParticipant
          ? QuizConsentRecord.deleteMany(
              { participant: quizParticipant._id },
              { session },
            )
          : Promise.resolve(),

        quizParticipant
          ? QuizParticipant.deleteOne({ _id: quizParticipant._id }, { session })
          : Promise.resolve(),

        quizParticipant
          ? QuizAdminAccessLog.deleteMany(
              { participant: quizParticipant._id },
              { session },
            )
          : Promise.resolve(),

        professionalProfile?.draftVersion?.photo ||
        professionalProfile?.publishedVersion?.photo
          ? MediaAsset.updateMany(
              {
                _id: {
                  $in: [
                    professionalProfile?.draftVersion?.photo,
                    professionalProfile?.publishedVersion?.photo,
                  ].filter(Boolean),
                },
              },
              { $set: { status: "REPLACED" } },
              { session },
            )
          : Promise.resolve(),

        SafePlacePost.updateMany(
          { _id: { $in: preservedSafePlacePosts.map((post) => post._id) } },
          { $set: { author: null, images: [] } },
          { session },
        ),

        SafePlacePost.deleteMany(
          { _id: { $in: isolatedSafePlacePostIds } },
          { session },
        ),

        SafePlaceComment.updateMany(
          { author: user._id },
          { $set: { author: null } },
          { session },
        ),

        SafePlaceReaction.deleteMany({ user: user._id }, { session }),

        postReactionOps.length
          ? SafePlacePost.bulkWrite(postReactionOps, { session })
          : Promise.resolve(),
        commentReactionOps.length
          ? SafePlaceComment.bulkWrite(commentReactionOps, { session })
          : Promise.resolve(),

        SafePlaceReaction.deleteMany(
          { targetType: "POST", targetId: { $in: isolatedSafePlacePostIds } },
          { session },
        ),

        SafePlaceContentRevision.deleteMany(
          { targetType: "POST", targetId: { $in: isolatedSafePlacePostIds } },
          { session },
        ),

        SafePlaceContentRevision.updateMany(
          { actor: user._id },
          { $set: { actor: null, pseudonymSnapshot: "Ancienne membre" } },
          { session },
        ),

        SafePlaceReport.updateMany(
          { reporter: user._id },
          {
            $set: { reporter: null, details: null },
            $unset: { openDedupeKey: "" },
          },
          { session },
        ),

        SafePlaceSuspension.updateMany(
          { user: user._id, status: "ACTIVE" },
          {
            $set: {
              status: "LIFTED",
              liftedAt: new Date(),
              liftReason: "Compte supprimé",
            },
          },
          { session },
        ),

        Notification.deleteMany(
          { $or: [{ recipient: user._id }, { actor: user._id }] },
          { session },
        ),

        NotificationDetail.deleteMany(
          {
            $or: [
              { notification: { $in: userNotificationIds } },
              { actor: user._id },
            ],
          },
          { session },
        ),

        NotificationDelivery.deleteMany({ recipient: user._id }, { session }),

        NotificationPreference.deleteMany({ user: user._id }, { session }),

        crmContact
          ? CrmContact.updateOne(
              { _id: crmContact._id },
              {
                $set: {
                  primaryEmail: `anonymized-${crmContact._id}@deleted.invalid`,
                  emailAliases: [],
                  firstName: "Contact",
                  lastName: "anonymisé",
                  phone: null,
                  tags: [],
                  doNotContact: true,
                  anonymizedAt: new Date(),
                  "marketingConsent.granted": false,
                },
              },
              { session },
            )
          : Promise.resolve(),

        crmContact
          ? CrmNote.deleteMany({ contact: crmContact._id }, { session })
          : Promise.resolve(),

        crmContact
          ? CrmTask.deleteMany({ contact: crmContact._id }, { session })
          : Promise.resolve(),

        WebinarRegistration.updateMany(
          { user: user._id, status: { $in: ["REGISTERED", "WAITLISTED"] } },
          {
            $set: {
              user: null,
              status: "CANCELLED",
              cancelledAt: new Date(),
              confirmationExpiresAt: null,
            },
            $unset: { activeKey: "" },
          },
          { session },
        ),

        WebinarRegistration.updateMany(
          {
            user: user._id,
            status: { $in: ["PRESENT", "ABSENT", "CANCELLED"] },
          },
          { $set: { user: null }, $unset: { activeKey: "" } },
          { session },
        ),

        webinarCounterOps.length
          ? WebinarSession.bulkWrite(webinarCounterOps, { session })
          : Promise.resolve(),

        WebinarQuestion.updateMany(
          { author: user._id },
          { $set: { author: null } },
          { session },
        ),

        WebinarEvaluation.updateMany(
          { user: user._id },
          { $set: { user: null, anonymizedAt: new Date() } },
          { session },
        ),

        WebinarReplayView.updateMany(
          { user: user._id },
          { $set: { user: null } },
          { session },
        ),

        CommunicationRecipient.updateMany(
          { user: user._id },
          [
            {
              $set: {
                email: {
                  $concat: [
                    "anonymized-",
                    { $toString: "$_id" },
                    "@deleted.invalid",
                  ],
                },
                user: null,
                firstNameSnapshot: null,
                anonymizedAt: new Date(),
              },
            },
          ],
          { session },
        ),

        CommunicationPreference.updateMany(
          { $or: [{ user: user._id }, { email: originalEmail }] },
          {
            $set: {
              user: null,
              editorialNewsletter: false,
              resourceAnnouncements: false,
              webinarAnnouncements: false,
              platformNews: false,
              allMarketingUnsubscribedAt: new Date(),
            },
          },
          { session },
        ),

        CommunicationWorkflowLog.updateMany(
          { actor: user._id },
          { $set: { actor: null } },
          { session },
        ),

        CommunicationResubscribeToken.deleteMany(
          { email: originalEmail },
          { session },
        ),

        MediaAsset.updateMany(
          {
            $or: [
              { _id: { $in: safePlaceImageIds } },
              { owner: user._id, purpose: "SAFE_PLACE_IMAGE" },
            ],
            status: { $ne: "DELETED" },
          },
          { $set: { status: "REPLACED" } },
          { session },
        ),

        IntervenantExitRequest.deleteMany(
          {
            user: user._id,
          },
          {
            session,
          },
        ),

        AdminActionLog.updateMany(
          {
            targetUser: user._id,
          },
          {
            $set: {
              comment: null,
            },
          },
          {
            session,
          },
        ),
      ]);

      anonymizedUser = user;
    });
  } finally {
    await session.endSession();
  }

  if (quizContactToRemove) {
    await syncQuizMarketingContact({
      ...quizContactToRemove,
      granted: false,
    }).catch((error) => {
      console.error(
        `Contact Quiz non désynchronisé du fournisseur email : ${error.message}`,
      );
    });
  }

  if (webinarSessionsToPromote.length) {
    const { promote } = require("./webinars/registration.service");
    for (const sessionId of webinarSessionsToPromote)
      await promote(sessionId).catch((error) =>
        console.error(`Liste d’attente non relancée : ${error.message}`),
      );
  }

  if (communicationEmailToRemove) {
    const { syncNewsletterContact } = require("./marketingContact.service");
    await syncNewsletterContact({
      email: communicationEmailToRemove,
      subscribed: false,
    }).catch((error) =>
      console.error(
        `Contact Newsletter non désynchronisé du fournisseur email : ${error.message}`,
      ),
    );
  }

  return anonymizedUser;
}

module.exports = {
  anonymizeUserById,
};
