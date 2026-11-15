import { expect, test } from "@playwright/test";

test.describe("live pin board", () => {
  // Headless Chromium draws the board in software, which is slow, and
  // slower still with several boards at once.
  test.describe.configure({ mode: "serial", timeout: 90_000 });

  test("Play starts the game and Escape stops it", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Escape needs a keyboard");
    await page.goto("/");
    const play = page.getByRole("button", { name: "Play" });
    await play.waitFor({ timeout: 20_000 });
    await play.click();
    await expect(play).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText(/W A S D/)).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(play).toHaveAttribute("aria-pressed", "false");
  });

  test("a touch screen gets the touch hint", async ({ page, isMobile }) => {
    test.skip(!isMobile, "needs a touch screen");
    await page.goto("/");
    const play = page.getByRole("button", { name: "Play" });
    await play.waitFor({ timeout: 20_000 });
    await play.tap();
    await expect(page.getByText(/Hold on the board/)).toBeVisible();
    await expect(page.getByText(/W A S D/)).toHaveCount(0);
  });

  // A cancelled key event would stop the page from scrolling.
  test("the drive keys are left alone unless the game is on", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "keyboard test");
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
