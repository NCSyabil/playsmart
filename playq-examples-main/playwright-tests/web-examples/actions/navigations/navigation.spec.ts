import { ur } from '@faker-js/faker/.';
import { test } from '@setup/playwrightTest';
import { comm, web, loc, api, dataTest, faker, vars } from "@playq";

// OpenBroweser action tests
test('basic navigation test', async ({ page }) => {
    // Basic navigation to URL
    await web.openBrowser(page, "https://letcode.in/");
});

//NavigateByPath action tests
test('navigation by path test', async ({ page }) => {
    // Basic navigation to URL
    await web.openBrowser(page, "https://letcode.in/");
    // Navigate by path
    await web.navigateByPath(page, "/button");
});