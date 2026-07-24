const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const env = require("./config/env");
const notFoundMiddleware = require("./middlewares/notFound.middleware");
const errorMiddleware = require("./middlewares/error.middleware");
const authRoutes = require("./routes/auth.routes");
const intervenantApplicationRoutes = require("./routes/intervenantApplication.routes");
const adminIntervenantApplicationRoutes = require("./routes/adminIntervenantApplication.routes");
const intervenantExitRoutes = require("./routes/intervenantExit.routes");
const adminUserRoutes = require("./routes/adminUser.routes");
const adminIntervenantExitRoutes = require("./routes/adminIntervenantExit.routes");
const resourceRoutes = require("./routes/resources/resource.routes");
const adminResourceRoutes = require("./routes/resources/adminResource.routes");
const reportRoutes = require("./routes/resources/report.routes");
const mediaRoutes = require("./routes/resources/media.routes");
const quizRoutes = require("./routes/quiz/quiz.routes");
const adminQuizRoutes = require("./routes/quiz/adminQuiz.routes");
const professionalProfileRoutes = require("./routes/professionalProfile.routes");
const professionalPublicRoutes = require("./routes/professionalPublic.routes");
const adminProfessionalProfileRoutes = require("./routes/adminProfessionalProfile.routes");
const applicationDocumentRoutes = require("./routes/applicationDocument.routes");
const consentRoutes = require("./routes/consent.routes");
const cronRoutes = require("./routes/cron.routes");
const createRateLimit = require("./middlewares/rateLimit.middleware");
const securityHeaders = require("./middlewares/securityHeaders.middleware");
const safePlaceAccessRoutes = require("./routes/safePlace/access.routes");
const safePlaceCategoryRoutes = require("./routes/safePlace/category.routes");
const safePlacePostRoutes = require("./routes/safePlace/post.routes");
const safePlaceCommentRoutes = require("./routes/safePlace/comment.routes");
const safePlaceReportRoutes = require("./routes/safePlace/report.routes");
const safePlaceMediaRoutes = require("./routes/safePlace/media.routes");
const safePlaceAdminCategoryRoutes = require("./routes/safePlace/adminCategory.routes");
const safePlaceAdminModerationRoutes = require("./routes/safePlace/adminModeration.routes");
const safePlaceAdminUtilityRoutes = require("./routes/safePlace/adminUtility.routes");
const notificationRoutes = require("./routes/notification.routes");
const adminNotificationRoutes = require("./routes/adminNotification.routes");
const safePlaceMyContentRoutes = require("./routes/safePlace/myContent.routes");
const webinarRoutes = require("./routes/webinars/webinar.routes");
const webinarAdminRoutes = require("./routes/webinars/webinarAdmin.routes");
const communicationRoutes = require("./routes/communications/preference.routes");
const publicCommunicationRoutes = require("./routes/communications/publicCommunication.routes");
const adminCommunicationRoutes = require("./routes/communications/adminCommunication.routes");
const communicationWebhookRoutes = require("./routes/communications/webhook.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const dashboardInvitationRoutes = require("./routes/dashboardInvitation.routes");
const systemRoutes = require("./routes/system.routes");
const requestContextMiddleware = require("./middlewares/requestContext.middleware");
const responseContractMiddleware = require("./middlewares/responseContract.middleware");
const { API_VERSION } = require("./config/app.constants");

const app = express();
app.set("trust proxy", 1);
app.use(requestContextMiddleware);
app.use(responseContractMiddleware);
app.use(securityHeaders);

const allowedOrigins = new Set([
  env.CLIENT_URL,
  ...env.ALLOWED_ORIGINS.split(",").map((value) => value.trim()).filter(Boolean),
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      try {
        const hostname = new URL(origin).hostname;
        if (
          env.APP_ENV !== "production" &&
          env.VERCEL_PREVIEW_HOST_SUFFIX &&
          hostname.endsWith(env.VERCEL_PREVIEW_HOST_SUFFIX)
        ) return callback(null, true);
      } catch {}
      const error = new Error("Origine non autorisée.");
      error.statusCode = 403;
      error.code = "CORS_ORIGIN_FORBIDDEN";
      return callback(error);
    },
    credentials: true,
  }),
);

app.use("/api", createRateLimit({ max: 300 }));

app.use(express.json({
  limit: "2mb",
  verify(req, _res, buffer) {
    if (req.originalUrl?.startsWith("/api/webhooks/resend/")) {
      req.rawBody = buffer.toString("utf8");
    }
  },
}));

app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    version: API_VERSION,
    environment: env.APP_ENV,
    message: "API Plateforme Mélanie opérationnelle",
  });
});

app.use("/api/auth", createRateLimit({ max: 60, code: "AUTH_RATE_LIMIT_EXCEEDED" }), authRoutes);
app.use("/api/auth", consentRoutes);

app.use("/api/intervenant-applications", intervenantApplicationRoutes);

app.use(
  "/api/admin/intervenant-applications",
  adminIntervenantApplicationRoutes,
);

app.use("/api/intervenant-exit-requests", intervenantExitRoutes);

app.use("/api/admin/intervenant-exit-requests", adminIntervenantExitRoutes);

app.use("/api/admin/users", adminUserRoutes);
app.use("/api/professional-profile", professionalProfileRoutes);
app.use("/api/professionals", professionalPublicRoutes);
app.use("/api/admin/professional-profiles", adminProfessionalProfileRoutes);
app.use("/api/intervenant-applications/media", applicationDocumentRoutes);

app.use("/api/resources", resourceRoutes);
app.use("/api/admin/resources", adminResourceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/admin/quiz", adminQuizRoutes);
app.use("/api/internal/cron", cronRoutes);
app.use("/api/safe-place", safePlaceAccessRoutes);
app.use("/api/safe-place/categories", safePlaceCategoryRoutes);
app.use("/api/safe-place/posts", safePlacePostRoutes);
app.use("/api/safe-place/comments", safePlaceCommentRoutes);
app.use("/api/safe-place/reports", safePlaceReportRoutes);
app.use("/api/safe-place/media", safePlaceMediaRoutes);
app.use("/api/admin/safe-place/categories", safePlaceAdminCategoryRoutes);
app.use("/api/admin/safe-place", safePlaceAdminModerationRoutes);
app.use("/api/admin/safe-place", safePlaceAdminUtilityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin/notifications", adminNotificationRoutes);
app.use("/api/safe-place/my-content", safePlaceMyContentRoutes);
app.use("/api/webinars", webinarRoutes);
app.use("/api/admin/webinars", webinarAdminRoutes);
app.use("/api/communication-preferences", communicationRoutes);
app.use("/api/communications", publicCommunicationRoutes);
app.use("/api/admin/communications", adminCommunicationRoutes);
app.use("/api/webhooks", communicationWebhookRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/dashboard/invitations", dashboardInvitationRoutes);
app.use("/api/admin/system", systemRoutes);

app.use(notFoundMiddleware);

app.use(errorMiddleware);

module.exports = app;
