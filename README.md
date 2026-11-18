<div align="center">

[![kpulka.com: Kamil Pułka, full-stack developer](docs/images/banner.png)](https://kpulka.com)

<a href="https://github.com/kpulka247/portfolio-kpulka/actions/workflows/release.yml" title="Release and deploy"><img src="https://img.shields.io/github/actions/workflow/status/kpulka247/portfolio-kpulka/release.yml"></a>
<a href="https://github.com/kpulka247/portfolio-kpulka/releases" title="GitHub Release"><img src="https://img.shields.io/github/v/release/kpulka247/portfolio-kpulka?logo=github&logoColor=white&color=%236f42c1"></a>
<a href="https://kpulka.com" title="Website status"><img src="https://img.shields.io/website?url=https%3A%2F%2Fkpulka.com&label=kpulka.com&up_message=online&up_color=%23252525"></a>

</div>

## Overview

This repository is the source of [kpulka.com](https://kpulka.com), the portfolio of Kamil Pułka, a full-stack developer from Poland. I design, build and ship web apps, browser extensions and mobile apps on my own, from the first sketch to the store listing.

The site itself is built to the same standard as the products it shows:

- **Interactive hero.** A three.js pin board on a fine grid that reacts to the pointer, with a coupe you can drive past obstacles, burn out and drift. The board rises into place when it loads and drifts up as the page scrolls, behind the sheet that covers it. It loads after the page, pauses when off screen, and falls back to a still image on slow devices and with reduced motion.
- **Light and dark themes.** One warm palette for both, and the whole page follows the theme, the board, the car and the browser bars included. The theme follows the system until you pick Light, Dark or Auto, and it switches at once.
- **Fast motion.** Colours, themes and hovers change at once. Opening a project or the privacy page raises it as a sheet over the current page, with the View Transitions API, and going back to the home page is instant. Cards glide when the Work filter changes, and covers settle into place as they scroll in, with CSS scroll-driven animations. Reduced motion turns all of it off.
- **Data-driven projects.** Each project is one typed data file that produces its card, its prerendered page, its sitemap entry and its link preview.
- **Live store numbers.** Users, ratings, releases and downloads are fetched from the Chrome Web Store, Firefox Add-ons, Google Play and GitHub at build time, and the site rebuilds weekly.
- **Search and sharing.** Every page is prerendered, with a canonical URL, Open Graph image and sitemap entry. The home page has Person structured data.
- **Privacy by default.** No cookies and no cookie banner. Visits are counted with Cloudflare Web Analytics, which stores nothing on the device.
- **Tested.** Unit tests for the content and build scripts, and Playwright tests for layout at nine screen widths, every route, the hero and the link previews.

## Projects

The projects on the site, each with its own page:

| Project                | What it is                                                                                 | Links                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| NoVice                 | Browser extension that blurs GTA VI trailers, leaks and spoilers on every website.         | [Page](https://kpulka.com/projects/novice/), [Source](https://github.com/kpulka247/novice)                          |
| Polsimer F74LED plugin | SimHub plugin in C# that drives the 12 LEDs of the Polsimer F74LED wheel over USB.         | [Page](https://kpulka.com/projects/polsimer-f74led/), [Source](https://github.com/kpulka247/polsimer-simhub-plugin) |
| Gifoji                 | Web app in Next.js and Supabase that turns a mood into an AI image or GIF.                 | [Page](https://kpulka.com/projects/gifoji/), [gifoji.com](https://gifoji.com)                                       |
| Dark Connect           | Browser extension that adds a dark mode to Garmin Connect, used by over a thousand people. | [Page](https://kpulka.com/projects/dark-connect/), [Source](https://github.com/kpulka247/dark-connect)              |

## Tech stack

- **Framework:** React 19, TypeScript and React Router 7, prerendering every page
- **Styling:** Tailwind CSS 4 with the design tokens in `src/index.css`, and self-hosted Anybody and Instrument Sans
- **Motion:** the View Transitions API and CSS scroll-driven animations, with no animation library
- **Graphics:** three.js, loaded after the page in its own chunk
- **Tooling:** Vite 7, Vitest, Playwright, ESLint and Prettier
- **Delivery:** GitHub Actions, GitHub Pages and semantic-release

## Development & Build

You need [Node.js](https://nodejs.org) 20 or newer, [pnpm](https://pnpm.io/) 10 or newer, and [Git](https://git-scm.com/).

```bash
git clone https://github.com/kpulka247/portfolio-kpulka.git
cd portfolio-kpulka
pnpm install       # install dependencies
pnpm dev           # dev server on http://localhost:5173 and on your network
pnpm build         # fetch store numbers, typecheck and prerender into dist/client
pnpm test          # unit tests
pnpm test:e2e      # Playwright tests against dist/client
pnpm lint          # ESLint
pnpm stats         # fetch store numbers without building
```

The end-to-end tests need a build and Playwright's Chromium once: `pnpm exec playwright install chromium`. Headless Chromium draws the pin board in software, so the hero tests are slow, and they run one at a time.

Three scripts make the site's images and run by hand:

- `node scripts/make-images.mjs` renders the link previews in `public/og/` and the README banner from the site itself. The banner joins the light and the dark theme along a diagonal.
- `node scripts/capture-hero.mjs` captures the still image of the pin board.
- `node scripts/make-icons.mjs` draws the site icon in every size into `public/`.

## Adding a project

1. Create `src/content/projects/<slug>.ts`. The file name is the slug and the page address. `src/content/schema.ts` describes each field.
2. Put its images in `src/assets/projects/<slug>/`. To crop them from the project's own repository, add jobs to `scripts/make-covers.mjs`.
3. Add it to the `projects` list in `src/content/projects/index.ts`. `order: 1` puts it first.
4. Add its store IDs and GitHub repository to `src/content/sources.json`, then run `pnpm stats`.
5. Run `node scripts/make-images.mjs`, then `pnpm build && pnpm test && pnpm test:e2e`.

## Deployment

Every push to `main` builds the site and deploys it to GitHub Pages. [semantic-release](https://github.com/semantic-release/semantic-release) picks the version from the [Conventional Commits](https://www.conventionalcommits.org/) and writes the changelog entry and the GitHub Release. The workflow also runs every Monday to refresh the store numbers.

Analytics are on when the repository variable `CF_BEACON_TOKEN` holds the Cloudflare Web Analytics token.

## Contact

Open to full-time and contract roles, remote-first.

- Email: [contact@kpulka.com](mailto:contact@kpulka.com)
- LinkedIn: [in/kpulka247](https://www.linkedin.com/in/kpulka247/)
- GitHub: [kpulka247](https://github.com/kpulka247)

## License

Copyright © Kamil Pułka. All rights reserved.

## Changelog

Changes for each release are in [CHANGELOG.md](./CHANGELOG.md).
