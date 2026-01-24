import { existsSync, readdirSync } from "node:fs";
import { join, parse, relative, resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

const treatmentsDir = resolve(__dirname, "treatments");
const careServicesDir = resolve(__dirname, "care-services");

function getRootHtmlInputs() {
  const inputs: Record<string, string> = {};
  const files = readdirSync(__dirname);
  for (const file of files) {
    if (file.endsWith(".html")) {
      inputs[parse(file).name] = resolve(__dirname, file);
    }
  }
  return inputs;
}

function getDirectoryInputs(dirPath: string) {
  const inputs: Record<string, string> = {};
  if (existsSync(dirPath)) {
    const files = readdirSync(dirPath);
    for (const file of files) {
      if (file.endsWith(".html")) {
        const key = join(
          relative(__dirname, dirPath),
          parse(file).name
        ).replace(/\\/g, "/");
        inputs[key] = join(dirPath, file);
      }
    }
  }
  return inputs;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    define: {
      "process.env.VITE_SITE_URL": JSON.stringify(env.VITE_SITE_URL),
    },
    plugins: [
      tailwindcss(),
      {
        name: "html-transform",
        enforce: "pre",
        transformIndexHtml: {
          order: "pre",
          handler(html) {
            const url =
              env.VITE_SITE_URL ||
              (mode === "development" ? "http://localhost:5173" : "");
            return html.replace(/%VITE_SITE_URL%/g, url);
          },
        },
      },
    ],
    build: {
      rollupOptions: {
        input: {
          ...getRootHtmlInputs(),
          ...getDirectoryInputs(treatmentsDir),
          ...getDirectoryInputs(careServicesDir),
        },
      },
    },
  };
});
