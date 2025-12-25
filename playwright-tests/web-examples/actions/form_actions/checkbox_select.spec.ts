import { ur } from '@faker-js/faker/.';
import { test } from '@setup/playwrightTest';
import { comm, web, loc, api, dataTest, faker, vars } from "@playq";

const url = "https://letcode.in/radio";

// Simple checkbox selection test
test('Checkbox selection test', async ({ page }) => {
    await web.openBrowser(page, url);
    // Simple checkbox selection - select 'Remember me'
    await web.clickCheckbox(page, "Remember me");
});
