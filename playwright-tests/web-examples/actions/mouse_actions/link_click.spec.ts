import { ur } from '@faker-js/faker/.';
import { test } from '@setup/playwrightTest';
import { comm, web, loc, api, dataTest, faker, vars } from "@playq";


test('link click test', async ({ page }) => {
    await web.openBrowser(page, "http://the-internet.herokuapp.com/");
    // Simple link click
    await web.clickLink(page, "Broken Images");
});

