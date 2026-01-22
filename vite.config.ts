import { existsSync, readdirSync } from "node:fs";
import { join, parse, resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const treatmentsDir = resolve(__dirname, "treatments");

function getTreatmentInputs() {
  const inputs: Record<string, string> = {};

  if (existsSync(treatmentsDir)) {
    const files = readdirSync(treatmentsDir);

    for (const file of files) {
      if (file.endsWith(".html")) {
        const name = `treatment_${parse(file).name}`;
        inputs[name] = join(treatmentsDir, file);
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
        urology_std_services: resolve(
          __dirname,
          "urology-std-services-nepal.html"
        ),
        ...getTreatmentInputs(),
      },
    },
  },
});
