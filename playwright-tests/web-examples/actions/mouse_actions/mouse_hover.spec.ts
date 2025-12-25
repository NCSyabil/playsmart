import { ur } from '@faker-js/faker/.';
import { test } from '@setup/playwrightTest';
import { comm, web, loc, api, dataTest, faker, vars } from "@playq";


const locHeroku = loc.example_heroku; 

// Simple mouse hover test
test('mouse hover test', async ({ page }) => {
    await web.openBrowser(page, "http://the-internet.herokuapp.com/hovers");
    // Simple mouse hover - hover over user1
    await web.mouseoverOnLink(page, locHeroku.heroku_hover_page.link_user1(page) );
    await web.verifyTextOnPage(page, "name: user1")
});
