import { ur } from '@faker-js/faker/.';
import { test } from '@setup/playwrightTest';
import { comm, web, loc, api, dataTest, faker, vars } from "@playq";
import { example_letcode } from '@resources/locators/loc-ts';

const url = "https://letcode.in/";

// Basic wait for URL test
test('basic wait for url test', async ({ page }) => {
    await web.openBrowser(page, url);
    await web.clickLink(page, example_letcode.letcode_home_page.link_explore_workspace(page));
    // wait for the URL to change
    await web.waitForUrl(page, `${url}/test`);
});

// Basic wait for input state test
test('basic wait for input state test', async ({ page }) => {
    await web.openBrowser(page, `${url}/edit`);
    // wait for a specific element to be enabled
    await web.waitForInputState(page, example_letcode.letcode_edit_page.input_fullname(page), "enabled");
});

// Basic wait for header test
test('basic wait for header test', async ({ page }) => {
    await web.openBrowser(page, `${url}/edit`);
    // wait for the header to be visible
    await web.waitForHeader(page, ".section .container .title", "Input");
});

// Basic wait for text at a location test
test('basic wait for text at a location test', async ({ page }) => {
    await web.openBrowser(page, `${url}/elements`);
    // wait for the text to be visible at the specified location
    await web.waitForTextAtLocation(page, "//button[@type='submit']", "Search");
});