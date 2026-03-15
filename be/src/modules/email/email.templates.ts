import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { EmailTemplateType } from "./email.types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_PATH = path.join(__dirname, "templates");

function loadTemplate(name: string): string {
  const p = path.join(TEMPLATES_PATH, `${name}.html`);
  try {
    return fs.readFileSync(p, "utf-8");
  } catch {
    return `<p>Template ${name} not found.</p>`;
  }
}

function replacePlaceholders(html: string, data: Record<string, string | number | undefined>): string {
  let out = html;
  for (const [key, value] of Object.entries(data)) {
    const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
    out = out.replace(placeholder, String(value ?? ""));
  }
  return out;
}

export function renderTemplate(
  template: EmailTemplateType,
  data: Record<string, string | number | undefined>
): string {
  const raw = loadTemplate(template);
  return replacePlaceholders(raw, data);
}
