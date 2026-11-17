import { expect, test } from "@playwright/test";

const WIDTHS = [320, 375, 390, 414, 768, 1024, 1280, 1440, 1920];

test.describe("home page layout", () => {
  test.skip(({ isMobile }) => isMobile, "covers every width from desktop");
  // The live board renders in software in headless Chromium, which makes
  // full-page screenshots crawl. Layout does not depend on it, so these
  // tests use the still image. e2e/hero.spec.ts covers the live board.
  test.use({ reducedMotion: "reduce" });

  for (const width of WIDTHS) {
    test(`no horizontal scroll at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
      // Lazy images load only near the viewport, so scroll through first.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo({ top: y, behavior: "instant" });
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        await Promise.all(
          Array.from(document.images).map((image) =>
            image.decode().catch(() => {}),
          ),
        );
        // The page scrolls smoothly, so jump back instantly before capturing.
        window.scrollTo({ top: 0, behavior: "instant" });
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        );
      });
      const skipLink = await page
        .getByRole("link", { name: "Skip to content" })
        .boundingBox();
      expect(skipLink && skipLink.y + skipLink.height).toBeLessThanOrEqual(0);
      const broken = await page.evaluate(() =>
        Array.from(document.images)
          .filter((image) => image.naturalWidth === 0)
          .map((image) => image.src),
      );
      expect(broken).toEqual([]);
      await page.screenshot({
        path: `test-results/screens/home-${width}.png`,
        fullPage: true,
      });
    });
  }
});

test("a filter chip narrows the grid and survives a reload", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  const cards = page.locator("#work .project-card");
  await expect(cards).toHaveCount(5);

  await page.getByRole("button", { name: /Browser extensions/ }).click();
  await expect(cards).toHaveCount(2);
  await expect(page).toHaveURL(/\?type=extension$/);

  await page.reload();
  await expect(cards).toHaveCount(2);
  await expect(
    page.getByRole("button", { name: /Browser extensions/ }),
  ).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: /^All/ }).click();
  await expect(cards).toHaveCount(5);
  expect(errors).toEqual([]);
});

test("a reload opens the page at the top", async ({ page }) => {
  await page.goto("/#contact");
  await expect(page.locator("#contact-heading")).toBeInViewport();
  await page.reload();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("h1")).toBeInViewport();
  expect(await page.evaluate(() => scrollY)).toBe(0);
});

test.describe("phone menu", () => {
  test.skip(({ isMobile }) => !isMobile, "the menu button shows on phones");

  test("opens, closes on Escape and returns focus", async ({ page }) => {
    await page.goto("/");
    const openButton = page.getByRole("button", { name: "Open menu" });
    await openButton.click();
    const menu = page.getByRole("dialog", { name: "Menu" });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link", { name: /Work/ })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(openButton).toBeFocused();
  });

  test("a menu link closes the menu and scrolls to its section", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page
      .getByRole("dialog")
      .getByRole("link", { name: "Contact", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.locator("#contact-heading")).toBeInViewport();
  });
});
