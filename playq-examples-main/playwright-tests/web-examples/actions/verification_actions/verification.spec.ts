import { ur } from '@faker-js/faker/.';
import { test } from '@setup/playwrightTest';
import { comm, web, loc, api, dataTest, faker, vars } from "@playq";
import { example_letcode } from '@resources/locators/loc-ts';
import Assert from '@src/helper/wrapper/assert';

const url = "https://letcode.in/";

// Basic header verification test
test('basic header verification test', async ({ page }) => {
    await web.openBrowser(page, `${url}/edit`);
    // verify the header text
    await web.verifyHeaderText(page, "Input");
});

// Header verification with custom action timeout test
test('header verification with custom action timeout test', async ({ page }) => {
    await web.openBrowser(page, `${url}/edit`);
    // verify the header text with custom action timeout
    await web.verifyHeaderText(page, "Input", {
        actionTimeout: 90000
    });
});

// Header verification with custom navigation timeout test
test('header verification with custom navigation timeout test', async ({ page }) => {
    await web.openBrowser(page, `${url}/edit`);
    // verify the header text with custom navigation timeout
    await web.verifyHeaderText(page, "Input", {
        navigationTimeout: 90000
    });
});

// Header verification with partial match test
test('header verification with partial match test', async ({ page }) => {
    await web.openBrowser(page, `${url}/edit`);
    // verify the header text with partial match
    await web.verifyHeaderText(page, "In", {
        partialMatch: true
    });
});

// Header verification with overriden pattern test
test('header verification with overriden pattern test', async ({ page }) => {
    await web.openBrowser(page, `${url}/edit`);
    // verify the header text with overriden pattern
    await web.verifyHeaderText(page, "Input", {
        pattern: "//section/div/h1"
    });
});

// Header verification with ignore case test
test('header verification with ignore case test', async ({ page }) => {
    await web.openBrowser(page, `${url}/edit`);
    // verify the header text with ignore case
    await web.verifyHeaderText(page, "InPut", {
        ignoreCase: true
    });
});

// Header verification with assert false test
test('header verification assert false test', async ({ page }) => {
    await web.openBrowser(page, `${url}/edit`);
    // verify the header text with assert false
    await web.verifyHeaderText(page, "Hello", {
        assert: false
    });
});


// Header verification with assert false test
test('header verification with assert false test', async ({ page }) => {
    await web.openBrowser(page, `${url}/edit`);
    // verify the header text with assert false
    await web.verifyHeaderText(page, "Hello", {
        assert: false
    });
});


// Header verification with specifying the locator test
test('header verification with specifying the locator test', async ({ page }) => {
    await web.openBrowser(page, `${url}/edit`);
    // verify the header text with specifying the locator
    await web.verifyHeaderText(page, "Input", {
        locator: "//section/div/h1"
    });
});


// Header verification with header type test
test('header verification with header type test', async ({ page }) => {
    await web.openBrowser(page, `${url}/edit`);
    // verify the header text with header type
    await web.verifyHeaderText(page, "Input", {
        headerType: "h1"
    });
});

// Header verification with screenshot full page test
test('header verification with screenshot full page test', async ({ page }) => {
    await web.openBrowser(page, `${url}/edit`);
    // verify the header text with screenshot full page
    await web.verifyHeaderText(page, "Input", {
        screenshotFullPage: true
    });
});
