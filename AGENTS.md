# Agent Guidelines for Tianxiao Li's Site

This repository now builds the AcaNova-X static site with Node.js 22. Read this file before editing; [migration notes](docs/acanova-migration.md) explain the source mapping. The old [al-folio Copilot instructions](.github/copilot-instructions.md), [customization guide](CUSTOMIZE.md), and Jekyll-specific instruction files describe retained legacy sources, not the active build.

## Active sources

- `data/profile.json`: biography, experience, links, projects, and CV URL.
- `data/publications.json`, `data/news.json`, `data/honors.json`: content.
- `site/`: HTML templates, components, CSS, and client scripts.
- `scripts/build.mjs`: generates `_site/`, compiles CSS, copies referenced assets and local fonts, and verifies local links.
- `scripts/serve.mjs`: previews `_site/` at `127.0.0.1:8080` by default; `HOST` and `PORT` override this.
- `tests/`: Node and Playwright checks.

The prior `_config.yml`, Liquid templates, BibTeX, Ruby scripts, and `_data/` are retained for reference and are not sources for the new build. Do not update them expecting a site change. Do not alter the existing CV PDF unless the task explicitly requires it.
The formatting baseline covers active Node sources, active workflows, and migration documentation; retained al-folio files are excluded.

## Commands

```sh
npm ci
npm run format:check
npm test
npm run build
npm run test:browser
npm start
```

Run formatting, unit tests, the build, and browser verification before committing changes that affect the site. Browser tests require installed Playwright browsers; CI installs Chromium. Use `npm run format` to format active files as configured in `package.json`. `docker compose up --build` provides a Node-based preview at <http://localhost:8080>; Docker requires a working daemon.

The build output is `_site/`. Do not edit it directly or commit it. Pull requests run verification but do not publish. Passing changes pushed to `main` or `master` deploy to the existing `gh-pages` branch. The CV rendering workflow is manual-only.

## Content rules

Keep publication `type` to `accepted`, `preprint`, or `under-review`. Use `showOnHomepage` and `featuredOrder` for selected publications. Add only real resource links and assets. Preserve `/assets/pdf/Tianxiao_s_CV.pdf` until a CV update is requested. QuadLink remains under review; web experience shows the MIT CSAIL internship as January–June 2026.
