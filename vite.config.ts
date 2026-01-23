import { existsSync, readdirSync } from "node:fs";
import { join, parse, resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// Define your directories here
const treatmentsDir = resolve(__dirname, "treatments");
const careServicesDir = resolve(__dirname, "care-services");

// Generic function to scan a directory and generate input objects
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
        main: resolve(__dirname, "index.html"),
        appointment: resolve(__dirname, "appointment.html"),
        contact: resolve(__dirname, "contact-us.html"),
        // Dynamically add all HTML files from treatments directory
        ...getDirectoryInputs(treatmentsDir, "treatment"),
        // Dynamically add all HTML files from care-services directory
        ...getDirectoryInputs(careServicesDir, "care_service"),
      },
    },
  },
});
