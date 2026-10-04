import { escapeHtml as e, link } from "./html.mjs";
import { icon } from "./icons.mjs";
import { about, authorLegend, educationList, experienceList, newsList, profileCard, publicationCard, section, viewAll } from "./components.mjs";

export const origin = "https://tingyunaiai9.github.io";

export function page(profile, { title, path, content }) {
  const nav = [
    ["About", "/#about"],
    ["Publications", "/publications/"],
    ["Background", "/background/"],
    ["Honors", "/honors/"],
    ["Projects", "/projects/"],
    ["CV", "/cv/"],
  ];
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(title)}${title === profile.name ? "" : ` | ${e(profile.name)}`}</title>
<meta name="description" content="${e(profile.description)}"><meta name="theme-color" content="#fefffe">
<link rel="canonical" href="${origin}${path}"><meta property="og:type" content="website"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(profile.description)}"><meta property="og:url" content="${origin}${path}"><meta property="og:image" content="${origin}${e(profile.portrait)}"><meta name="twitter:card" content="summary">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg"><script src="/theme.js"></script><link rel="stylesheet" href="/styles.css">
<script type="module" src="/script.js"></script></head><body>
<a class="skip-link" href="#main-content">Skip to content</a>
<header class="top-nav glass"><div class="nav-inner"><a class="brand" href="/">${e(profile.name)}</a><nav id="site-navigation" aria-label="Main navigation"><ul class="nav-links">${nav.map(([label, href]) => `<li><a class="nav-item${path === href ? " active" : ""}" href="${href}"${path === href ? ' aria-current="page"' : ""}>${label}</a></li>`).join("")}</ul></nav><div class="nav-actions"><button class="icon-button theme-toggle" type="button" aria-label="Switch to dark theme">${icon("moon")}${icon("sun")}</button><button class="icon-button mobile-menu-btn" type="button" aria-label="Open navigation" aria-controls="site-navigation" aria-expanded="false">${icon("menu")}</button></div></div></header>
<div class="page-shell grid-layout">${profileCard(profile)}<main class="content-column" id="main-content" tabindex="-1">${content}</main></div>
<footer><div class="footer-inner"><p>© ${new Date().getUTCFullYear()} ${e(profile.name)}</p><p>Built with ${link("AcaNova-X", "https://github.com/yihangtao/AcaNova-X")} · Hosted on ${link("GitHub Pages", "https://pages.github.com/")}</p></div></footer></body></html>`;
}

export function homepage({ profile, publications, news }) {
  const featured = publications.filter((paper) => paper.showOnHomepage).sort((a, b) => a.featuredOrder - b.featuredOrder);
  const service = `<ul class="service-list">${profile.service.map((entry) => `<li>${e(entry)}</li>`).join("")}</ul>`;
  return page(profile, {
    title: profile.name,
    path: "/",
    content:
      section("about", "About Me", about(profile)) +
      section("latest-news", "Latest News", newsList([...news].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)), viewAll("/news/")) +
      section(
        "publications",
        "Selected Publications",
        authorLegend() + `<div class="publications-list">${featured.map(publicationCard).join("")}</div>`,
        viewAll("/publications/", "Full list")
      ) +
      section("service", "Academic Service", service) +
      section(
        "contact",
        "Contact",
        `<p>I am happy to talk about computer graphics, 3D vision, and research opportunities.</p><p>${link(profile.email, `mailto:${profile.email}`, "text-link")}</p>`
      ),
  });
}

export function backgroundPage(profile) {
  const leadership = `<ul class="service-list">${(profile.leadership || []).map((entry) => `<li>${e(entry)}</li>`).join("")}</ul>`;
  return listPage(profile, {
    title: "Background",
    path: "/background/",
    content:
      section("experience", "Research Experience", experienceList(profile.experience)) +
      section("education", "Education", educationList(profile.education)) +
      (profile.leadership?.length ? section("leadership", "Leadership", leadership) : ""),
  });
}

export function publicationsPage(profile, publications) {
  return page(profile, {
    title: "Publications",
    path: "/publications/",
    content: `<div class="page-heading"><a class="back-link" href="/">← Back to homepage</a><h2>Publications</h2><p>Research in computer graphics, 3D vision, and physically grounded learning.</p></div>
    ${authorLegend()}<div class="publications-list" id="all-publications">${publications.map(publicationCard).join("")}</div>`,
  });
}

export function listPage(profile, { title, path, content }) {
  return page(profile, {
    title,
    path,
    content: `<div class="page-heading"><a class="back-link" href="/">← Back to homepage</a><h2>${e(title)}</h2></div>${content}`,
  });
}

export function cvPage(profile) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>CV | ${e(profile.name)}</title><meta http-equiv="refresh" content="0;url=${e(profile.cv)}"><link rel="canonical" href="${origin}${e(profile.cv)}"></head><body><p>${link("Open Tianxiao Li’s CV (PDF)", profile.cv)}</p><p><a href="/">Back to homepage</a></p></body></html>`;
}
