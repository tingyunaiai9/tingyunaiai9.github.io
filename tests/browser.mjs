import assert from "node:assert/strict";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { once } from "node:events";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { publicationCard } from "../site/components.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const port = process.env.TEST_PORT || "8081";
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, [path.join(root, "scripts/serve.mjs")], {
  env: { ...process.env, PORT: port },
  stdio: ["ignore", "pipe", "inherit"],
});
await Promise.race([
  once(server.stdout, "data"),
  once(server, "exit").then(() => {
    throw new Error("Preview server failed");
  }),
]);
const browser = await chromium.launch(process.platform === "win32" ? { channel: "msedge" } : { headless: true });
const results = [];
const errors = [];
const publications = JSON.parse(await readFile(path.join(root, "data/publications.json"), "utf8"));
const featuredCount = publications.filter((paper) => paper.showOnHomepage).length;
await mkdir(path.join(root, "test-results"), { recursive: true });
try {
  const context = await browser.newContext({ colorScheme: "light" });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) errors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(origin, { waitUntil: "networkidle" });
    assert.equal(await page.locator("#publications .publication-card").count(), featuredCount);
    assert.equal(await page.locator("h1").textContent(), "Tianxiao Li");
    assert.match(await page.locator("#experience").textContent(), /Jan 2026 – Jun 2026/);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Homepage overflow at ${width}px`);
    await page.screenshot({ path: path.join(root, `test-results/home-${width}.png`), fullPage: true });
    const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    assert.deepEqual(
      accessibility.violations.map((issue) => `${issue.id}: ${issue.nodes.map((node) => node.target.join(" ")).join(", ")}`),
      [],
      `Accessibility at ${width}px`
    );
    results.push(`Homepage ${width}px: no overflow, ${featuredCount} selections, WCAG AA checks passed`);
  }
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForFunction(() => Math.abs(document.querySelector(".profile-card").getBoundingClientRect().top - 116) < 2);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  await page.screenshot({ path: path.join(root, "test-results/home-dark.png"), fullPage: true });
  assert.deepEqual(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations.map((v) => v.id),
    []
  );
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  results.push("Dark theme: persists across reload, WCAG AA checks passed");

  await page.setViewportSize({ width: 320, height: 900 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  assert.equal(await page.locator(".mobile-menu-btn").getAttribute("aria-expanded"), "true");
  await page.keyboard.press("Escape");
  assert.equal(await page.locator(".mobile-menu-btn").getAttribute("aria-expanded"), "false");
  assert.equal(await page.locator(".mobile-menu-btn").evaluate((button) => button === document.activeElement), true);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("navigation").getByRole("link", { name: "Experience" }).click();
  assert.equal(await page.locator(".mobile-menu-btn").getAttribute("aria-expanded"), "false");
  await page.goto(`${origin}/publications/`, { waitUntil: "networkidle" });
  const visibleCards = page.locator(".publication-card:visible");
  assert.equal(await visibleCards.count(), publications.length);
  for (const [filter, count] of [
    ["first-author", publications.filter((paper) => paper.isFirstAuthor).length],
    ["accepted", publications.filter((paper) => paper.type === "accepted").length],
    ["under-review", publications.filter((paper) => paper.type === "under-review").length],
    ["preprint", publications.filter((paper) => paper.type === "preprint").length],
    ["all", publications.length],
  ]) {
    await page.locator(`[data-filter="${filter}"]`).click();
    assert.equal(await visibleCards.count(), count, `${filter} filter`);
  }
  await page.getByRole("searchbox").fill("wildcap");
  assert.equal(await visibleCards.count(), 1);
  await page.getByRole("searchbox").fill("no-paper-matches-this-query");
  await page.locator('[data-filter="first-author"]').click();
  assert.equal(await visibleCards.count(), 0);
  assert.equal(await page.locator("#no-results").isVisible(), true);
  await page.getByRole("searchbox").fill("");
  assert.equal(await visibleCards.count(), publications.filter((paper) => paper.isFirstAuthor).length);
  await page.locator('[data-filter="all"]').click();
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Publications overflow at ${width}px`);
  }
  await page.screenshot({ path: path.join(root, "test-results/publications.png"), fullPage: true });
  assert.deepEqual(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations.map((v) => v.id),
    []
  );
  results.push("Publication filters, combined search, empty results, mobile menu/Escape, and publication accessibility passed");

  for (const route of ["/news/", "/honors/", "/projects/", "/pages/all-publications.html", "/pages/all-news.html", "/pages/all-honors.html"]) {
    assert.equal((await page.goto(origin + route, { waitUntil: "networkidle" })).status(), 200);
  }
  assert.equal((await context.request.get(`${origin}/cv/`)).status(), 200);
  assert.equal((await context.request.get(`${origin}/assets/pdf/Tianxiao_s_CV.pdf`)).status(), 200);
  assert.equal((await context.request.get(`${origin}/does-not-exist/`)).status(), 404);
  const originalCV = await readFile(path.join(root, "assets/pdf/Tianxiao_s_CV.pdf"));
  assert.deepEqual(await readFile(path.join(root, "_site/assets/pdf/Tianxiao_s_CV.pdf")), originalCV);
  assert.equal(await page.locator('a[href="#"]').count(), 0);
  const outputEntries = await readdir(path.join(root, "_site"));
  assert.equal(outputEntries.includes("_data"), false);
  assert.equal(outputEntries.includes("Gemfile"), false);
  results.push("Original routes, template subpage aliases, exact CV bytes, 404 status, and output isolation passed");
  await context.close();

  const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
  const staticPage = await noJS.newPage();
  await staticPage.goto(origin);
  assert.equal(await staticPage.locator("#publications .publication-card").count(), featuredCount);
  await staticPage.goto(`${origin}/publications/`);
  assert.equal(await staticPage.locator(".publication-card").count(), publications.length);
  assert.equal(await staticPage.locator("#site-navigation").isVisible(), true);
  await noJS.close();
  results.push("Content and navigation remain available without JavaScript");

  const failedFetch = await browser.newContext();
  await failedFetch.route("**/data/publications.json", (route) => route.fulfill({ status: 200, contentType: "application/json", body: "{}" }));
  const fallbackPage = await failedFetch.newPage();
  await fallbackPage.goto(`${origin}/publications/`, { waitUntil: "networkidle" });
  assert.equal(await fallbackPage.locator(".publication-card:visible").count(), publications.length);
  assert.match(await fallbackPage.locator(".result-count").textContent(), /unavailable/);
  await failedFetch.close();
  results.push("Unavailable search data preserves the full static publication list");
  const publishedData = JSON.parse(await readFile(path.join(root, "data/publications.json"), "utf8"));
  const missingStatus = structuredClone(publishedData);
  delete missingStatus[0].type;
  const incompleteRecord = await browser.newContext();
  await incompleteRecord.route("**/data/publications.json", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(missingStatus) })
  );
  const invalidRecordPage = await incompleteRecord.newPage();
  await invalidRecordPage.goto(`${origin}/publications/`, { waitUntil: "networkidle" });
  assert.match(await invalidRecordPage.locator(".result-count").textContent(), /unavailable/);
  assert.equal(await invalidRecordPage.locator(".publication-card:visible").count(), publishedData.length);
  await incompleteRecord.close();
  results.push("Schema-invalid publication records preserve static content instead of enabling broken filters");
  const homeHTML = await readFile(path.join(root, "_site/index.html"), "utf8");
  for (const scenario of ["early-static-error", "broken-demo", "all-media-missing"]) {
    const fixture = {
      ...publications[0],
      id: "media-fixture",
      thumbnail: scenario === "broken-demo" ? "/assets/img/prof_pic_web.jpg" : "/missing-thumbnail.png",
      demo: scenario === "early-static-error" ? null : "/missing-demo.gif",
    };
    const mediaContext = await browser.newContext({ reducedMotion: scenario === "early-static-error" ? "reduce" : "no-preference" });
    await mediaContext.route("**/media-test", (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: homeHTML.replace('<div class="publications-list">', `<div class="publications-list">${publicationCard(fixture)}`),
      })
    );
    if (scenario === "early-static-error")
      await mediaContext.route("**/script.js", async (route) => {
        const response = await route.fetch();
        await new Promise((resolve) => setTimeout(resolve, 150));
        await route.fulfill({ response });
      });
    const mediaPage = await mediaContext.newPage();
    await mediaPage.goto(`${origin}/media-test`, { waitUntil: "networkidle" });
    if (scenario === "broken-demo") {
      await mediaPage.waitForFunction(() => {
        const image = document.querySelector("#media-fixture img");
        return image?.getAttribute("src") === "/assets/img/prof_pic_web.jpg" && image.complete && image.naturalWidth > 0;
      });
    } else {
      await mediaPage.waitForFunction(() => document.querySelector("#media-fixture figure")?.hidden === true);
      assert.equal(await mediaPage.locator("#media-fixture").evaluate((card) => card.classList.contains("has-media")), false);
    }
    assert.equal(await mediaPage.locator("#media-fixture h3").isVisible(), true);
    await mediaContext.close();
  }
  results.push("Optional media: early missing thumbnails, failed demos, and missing static/demo previews degrade correctly");
  assert.deepEqual(errors, [], "Browser console, page errors, and HTTP failures");
  await writeFile(path.join(root, "test-results/browser-report.json"), JSON.stringify({ results, errors }, null, 2));
  console.log(results.join("\n"));
} finally {
  await browser.close();
  server.kill();
}
