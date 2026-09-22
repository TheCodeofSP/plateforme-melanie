const service = require("../services/notification.service");
const delivery = require("../services/notificationDelivery.service");

const wrap = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list: wrap(async (req, res) =>
    res.json({
      success: true,
      ...(await service.list(req.auth.user._id, req.validatedQuery)),
    }),
  ),
  unread: wrap(async (req, res) =>
    res.json({
      success: true,
      counts: await service.unreadCount(req.auth.user._id),
    }),
  ),
  detail: wrap(async (req, res) =>
    res.json({
      success: true,
      notification: await service.getDetail(
        req.auth.user._id,
        req.params.notificationId,
      ),
    }),
  ),
  read: wrap(async (req, res) =>
    res.json({
      success: true,
      notification: await service.markRead(
        req.auth.user._id,
        req.params.notificationId,
      ),
    }),
  ),
  unreadOne: wrap(async (req, res) =>
    res.json({
      success: true,
      notification: await service.markUnread(
        req.auth.user._id,
        req.params.notificationId,
      ),
    }),
  ),
  readAll: wrap(async (req, res) =>
    res.json({
      success: true,
      updated: await service.readAll(req.auth.user._id, req.body),
    }),
  ),
  remove: wrap(async (req, res) =>
    res.json({
      success: true,
      deleted: Boolean(
        await service.remove(req.auth.user._id, req.params.notificationId),
      ),
    }),
  ),
  removeAll: wrap(async (req, res) =>
    res.json({
      success: true,
      deleted: await service.removeAll(req.auth.user._id, req.body),
    }),
  ),
  handled: wrap(async (req, res) =>
    res.json({
      success: true,
      notification: await service.setHandled(
        req.auth.user,
        req.params.notificationId,
        true,
      ),
    }),
  ),
  unhandled: wrap(async (req, res) =>
    res.json({
      success: true,
      notification: await service.setHandled(
        req.auth.user,
        req.params.notificationId,
        false,
      ),
    }),
  ),
  preferences: wrap(async (req, res) =>
    res.json({
      success: true,
      preferences: await service.preference(req.auth.user._id),
    }),
  ),
  updatePreferences: wrap(async (req, res) => {
    const preferences = await service.updatePreference(
      req.auth.user._id,
      req.body,
    );
    const platformDisabled = Object.entries(req.body.categories).some(
      ([, channels]) => channels.platform === false && channels.email === true,
    );
    res.json({
      success: true,
      preferences,
      warning: platformDisabled
        ? "Les catégories configurées en email uniquement ne seront plus visibles dans la cloche."
        : null,
    });
  }),
  test: wrap(async (req, res) =>
    res.status(201).json({
      success: true,
      result: await delivery.queueTest(req.auth.user, req.body),
    }),
  ),
  preview: wrap(async (req, res) =>
    res.json({ success: true, preview: await delivery.preview(req.body) }),
  ),
};
