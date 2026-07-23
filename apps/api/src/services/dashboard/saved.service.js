const DashboardSavedItem = require("../../models/DashboardSavedItem");
const { dashboardError } = require("./crm.service");
async function list(owner, kind) {
  return DashboardSavedItem.find({ owner, kind, deletedAt: null })
    .sort({ updatedAt: -1 })
    .lean();
}
async function create(owner, kind, data) {
  return DashboardSavedItem.create({ owner, kind, ...data });
}
async function update(owner, id, data) {
  const item = await DashboardSavedItem.findOneAndUpdate(
    { _id: id, owner, deletedAt: null },
    { $set: data },
    { new: true },
  );
  if (!item)
    throw dashboardError(
      "Élément enregistré introuvable.",
      "DASHBOARD_SAVED_ITEM_NOT_FOUND",
      404,
    );
  return item;
}
async function remove(owner, id) {
  const item = await DashboardSavedItem.findOneAndUpdate(
    { _id: id, owner, deletedAt: null },
    { $set: { deletedAt: new Date() } },
    { new: true },
  );
  if (!item)
    throw dashboardError(
      "Élément enregistré introuvable.",
      "DASHBOARD_SAVED_ITEM_NOT_FOUND",
      404,
    );
  return true;
}
module.exports = { list, create, update, remove };
