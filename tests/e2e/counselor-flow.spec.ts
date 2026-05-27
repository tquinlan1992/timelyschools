import { expect, test } from "@playwright/test";

test.describe("Counselor course request flow", () => {
  test("attention filter, student workspace, add course, persistence", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Course Requests" })).toBeVisible();
    await expect(page.getByText(/need review/i).first()).toBeVisible();

    await page.getByRole("button", { name: "Needs attention" }).click();
    await expect(page.getByRole("link", { name: /Nina Torres/i })).toBeVisible();

    await page.getByRole("link", { name: /Nina Torres/i }).click();
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

  test("shows error when adding duplicate course", async ({ page }) => {
    await page.goto("/students/S001");
    await page.getByRole("button", { name: "Add course" }).click();
    await page.getByPlaceholder("Search catalog…").fill("MTH101");
    const catalogPanel = page.getByRole("dialog");
    await expect(
      catalogPanel.getByRole("button", { name: /Algebra I MTH101/i })
    ).toBeDisabled();
  });
});
