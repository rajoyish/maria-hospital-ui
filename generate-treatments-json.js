import fs from "node:fs";
import path from "node:path";
import { loadEnv } from "vite";

const mode = process.argv[2] || "production";
const isDev = mode === "development";
const env = loadEnv(mode, process.cwd(), "");

const CONFIG = {
  baseUrl: process.env.VITE_SITE_URL || env.VITE_SITE_URL || "",
  scanDir: isDev ? "." : "dist",
  outputDir: isDev ? "public" : "dist",
  outputFile: "treatments-data.json",
  targetFolder: "/treatments/",
  ignoreDirs: ["node_modules", "dist", "public", ".git", ".vscode", ".idea"],
};

const SCAN_DIR = path.resolve(process.cwd(), CONFIG.scanDir);
const OUTPUT_DIR = path.resolve(process.cwd(), CONFIG.outputDir);
const OUTPUT_PATH = path.join(OUTPUT_DIR, CONFIG.outputFile);

const HTML_EXT_REGEX = /\.html$/;
const TREATMENT_SUFFIX_REGEX = /\s+Treatment.*$/i;
const NEPAL_SUFFIX_REGEX = /\s+Nepal$/i;
const TITLE_TAG_REGEX = /<title[^>]*>([\s\S]*?)<\/title>/i;
const WHITESPACE_REGEX = /\s+/g;

const META_REGEXES = {
  description: [
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
    /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i,
  ],
  keywords: [
    /<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']*)["']/i,
    /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']keywords["']/i,
  ],
  "og:image": [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i,
    /<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:image["']/i,
  ],
};

const normalizePath = (p) => p.split(path.sep).join("/");

const getHtmlFiles = (dir, fileList = []) => {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    if (CONFIG.ignoreDirs.includes(file)) {
      continue;
    }

    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getHtmlFiles(filePath, fileList);
    } else if (file.endsWith(".html")) {
      fileList.push(path.relative(SCAN_DIR, filePath));
    }
  }
  return fileList;
};

const toUrl = (relativePath) => {
  let slug = normalizePath(relativePath);
  slug = slug.replace(HTML_EXT_REGEX, "");

  if (slug === "index") {
    return "/";
  }
  if (slug.endsWith("/index")) {
    return `/${slug.slice(0, -6)}/`;
  }

  return `/${slug}`;
};

const cleanTitle = (rawTitle) => {
  let title = rawTitle;
  if (title.includes("|")) {
    title = title.split("|")[0];
  }
  title = title.replace(TREATMENT_SUFFIX_REGEX, "");
  title = title.replace(NEPAL_SUFFIX_REGEX, "");
  return title.trim();
};

const formatSlugToTitle = (slug) => {
  const words = slug.split("/").pop()?.split("-");
  if (!words) {
    return "";
  }
  return words
    .filter((w) => w.toLowerCase() !== "nepal")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const extractMetaContent = (html, metaKey) => {
  const regexes = META_REGEXES[metaKey];

  if (!regexes) {
    return "";
  }

  for (const regex of regexes) {
    const match = html.match(regex);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return "";
};

const extractPageData = (filePath, route) => {
  const data = {
    title: "",
    description: "",
    keywords: [],
    ogImage: "",
  };

  try {
    const content = fs.readFileSync(filePath, "utf-8");

    const titleMatch = content.match(TITLE_TAG_REGEX);
    if (titleMatch?.[1]) {
      const rawTitle = titleMatch[1].replace(WHITESPACE_REGEX, " ").trim();
      data.title = cleanTitle(rawTitle);
    }

    if (!data.title) {
      data.title = formatSlugToTitle(route);
    }

    data.description = extractMetaContent(content, "description");

    const rawKeywords = extractMetaContent(content, "keywords");
    if (rawKeywords) {
      data.keywords = rawKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
    }

    data.ogImage = extractMetaContent(content, "og:image");
  } catch {
    console.warn(`⚠️ Could not read file data from ${filePath}`);
    data.title = formatSlugToTitle(route);
  }

  return data;
};

const generateJson = () => {
  console.log(
    `\n🔍 Scanning for Treatment Data in: ${CONFIG.scanDir} (${mode})...`
  );

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = getHtmlFiles(SCAN_DIR);

  if (files.length === 0) {
    if (!isDev) {
      throw new Error("No HTML files found in dist. Run build first.");
    }
    console.warn("⚠️ No HTML files found to scan.");
  }

  const treatments = [];

  for (const file of files) {
    let route = toUrl(file);

    if (route.includes(CONFIG.targetFolder)) {
      const parts = route.split(CONFIG.targetFolder);
      route = CONFIG.targetFolder + parts[1];
    }

    const isTargetFolder =
      route.startsWith(CONFIG.targetFolder) &&
      route !== CONFIG.targetFolder &&
      route !== CONFIG.targetFolder.slice(0, -1);

    if (isTargetFolder) {
      const absoluteFilePath = path.join(SCAN_DIR, file);
      const pageData = extractPageData(absoluteFilePath, route);

      treatments.push({
        treatment: pageData.title,
        url: `${CONFIG.baseUrl}${route}`,
        description: pageData.description,
        keywords: pageData.keywords,
        ogImage: pageData.ogImage,
      });
    }
  }

  return JSON.stringify(treatments, null, 2);
};

try {
  const jsonContent = generateJson();
  fs.writeFileSync(OUTPUT_PATH, jsonContent);
  console.log(`✅ JSON Data generated at: ${OUTPUT_PATH}\n`);
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}
