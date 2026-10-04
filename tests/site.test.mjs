import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { escapeHtml, safeHref } from "../site/html.mjs";
import { isValidPublications, matchesPublication } from "../site/publications.mjs";
import { publicationCard } from "../site/components.mjs";

const paper = {
  id: "flowpde",
  title: "FlowPDE: Flow Matching & PDE Solving",
  authors: [{ name: "Tianxiao Li", self: true, equalContribution: true }],
  type: "accepted",
  isFirstAuthor: true,
  venue: "ICML 2026 Workshop on AI for Physics",
  year: 2026,
  highlight: "",
  thumbnail: null,
  tags: [{ text: "Paper", link: "https://example.org/paper" }],
};

test("co-first-author papers appear in the first-author filter", () => {
  assert.equal(matchesPublication(paper, "first-author", ""), true);
  assert.equal(matchesPublication({ ...paper, isFirstAuthor: false }, "first-author", ""), false);
});

test("search combines with status filters and matches authors and venues", () => {
  assert.equal(matchesPublication(paper, "accepted", "TIANXIAO"), true);
  assert.equal(matchesPublication(paper, "accepted", "physics"), true);
  assert.equal(matchesPublication(paper, "preprint", "FlowPDE"), false);
  assert.equal(matchesPublication(paper, "all", "nonexistent"), false);
  assert.equal(matchesPublication(paper, "all", "  flow matching  "), true);
});

test("under-review papers are separate from accepted papers and preprints", () => {
  const reviewing = { ...paper, type: "under-review" };
  assert.equal(matchesPublication(reviewing, "under-review"), true);
  assert.equal(matchesPublication(reviewing, "accepted"), false);
  assert.equal(matchesPublication(reviewing, "preprint"), false);
});

test("publication validation rejects incomplete filtering data and duplicate IDs", () => {
  assert.equal(isValidPublications([paper]), true);
  for (const field of ["id", "title", "venue", "type", "isFirstAuthor", "year", "authors"]) {
    const broken = { ...paper };
    delete broken[field];
    assert.equal(isValidPublications([broken]), false, `Missing ${field}`);
  }
  assert.equal(isValidPublications([paper, paper]), false);
  assert.equal(isValidPublications([{ ...paper, isFirstAuthor: "false" }]), false);
  assert.equal(isValidPublications([{ ...paper, authors: [null] }]), false);
});

test("migrated content retains the original paper records and the confirmed MIT end date", async () => {
  const profile = JSON.parse(await readFile(new URL("../data/profile.json", import.meta.url), "utf8"));
  const publications = JSON.parse(await readFile(new URL("../data/publications.json", import.meta.url), "utf8"));
  for (const id of ["li2026flowpde", "han2026opendelight", "han2026wildcap", "zhang2025m3dlayout", "zhang2026quadlink"]) {
    assert.ok(
      publications.some((p) => p.id === id),
      `Migrated record missing: ${id}`
    );
  }
  assert.equal(profile.experience.find((entry) => entry.institution.includes("MIT")).endDate, "2026-06");
  assert.equal(profile.cv, "/assets/pdf/Tianxiao_s_CV.pdf");
});

test("text is escaped and link protocols reject executable and placeholder URLs", () => {
  assert.equal(escapeHtml('<img src=x onerror="alert(1)">&'), "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&amp;");
  for (const value of ["javascript:alert(1)", "//evil.example", "#", "data:text/html,hi"]) assert.equal(safeHref(value), "");
  assert.equal(safeHref("/assets/pdf/Tianxiao_s_CV.pdf"), "/assets/pdf/Tianxiao_s_CV.pdf");
  assert.equal(safeHref("https://arxiv.org/abs/2512.11237"), "https://arxiv.org/abs/2512.11237");
});

test("publication cards retain author marks, escape data, and omit missing previews and links", () => {
  const html = publicationCard({
    ...paper,
    authors: [{ name: '<img src=x onerror="alert(1)">', self: true, equalContribution: true, corresponding: true }],
    tags: [{ text: "Code", link: "#" }],
  });
  assert.match(html, /<strong>&lt;img/);
  assert.match(html, /<sup>\*<\/sup>/);
  assert.match(html, /<sup>†<\/sup>/);
  assert.doesNotMatch(html, /<img /);
  assert.doesNotMatch(html, /href="#"/);
  assert.doesNotMatch(html, /publication-media/);
});
