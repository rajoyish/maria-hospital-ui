import tailwindcss from "@tailwindcss/vite";
import { exec } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmSync,
} from "node:fs";
import { dirname, join, parse, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { type ViteDevServer, defineConfig, loadEnv } from "vite";

const WINDOWS_PATH_REGEX = /\\/g;
const TRAILING_SLASH_REGEX = /\/$/;
const SITE_URL_PLACEHOLDER_REGEX = /%VITE_SITE_URL%/g;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CATEGORY_FOLDERS = [
  "urology-and-std",
  "ent",
  "anorectal-and-piles",
  "gynecology",
];
const CARE_SERVICES_DIR = resolve(__dirname, "care-services");

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

function getCategoryInputs(): Record<string, string> {
  const inputs: Record<string, string> = {};

  for (const category of CATEGORY_FOLDERS) {
    const categoryPath = resolve(__dirname, category, "treatments");

    if (existsSync(categoryPath)) {
      const files = readdirSync(categoryPath);
      for (const file of files) {
        if (file.endsWith(".html")) {
          const key = join(category, "treatments", parse(file).name).replace(
            WINDOWS_PATH_REGEX,
            "/"
          );
          inputs[key] = join(categoryPath, file);
        }
      }
    }
  }
  return inputs;
}

function moveCategoryFiles(
  distDir: string,
  category: string,
  targetTreatmentsDir: string
) {
  const srcDir = join(distDir, category, "treatments");
  const categoryDirInDist = join(distDir, category);

  if (!existsSync(srcDir)) {
    return;
  }

  const files = readdirSync(srcDir);

  for (const file of files) {
    const srcFile = join(srcDir, file);
    const destFile = join(targetTreatmentsDir, file);
    renameSync(srcFile, destFile);
    console.log(`✨ Organized: ${file} moved to /treatments/`);
  }

  try {
    rmSync(srcDir, { recursive: true, force: true });
    if (readdirSync(categoryDirInDist).length === 0) {
      rmSync(categoryDirInDist, { recursive: true, force: true });
    }
  } catch (_e) {
    // Ignored cleanup errors
  }
}

const structuralRewritePlugin = () => {
  return {
    name: "structural-rewrite",

    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, _res, next) => {
        if (req.url?.startsWith("/search/")) {
          req.url = "/search.html";
          return next();
        }

        if (req.url?.startsWith("/treatments/")) {
          const cleanName = req.url
            .replace("/treatments/", "")
            .replace(".html", "");

          for (const category of CATEGORY_FOLDERS) {
            const potentialPath = `/${category}/treatments/${cleanName}.html`;
            const absolutePath = join(
              __dirname,
              category,
              "treatments",
              `${cleanName}.html`
            );

            if (existsSync(absolutePath)) {
              req.url = potentialPath;
              break;
            }
          }
        }
        next();
      });
    },

    closeBundle() {
      const distDir = resolve(__dirname, "dist");
      const targetTreatmentsDir = join(distDir, "treatments");

      if (!existsSync(targetTreatmentsDir)) {
        mkdirSync(targetTreatmentsDir, { recursive: true });
      }

      for (const category of CATEGORY_FOLDERS) {
        moveCategoryFiles(distDir, category, targetTreatmentsDir);
      }
    },
  };
};

const generateTreatmentsPlugin = () => {
  return {
    name: "generate-treatments-dev",
    apply: "serve" as const,
    buildStart() {
      exec(
        "node generate-treatments-json.js development",
        (err, _stdout, stderr) => {
          if (err) {
            console.error("❌ JSON Gen Error:", stderr);
          } else {
            console.log("✅ Treatments JSON updated for Dev");
          }
        }
      );
    },
    handleHotUpdate({ file }: { file: string }) {
      if (file.endsWith(".html") && file.includes("treatments")) {
        exec("node generate-treatments-json.js development", () => {
          console.log("🔄 Treatments JSON refreshed");
        });
      }
    },
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const siteUrl = (env.VITE_SITE_URL || "").replace(TRAILING_SLASH_REGEX, "");

  return {
    define: {
      "process.env.VITE_SITE_URL": JSON.stringify(siteUrl),
    },
    plugins: [
      tailwindcss(),
      generateTreatmentsPlugin(),
      structuralRewritePlugin(),
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
          ...getCategoryInputs(),
          ...getDirectoryInputs(CARE_SERVICES_DIR),
        },
      },
    },
  };
});
