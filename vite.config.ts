import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        appointment: resolve(__dirname, "appointment.html"),
        contact: resolve(__dirname, "contact-us.html"),
      },
    },
  },
});
