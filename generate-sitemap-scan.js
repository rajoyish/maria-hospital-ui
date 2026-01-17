import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// --- CONFIGURATION ---
const BASE_URL = "https://npmariahospital.com";
const BUILD_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "dist"
);
const OUTPUT_FILE = path.join(BUILD_DIR, "sitemap.xml");

// Files to exclude from the sitemap
const EXCLUDED_FILES = ["404.html", "google-site-verification.html"];

// --- HELPER FUNCTIONS ---

// Recursively find all .html files in a directory
const getHtmlFiles = (dir, fileList = []) => {
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getHtmlFiles(filePath, fileList);
    } else {
      if (file.endsWith(".html") && !EXCLUDED_FILES.includes(file)) {
        // Store relative path from BUILD_DIR
        fileList.push(path.relative(BUILD_DIR, filePath));
      }
    }
  });

  return fileList;
};

// Convert file path to URL slug
const toUrl = (filePath) => {
  // Replace backslashes (Windows) with forward slashes
  let slug = filePath.replace(/\\/g, "/");

  // Remove .html extension
  slug = slug.replace(/\.html$/, "");

  // Handle index (root)
  if (slug === "index") {
    return "/";
  }

  return `/${slug}`;
};

// --- XML GENERATOR ---
const generateSitemap = () => {
  console.log(`🔍 Scanning directory: ${BUILD_DIR}`);

  const files = getHtmlFiles(BUILD_DIR);

  if (files.length === 0) {
    console.warn("⚠️ No HTML files found! Did you run 'npm run build' first?");
    return;
  }

  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const xmlUrls = files
    .map((file) => {
      const route = toUrl(file);
      // Priority: Home is 1.0, others 0.8
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

// --- EXECUTION ---
try {
  // Ensure dist folder exists
  if (!fs.existsSync(BUILD_DIR)) {
    console.error(
      `❌ Error: 'dist' folder not found at ${BUILD_DIR}. \nPlease run 'npm run build' before generating the sitemap.`
    );
    process.exit(1);
  }

  const sitemap = generateSitemap();

  if (sitemap) {
    fs.writeFileSync(OUTPUT_FILE, sitemap);
    console.log(`✅ Sitemap generated successfully at: ${OUTPUT_FILE}`);

    // Optional: Copy to public folder if you want to keep a record in source
    // const publicPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "public/sitemap.xml");
    // fs.copyFileSync(OUTPUT_FILE, publicPath);
  }
} catch (error) {
  console.error("❌ Error generating sitemap:", error);
}
