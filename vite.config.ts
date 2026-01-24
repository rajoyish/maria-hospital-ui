import { existsSync, readdirSync } from "node:fs";
import { dirname, join, parse, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

// --- Hoisted Regex & Constants ---
const WINDOWS_PATH_REGEX = /\\/g;
const TRAILING_SLASH_REGEX = /\/$/;
const SITE_URL_PLACEHOLDER_REGEX = /%VITE_SITE_URL%/g;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TREATMENTS_DIR = resolve(__dirname, "treatments");
const CARE_SERVICES_DIR = resolve(__dirname, "care-services");

// --- Helper Functions ---

function getRootHtmlInputs(): Record<string, string> {
  const inputs: Record<string, string> = {};
  const files = readdirSync(__dirname);

  for (const file of files) {
    if (file.endsWith(".html")) {
      inputs[parse(file).name] = resolve(__dirname, file);
    }
  }
  return inputs;
}

function getDirectoryInputs(dirPath: string): Record<string, string> {
  const inputs: Record<string, string> = {};

  if (existsSync(dirPath)) {
    const files = readdirSync(dirPath);
    for (const file of files) {
      if (file.endsWith(".html")) {
        const key = join(
          relative(__dirname, dirPath),
          parse(file).name
        ).replace(WINDOWS_PATH_REGEX, "/");
        inputs[key] = join(dirPath, file);
      }
    }
  }
  return inputs;
}

// --- Config Export ---

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  const rawUrl =
    env.VITE_SITE_URL ||
    (mode === "development"
      ? "http://localhost:5173"
      : "https://npmariahospital.com");

  const siteUrl = rawUrl.replace(TRAILING_SLASH_REGEX, "");

  return {
    define: {
      "process.env.VITE_SITE_URL": JSON.stringify(siteUrl),
    },
    plugins: [
      tailwindcss(),
      {
        name: "html-transform",
        enforce: "pre",
        transformIndexHtml: {
          order: "pre",
          handler(html) {
            return html.replace(SITE_URL_PLACEHOLDER_REGEX, siteUrl);
          },
        },
      },
    ],
    build: {
      rollupOptions: {
        input: {
          ...getRootHtmlInputs(),
          ...getDirectoryInputs(TREATMENTS_DIR),
          ...getDirectoryInputs(CARE_SERVICES_DIR),
        },
      },
    },
  };
});
