# Redesign plan for kpulka.com

This plan rebuilds the site to match the approved designs in Doop: the [kpulka.com redesign canvas](https://doop.design/c/taYV98tZeA). The canvas pages are the source of truth for layout and copy:

- **Site.** Home on desktop and phone, the NoVice project page, the phone menu, the 404 page and the privacy page.
- **Hero prototypes.** Prototype D is the chosen hero.
- **Components.** Project card, Project cover, Filter chip, Stack item, Feature row and Fact row. Each one records the source file it becomes.
- **Style guide "Design plan".** The tokens and the reasons behind them.

Work happens on a `redesign` branch from `dev`. Every step below ends in a check. Do not start the next step until the check passes.

## What changes for visitors

- The first screen shows the name, the title and how to get in touch, with no cookie banner.
- The hero is a pin board that reacts to the pointer. **Play** puts a toy car on it.
- Each project has its own page at `/projects/<slug>`. The pages are prerendered, so links shared on LinkedIn show a real preview, and search engines see content instead of a black page.
- Store numbers come from the stores at build time, so they are never typed by hand.
- The site loads nothing from Google.

## What the next maintainer gets

- Adding a project means adding one data file and its images. There is no per-project drawing code.
- One three.js module owns the hero. React owns everything else.
- CI fails if a page has horizontal scroll at 320 px, if a route returns no HTML, or if the browser console shows an error.

## Decisions already made

| Topic | Decision |
| --- | --- |
| Audience | Everyone, recruiters first. No CV and no personal details beyond "based in Poland". |
| Title | "Full-stack developer". |
| Hero | Prototype D: pin board, with Play for the car. |
| Projects | NoVice, Gifoji, Polsimer F74LED plugin, Dark Connect, do nothing. StudentOffers goes under "Earlier work". Advanced LED Engine and Weather Rush stay off the site. |
| Stack | The 12 items in the Doop home frames, moved to `src/data/stack.ts` in step 6. No three.js. |
| Analytics | Cloudflare Web Analytics with no cookies and no banner. GA4 goes. |
| Language | English only. |
| Fonts | Anybody (variable width) and Instrument Sans, self-hosted. |

## Defects in the current site that this plan removes

- `src/sections/Hero.tsx` cancels `touchmove` while `scrollY` is 0. On phones this blocks the first scroll gesture and pull-to-refresh.
- `index.html` loads `gtag.js` and the Metal Mania font from Google on every visit, before any consent. Only the card being deleted uses Metal Mania.
- `DeferredSection` in `src/pages/MainPage.tsx` mounts sections only on scroll. Crawlers and link previews see the hero and a black page.
- `vite.config.ts` sets `base: "./"`. Relative asset paths break on nested routes such as `/projects/novice`.
- The hero copy is rendered twice, in two stacked layers, to get the `mix-blend-difference` effect. Screen readers read it twice.
- The email address and its **Copy** button appear only on hover, so touch users cannot copy it.
- The hero uses `h-screen`. On iOS the height jumps when the address bar collapses.

## Steps

### 1. Subtract the analytics and the banner

1. Delete `src/components/CookieBanner.tsx` and `src/utils/analytics.ts`.
2. Remove the `gtag` snippet and the Metal Mania `<link>` from `index.html`.
3. Remove `react-ga4` and every `trackEvent` call.
4. Remove `VITE_GA_MEASUREMENT_ID` from `.github/workflows/release.yml`.

**Check.** `pnpm build` passes. `grep -r "google" dist` finds nothing.

### 2. Lay the foundation

1. Set `base: "/"` in `vite.config.ts`.
2. Add `@fontsource-variable/anybody` and `@fontsource-variable/instrument-sans`. Import the `latin` and `latin-ext` subsets, because "Ł" is in `latin-ext`.
3. Move the canvas tokens into a Tailwind v4 `@theme` block in `src/index.css`. Keep the token names: `--color-ground`, `--color-ink`, `--color-sheet`, `--color-paper`, `--color-soft`, `--color-dim`, `--color-rule`, `--color-raised`, `--color-live`, `--color-soon`, the `--text-*` scale and the `--radius-*` values.
4. Add a skip link and a visible `:focus-visible` style.

**Check.** A test page renders "Kamil Pułka" in Anybody, with the Ł from the font and not a fallback. The network tab shows no third-party requests.

### 3. Prerender every route

Move to React Router 7 framework mode with `ssr: false` and a `prerender` list. GitHub Pages then serves real HTML for each route with status 200. The `scripts/copy-404.js` trick goes away.

1. Routes: `/`, `/projects/:slug`, `/privacy`, and a catch-all that renders the 404 page.
2. Build the `prerender` list from the project data, so a new project gets its page with no route edits.
3. Give each route its own `<title>`, description, canonical URL and Open Graph tags.
4. Write `404.html` from the 404 route, so unknown paths get the designed page.

**Check.** `dist/projects/novice/index.html` exists and contains the project name in plain HTML. `pnpm preview` serves `/projects/novice` with status 200.

### 4. Model the projects as data

Each project is one file in `src/content/projects/<slug>.ts`, typed by `src/content/schema.ts`:

```ts
type ProjectType = "extension" | "web" | "mobile" | "plugin";

interface Project {
	slug: string;
	name: string;
	type: ProjectType;
	pitch: string;          // one line, on the card
	summary: string;        // the paragraph on the project page
	platforms: string;      // "Chrome and Firefox"
	builtWith: string[];
	links: { github?: string; website?: string; releases?: string };
	stores?: { chromeId?: string; amoSlug?: string; playId?: string };
	githubRepo?: string;    // "kpulka247/novice", for release and download stats
	cover: { device: "browser" | "window" | "phone"; tint: string; icon?: string; screen: string };
	features: { name: string; text: string }[];
	screenshots: { src: string; alt: string; caption?: string }[];
	order: number;          // newest first
	earlier?: boolean;      // true puts it under "Earlier work"
}
```

`scripts/make-covers.mjs` copies the cover and screenshot images from the project repos into `src/assets/projects/<slug>/` and writes them as WebP, so the build needs no image plugin. The Gifoji wordmark is the outlined SVG, so it does not depend on the visitor having Arial Black. Source files:

| Project | Icon | Cover window | Cover front piece | Project page screenshots |
| --- | --- | --- | --- | --- |
| NoVice | `novice/static/store/store-icon-128.png` | `novice/static/images/screenshot-hover.png` | The popup, cut from `static/images/screenshot.png` at x 948 to 1268, y 12 to 334 | `static/images/across-the-web.png`, `screenshot.png`, `screenshot-search.png` |
| Gifoji | `gifoji/apps/web/public/brand/icon-512.png` | A gallery built from `public/showcase/hero/left-01-still.webp`, `right-04-still.webp` and `presets/style/{stained-glass-mosaic,clay-stop-motion,voxel-art,glitch-art-datamosh}.webp`, with `brand/gifoji-wordmark.svg` | None | The same set |
| Polsimer F74LED | The three-LED mark, drawn in CSS | The plugin panel, cut from `polsimer-simhub-plugin/docs/images/settings_preview.png` at x 196 to 1180, y 32 to 492 (no sidebar, no title bar), then extended to 16:10 in the panel colour `#252525` | None | `docs/images/led_effects.gif` (convert to MP4 or WebM) |
| Dark Connect | `dark-connect/static/store/store-icon-128.png` | `dark-connect/static/images/screenshot.png` | The popup, cut from the same file at x 948 to 1253, y 12 to 399 | `static/images/screenshot-training.png`, `screenshot-hrv.png`, `screenshot-challenges.png` |

`scripts/make-covers.mjs` makes every crop above with `sharp`: it cuts the popups and rounds their corners, and it cuts and extends the Polsimer panel. Rerun it when a source screenshot changes. The Gifoji cover uses `depth: "shallow"` with a square gallery screen, so two full rows show and the gallery still runs off the bottom edge. Every other window uses `depth: "deep"`. Together these keep the UI at a similar size on every cover.
| do nothing | `do-nothing/store/google-play/icon-512.png` | `store/app-store/screenshots-6.9/3-waiting.png` (1320 by 2868, the shape of a current phone) | `store/app-store/screenshots-6.9/1-intro.png`, `2-idle.png`, `5-done.png` |

The do nothing repository is private. The images listed above are its public store assets. Nothing else from that repository goes on the site.

**Check.** `pnpm typecheck` passes. A unit test loads every project file and confirms that each image path resolves.

### 5. Pull store numbers at build time

`scripts/fetch-stats.mjs` runs at the start of `pnpm build`. It reads the store IDs and GitHub repos from `src/content/sources.json`, the one file the project data and the script share, and fetches the matching shields.io JSON endpoints:

- `chrome-web-store/users/<id>` and `chrome-web-store/rating/<id>`
- `amo/users/<slug>` and `amo/rating/<slug>`
- `github/downloads/<repo>/total` and `github/v/release/<repo>`

Google Play has no shields.io badge, so the script checks whether the app's store page answers 200 or 404. It writes `src/content/stats.json`, only when a value changed. That file is committed, so the build always has the last known values. `src/content/status.ts` turns the stats into the card status and the store buttons.

The script applies these rules:

1. If a store endpoint answers "not found", that store counts as not listed.
2. If no store is listed and the project has a store field, the status is **Coming to <stores>** in amber. Otherwise the status is **Live** in green.
3. Show a user count only when the stores together have 100 users or more. Show a rating only when the count is shown.
4. Show a download count only when it is 100 or more. Otherwise show the version.
5. If a request fails or times out after 10 seconds, keep the previous value for that field and print a warning. Never fail the build over stats.
6. Show a store button only when that store's listing exists.

Values on 15 November 2026:

| Project | Chrome | Firefox | GitHub | Status the rules produce |
| --- | --- | --- | --- | --- |
| Dark Connect | 1k users, 5/5 | 192 users, 5/5 | v2.7.1 | Live, 1k+ users, rated 5/5 |
| NoVice | not found | not found | v1.2.0 | Coming to Chrome and Firefox |
| Polsimer F74LED | n/a | n/a | v1.0.0, 4 downloads | Live, version 1.0.0 |

Add a weekly `schedule` trigger and a `workflow_dispatch` trigger to `release.yml`, so the numbers refresh without a commit. When nothing changed, `semantic-release` publishes nothing, so a scheduled run only rebuilds and deploys.

**Check.** Unit tests cover rules 1 to 6 with recorded responses. `pnpm build` with the network off still passes and uses the committed values.

### 6. Build the sections

Build in this order, and compare each section with its Doop frame at 1280 px and 390 px before you move on:

1. `Navbar` and the phone menu (`Menu open · phone`). The menu is a dialog: it traps focus, closes on Escape and returns focus to the button.
2. `Work`: the filter chips, the grid and **Earlier work**. Filter state lives in the URL (`?type=extension`), so a filtered view can be shared. The newest project spans two columns on desktop.
3. `ProjectCard` and `ProjectCover`, from the Doop components of the same names. Each cover has three layers:
	- The product icon, top-left at 24 px.
	- The product window. It starts 92 px from the left edge, right of the icon column, so the two never touch at any size. It is 160% of the cover width (`depth: "deep"`) or `122cqw - 92px` (`depth: "shallow"`), and it runs off the bottom-right corner. A phone frame aligns right instead and takes its size from the cover height.
	- An optional front piece that floats fully in view. Only the extensions use one: their own popup, for NoVice and Dark Connect.
4. `Stack`, from `src/data/stack.ts`. Use `react-icons` (`SiTypescript`, `SiClaude` and the others). Each item has a note that names where the tool was used.
5. `About`, with the photo moved to `src/assets/` and the Instagram link in the last paragraph.
6. `Contact`. **Copy address** is a real button. It shows "Copied" for 2 seconds and announces the change through `aria-live`.
7. `Footer`.

Keep motion to the one hero load sequence. The black sheet slides over the hero with CSS `position: sticky` and no scroll listeners. Respect `prefers-reduced-motion`.

**Check.** A Playwright test opens `/` at widths 320, 375, 390, 414, 768, 1024, 1280, 1440 and 1920. At each width it confirms there is no horizontal scroll and no console error, and it saves a screenshot for review.

### 7. Build the project pages

`src/pages/ProjectPage.tsx` renders the layout of the NoVice frame: name, tagline, summary, links, facts column, screenshots, **What it does** and **Next project**. All content comes from the project file and `stats.json`. A project's `screenshotLayout` picks how its screenshots show: `stack` puts the first one full width and the rest in captioned rows, and `grid` puts them side by side, for phone screens and small tiles.

`src/routes.ts` adds one static route per file in `src/content/projects/`, not one `projects/:slug` route. GitHub Pages answers an unknown path with `404.html`, which is rendered for the `*` route, and a dynamic route would match an unknown slug in the browser and fail to hydrate.

**Check.** All five pages prerender, and each one matches the NoVice frame's layout at 1280 px and 390 px.

### 8. Build the hero

`src/hero/pinBoard.ts` is a plain three.js module with `mount(canvas, options)` and `dispose()`. React lazy-loads it after first paint. The copy stays in normal HTML above the canvas.

- **Board.** One `InstancedMesh` of pins plus a height field. The field is a slow swell, a press under the pointer, and a slow automatic press after 4 seconds without input. Pins rise back over about 1 second.
- **Play.** A `button` with `aria-pressed`. Pressing it drops the car. W A S D and the arrow keys steer it, or the visitor holds on the board. Escape or **Stop** ends the game. The keys work only while the game is on, so they never take over page scrolling.
- **Car.** The car stays inside the visible part of the board and bounces off its edge. On a touch screen the hint says to hold on the board, and holding does not select text or open the long-press menu.
- **Presses.** Pins ease towards a press instead of snapping to it. The automatic press fades in over 2 seconds.
- **Size.** Pin count follows the viewport: about 4,100 on a 16:9 desktop and about 1,700 on a phone. Wider screens, up to 32:9, get more columns, so the board's sides stay off screen. Device pixel ratio is capped at 1.5.
- **Cost.** Rendering stops when the hero leaves the viewport or the tab is hidden.
- **Fallbacks.** Without WebGL 2, with `prefers-reduced-motion`, or on a device that draws the board's first frames slower than 24 fps, the board shows a still image of the pins. The speed is measured rather than guessed from `navigator.hardwareConcurrency`, because Safari caps that value and would send every iPhone to the fallback. The still image is a build-time capture of the board, so it matches the live one. `scripts/capture-hero.mjs` makes it: it opens the home page on the dev server at a desktop and a phone size and saves the canvas to `src/assets/hero/`. Every visitor sees the still image first, and the live board fades in over it once its first frame is drawn.
- **Height.** The hero uses `100svh`, so it does not jump on iOS.

**Check.** The hero holds 60 fps on a mid-range Android phone in Chrome remote debugging. The Lighthouse performance score on mobile is 90 or more. With reduced motion on, nothing animates.

### 9. Delete the old code

Delete `InteractiveCard.tsx`, `MovingLight.tsx`, `InteractiveBg.tsx`, `src/shaders/`, `TypingEffect.tsx`, `useTypingEffect.ts`, `SectionHeader.tsx`, `ScrollLink.tsx`, `Loader.tsx`, the old `src/sections/` files and `src/types/project.ts`. Remove `@react-three/fiber`, `@react-three/drei`, `@react-spring/three`, `vite-plugin-glsl` and `framer-motion`.

**Check.** `pnpm build` passes. The JavaScript loaded before the hero chunk is under 120 KB gzipped. Report the before and after sizes in the pull request.

### 10. Search and sharing

1. Generate `sitemap.xml` and `robots.txt` from the route list.
2. Add `Person` JSON-LD on `/` with the name, job title, the GitHub URL and the LinkedIn URL.
3. Give each project page an Open Graph image: its cover rendered at 1200 by 630 by a Playwright script at build time.

**Check.** The LinkedIn Post Inspector and the Rich Results Test show the right title, description and image for `/` and `/projects/novice`.

### 11. Analytics

After the redesign is live:

1. In the Cloudflare dashboard, open **Analytics & Logs**, then **Web Analytics**, then **Add a site**.
2. Enter `kpulka.com`. DNS stays at OVH, so choose the JavaScript snippet option.
3. Copy the token. Save it in GitHub as a repository variable named `CF_BEACON_TOKEN` (**Settings**, **Secrets and variables**, **Actions**, **Variables**). It is public in the page source, so it does not need to be a secret.
4. The build adds the beacon `<script>` only when `CF_BEACON_TOKEN` is set.

To remove after the switch:

- The repository secret `VITE_GA_MEASUREMENT_ID`.
- The GA4 property, in Google Analytics under **Admin**, **Property settings**, **Move to trash**. It holds no data you need after the switch.

**Check.** After deploy, Cloudflare shows visits within 10 minutes. DevTools shows no cookies and no `localStorage` keys for kpulka.com.

### 12. README

Rewrite `README.md` for two readers: a recruiter who opens the repository from the site, and a developer who wants to run it. The order:

1. A screenshot of the hero and a one-line description, with the link to kpulka.com.
2. What the site does: the pin board, prerendered project pages and build-time store numbers.
3. Tech stack, as a short list.
4. Run it locally: `pnpm install` and `pnpm dev`.
5. **Add a project**: a how-to with the data file, the images and the store IDs.
6. Project structure: a short tree of `src/`.
7. Deployment and releases: GitHub Pages, semantic-release and the weekly stats rebuild.
8. License.

Keep two badges: the workflow status and the latest release.

**Check.** A fresh clone builds by following only the README.

## Order of pull requests

The redesign ships as version 2.0.0. The last commit on `redesign`, after step 12, is `feat!: launch the redesigned site` with a `BREAKING CHANGE:` footer. semantic-release reads that commit and releases 2.0.0 when `redesign` reaches `main`. A footer on the merge commit is not enough, because merge commit headers do not follow the Conventional Commits format.

Each step above is one pull request into `redesign`, in the order listed. Steps 1 and 9 only delete code, so they are easy to review. Merge `redesign` into `dev`, then into `main`, after step 12 and a pass through the device matrix:

| Device | Browser |
| --- | --- |
| iPhone SE and iPhone 15 | Safari |
| Pixel 7 or similar | Chrome |
| iPad, portrait and landscape | Safari |
| Windows laptop at 1366 px | Chrome, Edge and Firefox |
| Mac at 1440 px and 1920 px | Safari and Chrome |

## Open questions

- Should the Polsimer card link to its GitHub releases page, or to a project page with install steps?
- When NoVice gets its store listings, should it keep the two-column spot, or should the newest live project take it?
