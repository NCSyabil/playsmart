import { ur } from '@faker-js/faker/.';
import { test } from '@setup/playwrightTest';
import { comm, web, loc, api, dataTest, faker, vars } from "@playq";


const locLetcode = loc.example_letcode;
const url = "https://letcode.in/edit";

// Simple fill test
test('input field fill test', async ({ page }) => {
    await web.openBrowser(page, url);
    // Simple fill - fill in the fullname field
    await web.fill(page, locLetcode.letcode_edit_page.input_fullname(page), "John Doe");
});


// Using aliases

// type -  fill a field using aliases
test('type to a field test', async ({ page }) => {
    await web.openBrowser(page, url);
    // Simple fill - type in the fullname field
    await web.type(page, locLetcode.letcode_edit_page.input_fullname(page), "John Doe");
});

// input -  fill a field using aliases
test('input to a field test', async ({ page }) => {
    await web.openBrowser(page, url);
    // Simple fill - fill in the fullname field
    await web.input(page, locLetcode.letcode_edit_page.input_fullname(page), "John Doe");
});

// set -  fill a field using aliases
test('set to a field test', async ({ page }) => {
    await web.openBrowser(page, url);
    // Simple fill - fill in the fullname field
    await web.set(page, locLetcode.letcode_edit_page.input_fullname(page), "John Doe");
});

// enter -  fill a field using aliases
test('enter to a field test', async ({ page }) => {
    await web.openBrowser(page, url);
    // Simple fill - fill in the fullname field
    await web.enter(page, locLetcode.letcode_edit_page.input_fullname(page), "John Doe");
});