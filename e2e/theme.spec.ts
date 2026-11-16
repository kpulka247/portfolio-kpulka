import { expect, test } from "@playwright/test";

const theme = (page: import("@playwright/test").Page) =>
  page.evaluate(() => document.documentElement.dataset.theme);

test.describe("theme", () => {
  test.use({ reducedMotion: "reduce" });

  test("follows the system setting by default", async ({ browser }) => {
    for (const colorScheme of ["light", "dark"] as const) {
      const page = await browser.newPage({ colorScheme });
      await page.goto("/");
      expect(await theme(page)).toBe(colorScheme);
      await page.close();
    }
  });

  test("the nav switch flips the theme and remembers it", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "the desktop nav");
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await page.getByRole("button", { name: "Switch to dark mode" }).click();
    expect(await theme(page)).toBe("dark");

    // Set before the page paints, so a reload never flashes light.
    await page.reload();
    expect(await theme(page)).toBe("dark");
    await expect(
      page.getByRole("radio", { name: "Dark", checked: true }),
    ).toBeVisible();
  });

  test("Auto in the footer goes back to the system setting", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await page.getByRole("radio", { name: "Light" }).click();
    expect(await theme(page)).toBe("light");
    await page.getByRole("radio", { name: "Auto" }).click();
    expect(await theme(page)).toBe("dark");
    await page.reload();
    expect(await theme(page)).toBe("dark");
  });
});
