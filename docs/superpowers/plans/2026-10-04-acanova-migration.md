# AcaNova-X migration implementation plan

> Execute the approved design incrementally in this chat. Use focused implementation and independent code review through subagent-driven-development where tasks have separate file ownership.

**Goal:** Replace the al-folio site with a personal AcaNova-X website while preserving academic content, existing URLs, and the CV PDF.

**Architecture:** JSON files are the editable content source. A small Node build pre-renders semantic HTML, compiles local Tailwind CSS, and copies only public assets to `_site`. Browser JavaScript progressively enhances publication filtering, navigation, and theme selection; content remains readable without JavaScript.

**Tech stack:** Node 22+, native ES modules, Tailwind CLI, HTML, CSS, browser JavaScript, GitHub Pages.

## Global constraints

- Domain: `https://tingyunaiai9.github.io`; no base path.
- English content; preserve all 5 publications and 4 homepage selections.
- Preserve author contribution marks, original profile portrait, and `/assets/pdf/Tianxiao_s_CV.pdf`.
- Keep `/publications/`, `/news/`, `/projects/`, and `/cv/` functional.
- Preserve the AcaNova-X two-column profile/content structure, serif headings, and gold accent; support a dark theme and a mobile menu.
- Do not invent research results, publication images, dates, or social accounts.
- User-confirmed updates: MIT web experience ends 2026-06; CV files remain unchanged; QuadLink uses `under-review`.
- Do not publish private CV fields such as phone number.
- Keep legacy Jekyll sources available as migration references, but exclude them from the published artifact.
- Run repository formatting, build checks, and browser validation before claiming completion. Do not publish during implementation.

## Task 1: Data migration

Files: `data/profile.json`, `data/publications.json`, `data/news.json`, `data/honors.json`.

- [x] Convert About and social links into profile data; convert CV education, experience, service, and the Echo of Time project.
- [x] Convert BibTeX to structured authors with `name`, `self`, `equalContribution`, and `corresponding`; retain original author order.
- [x] Use `year` for venue year and `preprintYear` for M3DLayout's 2025 preprint. Preserve real Paper/Code/Project URLs only.
- [x] Convert the scholarship news and all CV honors. Confirm all JSON parses and the source counts match.

## Task 2: Static pages and local styles

Files: `site/templates.mjs`, `site/styles.css`, `site/script.js`, `site/theme.js`, `scripts/build.mjs`, `scripts/serve.mjs`, `package.json`, `tests/site.test.mjs`.

- [x] Write failing behavior tests for co-first-author filtering, combined search/filter, original URLs, escaped author data, and invalid links.
- [x] Build reusable page/profile/publication renderers using escaped strings and checked URLs.
- [x] Render homepage, all publications, news, honors, projects, CV redirect, 404, sitemap, robots, and `.nojekyll`.
- [x] Add responsive gold/neutral AcaNova-X styling, compile Tailwind locally, and add keyboard-accessible menu and persisted theme.
- [x] Add optional media support with static-image fallback; omit media blocks when no thumbnail exists.
- [x] Run `npm test` and `npm run build`; serve `_site` at port 8080.

## Task 3: Deployment and maintenance

Files: `.github/workflows/deploy.yml`, `.github/workflows/prettier.yml`, `.github/legacy-workflows/`, `Dockerfile`, `docker-compose.yml`, `README.md`, `docs/acanova-migration.md`, `AGENTS.md`.

- [x] Replace Jekyll build with `npm ci`, `npm test`, and `npm run build`; continue deployment to the existing `gh-pages` branch so Pages settings need no change.
- [x] Archive obsolete Jekyll workflows; keep relevant link and security checks and preserve RenderCV generation as a documented independent tool.
- [x] Replace the Docker development image with a Node-based image using the new build and preview server.
- [x] Document content updates, optional thumbnails, CV maintenance, legacy content, rollback, and deployment.

## Task 4: Verification and review

- [x] Run `npx prettier . --write`, inspect formatting changes, then `npm test` and `npm run build`.
- [x] Run `docker compose up --build` if the Docker engine is available; report limitations accurately.
- [x] Test real browser at 320, 768, 1024, and 1440px, light/dark, publication filters/search/no results, mobile menu and keyboard, media fallback, and all old addresses.
- [x] Verify no failing local requests, no browser console errors, no placeholder links, no horizontal overflow, and readable content with JavaScript disabled.
- [x] Request independent code review and resolve actionable defects.
- [x] Open the local preview and provide changed files, commands, test evidence, and any unresolved content facts.
