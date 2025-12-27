import { vars, webLocResolver, webFixture, logFixture } from "@src/global";
import type { Locator, Page as page} from "@playwright/test";
import { Given, When, Then } from "@cucumber/cucumber";
import { warn } from "winston";
import * as webActions from '@src/helper/actions/webActions';

/**
 * Step Definition: Open Browser
 * 
 * Opens a browser and navigates to the specified URL.
 * 
 * @param {string} url - The URL to navigate to. Supports variable replacement using {{variableName}} syntax.
 * @param {string} options - JSON string with optional parameters:
 *   - screenshot: [boolean] Capture screenshot after navigation (default: false)
 *   - screenshotText: [string] Description for screenshot
 *   - screenshotFullPage: [boolean] Full page screenshot (default: true)
 * 
 * @example
 * Given Web: Open browser -url: "{{baseUrl}}" -options: ""
 * Given Web: Open browser -url: "https://example.com" -options: "{screenshot: true}"
 * 
 * @see {@link webActions.openBrowser}
 */
Given("Web: Open browser -url: {param} -options: {param}", async function (url, options) {
  let page = webFixture.getCurrentPage();
  await webActions.openBrowser(page, url, options);
});

/**
 * Step Definition: Navigate by Path
 * 
 * Navigates to a relative path from the current URL.
 * 
 * @param {string} relativePath - The relative path to navigate to (e.g., "/dashboard", "profile/edit")
 * @param {string} options - JSON string with optional parameters:
 *   - screenshot: [boolean] Capture screenshot after navigation (default: false)
 *   - screenshotText: [string] Description for screenshot
 *   - screenshotFullPage: [boolean] Full page screenshot (default: true)
 * 
 * @example
 * Given Web: Navigate by path -relativePath: "/dashboard" -options: ""
 * Given Web: Navigate by path -relativePath: "{{profilePath}}" -options: "{screenshot: true}"
 * 
 * @see {@link webActions.navigateByPath}
 */
Given("Web: Navigate by path -relativePath: {param} -options: {param}", async function (relativePath, options) {
  let page = webFixture.getCurrentPage();
  await webActions.navigateByPath(page, relativePath, options);
});

/**
 * Step Definition: Click Button
 * 
 * Clicks a button element identified by text, pattern locator, or selector.
 * 
 * @param {string} field - The button identifier. Can be:
 *   - Pattern locator: "pageName.fieldName" (e.g., "loginPage.submitButton")
 *   - Text: "Submit", "Login", "Save"
 *   - Selector: "xpath=//button[@id='submit']"
 * @param {string} options - JSON string with optional parameters:
 *   - actionTimeout: [number] Timeout in ms (default: from config)
 *   - pattern: [string] Pattern override
 *   - screenshot: [boolean] Capture screenshot after click (default: false)
 *   - screenshotBefore: [boolean] Capture screenshot before click (default: false)
 *   - screenshotText: [string] Description for screenshot
 *   - screenshotFullPage: [boolean] Full page screenshot (default: true)
 * 
 * @example
 * Given Web: Click button -field: "loginPage.submitButton" -options: ""
 * Given Web: Click button -field: "Submit" -options: "{screenshot: true}"
 * 
 * @see {@link webActions.clickButton}
 */
Given("Web: Click button -field: {param} -options: {param}", async function (field, options) {
  let page = webFixture.getCurrentPage();
  await webActions.clickButton(page, field, options);
});

/**
 * Step Definition: Click Link
 * 
 * Clicks a link element identified by text, pattern locator, or selector.
 * 
 * @param {string} field - The link identifier. Can be:
 *   - Pattern locator: "pageName.fieldName" (e.g., "homePage.loginLink")
 *   - Text: "Login", "Sign Up", "Forgot Password"
 *   - Selector: "xpath=//a[@href='/login']"
 * @param {string} options - JSON string with optional parameters:
 *   - actionTimeout: [number] Timeout in ms (default: from config)
 *   - pattern: [string] Pattern override
 *   - screenshot: [boolean] Capture screenshot after click (default: false)
 *   - screenshotBefore: [boolean] Capture screenshot before click (default: false)
 *   - screenshotText: [string] Description for screenshot
 *   - screenshotFullPage: [boolean] Full page screenshot (default: true)
 * 
 * @example
 * Given Web: Click link -field: "homePage.loginLink" -options: ""
 * Given Web: Click link -field: "Sign Up" -options: "{screenshot: true}"
 * 
 * @see {@link webActions.clickLink}
 */
Given("Web: Click link -field: {param} -options: {param}", async function (field, options) {
  let page = webFixture.getCurrentPage();
  await webActions.clickLink(page, field, options);
});

/**
 * Step Definition: Click Radio Button
 * 
 * Selects a radio button element identified by text, pattern locator, or selector.
 * 
 * @param {string} field - The radio button identifier. Can be:
 *   - Pattern locator: "pageName.fieldName" (e.g., "checkoutPage.paymentMethodRadio")
 *   - Text with group: "{radio_group:: Payment Method} Credit Card"
 *   - Text: "Yes", "No", "Option 1"
 *   - Selector: "xpath=//input[@type='radio'][@value='yes']"
 * @param {string} options - JSON string with optional parameters:
 *   - actionTimeout: [number] Timeout in ms (default: from config)
 *   - pattern: [string] Pattern override
 *   - force: [boolean] Force the action (default: true)
 *   - screenshot: [boolean] Capture screenshot after selection (default: false)
 *   - screenshotBefore: [boolean] Capture screenshot before selection (default: false)
 *   - screenshotText: [string] Description for screenshot
 *   - screenshotFullPage: [boolean] Full page screenshot (default: true)
 * 
 * @example
 * Given Web: Click radio button -field: "checkoutPage.paymentMethodRadio" -options: ""
 * Given Web: Click radio button -field: "{radio_group:: Newsletter} Yes" -options: "{screenshot: true}"
 * 
 * @see {@link webActions.clickRadioButton}
 */
Given("Web: Click radio button -field: {param} -options: {param}", async function (field, options) {
  let page = webFixture.getCurrentPage();
  await webActions.clickRadioButton(page, field, options);
});

/**
 * Step Definition: Click Checkbox
 * 
 * Checks a checkbox element identified by text, pattern locator, or selector.
 * 
 * @param {string} field - The checkbox identifier. Can be:
 *   - Pattern locator: "pageName.fieldName" (e.g., "checkoutPage.termsCheckbox")
 *   - Text: "I agree to terms", "Subscribe to newsletter"
 *   - Selector: "xpath=//input[@type='checkbox'][@name='terms']"
 * @param {string} options - JSON string with optional parameters:
 *   - actionTimeout: [number] Timeout in ms (default: from config)
 *   - pattern: [string] Pattern override
 *   - force: [boolean] Force the action (default: true)
 *   - screenshot: [boolean] Capture screenshot after checking (default: false)
 *   - screenshotBefore: [boolean] Capture screenshot before checking (default: false)
 *   - screenshotText: [string] Description for screenshot
 *   - screenshotFullPage: [boolean] Full page screenshot (default: true)
 * 
 * @example
 * Given Web: Click checkbox -field: "checkoutPage.termsCheckbox" -options: ""
 * Given Web: Click checkbox -field: "I agree to terms" -options: "{screenshot: true}"
 * 
 * @see {@link webActions.clickCheckbox}
 */
Given("Web: Click checkbox -field: {param} -options: {param}", async function (field, options) {
  let page = webFixture.getCurrentPage();
  await webActions.clickCheckbox(page, field, options);
});

/**
 * Step Definition: Mouseover on Link
 * 
 * Hovers the mouse over a link element to trigger hover effects or reveal hidden elements.
 * 
 * @param {string} field - The link identifier. Can be:
 *   - Pattern locator: "pageName.fieldName" (e.g., "homePage.menuLink")
 *   - Text: "Products", "Services", "About"
 *   - Selector: "xpath=//a[@class='menu-item']"
 * @param {string} options - JSON string with optional parameters:
 *   - actionTimeout: [number] Timeout in ms (default: from config)
 *   - pattern: [string] Pattern override
 *   - screenshot: [boolean] Capture screenshot after hover (default: false)
 *   - screenshotText: [string] Description for screenshot
 *   - screenshotFullPage: [boolean] Full page screenshot (default: true)
 * 
 * @example
 * Given Web: Mouseover on link -field: "homePage.menuLink" -options: ""
 * Given Web: Mouseover on link -field: "Products" -options: "{screenshot: true}"
 * 
 * @see {@link webActions.mouseoverOnLink}
 */
Given("Web: Mouseover on link -field: {param} -options: {param}", async function (field, options) {
  let page = webFixture.getCurrentPage();
  await webActions.mouseoverOnLink(page, field, options);
});

/**
 * Step Definition: Fill Input (Legacy)
 * 
 * Fills an input field with the specified value. This is a legacy alias for the "Fill" step.
 * 
 * @param {string} field - The input field identifier
 * @param {string} value - The value to fill. Supports variable replacement using {{variableName}} syntax.
 * @param {string} options - JSON string with optional parameters
 * 
 * @example
 * Given Web: Fill input -field: "loginPage.usernameInput" -value: "{{username}}" -options: ""
 * 
 * @deprecated Use "Web: Fill" instead for consistency
 * @see {@link webActions.fill}
 */
Given("Web: Fill input -field: {param} -value: {param} -options: {param}", async function (field, value, options) {
  let page = webFixture.getCurrentPage();
  await webActions.input(page, field, value, options);
});

/**
 * Step Definition: Fill
 * 
 * Fills an input field (text box, textarea, etc.) with the specified value.
 * 
 * @param {string} field - The input field identifier. Can be:
 *   - Pattern locator: "pageName.fieldName" (e.g., "loginPage.usernameInput")
 *   - Label text: "Username", "Email", "Password"
 *   - Placeholder: "Enter your email"
 *   - Selector: "xpath=//input[@name='username']"
 * @param {string} value - The value to fill. Supports variable replacement using {{variableName}} syntax.
 * @param {string} options - JSON string with optional parameters:
 *   - actionTimeout: [number] Timeout in ms (default: from config)
 *   - pattern: [string] Pattern override
 *   - iframe: [string] Iframe selector if element is inside an iframe
 *   - screenshot: [boolean] Capture screenshot after filling (default: false)
 *   - screenshotField: [boolean] Capture screenshot of field only (default: false)
 *   - screenshotText: [string] Description for screenshot
 *   - screenshotFullPage: [boolean] Full page screenshot (default: true)
 * 
 * @example
 * Given Web: Fill -field: "loginPage.usernameInput" -value: "{{username}}" -options: ""
 * Given Web: Fill -field: "Email" -value: "test@example.com" -options: "{screenshot: true}"
 * Given Web: Fill -field: "Username" -value: "JohnDoe" -options: "{screenshotField: true}"
 * 
 * @see {@link webActions.fill}
 */
Given("Web: Fill -field: {param} -value: {param} -options: {param}", async function (field, value, options) {
  let page = webFixture.getCurrentPage();
  await webActions.fill(page, field, value, options);
});

/**
 * Step Definition: Verify Header
 * 
 * Verifies that a header element contains the expected text.
 * 
 * @param {string} text - The expected header text. Supports variable replacement.
 * @param {string} options - JSON string with optional parameters:
 *   - actionTimeout: [number] Timeout in ms (default: from config)
 *   - partialMatch: [boolean] Allow partial text match (default: false)
 *   - ignoreCase: [boolean] Case-insensitive comparison (default: true)
 *   - locator: [string] Custom locator for the header element
 *   - screenshot: [boolean] Capture screenshot after verification (default: false)
 *   - screenshotText: [string] Description for screenshot
 *   - screenshotFullPage: [boolean] Full page screenshot (default: true)
 * 
 * @example
 * Given Web: Verify header -text: "Welcome Back!" -options: ""
 * Given Web: Verify header -text: "Dashboard" -options: "{partialMatch: true, screenshot: true}"
 * 
 * @see {@link webActions.verifyHeaderText}
 */
Given("Web: Verify header -text: {param} -options: {param}",  async function (text, options) {
  let page = webFixture.getCurrentPage();
  await webActions.verifyHeaderText(page, text, options);
  });

/**
 * Step Definition: Verify Page Title
 * 
 * Verifies that the page title matches the expected text.
 * 
 * @param {string} text - The expected page title. Supports variable replacement.
 * @param {string} options - JSON string with optional parameters:
 *   - actionTimeout: [number] Timeout in ms (default: from config)
 *   - partial_check: [boolean] Allow partial title match (default: false)
 *   - ignoreCase: [boolean] Case-insensitive comparison (default: false)
 *   - assert: [boolean] Use assertion (default: true)
 *   - screenshot: [boolean] Capture screenshot after verification (default: false)
 *   - screenshotText: [string] Description for screenshot
 *   - screenshotFullPage: [boolean] Full page screenshot (default: true)
 * 
 * @example
 * Given Web: Verify page title -text: "Home - My Store" -options: ""
 * Given Web: Verify page title -text: "Dashboard" -options: "{partial_check: true}"
 * 
 * @see {@link webActions.verifyPageTitle}
 */
Given("Web: Verify page title -text: {param} -options: {param}", async function (text, options) {
    let page = webFixture.getCurrentPage();
    await webActions.verifyPageTitle(page, text, options);
  });

/**
 * Step Definition: Wait for Input State
 * 
 * Waits for an input field to reach a specific state (enabled or disabled).
 * 
 * @param {string} field - The input field identifier
 * @param {string} state - The expected state: "enabled" or "disabled"
 * @param {string} options - JSON string with optional parameters:
 *   - actionTimeout: [number] Timeout in ms (default: from config)
 *   - pattern: [string] Pattern override
 *   - screenshot: [boolean] Capture screenshot after waiting (default: false)
 *   - screenshotText: [string] Description for screenshot
 *   - screenshotFullPage: [boolean] Full page screenshot (default: true)
 * 
 * @example
 * Given Web: Wait for Input -field: "loginPage.submitButton" -state: "enabled" (enabled or disabled) -options: ""
 * Given Web: Wait for Input -field: "Email" -state: "disabled" (enabled or disabled) -options: "{screenshot: true}"
 * 
 * @see {@link webActions.waitForInputState}
 */
Given("Web: Wait for Input -field: {param} -state: {param} (enabled or disabled) -options: {param}",  async function (field, state, options) {
  let page = webFixture.getCurrentPage();
  await webActions.waitForInputState (page, field, state, options);
  });

/**
 * Step Definition: Wait for Text at Location
 * 
 * Waits until the specified text appears at a given location/element.
 * 
 * @param {string} field - The element identifier where text should appear
 * @param {string} expectedText - The text to wait for. Supports variable replacement.
 * @param {string} options - JSON string with optional parameters:
 *   - actionTimeout: [number] Timeout in ms (default: from config)
 *   - partialMatch: [boolean] Allow partial text match (default: false)
 *   - ignoreCase: [boolean] Case-insensitive comparison (default: true)
 *   - pattern: [string] Pattern override
 *   - screenshot: [boolean] Capture screenshot after text appears (default: false)
 *   - screenshotText: [string] Description for screenshot
 *   - screenshotFullPage: [boolean] Full page screenshot (default: true)
 * 
 * @example
 * Given Web: Wait for Text at Location -field: "checkoutPage.statusMessage" -text: "Order Confirmed" -options: ""
 * Given Web: Wait for Text at Location -field: "h1" -text: "Welcome" -options: "{partialMatch: true}"
 * 
 * @see {@link webActions.waitForTextAtLocation}
 */
Given("Web: Wait for Text at Location -field: {param} -text: {param} -options: {param}",  async function (field, expectedText, options) {
  let page = webFixture.getCurrentPage();
  await webActions.waitForTextAtLocation (page, field, expectedText, options);
  });  

/**
 * Step Definition: Click Tab
 * 
 * Clicks a tab element to switch between different content sections.
 * 
 * @param {string} field - The tab identifier. Can be:
 *   - Pattern locator: "pageName.fieldName" (e.g., "dashboardPage.settingsTab")
 *   - Text: "Settings", "Profile", "Orders"
 *   - Selector: "xpath=//div[@role='tab']"
 * @param {string} options - JSON string with optional parameters:
 *   - actionTimeout: [number] Timeout in ms (default: from config)
 *   - pattern: [string] Pattern override
 *   - screenshot: [boolean] Capture screenshot after click (default: false)
 *   - screenshotBefore: [boolean] Capture screenshot before click (default: false)
 *   - screenshotText: [string] Description for screenshot
 *   - screenshotFullPage: [boolean] Full page screenshot (default: true)
 * 
 * @example
 * Given Web: Click tab -field: "dashboardPage.settingsTab" -options: ""
 * Given Web: Click tab -field: "Profile" -options: "{screenshot: true}"
 * 
 * @see {@link webActions.clickTab}
 */
Given("Web: Click tab -field: {param} -options: {param}", async function (field, options) {
  let page = webFixture.getCurrentPage();
  await webActions.clickTab(page, field, options);
});

/**
 * Step Definition: Select Dropdown
 * 
 * Selects an option from a dropdown/select element.
 * 
 * @param {string} field - The dropdown identifier. Can be:
 *   - Pattern locator: "pageName.fieldName" (e.g., "checkoutPage.countryDropdown")
 *   - Label text: "Country", "State", "Payment Method"
 *   - Selector: "xpath=//select[@name='country']"
 * @param {string} value - The option to select. Can be:
 *   - Option text: "United States", "California"
 *   - Option value: "US", "CA"
 *   - Supports variable replacement: "{{selectedCountry}}"
 * @param {string} options - JSON string with optional parameters:
 *   - actionTimeout: [number] Timeout in ms (default: from config)
 *   - pattern: [string] Pattern override
 *   - screenshot: [boolean] Capture screenshot after selection (default: false)
 *   - screenshotText: [string] Description for screenshot
 *   - screenshotFullPage: [boolean] Full page screenshot (default: true)
 * 
 * @example
 * Given Web: Select Dropdown -field: "checkoutPage.countryDropdown" -value: "United States" -options: ""
 * Given Web: Select Dropdown -field: "Country" -value: "{{country}}" -options: "{screenshot: true}"
 * 
 * @see {@link webActions.selectDropdown}
 */
Given("Web: Select Dropdown -field: {param} -value: {param} -options: {param}", async function (field, value, options) {
  let page = webFixture.getCurrentPage();
  await webActions.selectDropdown(page, field, value, options);
});

/**
 * Step Definition: Verify Text on Page
 * 
 * Verifies that the specified text appears anywhere on the page.
 * 
 * @param {string} text - The text to verify. Supports variable replacement.
 * @param {string} options - JSON string with optional parameters:
 *   - actionTimeout: [number] Timeout in ms (default: from config)
 *   - partialMatch: [boolean] Allow partial text match (default: false)
 *   - ignoreCase: [boolean] Case-insensitive comparison (default: true)
 *   - screenshot: [boolean] Capture screenshot after verification (default: false)
 *   - screenshotText: [string] Description for screenshot
 *   - screenshotFullPage: [boolean] Full page screenshot (default: true)
 * 
 * @example
 * Given Web: Verify text on page -text: "Welcome" -options: ""
 * Given Web: Verify text on page -text: "Order Confirmed" -options: "{partialMatch: true, screenshot: true}"
 * 
 * @see {@link webActions.verifyTextOnPage}
 */
Given("Web: Verify text on page -text: {param} -options: {param}", async function (text, options) {
  let page = webFixture.getCurrentPage();
  await webActions.verifyTextOnPage(page, text, options);
});

/**
 * Step Definition: Verify Text at Location
 * 
 * Verifies that a specific element contains the expected text.
 * 
 * @param {string} field - The element identifier where text should be verified
 * @param {string} expectedText - The expected text. Supports variable replacement.
 * @param {string} options - JSON string with optional parameters:
 *   - actionTimeout: [number] Timeout in ms (default: from config)
 *   - partialMatch: [boolean] Allow partial text match (default: false)
 *   - ignoreCase: [boolean] Case-insensitive comparison (default: true)
 *   - pattern: [string] Pattern override
 *   - screenshot: [boolean] Capture screenshot after verification (default: false)
 *   - screenshotText: [string] Description for screenshot
 *   - screenshotFullPage: [boolean] Full page screenshot (default: true)
 * 
 * @example
 * Given Web: Verify text at location -field: "checkoutPage.totalPrice" -value: "$99.99" -options: ""
 * Given Web: Verify text at location -field: "h1" -value: "Welcome" -options: "{partialMatch: true}"
 * 
 * @see {@link webActions.verifyTextAtLocation}
 */
Given("Web: Verify text at location -field: {param} -value: {param} -options: {param}", async function (field, expectedText, options) {
  let page = webFixture.getCurrentPage();
  await webActions.verifyTextAtLocation(page, field, expectedText, options);
});

/**
 * Step Definition: Verify Input Field is Present
 * 
 * Verifies that an input field exists and is visible on the page.
 * 
 * @param {string} field - The input field identifier
 * @param {string} options - JSON string with optional parameters:
 *   - actionTimeout: [number] Timeout in ms (default: from config)
 *   - pattern: [string] Pattern override
 *   - screenshot: [boolean] Capture screenshot after verification (default: false)
 *   - screenshotText: [string] Description for screenshot
 *   - screenshotFullPage: [boolean] Full page screenshot (default: true)
 * 
 * @example
 * Given Web: Verify input field is present -field: "loginPage.usernameInput" -options: ""
 * Given Web: Verify input field is present -field: "Email" -options: "{screenshot: true}"
 * 
 * @see {@link webActions.verifyInputFieldPresent}
 */
Given("Web: Verify input field is present -field: {param} -options: {param}", async function (field, options) {
  let page = webFixture.getCurrentPage();
  await webActions.verifyInputFieldPresent(page, field, options);
});

/**
 * Step Definition: Verify Input Field Value
 * 
 * Verifies that an input field contains the expected value.
 * 
 * @param {string} field - The input field identifier
 * @param {string} expectedValue - The expected value. Supports variable replacement.
 * @param {string} options - JSON string with optional parameters:
 *   - actionTimeout: [number] Timeout in ms (default: from config)
 *   - partialMatch: [boolean] Allow partial value match (default: false)
 *   - ignoreCase: [boolean] Case-insensitive comparison (default: true)
 *   - pattern: [string] Pattern override
 *   - screenshot: [boolean] Capture screenshot after verification (default: false)
 *   - screenshotText: [string] Description for screenshot
 *   - screenshotFullPage: [boolean] Full page screenshot (default: true)
 * 
 * @example
 * Given Web: Verify input field value -field: "loginPage.usernameInput" -value: "JohnDoe" -options: ""
 * Given Web: Verify input field value -field: "Email" -value: "{{email}}" -options: "{screenshot: true}"
 * 
 * @see {@link webActions.verifyInputFieldValue}
 */
Given("Web: Verify input field value -field: {param} -value: {param} -options: {param}", async function (field, expectedValue, options) {
  let page = webFixture.getCurrentPage();
  await webActions.verifyInputFieldValue(page, field, expectedValue, options);
});

/**
 * Step Definition: Verify Tab Field Present
 * 
 * Verifies that a tab element exists and is visible on the page.
 * 
 * @param {string} field - The tab identifier
 * @param {string} options - JSON string with optional parameters:
 *   - actionTimeout: [number] Timeout in ms (default: from config)
 *   - pattern: [string] Pattern override
 *   - screenshot: [boolean] Capture screenshot after verification (default: false)
 *   - screenshotText: [string] Description for screenshot
 *   - screenshotFullPage: [boolean] Full page screenshot (default: true)
 * 
 * @example
 * Given Web: Verify Tab field Present -field: "dashboardPage.settingsTab" -options: ""
 * Given Web: Verify Tab field Present -field: "Profile" -options: "{screenshot: true}"
 * 
 * @see {@link webActions.verifyTabField}
 */
Given("Web: Verify Tab field Present -field: {param} -options: {param}", async function (field, options) {
  let page = webFixture.getCurrentPage();
  await webActions.verifyTabField(page, field, options);
});

/**
 * Step Definition: Verify Toast Text Contains
 * 
 * Verifies that a toast notification contains the expected text.
 * 
 * @param {string} text - The expected text in the toast. Supports variable replacement.
 * @param {string} options - JSON string with optional parameters:
 *   - actionTimeout: [number] Timeout in ms (default: from config)
 *   - partialMatch: [boolean] Allow partial text match (default: true)
 *   - ignoreCase: [boolean] Case-insensitive comparison (default: true)
 *   - screenshot: [boolean] Capture screenshot after verification (default: false)
 *   - screenshotText: [string] Description for screenshot
 *   - screenshotFullPage: [boolean] Full page screenshot (default: true)
 * 
 * @example
 * Given Web: Verify toast text contains -text: "Saved successfully" -options: ""
 * Given Web: Verify toast text contains -text: "Error" -options: "{screenshot: true}"
 * 
 * @see {@link webActions.verifyToastTextContains}
 */
Given("Web: Verify toast text contains -text: {param} -options: {param}", async function (text, options) {
  let page = webFixture.getCurrentPage();
  await webActions.verifyToastTextContains(page, text, options);
});

/**
 * Step Definition: Wait for URL
 * 
 * Waits until the page URL matches the expected URL or pattern.
 * 
 * @param {string} url - The expected URL or URL pattern. Supports variable replacement.
 * @param {string} options - JSON string with optional parameters:
 *   - actionTimeout: [number] Timeout in ms (default: from config)
 *   - partialMatch: [boolean] Allow partial URL match (default: false)
 *   - screenshot: [boolean] Capture screenshot after URL matches (default: false)
 *   - screenshotText: [string] Description for screenshot
 *   - screenshotFullPage: [boolean] Full page screenshot (default: true)
 * 
 * @example
 * Given Web: Wait for URL -url: "{{baseUrl}}/dashboard" -options: ""
 * Given Web: Wait for URL -url: "/checkout/success" -options: "{partialMatch: true, screenshot: true}"
 * 
 * @see {@link webActions.waitForUrl}
 */
Given("Web: Wait for URL -url: {param} -options: {param}", async function (url, options) {
  let page = webFixture.getCurrentPage();
  await webActions.waitForUrl(page, url, options);
});  

/**
 * Step Definition: Press Key
 * 
 * Presses a keyboard key on the page or on a specific element.
 * 
 * @param {string} key - The key to press. Examples:
 *   - Single keys: "Enter", "Escape", "Tab", "Backspace", "Delete"
 *   - Arrow keys: "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"
 *   - Function keys: "F1", "F2", etc.
 *   - Modifiers: "Control", "Alt", "Shift", "Meta"
 *   - Combinations: "Control+A", "Shift+Tab"
 * @param {string} options - JSON string with optional parameters:
 *   - field: [string] Element to focus before pressing key
 *   - actionTimeout: [number] Timeout in ms (default: from config)
 *   - pattern: [string] Pattern override for field
 *   - screenshot: [boolean] Capture screenshot after key press (default: false)
 *   - screenshotText: [string] Description for screenshot
 *   - screenshotFullPage: [boolean] Full page screenshot (default: true)
 * 
 * @example
 * Given Web: Press Key -key: "Enter" -options: ""
 * Given Web: Press Key -key: "Escape" -options: "{screenshot: true}"
 * Given Web: Press Key -key: "Tab" -options: "{field: 'loginPage.usernameInput'}"
 * 
 * @see {@link webActions.pressKey}
 */
Given("Web: Press Key -key: {param} -options: {param}", async function (key, options) {
  let page = webFixture.getCurrentPage();
  await webActions.pressKey(page, key, options);
});

/**
 * Step Definition: Fill Billing Information with Data Table
 * 
 * Fills multiple billing information fields using a Cucumber data table.
 * This step automatically prefixes field names with "checkoutPage." and appends "Input".
 * 
 * @param {DataTable} dataTable - Cucumber data table with columns: field, value
 * 
 * Data Table Format:
 * | field     | value              |
 * | firstname | John               |
 * | lastname  | Doe                |
 * | email     | john.doe@email.com |
 * 
 * The step will convert "firstname" to "checkoutPage.firstnameInput" automatically.
 * 
 * @example
 * When I fill the billing information with the following details:
 *   | field     | value              |
 *   | firstname | John               |
 *   | lastname  | Doe                |
 *   | email     | john.doe@email.com |
 *   | address   | 123 Main St        |
 *   | city      | New York           |
 *   | zipcode   | 10001              |
 * 
 * @see {@link webActions.fill}
 */
When("I fill the billing information with the following details:", async function (dataTable) {
  let page = webFixture.getCurrentPage();
  const rows = dataTable.hashes(); // Convert data table to array of objects
  
  for (const row of rows) {
    const field = `checkoutPage.${row.field}Input`;
    const value = row.value;
    await webActions.fill(page, field, value, "");
  }
});

/**
 * Step Definition: Add Products to Cart with Data Table
 * 
 * Processes multiple products using a Cucumber data table.
 * This is a demonstration step that logs product information and verifies the order summary.
 * 
 * @param {DataTable} dataTable - Cucumber data table with columns: product, quantity, price
 * 
 * Data Table Format:
 * | product  | quantity | price  |
 * | Laptop   | 1        | $999   |
 * | Mouse    | 2        | $25    |
 * 
 * @example
 * When I add the following products to cart:
 *   | product  | quantity | price  |
 *   | Laptop   | 1        | $999   |
 *   | Mouse    | 2        | $25    |
 *   | Keyboard | 1        | $75    |
 * 
 * @note This is a demonstration step. In a real scenario, you would interact with
 *       product elements on the page to add items to the cart.
 * 
 * @see {@link webActions.verifyTextOnPage}
 */
When("I add the following products to cart:", async function (dataTable) {
  let page = webFixture.getCurrentPage();
  const products = dataTable.hashes(); // Convert data table to array of objects
  
  // Log the products being added (for demonstration purposes)
  for (const product of products) {
    console.log(`Adding product: ${product.product}, Quantity: ${product.quantity}, Price: ${product.price}`);
    // In a real scenario, you would interact with product elements on the page
    // For this demonstration, we're just verifying the data table is parsed correctly
  }
  
  // Verify that the order summary section is visible (as a basic check)
  await webActions.verifyTextOnPage(page, "Order Summary", "{partialMatch: true}");
});