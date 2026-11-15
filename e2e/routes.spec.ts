import { expect, test, type Page } from "@playwright/test";

// Chrome logs every 4xx response as "Failed to load resource", including
// the expected 404 of the page itself. Failed subresources are caught
// through the response listener instead, so that message is skipped.
function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    if (message.text().startsWith("Failed to load resource")) return;
    errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    const isDocument = response.request().resourceType() === "document";
    if (!isDocument && response.status() >= 400) {
      errors.push(`${response.status()} ${response.url()}`);
    }
  });
  return errors;
}

const routes = [
  { path: "/", status: 200, title: "Kamil Pułka | Full-stack developer" },
  { path: "/privacy", status: 200, title: "Privacy | Kamil Pułka" },
  { path: "/no-such-page", status: 404, title: "Page not found | Kamil Pułka" },
  {
    path: "/projects/no-such-project",
    status: 404,
    title: "Page not found | Kamil Pułka",
  },
  ...[
    ["novice", "NoVice"],
    ["polsimer-f74led", "Polsimer F74LED plugin"],
    ["do-nothing", "do nothing"],
    ["gifoji", "Gifoji"],
    ["dark-connect", "Dark Connect"],
  ].map(([slug, name]) => ({
    path: `/projects/${slug}`,
    status: 200,
    title: `${name} | Kamil Pułka`,
  })),
];

for (const { path, status, title } of routes) {
  test(`${path} renders and hydrates without errors`, async ({ page }) => {
    const errors = collectErrors(page);
    const response = await page.goto(path);
    expect(response?.status()).toBe(status);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveTitle(title);
    await expect(page.locator("main#main")).toBeVisible();
    expect(errors).toEqual([]);
  });
}
