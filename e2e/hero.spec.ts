import { expect, test } from "@playwright/test";

test.describe("live pin board", () => {
  test.skip(({ isMobile }) => isMobile, "keyboard driving is a desktop test");

  test("Play drops the car, the keys drive it, Escape stops it", async ({
    page,
  }) => {
    await page.goto("/");
    const canvas = page.locator('section[aria-label="Introduction"] canvas');
    await expect(canvas).toHaveClass(/opacity-100/, { timeout: 20_000 });

    const play = page.getByRole("button", { name: "Play" });
    const name = page.getByRole("heading", { level: 1 });
    await play.click();
    await expect(play).toHaveAttribute("aria-pressed", "true");

    await page.keyboard.down("w");
    await expect
      .poll(() => name.evaluate((el) => parseFloat(el.style.fontStretch)))
      .toBeGreaterThan(100);
    await page.keyboard.up("w");

    await page.keyboard.press("Escape");
    await expect(play).toHaveAttribute("aria-pressed", "false");
    await expect(name).not.toHaveAttribute("style", /font-stretch/);
  });

  // A cancelled key event would stop the page from scrolling.
  test("the drive keys are left alone unless the game is on", async ({
    page,
  }) => {
    await page.goto("/");
    const play = page.getByRole("button", { name: "Play" });
    await play.waitFor();
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
