import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";

const mode = process.argv[2] || "production";
const env = loadEnv(mode, process.cwd(), "");

// Hoisted regex to top-level scope for performance
const HTML_EXT_REGEX = /\.html$/;

const CONFIG = {
  baseUrl:
    process.env.VITE_SITE_URL ||
    env.VITE_SITE_URL ||
    "https://npmariahospital.com",
  excludedFiles: ["404.html", "google-site-verification.html"],
  outputDir: "dist",
  outputFile: "sitemap.xml",
  includeHtmlExtension: false,
  priorities: {
    home: "1.0",
    services: "0.9",
    default: "0.8",
  },
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD_DIR = path.resolve(__dirname, CONFIG.outputDir);
const OUTPUT_PATH = path.join(BUILD_DIR, CONFIG.outputFile);

const getHtmlFiles = (dir, fileList = []) => {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getHtmlFiles(filePath, fileList);
    } else if (file.endsWith(".html") && !CONFIG.excludedFiles.includes(file)) {
      fileList.push(path.relative(BUILD_DIR, filePath));
    }
  }
  return fileList;
};

const toUrl = (relativePath) => {
  let slug = relativePath.split(path.sep).join("/");

  if (!CONFIG.includeHtmlExtension) {
    slug = slug.replace(HTML_EXT_REGEX, "");
  }

  if (slug === "index") {
    return "/";
  }

  if (slug.endsWith("/index")) {
    return `/${slug.slice(0, -6)}/`;
  }

  return `/${slug}`;
};

const getPriority = (url) => {
  if (url === "/") {
    return CONFIG.priorities.home;
  }

  if (url.includes("/treatments/") || url.includes("/care-services/")) {
    return CONFIG.priorities.services;
  }

  return CONFIG.priorities.default;
};

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
