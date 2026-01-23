import { existsSync, readdirSync } from "node:fs";
import { join, parse, resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// Define your directories here
const treatmentsDir = resolve(__dirname, "treatments");
const careServicesDir = resolve(__dirname, "care-services");

// Helper: Scan root directory for HTML files (index, 404, contact, etc.)
function getRootHtmlInputs() {
  const inputs: Record<string, string> = {};
  // Scan the current directory
  const files = readdirSync(__dirname);

  for (const file of files) {
    // Only pick .html files
    if (file.endsWith(".html")) {
      // Use the filename (without extension) as the key
      // e.g., 'contact-us.html' becomes 'contact-us'
      const name = parse(file).name;
      inputs[name] = resolve(__dirname, file);
    }
  }
  return inputs;
}

// Helper: Scan sub-directories (treatments, care-services)
function getDirectoryInputs(dirPath: string, prefix: string) {
  const inputs: Record<string, string> = {};

  if (existsSync(dirPath)) {
    const files = readdirSync(dirPath);

    for (const file of files) {
      if (file.endsWith(".html")) {
        // Creates a unique key like 'care_service_urology'
        const name = `${prefix}_${parse(file).name}`;
        inputs[name] = join(dirPath, file);
      }
    }
  }

  return inputs;
}

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        // 1. Dynamically add all Root HTML files (index, 404, appointment, etc.)
        ...getRootHtmlInputs(),

        // 2. Dynamically add all HTML files from treatments directory
        ...getDirectoryInputs(treatmentsDir, "treatment"),

        // 3. Dynamically add all HTML files from care-services directory
        ...getDirectoryInputs(careServicesDir, "care_service"),
      },
    },
  },
});
