import { ur } from '@faker-js/faker/.';
import { test } from '@setup/playwrightTest';
import { comm, web, loc, api, dataTest, faker, vars } from "@playq";


test('exact title match test @smoke_test', async ({ page }) => {
    await web.openBrowser(page, "https://ecommerce-playground.lambdatest.io/");
    await web.verifyPageTitle(page,"Your Store")
});

test.describe('@smoke_test', () => {
    test('partial title match test', async ({ page }) => {
        await web.openBrowser(page, "https://ecommerce-playground.lambdatest.io/");
        await web.verifyPageTitle(page,"Your",{
            partialMatch: true,
        })
    });
});