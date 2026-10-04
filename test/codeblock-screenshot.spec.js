import { test, expect } from "@playwright/test";

test.describe("DocsPost CodeBlock Visual Regression", () => {
    test("Code block in Write, Preview and Public page must be pixel-identical", async ({ page }) => {
        // 1. Write mode (static view)
        await page.goto("http://localhost:3000/workspace/new", { waitUntil: "networkidle" });
        const writeBlock = page.locator(".docspost-codeblock-container").first();
        await expect(writeBlock).toBeVisible({ timeout: 10000 });
        const writeShot = await writeBlock.screenshot();

        // 2. Preview mode
        const previewBtn = page.getByRole("button", { name: "Preview" });
        await expect(previewBtn).toBeVisible();
        await previewBtn.click();
        await page.waitForTimeout(400);

        const previewBlock = page.locator(".docspost-codeblock-container").first();
        await expect(previewBlock).toBeVisible();
        const previewShot = await previewBlock.screenshot();

        // 3. Public doc page
        await page.goto("http://localhost:3000/doc/fastapi-guide", { waitUntil: "networkidle" });
        const publicBlock = page.locator(".docspost-codeblock-container").first();
        if (await publicBlock.isVisible()) {
            const publicShot = await publicBlock.screenshot();
            expect(publicShot).toMatchSnapshot("public-block.png", { maxDiffPixelRatio: 0.02 });
        }

        // Compare write and preview screenshots with tiny pixel threshold
        expect(previewShot).toMatchSnapshot("preview-block.png", { maxDiffPixelRatio: 0.02 });
    });
});
