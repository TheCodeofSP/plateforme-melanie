require("dotenv").config();
const mongoose = require("mongoose");
const connectDatabase = require("../config/db");
const User = require("../models/User");
const QuizParticipant = require("../models/QuizParticipant");
const crm = require("../services/dashboard/crm.service");
async function run() {
  await connectDatabase();
  let processed = 0;
  for (const user of await User.find({ accountStatus: { $ne: "ANONYMIZED" } })) { const participant = await QuizParticipant.findOne({ $or: [{ user: user._id }, { email: user.email }] }); await crm.syncIdentity({ user, participant, source: "PLATFORM_REGISTRATION" }); processed += 1; }
  for (const participant of await QuizParticipant.find({ user: null })) { await crm.syncIdentity({ participant, source: "QUIZ_PUBLIC" }); processed += 1; }
  console.log(`✅ ${processed} identités CRM synchronisées.`);
  await mongoose.connection.close();
}
run().catch(async (error) => { console.error("❌ Migration CRM impossible :", error.message); await mongoose.connection.close(); process.exit(1); });
