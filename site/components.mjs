import { escapeHtml as e, link, month, paragraph, safeHref } from "./html.mjs";
import { icon } from "./icons.mjs";

export function profileCard(profile) {
  return `<aside class="profile-column" aria-label="Researcher profile"><div class="profile-card">
    <img class="profile-portrait" src="${e(safeHref(profile.portrait))}" alt="${e(profile.name)}" width="180" height="225" fetchpriority="high">
    <h1>${e(profile.name)}</h1><p class="profile-role">${e(profile.role)}</p>
    <p class="profile-affiliation">${e(profile.department)}<br>${e(profile.institution)}</p>
    <p class="profile-location">${icon("pin")}${e(profile.location)}</p>
    <div class="social-links">${[
      ["Email", `mailto:${profile.email}`, "mail"],
      ["CV", profile.cv, "file"],
      ["GitHub", profile.github, "github"],
    ]
      .map(([label, href, name]) => `<a class="social-btn" href="${e(safeHref(href))}" aria-label="${label}" title="${label}">${icon(name)}</a>`)
      .join("")}</div>
    <div class="research-interests-card"><h2>Research Interests</h2><ul>${profile.interests.map((interest) => `<li>${e(interest)}</li>`).join("")}</ul></div>
  </div></aside>`;
}

export function section(id, title, content, more = "") {
  return `<section id="${id}" class="content-section"><div class="section-header"><h2>${e(title)}</h2>${more}</div>${content}</section>`;
}

export function viewAll(href, label = "View all") {
  return `<a class="view-all" href="${href}">${label}${icon("arrow")}</a>`;
}

export function publicationCard(paper) {
  const authors = paper.authors
    .map(
      (author) =>
        `${author.self ? `<strong>${e(author.name)}</strong>` : e(author.name)}${author.equalContribution ? "<sup>*</sup>" : ""}${author.corresponding ? "<sup>†</sup>" : ""}`
    )
    .join(", ");
  const thumbnail = safeHref(paper.thumbnail);
  const media = thumbnail
    ? `<figure class="publication-media"><img src="${e(thumbnail)}"${safeHref(paper.demo) ? ` data-demo="${e(paper.demo)}"` : ""} alt="Preview of ${e(paper.title)}" loading="lazy" width="300" height="170"></figure>`
    : "";
  const resources = paper.tags
    .filter((tag) => safeHref(tag.link))
    .map((tag) => link(tag.text, tag.link, "resource-link"))
    .join("");
  const venue = `${paper.venue}${["Poster", "Highlight"].includes(paper.highlight) ? ` (${paper.highlight})` : ""}`;
  return `<article class="publication-card${thumbnail ? " has-media" : ""}" id="${e(paper.id)}">
    ${media}<div class="publication-content"><p class="publication-venue">${e(venue)}</p>
    <h3>${e(paper.title)}</h3><p class="publication-authors">${authors}</p>
    ${paper.preprintYear && paper.preprintYear !== paper.year ? `<p class="publication-note">Preprint first released in ${e(paper.preprintYear)}.</p>` : ""}
    ${resources ? `<div class="publication-links">${resources}</div>` : ""}</div></article>`;
}

export function authorLegend() {
  return '<p class="author-legend"><span><sup>*</sup> Equal contribution</span><span><sup>†</sup> Corresponding author</span></p>';
}

export function newsList(news) {
  if (!news.length) return '<p class="empty-message">No announcements yet.</p>';
  return `<ul class="news-list">${[...news]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(
      (item) =>
        `<li><time datetime="${e(item.date)}">${e(month(item.date))}</time><span>${item.href ? link(item.text, item.href) : e(item.text)}</span></li>`
    )
    .join("")}</ul>`;
}

export function honorsList(honors) {
  if (!honors.length) return '<p class="empty-message">No honors listed yet.</p>';
  return `<ul class="honors-list">${honors.map((item) => `<li><span class="honor-year">${e(item.year)}</span><div><h3>${e(item.title)}</h3>${item.awarder ? `<p>${e(item.awarder)}</p>` : ""}${item.description ? `<p>${e(item.description)}</p>` : ""}</div></li>`).join("")}</ul>`;
}

export function experienceList(experience) {
  return `<ol class="timeline">${experience.map((item) => `<li><div class="timeline-heading"><h3>${e(item.institution)}</h3><span class="timeline-date">${e(month(item.startDate))} – ${e(month(item.endDate))}</span></div><p class="timeline-role">${e(item.position)}<span class="location-text"> · ${e(item.location)}</span></p><p>Advisor${item.advisors.length > 1 ? "s" : ""}: ${item.advisors.map((advisor) => link(advisor.name, advisor.href)).join(" & ")}</p><p>${e(item.topic)}</p></li>`).join("")}</ol>`;
}

export function educationList(education) {
  return `<ol class="timeline">${education.map((item) => `<li><div class="timeline-heading"><h3>${e(item.institution)}</h3><span class="timeline-date">${e(month(item.startDate))} – ${e(month(item.endDate))} (expected)</span></div><p class="timeline-role">${e(item.degree)}</p>${item.highlights.map((highlight) => `<p>${e(highlight)}</p>`).join("")}</li>`).join("")}</ol>`;
}

export function projectsList(projects) {
  return projects
    .map(
      (project) =>
        `<article class="project-card"><h3>${link(project.title, project.href)}</h3><p>${e(project.description)}</p><p class="project-keywords">${project.keywords.map(e).join(" · ")}</p><ul>${project.awards.map((award) => `<li>${e(award)}</li>`).join("")}</ul>${link("View on GitHub →", project.href, "text-link")}</article>`
    )
    .join("");
}

export function about(profile) {
  return `<div class="biography">${profile.biography.map(paragraph).join("")}</div><div class="highlight-box"><h3>${e(profile.opportunity.title)}</h3><p>${e(profile.opportunity.text)} ${link("Get in touch →", `mailto:${profile.email}`)}</p></div>`;
}
