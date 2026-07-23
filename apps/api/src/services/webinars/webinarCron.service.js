const Webinar = require("../../models/Webinar");
const WebinarSession = require("../../models/WebinarSession");
const WebinarRegistration = require("../../models/WebinarRegistration");
const {
  createNotification,
  createManagementNotification,
} = require("../notification.service");
const email = require("./webinarEmail.service");
const registrations = require("./registration.service");

async function reminders24() {
  const now = new Date();
  const sessions = await WebinarSession.find({
    startsAt: {
      $gte: new Date(now.getTime() + 23 * 3600000),
      $lte: new Date(now.getTime() + 25 * 3600000),
    },
    status: { $in: ["SCHEDULED", "POSTPONED"] },
  });
  let processed = 0;
  for (const session of sessions) {
    const webinar = await Webinar.findById(session.webinar);
    const rows = await WebinarRegistration.find({
      session: session._id,
      status: "REGISTERED",
      reminder24SentAt: null,
      createdAt: { $lte: new Date(session.startsAt.getTime() - 24 * 3600000) },
    }).populate("user");
    for (const row of rows) {
      if (!row.user) continue;
      const key = `webinar-reminder-24:${session._id}:${row.user._id}`;
      const notification = await createNotification({
        recipient: row.user._id,
        type: "WEBINAR_REMINDER",
        title: "Webinaire demain",
        message: webinar.title,
        targetType: "WEBINAR",
        targetId: webinar._id,
        actionPath: `/webinars/${webinar._id}`,
        deduplicationKey: key,
        emailHandledExternally: true,
      });
      await email.send(
        "reminder24",
        row.user,
        { title: webinar.title },
        { notification: notification?._id, idempotencyKey: key },
      );
      row.reminder24SentAt = now;
      await row.save();
      processed += 1;
    }
  }
  return { processed, failed: 0 };
}

async function reminders1() {
  const now = new Date();
  const sessions = await WebinarSession.find({
    startsAt: {
      $gte: new Date(now.getTime() + 45 * 60000),
      $lte: new Date(now.getTime() + 75 * 60000),
    },
    status: { $in: ["SCHEDULED", "POSTPONED"] },
  }).select("+meetUrl");
  let processed = 0;
  let failed = 0;
  for (const session of sessions) {
    const webinar = await Webinar.findById(session.webinar);
    if (!session.meetUrl) {
      await createManagementNotification({
        scope: "WEBINARS",
        type: "WEBINAR_ADMIN_ALERT",
        title: "Lien Meet manquant",
        message: webinar.title,
        targetType: "WEBINAR_SESSION",
        targetId: session._id,
        actionPath: `/admin/webinars/${webinar._id}`,
        groupKey: `missing-meet:${session._id}`,
      });
      failed += 1;
      continue;
    }
    const rows = await WebinarRegistration.find({
      session: session._id,
      status: "REGISTERED",
      reminder1SentAt: null,
      createdAt: { $lte: new Date(session.startsAt.getTime() - 3600000) },
    }).populate("user");
    for (const row of rows) {
      if (!row.user) continue;
      const key = `webinar-reminder-1:${session._id}:${row.user._id}`;
      const notification = await createNotification({
        recipient: row.user._id,
        type: "WEBINAR_REMINDER",
        title: "Webinaire dans une heure",
        message: webinar.title,
        targetType: "WEBINAR",
        targetId: webinar._id,
        actionPath: `/webinars/${webinar._id}`,
        deduplicationKey: key,
        emailHandledExternally: true,
      });
      await email.send(
        "reminder1",
        row.user,
        { title: webinar.title, meetUrl: session.meetUrl },
        { notification: notification?._id, idempotencyKey: key },
      );
      row.reminder1SentAt = now;
      await row.save();
      processed += 1;
    }
  }
  return { processed, failed };
}

async function maintain() {
  const now = new Date();
  const expired = await WebinarRegistration.find({
    status: "WAITLISTED",
    confirmationExpiresAt: { $lte: now },
  });
  for (const row of expired) {
    const max = await WebinarRegistration.findOne({
      session: row.session,
      status: "WAITLISTED",
    })
      .sort({ waitlistPosition: -1 })
      .select("waitlistPosition");
    row.waitlistPosition = (max?.waitlistPosition || 0) + 1;
    row.confirmationExpiresAt = null;
    await row.save();
    await registrations.promote(row.session);
  }
  const closing = await WebinarSession.find({
    status: { $in: ["SCHEDULED", "POSTPONED"] },
    startsAt: { $lte: new Date(now.getTime() + 3600000), $gt: now },
    registrationsClosedAt: null,
  });
  for (const session of closing) {
    session.registrationsClosedAt = now;
    await session.save();
  }
  const completed = await WebinarSession.find({
    status: { $in: ["SCHEDULED", "POSTPONED"] },
    startsAt: { $lt: now },
  });
  let completedCount = 0;
  for (const session of completed) {
    if (
      new Date(session.startsAt).getTime() + session.durationMinutes * 60000 <=
      now
    ) {
      session.status = "COMPLETED";
      session.completedAt = now;
      await session.save();
      completedCount += 1;
    }
  }
  const open = await WebinarSession.find({
    status: { $in: ["SCHEDULED", "POSTPONED"] },
    startsAt: { $gt: new Date(now.getTime() + 3600000) },
    registrationsManuallyClosed: false,
    $expr: { $lt: ["$counters.registered", "$capacity"] },
  });
  for (const session of open) await registrations.promote(session._id);
  return {
    processed: expired.length + closing.length + completedCount + open.length,
    failed: 0,
  };
}

module.exports = { reminders24, reminders1, maintain };
