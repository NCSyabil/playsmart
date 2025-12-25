import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { webFixture } from "@src/helper/fixtures/webFixture";
import * as webActions from "@src/helper/actions/webActions";

// These step definitions are for the original sample.feature
// More comprehensive step definitions are in demo-login.steps.ts

When("I click on the {string} link", async function (linkText: string) {
  const page = webFixture.getCurrentPage();
  await webActions.clickLink(page, linkText, "");
});

Then("I should be on a different page", async function () {
  const page = webFixture.getCurrentPage();
  const url = page.url();
  expect(url).not.toBe("https://example.com");
});
