import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite"; // Use Vite's built-in env loader

// --- GET ENV VARS ---
// Get mode from command line args (default to production)
// Example usage: node generate-sitemap-scan.js staging
const mode = process.argv[2] || "production";

// Load env file based on mode (e.g., .env.staging, .env.production)
const env = loadEnv(mode, process.cwd(), "");

// --- CONFIGURATION ---
const CONFIG = {
  // Uses VITE_SITE_URL from .env file, fallback to hardcoded
  baseUrl: env.VITE_SITE_URL || "https://npmariahospital.com",
  excludedFiles: ["404.html", "google-site-verification.html"],
  outputDir: "dist",
  outputFile: "sitemap.xml",
  // Change to true if your host REQUIRES .html extensions in the URL
  includeHtmlExtension: false,
  priorities: {
    home: "1.0",
    services: "0.9",
    default: "0.8",
  },
};

// Paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD_DIR = path.resolve(__dirname, CONFIG.outputDir);
const OUTPUT_PATH = path.join(BUILD_DIR, CONFIG.outputFile);

// --- HELPER FUNCTIONS ---

const getHtmlFiles = (dir, fileList = []) => {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getHtmlFiles(filePath, fileList);
    } else {
      if (file.endsWith(".html") && !CONFIG.excludedFiles.includes(file)) {
        fileList.push(path.relative(BUILD_DIR, filePath));
      }
    }
  }
  return fileList;
};

const toUrl = (relativePath) => {
  let slug = relativePath.split(path.sep).join("/");

  // Remove .html unless explicitly kept in config
  if (!CONFIG.includeHtmlExtension) {
    slug = slug.replace(/\.html$/, "");
  }

  if (slug === "index") return "/";
  if (slug.endsWith("/index")) return `/${slug.slice(0, -6)}/`;

  return `/${slug}`;
};

const getPriority = (url) => {
  if (url === "/") return CONFIG.priorities.home;
  if (url.includes("/treatments/") || url.includes("/care-services/")) {
    return CONFIG.priorities.services;
  }
  return CONFIG.priorities.default;
};

// --- XML GENERATOR ---

const generateSitemap = () => {
  console.log(`\n🔍 Generating Sitemap for: ${mode.toUpperCase()}`);
  console.log(`🌐 Base URL: ${CONFIG.baseUrl}`);

  const files = getHtmlFiles(BUILD_DIR);

  if (files.length === 0) {
    throw new Error("No HTML files found. Run 'npm run build' first.");
  }

  const date = new Date().toISOString().split("T")[0];

  const urlTags = files.map((file) => {
    const route = toUrl(file);
    const priority = getPriority(route);

    return `  <url>
    <loc>${CONFIG.baseUrl}${route}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlTags.join("\n")}
</urlset>`;
};

// --- EXECUTION ---

try {
  if (!fs.existsSync(BUILD_DIR)) {
    console.error(`❌ Build directory not found: ${BUILD_DIR}`);
    process.exit(1);
  }

  const sitemapContent = generateSitemap();
  fs.writeFileSync(OUTPUT_PATH, sitemapContent);
  console.log(`✅ Sitemap generated at: ${OUTPUT_PATH}\n`);
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}
