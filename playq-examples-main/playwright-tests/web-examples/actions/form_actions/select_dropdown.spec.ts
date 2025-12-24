import { ur } from '@faker-js/faker/.';
import { test } from '@setup/playwrightTest';
import { comm, web, loc, api, dataTest, faker, vars } from "@playq";


const locLetcode = loc.example_letcode;

// Simple drop down select test
test('select dropdown test', async ({ page }) => {
    await web.openBrowser(page, "https://letcode.in/dropdowns");
    // Simple select - select a fruit
    await web.selectDropdown(page, locLetcode.letcode_dropdowns_page.select_fruit(page), "Apple");

});