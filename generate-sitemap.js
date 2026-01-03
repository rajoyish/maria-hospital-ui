import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 1. Configuration
const BASE_URL = "https://npmariahospital.com";
const OUTPUT_FILE = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "public/sitemap.xml"
);

// 2. Define your routes here
// (I have added standard hospital pages based on your project)
const routes = [
  "/",
  "/care-services",
  "/contact-us",
  "/appointment",
  "/urology-and-stds",
  "/ent-ear-nose-throat",
  "/anorectal-piles",
  "/acupuncture",
  "/gynecology",
  "/general-medicine-lab",
  "/faqs",
  "/testimonials",
];

// 3. XML Generator Function
const generateSitemap = (urls) => {
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const xmlUrls = urls
    .map((route) => {
      // Handle priority: Home is 1.0, others 0.8
      const priority = route === "/" ? "1.0" : "0.8";

      return `
  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;
};

// 4. Write File
try {
  const sitemap = generateSitemap(routes);
  fs.writeFileSync(OUTPUT_FILE, sitemap);
  console.log(`✅ Sitemap generated successfully at: ${OUTPUT_FILE}`);
  console.log(`   Total URLs: ${routes.length}`);
} catch (error) {
  console.error("❌ Error generating sitemap:", error);
}
