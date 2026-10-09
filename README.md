# Tianxiao Li

Source for [tingyunaiai9.github.io](https://tingyunaiai9.github.io), a static academic homepage. The AcaNova-X design is built with Node.js 22 and Tailwind CSS 4.3.0. GitHub Pages serves the generated `_site/` directory from the `gh-pages` branch.

## Local development

```sh
npm ci
npm run build
npm start
```

Open <http://127.0.0.1:8080>. `npm run dev` builds and starts the same preview. Set `HOST` and `PORT` to change the preview address. For Docker, run `docker compose up --build` and open <http://localhost:8080>. Docker uses Node.js 22; it does not require Ruby or Jekyll.

## Edit content

Edit `data/profile.json` for the biography, experience, links, and projects; `data/publications.json` for papers; `data/news.json` for announcements; and `data/honors.json` for awards. The site code lives in `site/`; `scripts/build.mjs` renders pages and copies only referenced public assets into `_site/`.

Publication statuses are `accepted`, `preprint`, and `under-review`. Set `showOnHomepage` and `featuredOrder` to control the selected publications and their order. Add only working paper, code, project, or other resource links to `tags`; leave `thumbnail` and `demo` as `null` until real assets are available. QuadLink is currently under review. The web experience lists the MIT CSAIL remote internship as January–June 2026. The existing CV PDF remains at [/assets/pdf/Tianxiao_s_CV.pdf](/assets/pdf/Tianxiao_s_CV.pdf); this migration does not revise it.

The generated routes are `/`, `/publications/`, `/background/`, `/news/`, `/honors/`, `/projects/`, and `/cv/`. Legacy page aliases remain at `/pages/all-publications.html`, `/pages/all-news.html`, and `/pages/all-honors.html`. The `/cv/` route redirects to the existing PDF.

The homepage contains About, up to three news items, selected publications, academic service, and contact information. Full research experience and education appear on the Experience page at `/background/`; honors and projects have their own pages. Publications are a static list with plain venue information and resource links, without search, filters, or badges.

## Verify and publish

```sh
npm run format:check
npm test
npm run build
npm run test:browser
```

The build checks local links in the rendered pages. Browser tests use Playwright: install Chromium with `npx playwright install chromium` on Linux/macOS or use Edge on Windows. CI installs Chromium and runs formatting, audit, unit, build, and browser checks. A PR does not publish; a verified push to `main` or `master` publishes `_site/` to `gh-pages`.

The former al-folio/Jekyll sources remain in the repository for reference but are unused by this build and excluded from `_site/`. See [migration notes](docs/acanova-migration.md) for source mapping, deployment, and rollback.

Formatting checks cover the active Node sources, active workflows, and migration documentation. The retained al-folio files are excluded from that check.

After editing content, run `npm run build` again and reload the preview. The preview server does not rebuild automatically.
