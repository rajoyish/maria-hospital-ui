import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  const txtPath = resolve(__dirname, "..", "videos.txt");
  const publicDir = resolve(__dirname, "..", "public");
  const jsonPath = resolve(publicDir, "videos.json");

  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  if (!existsSync(txtPath)) {
    writeFileSync(txtPath, "");
    writeFileSync(jsonPath, "[]");
    process.exit(0);
  }

  const urlsText = readFileSync(txtPath, "utf-8");
  const urls = urlsText.split("\n").filter((line) => line.trim() !== "");

  const videos = urls
    .map((url) => {
      const match = url.match(/@([^/]+)\/video\/(\d+)/);
      return match ? { id: match[2], author: `@${match[1]}` } : null;
    })
    .filter(Boolean);

  writeFileSync(jsonPath, JSON.stringify(videos, null, 2));
} catch (error) {
  process.exit(1);
}