import { expect, test, type Page } from "@playwright/test";

async function resetSeedData(page: Page) {
  const res = await page.request.post("/api/test/reset");
  expect(res.ok()).toBeTruthy();
}

function studentsBreadcrumb(page: Page) {
  return page
    .getByRole("navigation", { name: "Breadcrumb" })
    .getByRole("link", { name: "Students" });
}

function studentRow(page: Page, name: RegExp | string) {
  return page.getByRole("link", { name: new RegExp(`View ${typeof name === "string" ? name : name.source}`, "i") });
}

test.describe("Counselor course request flow", () => {
  test.beforeEach(async ({ page }) => {
    await resetSeedData(page);
  });

  test("attention filter, student workspace, add course, persistence", async ({ page }) => {
    await page.goto("/students");
    await expect(page.getByRole("heading", { name: "Students" })).toBeVisible();
    await expect(page.getByText(/need review/i).first()).toBeVisible();

    await page.getByRole("button", { name: "Needs attention" }).click();
    await expect(page.getByRole("link", { name: /View Nina Torres/i })).toBeVisible();

    await page.getByRole("link", { name: /View Nina Torres/i }).click();
    await expect(page.getByText("Credit evaluation pending")).toBeVisible();

    await page.getByRole("button", { name: "Add course" }).click();
    await page.getByPlaceholder("Search catalog…").fill("MTH302");
    await page.getByRole("button", { name: /Statistics MTH302/i }).click();

    await expect(page.getByRole("heading", { name: "Statistics", exact: true })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("heading", { name: "Statistics", exact: true })).toBeVisible();
  });

  test("deep link loads retake banner for S003", async ({ page }) => {
    await page.goto("/students/S003");
    await expect(page.getByText("Math retake required")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Jordan Williams" })).toBeVisible();
  });

  test("each assignment edge case has a visible roster flag and banner", async ({ page }) => {
    await page.goto("/students");
    await expect(studentRow(page, /Mei Chen/i)).toBeVisible();

    const cases = [
      { name: "Mei Chen", chip: "ELL", banner: "English Language Learner" },
      { name: "Jordan Williams", chip: "Retake", banner: "Math retake required" },
      { name: "Liam O'Brien", chip: "AP load", banner: "Heavy AP schedule" },
      { name: "Nina Torres", chip: "Transfer", banner: "Mid-year transfer" },
    ] as const;

    for (const { name, chip, banner } of cases) {
      const row = studentRow(page, name);
      await expect(row.locator(".status-chip", { hasText: chip })).toBeVisible();
      await row.click();
      await expect(page.getByRole("heading", { name: banner })).toBeVisible();
      await studentsBreadcrumb(page).click();
      await expect(page.getByRole("heading", { name: "Students" })).toBeVisible();
    }
  });

  test("roster updates when all requests are removed", async ({ page }) => {
    await page.goto("/students/S001");
    await expect(page.getByRole("heading", { name: "Alex Rivera" })).toBeVisible();

    const removeButtons = page.getByRole("button", { name: "Remove" });
    const count = await removeButtons.count();
    for (let i = 0; i < count; i++) {
      await removeButtons.first().click();
    }

    await studentsBreadcrumb(page).click();
    const row = studentRow(page, "Alex Rivera");
    await expect(row).toBeVisible();
    await expect(row.locator(".status-chip.no_requests")).toBeVisible();
    await expect(row.locator(".request-counts")).toHaveText("No requests");
  });

  test("course catalog page lists departments", async ({ page }) => {
    await page.goto("/courses");
    await expect(page.getByRole("heading", { name: "Course catalog" })).toBeVisible();
    await page.getByLabel("Filter by department").selectOption("Math");
    await expect(page.getByRole("cell", { name: "MTH101" })).toBeVisible();
    await expect(page.locator("tbody").getByText("Math", { exact: true }).first()).toBeVisible();
  });

  test("shows error when adding duplicate course", async ({ page }) => {
    await page.goto("/students/S001");
    await expect(page.getByRole("heading", { name: "Alex Rivera" })).toBeVisible();
    await page.getByRole("button", { name: "Add course" }).click();
    await page.getByPlaceholder("Search catalog…").fill("MTH101");
    const catalogPanel = page.getByRole("dialog");
    await expect(
      catalogPanel.getByRole("button", { name: /Algebra I/i })
    ).toBeDisabled({ timeout: 10_000 });
  });
});
