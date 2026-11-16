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
    await expect(page.getByText(/W A S D to drive/)).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(play).toHaveAttribute("aria-pressed", "false");
  });

  test("the hint leaves 5 s after the first input and returns on Play", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "keyboard test");
    await page.goto("/");
    const play = page.getByRole("button", { name: "Play" });
    await play.waitFor({ timeout: 20_000 });
    await play.click();
    const hint = page.getByText(/W A S D to drive/);
    await expect(hint).toBeVisible();
    // Steering alone counts as the first input.
    await page.keyboard.press("d");
    await page.waitForTimeout(3_500);
    await expect(hint).toBeVisible();
    await expect(hint).toBeHidden({ timeout: 6_000 });
    // The copy under the board stays the whole time.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.keyboard.press("Escape");
    await play.click();
    await expect(hint).toBeVisible();
  });

  test("rapid Play clicks end in a clean, running game", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "keyboard test");
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    const play = page.getByRole("button", { name: "Play" });
    await play.waitFor({ timeout: 20_000 });
    for (let i = 0; i < 7; i++) await play.click({ delay: 0 });
    await expect(play).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText(/W A S D to drive/)).toBeVisible();
    await expect(page.getByText(/Best \d+ m/)).toBeVisible();
    await play.click();
    await expect(play).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByText(/Best \d+ m/)).toBeHidden();
    expect(errors).toEqual([]);
  });

  test("clicking Play leaves no focus ring once the keys are used", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "keyboard test");
    await page.goto("/");
    const play = page.getByRole("button", { name: "Play" });
    await play.waitFor({ timeout: 20_000 });
    await play.click();
    await page.keyboard.press("w");
    await expect(play).not.toBeFocused();
  });

  test("nothing covers Play or the hint", async ({ page }) => {
    await page.goto("/");
    const play = page.getByRole("button", { name: "Play" });
    await play.waitFor({ timeout: 20_000 });
    await play.click();
    const hint = page.locator('p[aria-live="polite"]');
    await expect(hint).toBeVisible();
    for (const control of [play, hint]) {
      const onTop = await control.evaluate((element) => {
        const box = element.getBoundingClientRect();
        const top = document.elementFromPoint(
          box.left + box.width / 2,
          box.top + box.height / 2,
        );
        return element.contains(top);
      });
      expect(onTop).toBe(true);
    }
  });

  test("a touch screen gets the touch hint", async ({ page, isMobile }) => {
    test.skip(!isMobile, "needs a touch screen");
    await page.goto("/");
    const play = page.getByRole("button", { name: "Play" });
    await play.waitFor({ timeout: 20_000 });
    await play.tap();
    await expect(page.getByText(/Hold to drive/)).toBeVisible();
    await expect(page.getByText(/W A S D to drive/)).toHaveCount(0);
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

  test("shows one still frame of the real board and no game", async ({
    page,
  }) => {
    await page.goto("/");
    const hero = page.locator('section[aria-label="Introduction"]');
    await expect(hero.locator("canvas")).toHaveClass(/opacity-100/, {
      timeout: 20_000,
    });
    await expect(hero.locator("picture")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Play" })).toHaveCount(0);
  });
});
