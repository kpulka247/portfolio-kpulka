import { expect, test, type Page } from "@playwright/test";

// Holds W for a while and records the name's width and height as it goes.
// The car reaches the edge of the screen in about two seconds and bounces,
// so a single reading could miss the peak.
async function drive(page: Page) {
  const name = page.getByRole("heading", { level: 1 });
  const samples: { stretch: number; height: number }[] = [];
  await page.keyboard.down("w");
  for (let i = 0; i < 25; i++) {
    samples.push(
      await name.evaluate((el) => ({
        stretch: parseFloat(el.style.fontStretch) || 100,
        height: el.getBoundingClientRect().height,
      })),
    );
    await page.waitForTimeout(100);
  }
  await page.keyboard.up("w");
  return samples;
}

test.describe("live pin board", () => {
  test.skip(({ isMobile }) => isMobile, "keyboard driving is a desktop test");
  // Headless Chromium draws the board in software, which is slow, and
  // slower still with several boards at once.
  test.describe.configure({ mode: "serial", timeout: 90_000 });

  test("Play drops the car, the keys drive it, Escape stops it", async ({
    page,
  }) => {
    await page.goto("/");
    const play = page.getByRole("button", { name: "Play" });
    await play.waitFor({ timeout: 20_000 });
    await play.click();
    await expect(play).toHaveAttribute("aria-pressed", "true");

    const samples = await drive(page);
    expect(Math.max(...samples.map((s) => s.stretch))).toBeGreaterThan(102);

    await page.keyboard.press("Escape");
    await expect(play).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByRole("heading", { level: 1 })).not.toHaveAttribute(
      "style",
      /font-stretch/,
    );
  });

  // The name widens only as far as it still fits its lines.
  for (const width of [1120, 1440]) {
    test(`the name keeps its lines while driving at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const play = page.getByRole("button", { name: "Play" });
      await play.waitFor({ timeout: 20_000 });
      const name = page.getByRole("heading", { level: 1 });
      const before = await name.evaluate(
        (el) => el.getBoundingClientRect().height,
      );

      await play.click();
      const samples = await drive(page);
      expect(Math.max(...samples.map((s) => s.stretch))).toBeGreaterThan(102);
      for (const sample of samples) expect(sample.height).toBe(before);
    });
  }

  // A cancelled key event would stop the page from scrolling.
  test("the drive keys are left alone unless the game is on", async ({
    page,
  }) => {
    await page.goto("/");
    const play = page.getByRole("button", { name: "Play" });
    await play.waitFor({ timeout: 20_000 });
    const cancelled = () =>
      page.evaluate(
        () =>
          !window.dispatchEvent(
            new KeyboardEvent("keydown", {
              key: "ArrowDown",
              cancelable: true,
            }),
          ),
      );

    expect(await cancelled()).toBe(false);
    await play.click();
    expect(await cancelled()).toBe(true);
    await play.click();
    expect(await cancelled()).toBe(false);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("keeps the still image and offers no game", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const hero = page.locator('section[aria-label="Introduction"]');
    await expect(hero.locator("picture img")).toBeVisible();
    await expect(hero.locator("canvas")).toHaveClass(/opacity-0/);
    await expect(page.getByRole("button", { name: "Play" })).toHaveCount(0);
  });
});
