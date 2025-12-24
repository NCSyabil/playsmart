import { ur } from '@faker-js/faker/.';
import { test } from '@setup/playwrightTest';
import { comm, web, loc, api, dataTest, faker, vars } from "@playq";


const url = "https://letcode.in/radio";

// Simple radio button click with pattern
test('radio click test', async ({ page }) => {
    await web.openBrowser(page, url);
    // Simple radio button click with pattern - select 'Yes' in 'Select any one' field
    await web.clickRadioButton(page, "{field::Select any one} Yes");
});

 // Screenshot after selection
test('radio click test with screenshot after selection', async ({ page }) => {
    await web.openBrowser(page, url);
    // Screenshot after selection
    await web.clickRadioButton(page, "{field::Select any one} No", {
            screenshot: true,
            screenshotText: 'before selection'
        });

});

// Screenshots before and after
test('radio click test with screenshots before and after', async ({ page }) => {
    await web.openBrowser(page, url);
    // Screenshot after selection
    await web.clickRadioButton(page, "{field::Select any one} No", {
            screenshot: true,
            screenshotText: 'screenshot after selection'
        });
});