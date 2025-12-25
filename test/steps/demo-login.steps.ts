import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { webFixture } from "@src/helper/fixtures/webFixture";
import * as webActions from "@src/helper/actions/webActions";

// Navigation steps
Given("I navigate to {string}", async function (url: string) {
  const page = webFixture.getCurrentPage();
  await webActions.openBrowser(page, url, "");
});

// Input steps
When("I fill in {string} with {string}", async function (fieldId: string, value: string) {
  const page = webFixture.getCurrentPage();
  await webActions.fill(page, `#${fieldId}`, value, "");
});

// Click steps
When("I click the {string} button", async function (buttonId: string) {
  const page = webFixture.getCurrentPage();
  await webActions.clickButton(page, `#${buttonId}`, "");
});

When("I click on the {string} link", async function (linkText: string) {
  const page = webFixture.getCurrentPage();
  await webActions.clickLink(page, linkText, "");
});

// Verification steps
Then("I should see the page title contains {string}", async function (expectedTitle: string) {
  const page = webFixture.getCurrentPage();
  const title = await page.title();
  expect(title).toContain(expectedTitle);
});

Then("I should see {string} on the page", async function (text: string) {
  const page = webFixture.getCurrentPage();
  await webActions.verifyTextAtLocation(page, ".post-title", text);
});

Then("I should see the {string} field", async function (fieldId: string) {
  const page = webFixture.getCurrentPage();
  await webActions.verifyInputFieldPresent(page, `#${fieldId}`, "");
});

Then("I should see the {string} button", async function (buttonId: string) {
  const page = webFixture.getCurrentPage();
  await webActions.verifyInputFieldPresent(page, `#${buttonId}`, "");
});

Then("I should be on a different page", async function () {
  const page = webFixture.getCurrentPage();
  const url = page.url();
  expect(url).not.toBe("https://example.com");
});
