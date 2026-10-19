import { expect, test } from "@playwright/test";

test("explains attribution evidence without changing demo or contacting backend", async ({
  page,
}) => {
  const errors: string[] = [];
  const backend: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    if (r.url().includes("supabase.co")) backend.push(r.url());
  });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Ativar tema claro", exact: true })).toBeEnabled();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Cada lead tem");
  const journey = page.getByRole("group", { name: "Etapas da origem" });
  await journey.getByRole("button", { name: /03/ }).click();
  await expect(
    page.getByRole("heading", { name: "A conversa precisa de contexto." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sem evidência", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Sem evidência, sem suposições." })).toBeVisible();
  await expect(journey.getByRole("button").first()).toBeDisabled();
  await page.getByRole("button", { name: "Com evidência", exact: true }).click();
  await journey.getByRole("button", { name: /04/ }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Atribuição que você pode conferir." }),
  ).toBeVisible();
  const preview = page.getByRole("group", { name: "Visualização da prévia" });
  await preview.getByRole("button", { name: "Conversas", exact: true }).click();
  await expect(page.locator(".lp-product .lp-inbox")).toBeVisible();
  await preview.getByRole("button", { name: "Pipeline", exact: true }).click();
  await expect(page.locator(".lp-product .lp-kanban")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("leadtrace.demo.v1"))).toBeNull();
  expect(backend).toEqual([]);
  expect(errors).toEqual([]);
});

for (const width of [390, 768, 1440]) {
  test(`landing fits ${width}px in both themes and supports reduced motion`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "Ativar tema claro", exact: true }),
    ).toBeEnabled();
    await expect(page.locator(".lp-product")).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.getByRole("button", { name: "Ativar tema claro", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    if (width === 390) {
      const menu = page.getByRole("button", { name: "Abrir menu", exact: true });
      await menu.click();
      await expect(page.getByRole("navigation", { name: "Menu principal" })).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(menu).toBeFocused();
      await menu.click();
      await page
        .getByRole("navigation", { name: "Menu principal" })
        .getByRole("link", { name: "Funcionalidades", exact: true })
        .click();
      await expect(menu).toHaveAttribute("aria-expanded", "false");
    }
  });
}
