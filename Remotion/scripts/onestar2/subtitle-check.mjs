// Fails if any narration line is too long to fit two subtitle lines in the safe box.
// Rule of thumb: about 30 Thai characters per line at font size 52 in an 850 px wide box, two lines maximum.
import { readFileSync } from "node:fs";
const LIMIT = 56;
const lines = JSON.parse(readFileSync("scripts/onestar2/part2.narration.json", "utf8")).map((l) => (typeof l === "string" ? l : l.text));
let bad = 0;
lines.forEach((t, i) => {
  const n = t.replace(/\s/g, "").length;
  console.log(`line ${i}: ${n} chars`);
  if (n > LIMIT) { console.error(`FAIL: line ${i} has ${n} chars (limit ${LIMIT})`); bad++; }
});
if (bad) process.exit(1);
console.log("OK");
