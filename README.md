<div align="center">

[![The kpulka.com hero: Kamil Pułka, full-stack developer, over a field of pins](public/og/home.jpg)](https://kpulka.com)

# kpulka.com

The portfolio site of Kamil Pułka, full-stack developer.

[![Release and deploy](https://img.shields.io/github/actions/workflow/status/kpulka247/portfolio-kpulka/release.yml?label=release%20and%20deploy)](https://github.com/kpulka247/portfolio-kpulka/actions/workflows/release.yml)
[![Latest release](https://img.shields.io/github/v/release/kpulka247/portfolio-kpulka?logo=github&logoColor=white)](https://github.com/kpulka247/portfolio-kpulka/releases)

**[Open the site](https://kpulka.com)**

</div>

## What the site does

- **A pin board you can play with.** The hero is a field of pins that dips under the pointer. **Play** drops a toy car on it that you drive with the keyboard or a finger. It is a plain three.js module that loads after the page, renders only while in view, and falls back to a still image on slow devices and for visitors who prefer reduced motion.
- **A page for every project.** Each project lives in one data file and gets a prerendered page at `/projects/<slug>`, so search engines and link previews see real content.
- **Live store numbers.** Users, ratings, releases and downloads come from the Chrome Web Store, Firefox Add-ons, Google Play and GitHub at build time. Nothing is typed by hand, and the site rebuilds every Monday to stay current.
- **No cookies.** Visits are counted with Cloudflare Web Analytics, which stores nothing on the visitor's device, so there is no cookie banner.

## Tech stack

- React 19 and TypeScript
- React Router 7 in framework mode, prerendering every page
- Vite 7 and Tailwind CSS 4
- three.js for the hero
- Vitest and Playwright for tests
- GitHub Actions, GitHub Pages and semantic-release

## Run it locally

You need [Node.js](https://nodejs.org) 20 or later and [pnpm](https://pnpm.io) 10 or later.

```bash
git clone https://github.com/kpulka247/portfolio-kpulka.git
cd portfolio-kpulka
pnpm install
pnpm dev
```

The site runs at `http://localhost:5173`. `pnpm dev` also prints a network address, so you can open the site on a phone on the same network.

| Command | What it does |
| --- | --- |
| `pnpm dev` | Starts the dev server. |
| `pnpm build` | Fetches the store numbers, typechecks and prerenders every page into `dist/client`. |
| `pnpm test` | Runs the unit tests. |
| `pnpm test:e2e` | Runs the Playwright tests against `dist/client`. Run `pnpm build` and `pnpm exec playwright install chromium` first. |
| `pnpm lint` | Runs ESLint. |
| `pnpm stats` | Fetches the store numbers into `src/content/stats.json` without building. |

## Add a project

A project is one data file plus its images. The home page, the project page, the sitemap and the link preview all follow from it.

1. Create `src/content/projects/<slug>.ts`. The file name must be the slug, because `src/routes.ts` makes one page per file. Copy an existing project of the same kind and change its fields. `src/content/schema.ts` describes each one.
2. Put the images in `src/assets/projects/<slug>/`: an icon, a cover screenshot and the screenshots for the project page. If the source images live in the project's own repository, add jobs for them to `scripts/make-covers.mjs`, which crops them and writes WebP.
3. Add the project to the `projects` list in `src/content/projects/index.ts`. Its `order` field sets its place: 1 is first and spans two columns on desktop.
4. If the project is in a store or has GitHub releases, add its IDs to `src/content/sources.json` and run `pnpm stats`. A store ID with no live listing yet shows "Coming to" that store.
5. Run `node scripts/make-og.mjs` to render the project's link-preview image into `public/og/`.
6. Run `pnpm build && pnpm test && pnpm test:e2e`.

A small project with no page goes in `earlierProjects` in the same `index.ts` instead.

## Project structure

```text
src/
├── root.tsx            Page shell, fonts and the analytics script
├── routes.ts           One route per page, including one per project file
├── pages/              The home, project, privacy and 404 pages
├── sections/           The home page sections: Hero, Work, Stack, About, Contact
├── components/         Navbar, Footer, ProjectCard, ProjectCover, LegalPage
├── hero/pinBoard.ts    The three.js pin board
├── content/            Projects as data, store IDs, fetched stats and status rules
├── data/               Contact links and the Stack list
├── assets/             Images, imported so Vite fingerprints them
├── seo.ts              Canonical URLs, link previews and structured data
└── analytics.ts        Cloudflare Web Analytics token
```

The `scripts/` folder holds the build steps (`fetch-stats.mjs`, `copy-404.js`, `write-sitemap.mjs`) and the image tools you run by hand (`make-covers.mjs`, `capture-hero.mjs`, `make-og.mjs`).

## Deployment and releases

`.github/workflows/release.yml` runs on every push to `main`, every Monday at 06:00 UTC, and on demand:

1. **Build.** Installs dependencies, fetches fresh store numbers and prerenders the site.
2. **Release.** [semantic-release](https://github.com/semantic-release/semantic-release) reads the [Conventional Commits](https://www.conventionalcommits.org/) since the last release, picks the version, updates [CHANGELOG.md](CHANGELOG.md) and publishes a GitHub release. With no new commits, as on most Mondays, it releases nothing.
3. **Deploy.** Publishes `dist/client` to GitHub Pages at [kpulka.com](https://kpulka.com).

Analytics are on only when the repository variable `CF_BEACON_TOKEN` holds the Cloudflare Web Analytics token. Without it, the site has no analytics, and the privacy page leaves them out.

## License

Copyright © Kamil Pułka. All rights reserved. The code is public so you can read how the site works. It carries no open-source license.
