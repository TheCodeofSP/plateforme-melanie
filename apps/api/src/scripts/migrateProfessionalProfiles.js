require("dotenv").config();
const connectDB = require("../config/db");
const mongoose = require("mongoose");

async function main() {
  await connectDB();
  const profiles = mongoose.connection.collection("professionalprofiles");
  const users = mongoose.connection.collection("users");
  const cursor = profiles.find({ draftVersion: { $exists: false } });
  let migrated = 0;
  for await (const profile of cursor) {
    const user = await users.findOne(
      { _id: profile.user },
      { projection: { firstName: 1, lastName: 1 } },
    );
    const version = {
      professionalName: profile.professionalName || "",
      displayedFirstName: user?.firstName || "",
      displayedLastName: user?.lastName || "",
      profession: profile.profession || "",
      specialties: profile.specialties || [],
      shortPresentation: (profile.presentation || "").slice(0, 500),
      biography: profile.presentation || "",
      photo: null,
      website: profile.links?.website || null,
    };
    await profiles.updateOne(
      { _id: profile._id, draftVersion: { $exists: false } },
      {
        $set: {
          draftVersion: version,
          publishedVersion: profile.isActive ? version : null,
          publicationStatus: profile.isActive ? "PUBLISHED" : "HIDDEN",
          reviewStatus: profile.isActive ? "APPROVED" : "NOT_SUBMITTED",
          approvedAt: profile.activatedAt || profile.updatedAt || new Date(),
          hiddenAt: profile.isActive
            ? null
            : profile.deactivatedAt || new Date(),
        },
        $unset: {
          professionalName: "",
          profession: "",
          specialties: "",
          presentation: "",
          links: "",
        },
      },
    );
    migrated += 1;
  }
  console.log(`${migrated} profil(s) professionnel(s) migré(s).`);
  await mongoose.disconnect();
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
