# Cucumber Step Definition Reference

Complete reference for all available Cucumber step definitions in the Playwright automation framework.

## Quick Reference

| Category | Step Count | Description |
|----------|------------|-------------|
| Navigation | 2 | Browser navigation and URL handling |
| Click Actions | 6 | Button, link, checkbox, radio, tab clicks |
| Input Actions | 3 | Fill inputs, select dropdowns |
| Verification | 8 | Verify text, elements, page state |
| Wait Actions | 3 | Wait for URL, text, input state |
| Keyboard | 1 | Press keys |
| Mouse | 1 | Hover actions |
| Data Tables | 2 | Process multiple rows of data |

---

## Navigation Steps

### 1. Open Browser
```gherkin
Given Web: Open browser -url: {param} -options: {param}
```
Opens browser and navigates to URL. Supports variables: `#{env.BASE_URL}`, `#{var.static.url}`

**Examples:**
```gherkin
Given Web: Open browser -url: "https://example.com" -options: ""
Given Web: Open browser -url: "#{env.BASE_URL}" -options: "{screenshot: true}"
```

### 2. Navigate by Path
```gherkin
Given Web: Navigate by path -relativePath: {param} -options: {param}
```
Navigates to relative path from current URL.

**Examples:**
```gherkin
When Web: Navigate by path -relativePath: "/dashboard" -options: ""
When Web: Navigate by path -relativePath: "#{config.profilePath}" -options: ""
```

---

## Click Actions

### 3. Click Button
```gherkin
Given Web: Click button -field: {param} -options: {param}
```
Clicks button by pattern locator, text, or selector.

**Field Formats:**
- Pattern: `"loginPage.submitButton"`
- Text: `"Submit"`, `"Login"`
- Selector: `"xpath=//button[@id='submit']"`

**Examples:**
```gherkin
When Web: Click button -field: "loginPage.submitButton" -options: ""
When Web: Click button -field: "Submit" -options: "{screenshot: true}"
```

### 4. Click Link
```gherkin
Given Web: Click link -field: {param} -options: {param}
```
Clicks link by pattern locator, text, or selector.

**Examples:**
```gherkin
When Web: Click link -field: "homePage.loginLink" -options: ""
When Web: Click link -field: "Sign Up" -options: ""
```

### 5. Click Radio Button
```gherkin
Given Web: Click radio button -field: {param} -options: {param}
```
Selects radio button. Supports radio groups.

**Examples:**
```gherkin
When Web: Click radio button -field: "checkoutPage.paypalRadio" -options: ""
When Web: Click radio button -field: "{radio_group:: Payment} Credit Card" -options: ""
```

### 6. Click Checkbox
```gherkin
Given Web: Click checkbox -field: {param} -options: {param}
```
Checks checkbox by pattern locator or text.

**Examples:**
```gherkin
When Web: Click checkbox -field: "checkoutPage.termsCheckbox" -options: ""
When Web: Click checkbox -field: "I agree to terms" -options: ""
```

### 7. Click Tab
```gherkin
Given Web: Click tab -field: {param} -options: {param}
```
Clicks tab to switch content sections.

**Examples:**
```gherkin
When Web: Click tab -field: "dashboardPage.settingsTab" -options: ""
When Web: Click tab -field: "Profile" -options: ""
```

### 8. Mouseover on Link
```gherkin
Given Web: Mouseover on link -field: {param} -options: {param}
```
Hovers mouse over link to trigger hover effects.

**Examples:**
```gherkin
When Web: Mouseover on link -field: "homePage.menuLink" -options: ""
When Web: Mouseover on link -field: "Products" -options: ""
```

---

## Input Actions

### 9. Fill
```gherkin
Given Web: Fill -field: {param} -value: {param} -options: {param}
```
Fills input field with value. Supports variables.

**Field Formats:**
- Pattern: `"loginPage.usernameInput"`
- Label: `"Username"`, `"Email"`
- Placeholder: `"Enter your email"`
- Selector: `"xpath=//input[@name='username']"`

**Examples:**
```gherkin
When Web: Fill -field: "loginPage.usernameInput" -value: "testuser" -options: ""
When Web: Fill -field: "Email" -value: "#{var.static.email}" -options: ""
When Web: Fill -field: "Username" -value: "JohnDoe" -options: "{screenshotField: true}"
```

### 10. Fill Input (Legacy)
```gherkin
Given Web: Fill input -field: {param} -value: {param} -options: {param}
```
Legacy alias for Fill step. Use "Fill" instead.

### 11. Select Dropdown
```gherkin
Given Web: Select Dropdown -field: {param} -value: {param} -options: {param}
```
Selects option from dropdown by text or value.

**Examples:**
```gherkin
When Web: Select Dropdown -field: "checkoutPage.countryDropdown" -value: "United States" -options: ""
When Web: Select Dropdown -field: "Country" -value: "#{var.static.country}" -options: ""
```

---

## Verification Steps

### 12. Verify Text on Page
```gherkin
Given Web: Verify text on page -text: {param} -options: {param}
```
Verifies text appears anywhere on page.

**Examples:**
```gherkin
Then Web: Verify text on page -text: "Welcome" -options: ""
Then Web: Verify text on page -text: "Order Confirmed" -options: "{partialMatch: true}"
```

### 13. Verify Text at Location
```gherkin
Given Web: Verify text at location -field: {param} -value: {param} -options: {param}
```
Verifies specific element contains expected text.

**Examples:**
```gherkin
Then Web: Verify text at location -field: "checkoutPage.totalPrice" -value: "$99.99" -options: ""
Then Web: Verify text at location -field: "h1" -value: "Welcome" -options: "{partialMatch: true}"
```

### 14. Verify Header
```gherkin
Given Web: Verify header -text: {param} -options: {param}
```
Verifies header element contains expected text.

**Examples:**
```gherkin
Then Web: Verify header -text: "Welcome Back!" -options: ""
Then Web: Verify header -text: "Dashboard" -options: "{partialMatch: true}"
```

### 15. Verify Page Title
```gherkin
Given Web: Verify page title -text: {param} -options: {param}
```
Verifies page title matches expected text.

**Examples:**
```gherkin
Then Web: Verify page title -text: "Home - My Store" -options: ""
Then Web: Verify page title -text: "Dashboard" -options: "{partial_check: true}"
```

### 16. Verify Input Field is Present
```gherkin
Given Web: Verify input field is present -field: {param} -options: {param}
```
Verifies input field exists and is visible.

**Examples:**
```gherkin
Then Web: Verify input field is present -field: "loginPage.usernameInput" -options: ""
Then Web: Verify input field is present -field: "Email" -options: ""
```

### 17. Verify Input Field Value
```gherkin
Given Web: Verify input field value -field: {param} -value: {param} -options: {param}
```
Verifies input field contains expected value.

**Examples:**
```gherkin
Then Web: Verify input field value -field: "loginPage.usernameInput" -value: "JohnDoe" -options: ""
Then Web: Verify input field value -field: "Email" -value: "#{var.static.email}" -options: ""
```

### 18. Verify Tab Field Present
```gherkin
Given Web: Verify Tab field Present -field: {param} -options: {param}
```
Verifies tab element exists and is visible.

**Examples:**
```gherkin
Then Web: Verify Tab field Present -field: "dashboardPage.settingsTab" -options: ""
Then Web: Verify Tab field Present -field: "Profile" -options: ""
```

### 19. Verify Toast Text Contains
```gherkin
Given Web: Verify toast text contains -text: {param} -options: {param}
```
Verifies toast notification contains expected text.

**Examples:**
```gherkin
Then Web: Verify toast text contains -text: "Saved successfully" -options: ""
Then Web: Verify toast text contains -text: "Error" -options: "{screenshot: true}"
```

---

## Wait Actions

### 20. Wait for URL
```gherkin
Given Web: Wait for URL -url: {param} -options: {param}
```
Waits until page URL matches expected URL or pattern.

**Examples:**
```gherkin
Then Web: Wait for URL -url: "#{env.BASE_URL}/dashboard" -options: ""
Then Web: Wait for URL -url: "/checkout/success" -options: "{partialMatch: true}"
```

### 21. Wait for Text at Location
```gherkin
Given Web: Wait for Text at Location -field: {param} -text: {param} -options: {param}
```
Waits until specified text appears at given location.

**Examples:**
```gherkin
Then Web: Wait for Text at Location -field: "checkoutPage.statusMessage" -text: "Order Confirmed" -options: ""
Then Web: Wait for Text at Location -field: "h1" -text: "Welcome" -options: "{partialMatch: true}"
```

### 22. Wait for Input State
```gherkin
Given Web: Wait for Input -field: {param} -state: {param} (enabled or disabled) -options: {param}
```
Waits for input field to reach specific state (enabled/disabled).

**Examples:**
```gherkin
Then Web: Wait for Input -field: "loginPage.submitButton" -state: "enabled" (enabled or disabled) -options: ""
Then Web: Wait for Input -field: "Email" -state: "disabled" (enabled or disabled) -options: ""
```

---

## Keyboard Actions

### 23. Press Key
```gherkin
Given Web: Press Key -key: {param} -options: {param}
```
Presses keyboard key on page or specific element.

**Supported Keys:**
- Single: `"Enter"`, `"Escape"`, `"Tab"`, `"Backspace"`, `"Delete"`
- Arrows: `"ArrowUp"`, `"ArrowDown"`, `"ArrowLeft"`, `"ArrowRight"`
- Function: `"F1"`, `"F2"`, etc.
- Modifiers: `"Control"`, `"Alt"`, `"Shift"`, `"Meta"`
- Combinations: `"Control+A"`, `"Shift+Tab"`

**Examples:**
```gherkin
When Web: Press Key -key: "Enter" -options: ""
When Web: Press Key -key: "Escape" -options: ""
When Web: Press Key -key: "Control+A" -options: ""
When Web: Press Key -key: "Tab" -options: "{field: 'loginPage.usernameInput'}"
```

---

## Data Table Steps

### 24. Fill Billing Information
```gherkin
When I fill the billing information with the following details:
```
Fills multiple billing fields using data table. Auto-prefixes with `checkoutPage.` and appends `Input`.

**Example:**
```gherkin
When I fill the billing information with the following details:
  | field     | value              |
  | firstname | John               |
  | lastname  | Doe                |
  | email     | john.doe@email.com |
  | address   | 123 Main St        |
  | city      | New York           |
  | zipcode   | 10001              |
```

### 25. Add Products to Cart
```gherkin
When I add the following products to cart:
```
Processes multiple products using data table (demonstration step).

**Example:**
```gherkin
When I add the following products to cart:
  | product  | quantity | price  |
  | Laptop   | 1        | $999   |
  | Mouse    | 2        | $25    |
```

---

## Common Options

All steps support these common options (passed as JSON string):

### Timing Options
- `actionTimeout` (number): Timeout in milliseconds (default: from config)

### Screenshot Options
- `screenshot` (boolean): Capture screenshot after action (default: false)
- `screenshotBefore` (boolean): Capture screenshot before action (default: false)
- `screenshotText` (string): Description for screenshot
- `screenshotFullPage` (boolean): Full page screenshot (default: true)
- `screenshotField` (boolean): Screenshot of field only (default: false)

### Pattern Options
- `pattern` (string): Pattern override for locator resolution
- `smartIQ_refreshLoc` (string): Refresh locator using PatternIQ

### Verification Options
- `partialMatch` (boolean): Allow partial text match (default: false)
- `ignoreCase` (boolean): Case-insensitive comparison (default: true)
- `assert` (boolean): Use assertion (default: true)

### Other Options
- `iframe` (string): Iframe selector if element is inside iframe
- `force` (boolean): Force the action (default: varies by action)

**Example with Multiple Options:**
```gherkin
When Web: Click button -field: "submitButton" -options: "{actionTimeout: 30000, screenshot: true, screenshotText: 'After submit', screenshotFullPage: true}"
```

---

## Common Usage Patterns

### Login Flow
```gherkin
Scenario: User login
  Given Web: Open browser -url: "#{env.BASE_URL}/login" -options: ""
  When Web: Fill -field: "loginPage.usernameInput" -value: "#{var.static.username}" -options: ""
  And Web: Fill -field: "loginPage.passwordInput" -value: "#{var.static.password}" -options: ""
  And Web: Click button -field: "loginPage.loginButton" -options: ""
  Then Web: Wait for URL -url: "#{env.BASE_URL}/dashboard" -options: "{partialMatch: true}"
  And Web: Verify text on page -text: "Welcome" -options: "{partialMatch: true}"
```

### Form Submission
```gherkin
Scenario: Submit form
  When Web: Fill -field: "contactPage.nameInput" -value: "John Doe" -options: ""
  And Web: Fill -field: "contactPage.emailInput" -value: "john@example.com" -options: ""
  And Web: Select Dropdown -field: "contactPage.subjectDropdown" -value: "Support" -options: ""
  And Web: Click button -field: "contactPage.submitButton" -options: ""
  Then Web: Verify text on page -text: "Message sent" -options: "{partialMatch: true}"
```

### Navigation and Verification
```gherkin
Scenario: Navigate and verify
  Given Web: Open browser -url: "#{env.BASE_URL}" -options: ""
  When Web: Click link -field: "homePage.productsLink" -options: ""
  Then Web: Wait for URL -url: "/products" -options: "{partialMatch: true}"
  And Web: Verify header -text: "Our Products" -options: ""
  And Web: Verify text on page -text: "Browse our catalog" -options: "{partialMatch: true}"
```

---

## Troubleshooting

### Issue: Step Not Found
**Error:** `Undefined step: Web: Click button...`

**Solutions:**
- Verify step syntax matches exactly (case-sensitive)
- Check step definition exists in `src/helper/actions/webStepDefs.ts`
- Ensure all parameters are provided

### Issue: Pattern Locator Not Found
**Error:** `Pattern field "loginPage.usernameInput" not found`

**Solutions:**
- Check pattern file exists: `resources/locators/pattern/loginPage.pattern.ts`
- Verify field is exported correctly
- Ensure field name matches (case-sensitive)

### Issue: Element Not Found
**Error:** `Failed to click element. Timeout exceeded`

**Solutions:**
- Verify element exists and is visible
- Increase timeout: `{actionTimeout: 30000}`
- Add wait before action: `Web: Wait for Text at Location`
- Use screenshot to debug: `{screenshot: true}`

### Issue: Variable Not Resolved
**Warning:** `Variable "username" not found`

**Solutions:**
- Check variable is defined in `resources/variable.ts` or `resources/config.ts`
- Verify syntax: `#{var.static.username}` or `#{env.USERNAME}`
- Check environment variables are set

### Issue: Options Not Parsed
**Error:** `Failed to parse options string`

**Solutions:**
- Use valid JSON format: `{key: value}` not `{key=value}`
- Use double quotes for strings: `{text: "value"}`
- Escape special characters properly
- Use empty string if no options: `""`

---

## Additional Resources

- [Cucumber User Guide](./cucumber-user-guide.md) - Complete guide to writing feature files
- [Pattern Locator Documentation](../documents/01-pattern-locator-overview.md) - Learn about pattern locators
- [Variable System Documentation](../documents/00-quick-start.md) - Using variables in tests
- [Web Actions Source](../src/helper/actions/webActions.ts) - Implementation details
