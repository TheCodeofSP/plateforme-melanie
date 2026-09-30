function getRecetteKeys(row) {
  return [row.externalImportKey, ...(row.externalImportAliases || [])];
}
function getRecetteChanges(resource, row) {
  const changes = {};
  if (resource.publishedVersion) {
    changes.finalVisibility = row.visibility;
    changes["publishedVersion.proposedVisibility"] = row.visibility;
    changes["publishedVersion.recommendedSpmProfiles"] = row.recommendedSpmProfiles;
  }
  if (resource.workingVersion) {
    changes["workingVersion.proposedVisibility"] = row.visibility;
    changes["workingVersion.recommendedSpmProfiles"] = row.recommendedSpmProfiles;
  }
  return changes;
}
module.exports = { getRecetteKeys, getRecetteChanges };
