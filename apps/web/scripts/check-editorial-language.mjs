import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";

const roots = ["src/content", "src/pages"];
const expressions = [
  ["diagnostic", /\bdiagnostic\w*/giu],
  ["promesse de soin", /\b(guérir|guérison|soigner|traitement)\w*/giu],
  ["formulation genrée", /\b(femme|femmes|féminin|féminine)\w*/giu],
];

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? filesIn(path) : [path];
    }),
  );
  return nested.flat();
}

let matches = 0;
for (const root of roots) {
  for (const file of await filesIn(root)) {
    if (![".js", ".jsx"].includes(extname(file))) continue;
    const lines = (await readFile(file, "utf8")).split("\n");
    lines.forEach((line, index) => {
      expressions.forEach(([label, pattern]) => {
        pattern.lastIndex = 0;
        if (pattern.test(line)) {
          matches += 1;
          console.log(`${file}:${index + 1} [${label}] ${line.trim()}`);
        }
      });
    });
  }
}

console.log(
  matches
    ? `\n${matches} occurrence(s) à relire dans leur contexte.`
    : "\nAucune expression sensible détectée.",
);
