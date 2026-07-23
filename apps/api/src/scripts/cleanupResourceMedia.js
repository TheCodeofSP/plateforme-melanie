require("dotenv").config();
const connectDB = require("../config/db");
const { cleanupReplacedMedia } = require("../services/resources/media.service");
async function main() {
  await connectDB();
  const count = await cleanupReplacedMedia();
  console.log(`${count} média(s) remplacé(s) supprimé(s).`);
  process.exit(0);
}
main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
