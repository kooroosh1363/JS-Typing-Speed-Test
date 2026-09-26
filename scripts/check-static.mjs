import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../assets/css/style.css", import.meta.url), "utf8");

const failures = [];
const requireMatch = (pattern, message) => {
  if (!pattern.test(html)) failures.push(message);
};

requireMatch(/<main\b/i, "A main landmark is required.");
requireMatch(/<textarea\b[^>]*aria-describedby=/i, "Typing input must expose status help.");
requireMatch(/aria-live="polite"/i, "Live benchmark status is required.");
requireMatch(/<progress\b/i, "Passage progress element is required.");
requireMatch(/type="module"/i, "JavaScript must load as an ES module.");

if (/fonts\.googleapis\.com/i.test(css)) failures.push("External Google Fonts are not allowed.");
if (/outline\s*:\s*none/i.test(css)) failures.push("Visible keyboard focus must not be disabled.");
if (/href=["']#["']/i.test(html)) failures.push("Placeholder navigation links are not allowed.");
if (/on(?:click|input|keyup|keypress)=/i.test(html)) failures.push("Inline event handlers are not allowed.");

if (failures.length) {
  failures.forEach((failure) => console.error(`[fail] ${failure}`));
  process.exit(1);
}

console.log("[pass] Static accessibility and hygiene checks.");
