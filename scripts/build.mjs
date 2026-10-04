import { cp, mkdir, readFile, rm, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { backgroundPage, cvPage, homepage, listPage, origin, page, publicationsPage } from "../site/templates.mjs";
import { honorsList, newsList, projectsList } from "../site/components.mjs";
import { safeHref } from "../site/html.mjs";
import { checkBuiltSite } from "./check-site.mjs";
import { isValidPublications } from "../site/publications.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "_site");
assert.equal(path.dirname(output), path.resolve(root), "Build output must be inside the project");
const data = Object.fromEntries(
  await Promise.all(
    ["profile", "publications", "news", "honors"].map(async (name) => [
      name,
      JSON.parse(await readFile(path.join(root, "data", `${name}.json`), "utf8")),
    ])
  )
);
const { profile, publications, news, honors } = data;
assert.ok(profile.name && profile.email && Array.isArray(profile.biography), "Profile data is incomplete");
assert.ok(Array.isArray(publications) && Array.isArray(news) && Array.isArray(honors), "Content lists must be arrays");
assert.ok(isValidPublications(publications), "Publication data is incomplete or has duplicate IDs");
for (const paper of publications) {
  assert.ok(paper.title && Array.isArray(paper.authors) && Array.isArray(paper.tags), `Invalid publication: ${paper.id}`);
  assert.ok(["accepted", "preprint", "under-review"].includes(paper.type), `Invalid status: ${paper.id}`);
  assert.ok(Number.isInteger(paper.year), `Invalid publication year: ${paper.id}`);
  for (const tag of paper.tags) assert.ok(safeHref(tag.link), `Invalid publication link: ${paper.id}`);
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
async function write(relative, content) {
  const target = path.join(output, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content);
}

const pages = new Map([
  ["index.html", homepage(data)],
  ["publications/index.html", publicationsPage(profile, publications)],
  ["background/index.html", backgroundPage(profile)],
  ["news/index.html", listPage(profile, { title: "News", path: "/news/", content: newsList(news) })],
  ["honors/index.html", listPage(profile, { title: "Honors & Funding", path: "/honors/", content: honorsList(honors) })],
  ["projects/index.html", listPage(profile, { title: "Projects", path: "/projects/", content: projectsList(profile.projects) })],
  ["cv/index.html", cvPage(profile)],
  [
    "404.html",
    page(profile, {
      title: "Page not found",
      path: "/404.html",
      content:
        '<div class="page-heading"><h2>Page not found</h2><p>The page may have moved. <a href="/">Return to the homepage</a> or browse <a href="/publications/">publications</a>.</p></div>',
    }),
  ],
]);
for (const [relative, content] of pages) await write(relative, content);
for (const [alias, destination] of [
  ["pages/all-publications.html", "publications/index.html"],
  ["pages/all-news.html", "news/index.html"],
  ["pages/all-honors.html", "honors/index.html"],
])
  await write(alias, pages.get(destination));

await mkdir(path.join(output, "data"), { recursive: true });
await cp(path.join(root, "data"), path.join(output, "data"), { recursive: true });
for (const file of ["script.js", "theme.js"]) await cp(path.join(root, "site", file), path.join(output, file));
await write(
  "assets/favicon.svg",
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#1e293b"/><text x="32" y="42" text-anchor="middle" font-family="Georgia,serif" font-size="32" fill="#d4a562">TL</text></svg>'
);
const assets = new Set(
  [profile.portrait, profile.cv, ...publications.flatMap((paper) => [paper.thumbnail, paper.demo, ...paper.tags.map((tag) => tag.link)])].filter(
    (asset) => asset?.startsWith("/assets/")
  )
);
for (const asset of assets) {
  const source = path.resolve(root, `.${asset}`);
  assert.ok(source.startsWith(path.join(root, "assets") + path.sep), `Asset outside public directory: ${asset}`);
  await access(source);
  const destination = path.join(output, asset.slice(1));
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination);
}
const fontNames = [
  ["inter", "400"],
  ["inter", "500"],
  ["inter", "600"],
  ["crimson-text", "400"],
  ["crimson-text", "600"],
];
for (const [family, weight] of fontNames) {
  const filename = `${family}-latin-${weight}-normal.woff2`;
  await mkdir(path.join(output, "assets/fonts"), { recursive: true });
  await cp(path.join(root, `node_modules/@fontsource/${family}/files/${filename}`), path.join(output, "assets/fonts", filename));
}
for (const family of ["inter", "crimson-text"]) {
  await cp(path.join(root, `node_modules/@fontsource/${family}/LICENSE`), path.join(output, "assets/fonts", `${family}-LICENSE.txt`));
}
const css = spawnSync(
  process.execPath,
  [
    path.join(root, "node_modules/@tailwindcss/cli/dist/index.mjs"),
    "-i",
    path.join(root, "site/styles.css"),
    "-o",
    path.join(output, "styles.css"),
    "--minify",
  ],
  { cwd: root, stdio: "inherit" }
);
assert.equal(css.status, 0, "CSS compilation failed");
await write(".nojekyll", "");
await write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
const urls = ["/", "/publications/", "/background/", "/news/", "/honors/", "/projects/"];
await write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${origin}${url}</loc></url>`).join("")}</urlset>`
);
console.log(`Built ${pages.size + 3} pages, ${publications.length} publications, ${assets.size} public assets → _site`);
const checks = await checkBuiltSite(output);
console.log(`Verified ${checks.links} local links across ${checks.pages} HTML pages`);
