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
    assert.equal(await page.locator("#experience, #education, #honors, #leadership, #projects").count(), 0);
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
  await page.evaluate(() => window.scrollTo({ top: 400, behavior: "instant" }));
  await page.waitForFunction(() => Math.abs(document.querySelector(".profile-card").getBoundingClientRect().top - 116) < 2);
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  assert.equal(
    await page.evaluate(
      () =>
        document.querySelector(".profile-card").getBoundingClientRect().bottom <=
        document.querySelector(".profile-column").getBoundingClientRect().bottom + 2
    ),
    true,
    "Sticky profile stays inside its column at the end of a short page"
  );
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
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
  await page.getByRole("navigation").getByRole("link", { name: "Experience", exact: true }).click();
  await page.waitForURL(`${origin}/experience/`);
  assert.equal(await page.locator(".mobile-menu-btn").getAttribute("aria-expanded"), "false");
  assert.match(await page.locator("#experience").textContent(), /Jan 2026 – Jun 2026/);
  assert.equal(await page.locator("#education").count(), 1);
  assert.equal(await page.locator("#leadership").count(), 0);
  assert.equal(await page.getByText(/Relevant coursework/).count(), 0);
  assert.equal(
    await page.locator('#experience a[href="https://scholar.google.com/citations?user=_MjXpXkAAAAJ&hl=en"]').textContent(),
    "Prof. Mingsheng Long"
  );
  await page.goto(`${origin}/publications/`, { waitUntil: "networkidle" });
  const visibleCards = page.locator(".publication-card:visible");
  assert.equal(await visibleCards.count(), publications.length);
  assert.equal(await page.locator(".publication-controls, [data-filter], .status-label, .highlight-label").count(), 0);
  assert.match(await page.locator("#zhang2026quadlink").textContent(), /Under review/);
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Publications overflow at ${width}px`);
  }
  await page.screenshot({ path: path.join(root, "test-results/publications.png"), fullPage: true });
  assert.deepEqual(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations.map((v) => v.id),
    []
  );
  results.push("Static publications, plain venue text, mobile menu/Escape, and publication accessibility passed");

  for (const route of [
    "/experience/",
    "/news/",
    "/honors/",
    "/projects/",
    "/pages/all-publications.html",
    "/pages/all-news.html",
    "/pages/all-honors.html",
  ]) {
    assert.equal((await page.goto(origin + route, { waitUntil: "networkidle" })).status(), 200);
  }
  await page.goto(`${origin}/#experience`);
  await page.waitForURL(`${origin}/experience/#experience`);
  assert.equal(await page.locator("#experience").isVisible(), true);
  await page.goto(`${origin}/background/`);
  await page.waitForURL(`${origin}/experience/`);
  await page.goto(`${origin}/background/?source=bookmark#education`);
  await page.waitForURL(`${origin}/experience/?source=bookmark#education`);
  assert.equal(await page.locator("#education").isVisible(), true);
  await page.goto(`${origin}/#honors`);
  await page.waitForURL(`${origin}/honors/`);
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
