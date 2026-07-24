const {
  listAdminUsers,
  getAdminUserDetails,
  suspendUser,
  reactivateUser,
  revokeIntervenantRole,
  anonymizeUserAsAdmin,
} = require("../services/adminUser.service");

async function listUsers(req, res, next) {
  try { res.json({ success: true, ...(await listAdminUsers(req.validatedQuery || req.query)) }); } catch (error) { next(error); }
}

async function getUserDetails(req, res, next) {
  try {
    const details = await getAdminUserDetails(req.params.userId);

    res.status(200).json({
      success: true,
      ...details,
    });
  } catch (error) {
    next(error);
  }
}

async function suspendAccount(req, res, next) {
  try {
    await suspendUser({
      adminId: req.auth.user._id,
      userId: req.params.userId,
      comment: req.body.comment,
    });

    res.status(200).json({
      success: true,
      message: "Le compte a été suspendu.",
    });
  } catch (error) {
    next(error);
  }
}

async function reactivateAccount(req, res, next) {
  try {
    await reactivateUser({
      adminId: req.auth.user._id,
      userId: req.params.userId,
      comment: req.body.comment,
    });

    res.status(200).json({
      success: true,
      message: "Le compte a été réactivé.",
    });
  } catch (error) {
    next(error);
  }
}

async function revokeIntervenant(req, res, next) {
  try {
    await revokeIntervenantRole({
      adminId: req.auth.user._id,
      userId: req.params.userId,
      comment: req.body.comment,
    });

    res.status(200).json({
      success: true,
      message: "Le rôle intervenant a été retiré.",
    });
  } catch (error) {
    next(error);
  }
}

async function anonymizeAccount(req, res, next) {
  try {
    await anonymizeUserAsAdmin({
      adminId: req.auth.user._id,
      userId: req.params.userId,
    });

    res.status(200).json({
      success: true,
      message: "Le compte et ses données personnelles ont été anonymisés.",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listUsers,
  getUserDetails,
  suspendAccount,
  reactivateAccount,
  revokeIntervenant,
  anonymizeAccount,
};
