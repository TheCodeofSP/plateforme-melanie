const fs = require("fs");
const path = require("path");
function files(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? files(path.join(dir, entry.name))
        : entry.name.endsWith(".js")
          ? [path.join(dir, entry.name)]
          : [],
    );
}
for (const file of files(path.join(__dirname, ".."))) {
  try {
    new Function(fs.readFileSync(file, "utf8"));
  } catch (error) {
    console.error(`${file}: ${error.message}`);
    process.exitCode = 1;
  }
}
if (!process.exitCode) console.log("Syntaxe JavaScript valide.");
