## [2.0.1](https://github.com/kpulka247/portfolio-kpulka/compare/v2.0.0...v2.0.1) (2026-11-17)

### Bug Fixes

* **nav:** keep the bar off the top edge so iOS Safari can't copy it ([9a9f8c5](https://github.com/kpulka247/portfolio-kpulka/commit/9a9f8c575836cccfffba05f737d84f21c72415c1))
* **scroll:** open the page at the top after a reload ([eeac739](https://github.com/kpulka247/portfolio-kpulka/commit/eeac739c9c1754be90d0bb9474426db8c2425b5a))

## [2.0.0](https://github.com/kpulka247/portfolio-kpulka/compare/v1.4.0...v2.0.0) (2026-11-17)

### ⚠ BREAKING CHANGES

* the site is rebuilt on React Router with prerendered
pages, a new design in light and dark mode, an interactive hero game and
a page for every project. The old site's code, packages, Google Analytics
and cookie banner are removed.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>

### Features

* add a dark mode, with the SUV's lights on at night ([f6b9567](https://github.com/kpulka247/portfolio-kpulka/commit/f6b95677be094123f639586fdd7d0fb769bc6838))
* add a page for every project ([39d577d](https://github.com/kpulka247/portfolio-kpulka/commit/39d577d7025bc9139e24938152d7687792116617))
* add a sitemap, structured data and link previews ([7fac9cb](https://github.com/kpulka247/portfolio-kpulka/commit/7fac9cbc2ae6ba4ee871921e3b2cb0c0a38ef0ba))
* add burnouts, donuts and drifts with lit tyre smoke ([8fa608e](https://github.com/kpulka247/portfolio-kpulka/commit/8fa608e33b5bb91bf47a60857928701e757ddae8))
* add Cloudflare Web Analytics and rewrite the privacy page ([5c495a1](https://github.com/kpulka247/portfolio-kpulka/commit/5c495a197adb7440b7e331311da855b23f9f6bde))
* add self-hosted fonts, design tokens and a skip link ([79d1669](https://github.com/kpulka247/portfolio-kpulka/commit/79d1669b253c289beab6fd9a3423ceafb0ac87e6))
* add the do nothing privacy policy ([2a4a9d4](https://github.com/kpulka247/portfolio-kpulka/commit/2a4a9d4f0d40d1b3e4c9464ac45da35614149840))
* add the pin board hero with Play ([3a8ca95](https://github.com/kpulka247/portfolio-kpulka/commit/3a8ca955fd0b9aff66027ec681002a295524affa))
* build the redesigned home page sections ([e399236](https://github.com/kpulka247/portfolio-kpulka/commit/e3992365b16b8624c6d35fc1f30c75b7c1864708))
* close the page with one About and Contact panel ([febe099](https://github.com/kpulka247/portfolio-kpulka/commit/febe0995a078a49b9667deb76caf50e657d9fc8a))
* darken the SUV with the scene at night ([01b010f](https://github.com/kpulka247/portfolio-kpulka/commit/01b010f2bfd7ffbe5e210031a834f2e5aad8a749))
* dent the board when the SUV lands from a fall ([d152016](https://github.com/kpulka247/portfolio-kpulka/commit/d1520164bb52aa311341eb9565aec68dcd2d8e19))
* give each of the SUV's four lamps its own light ([e40ac2c](https://github.com/kpulka247/portfolio-kpulka/commit/e40ac2c38c9c65390c4d92a97aa6c56fbe344e26))
* **hero:** fade the board in quickly when its first frame is drawn ([25f9ca1](https://github.com/kpulka247/portfolio-kpulka/commit/25f9ca1211409ca3de7df2b567edf2618b861794))
* **hero:** fine-grid board with ink obstacles and a two-tone car ([ddd6981](https://github.com/kpulka247/portfolio-kpulka/commit/ddd69818ae7e7aab0a097fe742a9e046aa3169b3))
* **hero:** raise the board on load and drift it up while scrolling ([9bd2f2c](https://github.com/kpulka247/portfolio-kpulka/commit/9bd2f2c2178e548e679ad6e2278ad7419f83cfc9))
* **images:** join both themes in the banner and redraw the previews ([8cfef6d](https://github.com/kpulka247/portfolio-kpulka/commit/8cfef6d38d2c304b0bc736029e72c508022cd3e1))
* light the SUV's brake lights ([48db04d](https://github.com/kpulka247/portfolio-kpulka/commit/48db04d6da7681e59fdef5bf418ce31256da925c))
* model the projects as data with images from their repos ([fa01c75](https://github.com/kpulka247/portfolio-kpulka/commit/fa01c754eab11d1c79843da408c1b5c380671e8e))
* **motion:** animate page changes, the work filter and the phone menu ([bad86d8](https://github.com/kpulka247/portfolio-kpulka/commit/bad86d8cc65b2be94dcbac7ba11453c489392d45))
* **motion:** move between pages as the site's sheet, without moving text ([e460aa4](https://github.com/kpulka247/portfolio-kpulka/commit/e460aa4345e39c40d2787249733731d1ba23b06d))
* **motion:** replace fades with instant changes and a few moves ([ea7c1cd](https://github.com/kpulka247/portfolio-kpulka/commit/ea7c1cd10ec2ab881377f5f76e13255c815e4adf))
* **nav:** draw the nav in ink over the ground ([7bd59da](https://github.com/kpulka247/portfolio-kpulka/commit/7bd59da536cf9bd919a72d10d293722bdacdf849))
* neutral headlights and a trampoline landing ([a98e481](https://github.com/kpulka247/portfolio-kpulka/commit/a98e48161dcac5ab0ab094163d1efc10db00c9c5))
* **pages:** open project, privacy and 404 pages on the ground ([e65a545](https://github.com/kpulka247/portfolio-kpulka/commit/e65a5453201ef9c86a66e5f02cf87be4f61ca879))
* prerender every route with React Router framework mode ([408548e](https://github.com/kpulka247/portfolio-kpulka/commit/408548e8d862b0b581f5249bf099573c4fe6d30b))
* pull store numbers at build time ([883224b](https://github.com/kpulka247/portfolio-kpulka/commit/883224b595836b8d80fb416d54f85f36638687bb))
* rebuild kpulka.com from scratch ([385c027](https://github.com/kpulka247/portfolio-kpulka/commit/385c027ef03d5d48c22162b6f2de6b07956a8ea0))
* replace the site icon and refine the README ([15f2264](https://github.com/kpulka247/portfolio-kpulka/commit/15f22642936045230598d440d554bd1d1ac45481))
* rework the hero game into a fair, gradual drive ([e7cbee7](https://github.com/kpulka247/portfolio-kpulka/commit/e7cbee7d811eb7edafaf8cc36598f842c891a072))
* ride the board's waves rigidly and lean only from driving ([67b8c63](https://github.com/kpulka247/portfolio-kpulka/commit/67b8c63af118ed9c64acb62c6b85111c66e9a533))
* scale the landing dent with the height of the drop ([3991e5c](https://github.com/kpulka247/portfolio-kpulka/commit/3991e5c3230cbe74bca171ca12c13224be5bf80d))
* stiffen the coupe and stop donuts when the burnout ends ([644d2d0](https://github.com/kpulka247/portfolio-kpulka/commit/644d2d0d47fbc0d7fc634de60ef58c3d162db768))
* swap the SUV for a low Japanese sports coupe ([09821b2](https://github.com/kpulka247/portfolio-kpulka/commit/09821b2060b27f19b0e3fe629e26726a599e4c60))
* switch dark mode to warm graphite ([601ed7f](https://github.com/kpulka247/portfolio-kpulka/commit/601ed7fb646063d1b07eaf1233b722c93f3dcc27)), closes [#3b3835](https://github.com/kpulka247/portfolio-kpulka/issues/3b3835)
* switch the SUV's lights on and off at once ([d5b0ad0](https://github.com/kpulka247/portfolio-kpulka/commit/d5b0ad05558c191a6df06eb4f9c4b92a8e819f15))
* **theme:** give light and dark one warm palette and borderless controls ([ab32f84](https://github.com/kpulka247/portfolio-kpulka/commit/ab32f84fabc972b86348348445d4d4427e9b458f))
* turn the hero into an endless drive with pillars ([8c8db8e](https://github.com/kpulka247/portfolio-kpulka/commit/8c8db8ee0e9b6872d4e7fb04db91d3a138393dee))
* widen the coupe's cabin and move the pop-ups out ([4fc1464](https://github.com/kpulka247/portfolio-kpulka/commit/4fc1464bfb32df4d555bf53779247c4b3b3b46e6))

### Bug Fixes

* brake gently against the throttle and keep overlapping dents ([b53d3ec](https://github.com/kpulka247/portfolio-kpulka/commit/b53d3ec85e8dccaa9f5ffa72267bc1af073fdbbf))
* dark Safari bars, a matching board before load, no menu outline ([fffed90](https://github.com/kpulka247/portfolio-kpulka/commit/fffed90c1ecf388c7b2fe91e135c490df30f219e))
* drop the board's far edge away and keep the SUV compact ([dabf48c](https://github.com/kpulka247/portfolio-kpulka/commit/dabf48c7beb40cd6fa8679a4a458b9587093f58d))
* give the SUV the night board's warm tint ([b518992](https://github.com/kpulka247/portfolio-kpulka/commit/b518992126d419ce8ede1161aaa22e3819660b01))
* **hero:** fade the Play row in with the board ([cde5e4a](https://github.com/kpulka247/portfolio-kpulka/commit/cde5e4ab461feaa6ba9598117d585a45e8681f3c))
* **hero:** light the tyre smoke from the car's real lamps ([665db86](https://github.com/kpulka247/portfolio-kpulka/commit/665db86875fcea931a128f00d23b525f8de4b6e6))
* **hero:** lighten the tyre smoke at night ([abd0642](https://github.com/kpulka247/portfolio-kpulka/commit/abd0642f3d234e2dcea692d1c8617b3a01dfa51a))
* keep dark mode warm and drop Play's focus ring after a click ([e5fd2e3](https://github.com/kpulka247/portfolio-kpulka/commit/e5fd2e329fa8a9935c636cfd97fcde1b1162aa7c))
* keep the hero name on its lines and the car in view ([a865208](https://github.com/kpulka247/portfolio-kpulka/commit/a8652087b2d2d87e6f29364f586b73b3be91c8c0))
* keep the Play button and hint above the hero fade ([90ca525](https://github.com/kpulka247/portfolio-kpulka/commit/90ca5259943f5f4e32f4141082970fa67c41ee53))
* keep the SUV clear of the hero's bottom fade ([700514c](https://github.com/kpulka247/portfolio-kpulka/commit/700514cec1107e854f3c8ff9bd6ebd61d1a5e6e4))
* lean the SUV away from the turn ([4bed8cb](https://github.com/kpulka247/portfolio-kpulka/commit/4bed8cb452808b1d7ea0cd7e01ef490f1a3a31af))
* make the SUV's landings, donuts and smoke behave like a real car ([437220c](https://github.com/kpulka247/portfolio-kpulka/commit/437220cdb4ed94ec0a74d05eae957c6576223d27))
* **motion:** fly one sharp project name without a scroll under it ([6403c37](https://github.com/kpulka247/portfolio-kpulka/commit/6403c37a1872ca823d3def39760edb00f46b8ee7))
* **motion:** open home at once, keep the nav still, fade the Play row ([78df9d0](https://github.com/kpulka247/portfolio-kpulka/commit/78df9d0c01f24190559e19365eac5187d09609f0))
* **nav:** open the home page at its section without scrolling ([5de3259](https://github.com/kpulka247/portfolio-kpulka/commit/5de32593f724d599434862f0c6c0cbc01ef30879))
* **nav:** scroll to sections on every hash link, in every browser ([5660e41](https://github.com/kpulka247/portfolio-kpulka/commit/5660e41805acbc244b32130b5db38b292292c0b6))
* set the body text in Instrument Sans ([4d1709d](https://github.com/kpulka247/portfolio-kpulka/commit/4d1709d0c2f269d93babfe11b1ae21fcacf0ecdf))
* smooth the board's presses and fit it to wide screens ([2e56e08](https://github.com/kpulka247/portfolio-kpulka/commit/2e56e08825d914bd94532442061e350d2a34212c))
* smooth the hero game's entrances, horizon and wheels ([cff717d](https://github.com/kpulka247/portfolio-kpulka/commit/cff717d4754cf3ab109539c5980a20c5af18a46b))
* soften the hero fade at the play area's edge ([b037e6c](https://github.com/kpulka247/portfolio-kpulka/commit/b037e6cd052abc277d6d37f04cd0cf11abc2c493))
* stop landing dents setting each other off ([3d4f6ba](https://github.com/kpulka247/portfolio-kpulka/commit/3d4f6baf7beb2fc6d2266afc746400edbf6bd80a))
* stop the hero game freezing after a crash restart ([8014e11](https://github.com/kpulka247/portfolio-kpulka/commit/8014e1149300ca9d2353d67cda1dd09f4de2d526))
* switch the SUV's lights when the fade looks finished ([41b0867](https://github.com/kpulka247/portfolio-kpulka/commit/41b0867bbd3eb01a831563c5bb4e8d4bfd595e5b))
* tone the night board down to a neutral warm grey ([629ac5b](https://github.com/kpulka247/portfolio-kpulka/commit/629ac5bd208ab9e7019486005adea83b4ef376d5))
* **work:** keep the filter chips responsive during the glide ([99d6320](https://github.com/kpulka247/portfolio-kpulka/commit/99d6320d4e1bf7e7aa0141462009885d07bfbf19))

## [1.4.0](https://github.com/kpulka247/portfolio-kpulka/compare/v1.3.9...v1.4.0) (2026-07-17)

### Features

* **skills:** refresh skills showcase ([a666c58](https://github.com/kpulka247/portfolio-kpulka/commit/a666c58e493d5a7a98b0b4047ce1feb021c4a934))

### Performance Improvements

* optimize initial page rendering ([bbc1760](https://github.com/kpulka247/portfolio-kpulka/commit/bbc1760d1ca488400f09cee3bb286df5697aa312))

## [1.3.9](https://github.com/kpulka247/portfolio-kpulka/compare/v1.3.8...v1.3.9) (2026-04-21)

### Bug Fixes

* **projects:** Refine themed project cards and interactive motifs ([8bcfd77](https://github.com/kpulka247/portfolio-kpulka/commit/8bcfd77ae3096990115a627e5ed0f83eb41519d5))

## [1.3.8](https://github.com/kpulka247/portfolio-kpulka/compare/v1.3.7...v1.3.8) (2025-11-24)

### Bug Fixes

* Adjust smoke intensity ([1174048](https://github.com/kpulka247/portfolio-kpulka/commit/1174048854fd577320de5ccec6ce47ae81391cea))
* Fix card scaling bug ([f61b74b](https://github.com/kpulka247/portfolio-kpulka/commit/f61b74bd39e57c14e57dacf7986bef33c43177bd))

## [1.3.7](https://github.com/kpulka247/portfolio-kpulka/compare/v1.3.6...v1.3.7) (2025-10-11)

### Bug Fixes

* **refactor:** Centralize touch detection with useIsTouchDevice hook ([6dde09e](https://github.com/kpulka247/portfolio-kpulka/commit/6dde09ec505721ce43cd62928667848412653d70))

## [1.3.6](https://github.com/kpulka247/portfolio-kpulka/compare/v1.3.5...v1.3.6) (2025-10-09)

### Bug Fixes

* **privacy:** Clarify distinction between event tracking and data collection ([84e431b](https://github.com/kpulka247/portfolio-kpulka/commit/84e431b49a8c721d69368caf397b4765043f6e5e))

## [1.3.5](https://github.com/kpulka247/portfolio-kpulka/compare/v1.3.4...v1.3.5) (2025-10-09)

### Bug Fixes

* Adjust consent banner and scroll button placement ([07d1c46](https://github.com/kpulka247/portfolio-kpulka/commit/07d1c46518855ed0fe048bf94b0e464654933d6a))

## [1.3.4](https://github.com/kpulka247/portfolio-kpulka/compare/v1.3.3...v1.3.4) (2025-10-09)

### Bug Fixes

* Fix card click double redirect ([680b4cf](https://github.com/kpulka247/portfolio-kpulka/commit/680b4cff3e7b09df7ccb2b3524adf0694125bbca))
* **ux:** Disable auto-translation to prevent rendering bug ([452568f](https://github.com/kpulka247/portfolio-kpulka/commit/452568f954e77b002807414e818eafd787be13e6))

## [1.3.3](https://github.com/kpulka247/portfolio-kpulka/compare/v1.3.2...v1.3.3) (2025-10-02)

### Bug Fixes

* Optimize WebGL background scaling and visibility logic ([2ae8af1](https://github.com/kpulka247/portfolio-kpulka/commit/2ae8af1229e3ca1fda54d6e1164004179e08a17c))

## [1.3.2](https://github.com/kpulka247/portfolio-kpulka/compare/v1.3.1...v1.3.2) (2025-10-01)

### Bug Fixes

* Improve touch screen detection ([8077dae](https://github.com/kpulka247/portfolio-kpulka/commit/8077dae6c82ac82b37289eda486c24ddb568dcd8))

## [1.3.1](https://github.com/kpulka247/portfolio-kpulka/compare/v1.3.0...v1.3.1) (2025-10-01)

### Bug Fixes

* Fix flicker on WebGL card load ([918fab8](https://github.com/kpulka247/portfolio-kpulka/commit/918fab80a86fba20b660e66b6e65d3602c823ce4))

## [1.3.0](https://github.com/kpulka247/portfolio-kpulka/compare/v1.2.1...v1.3.0) (2025-10-01)

### Features

* Add favicon ([224c159](https://github.com/kpulka247/portfolio-kpulka/commit/224c159e720474b0ce18328f9d0bbfa42463a9a8))
* **performance:** Implement lazy loading and enhance loading UX ([44e803b](https://github.com/kpulka247/portfolio-kpulka/commit/44e803b4a207bdfd622a2dfaa4adceab4b7c69b7))
* **ui:** Add users counter and store buttons ([991cfb9](https://github.com/kpulka247/portfolio-kpulka/commit/991cfb94c8fa5ec4977045d0832176d3a25fba41))

### Bug Fixes

* **ui:** Fix infinite slider loop ([a141c6d](https://github.com/kpulka247/portfolio-kpulka/commit/a141c6dd04ec84c4ee76cc1dd93c0799e7060b1f))

## [1.2.1](https://github.com/kpulka247/portfolio-kpulka/compare/v1.2.0...v1.2.1) (2025-09-30)

### Bug Fixes

* Fix touch and mobile compatibility ([3a53fd3](https://github.com/kpulka247/portfolio-kpulka/commit/3a53fd36227fff961c08b938fb42a5d4fc542c8b))

## [1.2.0](https://github.com/kpulka247/portfolio-kpulka/compare/v1.1.1...v1.2.0) (2025-09-30)

### Features

* Add responsiveness and mobile support ([0772b96](https://github.com/kpulka247/portfolio-kpulka/commit/0772b968d08d7498aeb254f91e0c0612a21b2ed5))

### Bug Fixes

* **style:** Text style adjust ([2152f69](https://github.com/kpulka247/portfolio-kpulka/commit/2152f692c5fd59b2cbb4bb9c0eafadcb2a1b5ad7))

## [1.1.1](https://github.com/kpulka247/portfolio-kpulka/compare/v1.1.0...v1.1.1) (2025-09-30)

### Bug Fixes

* **style:** Text style adjust ([fc83f97](https://github.com/kpulka247/portfolio-kpulka/commit/fc83f972ac8062e8b22b1158e9a117cf85587256))

## [1.1.0](https://github.com/kpulka247/portfolio-kpulka/compare/v1.0.3...v1.1.0) (2025-09-29)

### Features

* **privacy:** Add privacy policy page and GA4 tracking ([3689d69](https://github.com/kpulka247/portfolio-kpulka/commit/3689d6955f5a526d63fb98b0f0146317199a3f00))

## [1.0.3](https://github.com/kpulka247/portfolio-kpulka/compare/v1.0.2...v1.0.3) (2025-09-29)

### Bug Fixes

* **ci:** Fix workflow upload artifact job ([2c66cfa](https://github.com/kpulka247/portfolio-kpulka/commit/2c66cfa1ad5f48e3ccf047918d355ec0f4ede139))

## [1.0.2](https://github.com/kpulka247/portfolio-kpulka/compare/v1.0.1...v1.0.2) (2025-09-29)

### Bug Fixes

* **ci:** Fix deploy file path ([10d5b0d](https://github.com/kpulka247/portfolio-kpulka/commit/10d5b0d39d6360af2f029f7b63d7dd9808e26f1f))

## [1.0.1](https://github.com/kpulka247/portfolio-kpulka/compare/v1.0.0...v1.0.1) (2025-09-29)

### Bug Fixes

* **ci:** Fix deploy artifact path ([a1d7a0d](https://github.com/kpulka247/portfolio-kpulka/commit/a1d7a0d915415ef648fee32cbb657cdcb011318e))

## 1.0.0 (2025-09-29)

### Features

* Dynamic and responsive navbar ([e8ff355](https://github.com/kpulka247/portfolio-kpulka/commit/e8ff3552522514ce1594d76e00297e63fd5c1c13))
* First commit ([7b72664](https://github.com/kpulka247/portfolio-kpulka/commit/7b7266484818197f5fe68d2be5b2fa1d3f998e25))
* **structure:** Add initial project structure ([e2240b2](https://github.com/kpulka247/portfolio-kpulka/commit/e2240b2c74c490875ed3b54c9b2a9d9b2d04b1d5))
* **ui:** Add interactive 3D project preview card ([f239406](https://github.com/kpulka247/portfolio-kpulka/commit/f2394066db377cf86eed14029a668cf53d871f15))
* **ui:** Add interactive smoke background with WebGL ([e38ae61](https://github.com/kpulka247/portfolio-kpulka/commit/e38ae6131d7e0ace1e47c80a68bb83310fdb322b))
* **ui:** Add skills slider ([411e8fa](https://github.com/kpulka247/portfolio-kpulka/commit/411e8fa6bc7245fa42cbb0ffe0edda124e95a814))
* **ui:** Animate page elements on load ([dd9e022](https://github.com/kpulka247/portfolio-kpulka/commit/dd9e0226a1bff753201402d5ab44326309c38bde))
* **ui:** Design main sections with custom styles and functionality ([0e83aa8](https://github.com/kpulka247/portfolio-kpulka/commit/0e83aa84661675bab530da39f61039fb181315e8))
