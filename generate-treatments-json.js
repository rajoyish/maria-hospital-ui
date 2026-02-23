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
const CONTENT_ATTR_REGEX = /content=(["'])([\s\S]*?)\1|content=([^\s>]+)/i;
const SCRIPT_REGEX =
  /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

const FALLBACK_PATTERNS = [
  /"position"\s*:\s*2\s*,\s*"name"\s*:\s*"([^"]+)"/i,
  /"name"\s*:\s*"([^"]+)"\s*,\s*"item"[^}]*"position"\s*:\s*2/i,
  /"position"\s*:\s*["']?2["']?[\s\S]{1,100}?"name"\s*:\s*"([^"]+)"/i,
];

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
  const isOg = metaKey === "og:image";
  const attr = isOg ? "property" : "name";

  const tagRegex = new RegExp(
    `<meta(?:\\s+[^>]*?)?(?:${attr}=["']${metaKey}["']|${attr}=${metaKey})(?:\\s+[^>]*?)?>`,
    "i"
  );
  const match = html.match(tagRegex);

  if (!match) {
    return "";
  }

  const contentMatch = match[0].match(CONTENT_ATTR_REGEX);

  if (contentMatch) {
    return (contentMatch[2] || contentMatch[3] || "").trim();
  }

  return "";
};

const findServiceInBreadcrumb = (items) => {
  for (const item of items) {
    if (
      item["@type"] === "BreadcrumbList" &&
      Array.isArray(item.itemListElement)
    ) {
      const categoryItem = item.itemListElement.find(
        (el) => String(el.position) === "2"
      );
      if (categoryItem?.name) {
        return categoryItem.name.trim();
      }
    }
  }
  return "";
};

const extractServiceFromLdJson = (html) => {
  const matches = [...html.matchAll(SCRIPT_REGEX)];

  for (const match of matches) {
    let jsonData = null;

    try {
      jsonData = JSON.parse(match[1]);
    } catch {
      // Ignore parsing errors for invalid JSON blocks
    }

    if (jsonData) {
      const itemsToSearch = [];

      if (Array.isArray(jsonData)) {
        itemsToSearch.push(...jsonData);
      } else if (jsonData["@graph"] && Array.isArray(jsonData["@graph"])) {
        itemsToSearch.push(...jsonData["@graph"]);
      } else {
        itemsToSearch.push(jsonData);
      }

      const service = findServiceInBreadcrumb(itemsToSearch);
      if (service) {
        return service;
      }
    }
  }
  return "";
};

const extractServiceFromFallback = (html) => {
  for (const pattern of FALLBACK_PATTERNS) {
    const fbMatch = html.match(pattern);
    if (fbMatch?.[1]) {
      return fbMatch[1].trim();
    }
  }
  return "";
};

const extractCareService = (html) => {
  const service =
    extractServiceFromLdJson(html) || extractServiceFromFallback(html);
  return service || "General Care Services";
};

const extractPageData = (filePath, route) => {
  const data = {
    title: "",
    description: "",
    keywords: [],
    ogImage: "",
    care_services: "",
  };

  let content = "";
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch {
    data.title = formatSlugToTitle(route);
    data.care_services = "General Care Services";
    return data;
  }

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
  data.care_services = extractCareService(content);

  return data;
};

const generateJson = () => {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = getHtmlFiles(SCAN_DIR);

  if (files.length === 0 && !isDev) {
    throw new Error("No HTML files found in dist. Run build first.");
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
        care_services: pageData.care_services,
      });
    }
  }

  return JSON.stringify(treatments, null, 2);
};

let jsonContent = "";
try {
  jsonContent = generateJson();
} catch {
  process.exit(1);
}

try {
  fs.writeFileSync(OUTPUT_PATH, jsonContent);
} catch {
  process.exit(1);
}
