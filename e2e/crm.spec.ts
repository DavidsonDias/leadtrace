import { expect, test } from "@playwright/test";
test("edits a lead and persists it across reloads", async ({ page }) => {
  await page.goto("/app/leads");
  await page.locator("tbody tr").first().click();
  await page.getByRole("button", { name: "Editar informações", exact: true }).click();
  await page.getByLabel("Nome", { exact: true }).fill("Contato de validação");
  await page.getByRole("button", { name: "Salvar informações", exact: true }).click();
  await page.reload();
  await expect(page.getByText("Contato de validação", { exact: true }).first()).toBeVisible();
});
test("keeps pipeline, proposal and disqualification coherent", async ({ page }) => {
  await page.goto("/app/pipeline");
  const card = page
    .getByRole("region", { name: "Novo lead", exact: true })
    .locator("article")
    .first();
  const company = (await card.locator("button p").first().textContent())!;
  await card.getByRole("combobox").selectOption("proposta_enviada");
  await page.reload();
  await expect(
    page
      .getByRole("region", { name: "Proposta enviada", exact: true })
      .locator("article")
      .filter({ has: page.getByText(company, { exact: true }) }),
  ).toBeVisible();
  await page.goto("/app/deals");
  await expect(
    page.locator("tbody tr").filter({ has: page.getByText(company, { exact: true }) }),
  ).toBeVisible();
  await page.goto("/app/pipeline");
  await page
    .locator("article")
    .filter({ has: page.getByText(company, { exact: true }) })
    .getByRole("combobox")
    .selectOption("desqualificado");
  await expect(page.getByRole("button", { name: "Confirmar", exact: true })).toBeDisabled();
  await page.getByRole("radio", { name: "Sem orçamento", exact: true }).click();
  await page.getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect(
    page
      .getByRole("region", { name: "Lead desqualificado", exact: true })
      .locator("article")
      .filter({ has: page.getByText(company, { exact: true }) }),
  ).toBeVisible();
});
test("offers all modules and persisted light mode on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app");
  await page.getByRole("button", { name: "Ativar tema claro", exact: true }).click();
  for (const name of ["Origem", "Propostas", "Configurações"]) {
    await page
      .getByRole("navigation", { name: "Todos os módulos", exact: true })
      .getByRole("link", { name, exact: true })
      .click();
    await expect(page.locator("main")).toBeVisible();
  }
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
test("sends only simulated demo messages", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/app/inbox");
  await page.locator("main aside ul button").first().click();
  await page
    .getByRole("textbox", { name: "Mensagem", exact: true })
    .fill("Podemos agendar uma visita técnica?");
  await page.getByRole("button", { name: "Enviar", exact: true }).click();
  await expect(
    page.getByText("Podemos agendar uma visita técnica?", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Modo demonstração — nenhuma mensagem será enviada pelo WhatsApp.", {
      exact: true,
    }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("keeps unconfigured production access separate from demo", async ({ page }) => {
  await page.goto("/workspace");
  await expect(
    page.getByRole("heading", { name: "Plataforma ainda não configurada" }),
  ).toBeVisible();
  await page.goto("/login");
  await expect(page.getByRole("button", { name: "Entrar", exact: true })).toBeDisabled();
  await expect(page.getByRole("link", { name: "Entrar na demonstração" })).toBeVisible();
  await page.goto("/forgot-password");
  await expect(page.getByText(/Nenhum e-mail será enviado/)).toBeVisible();
  await page.goto("/reset-password");
  await expect(page.getByText(/Abra um link válido/)).toBeVisible();
});
