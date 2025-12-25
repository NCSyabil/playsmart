import { ur } from '@faker-js/faker/.';
import { test } from '@setup/playwrightTest';
import { comm, web, loc, api, dataTest, faker, vars } from "@playq";

test.describe('@hello_playq', () => {
    test('hello playq', async ({ page }) => {
        test.info().annotations.push({ type: 'tag', description: 'sample' });
        await web.openBrowser(page, "https://ecommerce-playground.lambdatest.io/");
        await web.verifyPageTitle(page,"Your Store")
    });
});
