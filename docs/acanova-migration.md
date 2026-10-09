# AcaNova-X migration notes

The production source is now `data/`, `site/`, and `scripts/`. Node.js 22 runs `scripts/build.mjs`, which writes pre-rendered HTML to `_site/`, compiles Tailwind CSS 4.3.0, copies local Fontsource fonts and referenced assets, and checks local links. `_site/` is generated and should not be committed. The old al-folio/Jekyll directories, `Gemfile`, `_config.yml`, and Liquid templates remain for historical reference but do not affect the new pages. Only needed assets enter `_site/`.
The active formatting baseline covers Node sources, workflows, and migration documentation; retained al-folio files are excluded.

## Content mapping

| Current source                                       | Controls                                                        |
| ---------------------------------------------------- | --------------------------------------------------------------- |
| `data/profile.json`                                  | Biography, experience, projects, social links, portrait, CV URL |
| `data/publications.json`                             | Papers, statuses, selected order, links                         |
| `data/news.json`                                     | News                                                            |
| `data/honors.json`                                   | Honors and funding                                              |
| `site/templates.mjs`, `site/components.mjs`          | HTML pages and repeated sections                                |
| `site/styles.css`, `site/script.js`, `site/theme.js` | Styles and browser behavior                                     |

Only `accepted`, `preprint`, and `under-review` are valid publication types. QuadLink stays `under-review` until its status is confirmed. The homepage selected list follows `showOnHomepage` and `featuredOrder`. Leave `thumbnail` and `demo` null where no approved image or demo exists; put only valid resource URLs in `tags`. The MIT CSAIL remote internship appears on the web as January–June 2026. The CV remains the existing PDF at `/assets/pdf/Tianxiao_s_CV.pdf`; it was intentionally not regenerated or edited.

## Local checks

```sh
npm ci
npm run format:check
npm test
npm run build
npm run test:browser
npm start
```

`npm start` serves `_site/` on `127.0.0.1:8080`; `HOST` and `PORT` may override those defaults. The browser test starts its own preview on port 8081. On a machine with Docker, `docker compose up --build` serves the same site on port 8080. Browser dependencies must be installed with `npx playwright install chromium` on Linux/macOS; CI uses `npx playwright install --with-deps chromium`. On Windows, the browser test uses Edge.

## Routes and publication

The main routes are `/`, `/publications/`, `/background/`, `/news/`, `/honors/`, `/projects/`, and `/cv/`. Existing links to `/pages/all-publications.html`, `/pages/all-news.html`, and `/pages/all-honors.html` continue to resolve. The CV route points to the unchanged PDF.

The `deploy.yml` workflow verifies formatting, dependency audit, unit tests, build, and browser behavior on relevant pull requests and pushes. The build includes a check of local static links. Only successful runs on `main` or `master` publish the verified `_site/` artifact to the existing `gh-pages` branch with `JamesIves/github-pages-deploy-action@v4`. This keeps the existing GitHub Pages branch setting. The publish job alone has `contents: write`. Old al-folio automation is retained under `.github/legacy-workflows/`, where GitHub Actions does not execute it. `render-cv.yml` can only run manually.

The migration branch is for review. After checks and approval, push/merge it to the chosen default branch to publish. To roll back, revert the migration on that branch and let the existing deployment workflow rebuild, or restore the previous known-good `gh-pages` branch commit while the source revert is prepared. Keep the old sources until the replacement is accepted.

## Homepage organization

The homepage shows About, up to three news items, selected publications, academic service, and contact information. Research experience and education are on the Experience page at `/background/`; honors and projects remain on their existing pages. Navigation links expose these pages. Existing homepage section fragments redirect to the corresponding pages when JavaScript is enabled.

Publications display a full static list. Search, filters, and badges are removed. Venue, Poster/Highlight distinctions, author contribution marks, and real resource links remain as text. QuadLink retains Under review as its venue text.

## Verification record

Verified locally: 4 Node tests; local link checks across 11 generated HTML pages; Edge browser checks at 320, 768, 1024, and 1440px; light/dark WCAG AA checks; static publication lists without controls or badges; mobile navigation and Escape; static content without JavaScript; optional media fallbacks; compact homepage, Experience navigation, and legacy homepage fragment redirects. CV source data, CV route source, and PDF match the previous Git revision byte-for-byte. Active workflow YAML and Docker Compose configuration parse successfully. Dependency audit reports no known vulnerabilities. The container build/runtime is unverified because the Docker Desktop engine was unavailable; local preview uses Node, as requested. The migration branch is `codex/acanova-migration`; production changes only after verified commits reach `main` or `master`.
