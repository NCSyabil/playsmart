import { ur } from '@faker-js/faker/.';
import { test } from '@setup/playwrightTest';
import { comm, web, loc, api, dataTest, faker, vars } from "@playq";
 

// Simple button click test
test('button click test', async ({ page }) => {
    await web.openBrowser(page, "https://letcode.in/button");
    // Simple button click
    await web.clickButton(page, "Goto Home"); // Using Pattern-IQ/Smart AI

    // await webActions.clickButton(page, "#Home"); // Using direct locators

    // await web.clickButton(page, loc.uportal_gb.mbrApp_pcDetails.btn_save_continue(page)); // Using central locator management
});

// Button click test with custom timeout
test('button click test with custom timeout', async ({ page }) => {
    await web.openBrowser(page, "https://letcode.in/button");
    // Button click with custom timeout
    await web.clickButton(page, "Goto Home", {
        timeout: 20000
    });
});

// Button click test with override pattern
test('button click test with override pattern', async ({ page }) => {
    await web.openBrowser(page, "https://letcode.in/button");
    // Button click with pattern
    await web.clickButton(page, "Home", {
        pattern: "letcodesamples"
    });
});

// Double click a button test
test('double click a button test', async ({ page }) => {
    await web.openBrowser(page, "https://letcode.in/button");
    // double click
    await web.clickButton(page, "Goto Home", {
        doubleClick: true
    });
});


// Button click test with screenshot
test('click a button test with screenshot', async ({ page }) => {
    await web.openBrowser(page, "https://letcode.in/button");
    // Take screenshot after click action
    await web.clickButton(page, "Goto Home", {
        screenshot: true,
        screenshotText: "After clicking Goto Home button"
    });
});


// Button click test with screenshot before
test('click a button test with screenshot before', async ({ page }) => {
    await web.openBrowser(page, "https://letcode.in/button");
    // Take screenshot before click action
    await web.clickButton(page, "Goto Home", {
        screenshot: true,
        screenshotBefore: true,
        screenshotText: "Before clicking Goto Home button"
    });
});