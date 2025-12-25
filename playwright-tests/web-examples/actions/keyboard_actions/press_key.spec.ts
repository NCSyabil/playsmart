import { ur } from '@faker-js/faker/.';
import { test } from '@setup/playwrightTest';
import { comm, web, loc, api, dataTest, faker, vars } from "@playq";



// Simple  press key test
test('press key test', async ({ page }) => {
    await web.openBrowser(page, "http://the-internet.herokuapp.com/key_presses");
    // Press the Enter key
    await web.pressKey(page, "Enter");
    // Verify the key press
    await web.verifyTextOnPage(page, "You entered: ENTER");
});

