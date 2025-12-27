# Cucumber User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Gherkin Syntax](#gherkin-syntax)
4. [Writing Feature Files](#writing-feature-files)
5. [Pattern Locator Usage](#pattern-locator-usage)
6. [Variable System Integration](#variable-system-integration)
7. [Step Definition Reference](#step-definition-reference)
8. [Best Practices](#best-practices)
9. [Common Patterns](#common-patterns)
10. [Troubleshooting](#troubleshooting)

---

## Introduction

This guide will help you write effective Cucumber BDD tests using the Playwright automation framework. Cucumber allows you to write human-readable test scenarios using Gherkin syntax, making your tests accessible to both technical and non-technical stakeholders.

### What is Cucumber?

Cucumber is a Behavior-Driven Development (BDD) testing framework that uses Gherkin syntax to describe test scenarios in plain English. It bridges the gap between business requirements and automated tests.

### What is Gherkin?

Gherkin is a business-readable domain-specific language that lets you describe software behavior without detailing how that behavior is implemented. It uses keywords like `Feature`, `Scenario`, `Given`, `When`, `Then`, and `And` to structure test cases.

---

## Getting Started

### Prerequisites

- Node.js and npm installed
- Playwright and Cucumber dependencies installed (already configured in this framework)
- Basic understanding of test automation concepts

### Running Your First Test

1. Navigate to the `features/` directory
2. Open an existing feature file (e.g., `features/login/user-login.feature`)
3. Run the test:
   ```bash
   npm test
   ```

### Project Structure

```
features/
├── login/
│   └── user-login.feature
├── checkout/
│   └── shopping-cart.feature
└── navigation/
    └── web-actions.feature
```

---

## Gherkin Syntax

### Basic Keywords

#### Feature
Describes the feature being tested. Should include a brief description of the feature's purpose.

```gherkin
Feature: User Login
  As a user
  I want to log into the application
  So that I can access my account
```

#### Background
Steps that run before each scenario in the feature file. Use for common setup steps.

```gherkin
Background:
  Given Web: Open browser -url: "#{env.PLAYQ_PROJECT_ROOT}/test-pages/login.html" -options: ""
```

#### Scenario
A single test case with a specific set of steps.

```gherkin
Scenario: Successful login with valid credentials
  When Web: Fill -field: "loginPage.usernameInput" -value: "testuser" -options: ""
  And Web: Fill -field: "loginPage.passwordInput" -value: "testpass" -options: ""
  And Web: Click button -field: "loginPage.loginButton" -options: ""
  Then Web: Wait for URL -url: "home.html" -options: "{partialMatch: true}"
```

#### Scenario Outline
A template scenario that runs multiple times with different data from an Examples table.

```gherkin
Scenario Outline: Login with different credentials
  When Web: Fill -field: "loginPage.usernameInput" -value: "<username>" -options: ""
  And Web: Fill -field: "loginPage.passwordInput" -value: "<password>" -options: ""
  And Web: Click button -field: "loginPage.loginButton" -options: ""
  Then Web: Verify text on page -text: "<expectedResult>" -options: "{partialMatch: true}"

  Examples:
    | username  | password    | expectedResult                |
    | testuser  | testpass    | home.html                     |
    | admin     | wrongpass   | Invalid username or password  |
```

### Step Keywords

- **Given**: Describes the initial context or preconditions
- **When**: Describes an action or event
- **Then**: Describes an expected outcome or result
- **And**: Continues the previous step type
- **But**: Continues the previous step type (typically for negative conditions)

### Tags

Tags allow you to organize and filter scenarios:

```gherkin
@smoke @login
Scenario: Successful login with valid credentials
  # ... steps ...
```

Run specific tags:
```bash
npm test -- --tags "@smoke"
npm test -- --tags "@smoke and @login"
npm test -- --tags "@smoke or @regression"
```

---

## Writing Feature Files

### Feature File Structure

```gherkin
Feature: Feature Name
  Brief description of the feature
  
  Background:
    # Common setup steps
  
  @tag1 @tag2
  Scenario: Scenario name
    Given [precondition]
    When [action]
    Then [expected result]
  
  @tag3
  Scenario Outline: Parameterized scenario
    Given [precondition with <parameter>]
    When [action with <parameter>]
    Then [expected result with <parameter>]
    
    Examples:
      | parameter | expected |
      | value1    | result1  |
      | value2    | result2  |
```

### Writing Effective Scenarios

#### 1. Keep Scenarios Focused
Each scenario should test one specific behavior:

**Good:**
```gherkin
Scenario: User can login with valid credentials
  When Web: Fill -field: "loginPage.usernameInput" -value: "testuser" -options: ""
  And Web: Fill -field: "loginPage.passwordInput" -value: "testpass" -options: ""
  And Web: Click button -field: "loginPage.loginButton" -options: ""
  Then Web: Wait for URL -url: "home.html" -options: "{partialMatch: true}"
```

**Bad:**
```gherkin
Scenario: User can login and add items to cart and checkout
  # Too many behaviors in one scenario
```

#### 2. Use Descriptive Names
Scenario names should clearly describe what is being tested:

**Good:**
```gherkin
Scenario: Login with empty username shows error
```

**Bad:**
```gherkin
Scenario: Test 1
```

#### 3. Follow Given-When-Then Structure
- **Given**: Set up the initial state
- **When**: Perform the action being tested
- **Then**: Verify the expected outcome

```gherkin
Scenario: Add item to cart
  Given Web: Open browser -url: "#{env.PLAYQ_PROJECT_ROOT}/test-pages/home.html" -options: ""
  When Web: Click button -field: "homePage.addToCartButton" -options: ""
  Then Web: Verify text on page -text: "Item added to cart" -options: "{partialMatch: true}"
```

### Using Data Tables

Data tables allow you to pass structured data to steps:

```gherkin
Scenario: Fill checkout form with multiple fields
  When I fill the billing information with the following details:
    | field     | value              |
    | firstname | John               |
    | lastname  | Doe                |
    | email     | john.doe@email.com |
    | address   | 123 Main St        |
    | city      | New York           |
    | zipcode   | 10001              |
```

---

## Pattern Locator Usage

Pattern locators provide a maintainable way to identify UI elements. Instead of hardcoding selectors in your feature files, you reference pattern definitions.

### What are Pattern Locators?

Pattern locators are defined in TypeScript files under `resources/locators/pattern/` and use a simple syntax to identify elements by text, attributes, or other properties.

### Pattern File Example

```typescript
// resources/locators/pattern/loginPage.pattern.ts
export const loginPage = {
  usernameInput: {
    text: "Username",
    type: "input"
  },
  passwordInput: {
    text: "Password",
    type: "input"
  },
  loginButton: {
    text: "Login",
    type: "button"
  },
  rememberCheckbox: {
    text: "Remember me",
    type: "checkbox"
  },
  forgotPasswordLink: {
    text: "Forgot Password",
    type: "link"
  }
};
```

### Using Pattern Locators in Feature Files

Reference pattern locators using the format: `pageName.fieldName`

```gherkin
Scenario: Login with pattern locators
  When Web: Fill -field: "loginPage.usernameInput" -value: "testuser" -options: ""
  And Web: Fill -field: "loginPage.passwordInput" -value: "testpass" -options: ""
  And Web: Click button -field: "loginPage.loginButton" -options: ""
```

### Benefits of Pattern Locators

1. **Maintainability**: Update locators in one place
2. **Readability**: Semantic names instead of complex selectors
3. **Reusability**: Share locators across multiple tests
4. **Flexibility**: Support multiple locator strategies (text, attributes, xpath, css)

### Alternative Locator Strategies

You can also use direct text or selectors when pattern locators aren't defined:

```gherkin
# Using text directly
When Web: Click button -field: "Submit" -options: ""

# Using xpath selector
When Web: Click button -field: "xpath=//button[@id='submit']" -options: ""

# Using css selector
When Web: Fill -field: "css=#username" -value: "testuser" -options: ""
```

---

## Variable System Integration

The framework includes a powerful variable system that allows you to use dynamic values in your feature files.

### Variable Syntax

Variables use the `#{variableName}` syntax:

```gherkin
Given Web: Open browser -url: "#{env.PLAYQ_PROJECT_ROOT}/test-pages/login.html" -options: ""
When Web: Fill -field: "loginPage.usernameInput" -value: "#{var.static.username}" -options: ""
```

### Variable Types

#### 1. Environment Variables
Access environment variables using `#{env.VARIABLE_NAME}`:

```gherkin
Given Web: Open browser -url: "#{env.BASE_URL}/login" -options: ""
```

#### 2. Static Variables
Defined in `resources/variable.ts`:

```gherkin
When Web: Fill -field: "loginPage.usernameInput" -value: "#{var.static.testUsername}" -options: ""
```

#### 3. Configuration Variables
Defined in `resources/config.ts`:

```gherkin
Then Web: Wait for URL -url: "#{config.baseUrl}/dashboard" -options: ""
```

#### 4. Runtime Variables
Set during test execution using the vars system:

```typescript
// In a custom step definition
vars.setValue("sessionToken", "abc123");
```

```gherkin
# Use in subsequent steps
When Web: Fill -field: "tokenInput" -value: "#{sessionToken}" -options: ""
```

### Variable Transformations

#### Convert to Number
```gherkin
When Web: Fill -field: "ageInput" -value: "#{userAge.(toNumber)}" -options: ""
```

#### Encrypted Values
```gherkin
# Decrypt encrypted password
When Web: Fill -field: "passwordInput" -value: "#{pwd.encryptedValue}" -options: ""
```

### Common Variable Use Cases

#### 1. Environment-Specific URLs
```gherkin
Background:
  Given Web: Open browser -url: "#{env.BASE_URL}" -options: ""
```

#### 2. Test Data
```gherkin
Scenario: Login with test credentials
  When Web: Fill -field: "loginPage.usernameInput" -value: "#{var.static.testUser}" -options: ""
  And Web: Fill -field: "loginPage.passwordInput" -value: "#{var.static.testPassword}" -options: ""
```

#### 3. Dynamic File Paths
```gherkin
Given Web: Open browser -url: "file://#{env.PLAYQ_PROJECT_ROOT}/test-pages/login.html" -options: ""
```

---

## Step Definition Reference

### Navigation Steps

#### Open Browser
Opens a browser and navigates to the specified URL.

```gherkin
Given Web: Open browser -url: "https://example.com" -options: ""
Given Web: Open browser -url: "#{env.BASE_URL}" -options: "{screenshot: true}"
```

#### Navigate by Path
Navigates to a relative path from the current URL.

```gherkin
When Web: Navigate by path -relativePath: "/dashboard" -options: ""
When Web: Navigate by path -relativePath: "#{config.profilePath}" -options: ""
```

### Click Actions

#### Click Button
Clicks a button element.

```gherkin
When Web: Click button -field: "loginPage.submitButton" -options: ""
When Web: Click button -field: "Submit" -options: "{screenshot: true}"
```

#### Click Link
Clicks a link element.

```gherkin
When Web: Click link -field: "homePage.loginLink" -options: ""
When Web: Click link -field: "Sign Up" -options: ""
```

#### Click Radio Button
Selects a radio button.

```gherkin
When Web: Click radio button -field: "checkoutPage.paypalRadio" -options: ""
When Web: Click radio button -field: "{radio_group:: Payment Method} Credit Card" -options: ""
```

#### Click Checkbox
Checks a checkbox.

```gherkin
When Web: Click checkbox -field: "checkoutPage.termsCheckbox" -options: ""
When Web: Click checkbox -field: "I agree to terms" -options: ""
```

#### Click Tab
Clicks a tab to switch content.

```gherkin
When Web: Click tab -field: "dashboardPage.settingsTab" -options: ""
```

### Input Actions

#### Fill
Fills an input field with a value.

```gherkin
When Web: Fill -field: "loginPage.usernameInput" -value: "testuser" -options: ""
When Web: Fill -field: "Email" -value: "#{var.static.email}" -options: "{screenshot: true}"
```

#### Select Dropdown
Selects an option from a dropdown.

```gherkin
When Web: Select Dropdown -field: "checkoutPage.countryDropdown" -value: "United States" -options: ""
```

### Verification Steps

#### Verify Text on Page
Verifies text appears anywhere on the page.

```gherkin
Then Web: Verify text on page -text: "Welcome" -options: ""
Then Web: Verify text on page -text: "Order Confirmed" -options: "{partialMatch: true}"
```

#### Verify Text at Location
Verifies text at a specific element.

```gherkin
Then Web: Verify text at location -field: "checkoutPage.totalPrice" -value: "$99.99" -options: ""
```

#### Verify Header
Verifies header text.

```gherkin
Then Web: Verify header -text: "Welcome Back!" -options: ""
```

#### Verify Page Title
Verifies the page title.

```gherkin
Then Web: Verify page title -text: "Home - My Store" -options: ""
```

#### Verify Input Field is Present
Verifies an input field exists.

```gherkin
Then Web: Verify input field is present -field: "loginPage.usernameInput" -options: ""
```

#### Verify Input Field Value
Verifies an input field contains a specific value.

```gherkin
Then Web: Verify input field value -field: "loginPage.usernameInput" -value: "JohnDoe" -options: ""
```

### Wait Actions

#### Wait for URL
Waits for the URL to match a pattern.

```gherkin
Then Web: Wait for URL -url: "#{env.BASE_URL}/dashboard" -options: ""
Then Web: Wait for URL -url: "/checkout/success" -options: "{partialMatch: true}"
```

#### Wait for Text at Location
Waits for text to appear at a specific location.

```gherkin
Then Web: Wait for Text at Location -field: "checkoutPage.statusMessage" -text: "Order Confirmed" -options: ""
```

#### Wait for Input State
Waits for an input to be enabled or disabled.

```gherkin
Then Web: Wait for Input -field: "loginPage.submitButton" -state: "enabled" (enabled or disabled) -options: ""
```

### Other Actions

#### Press Key
Presses a keyboard key.

```gherkin
When Web: Press Key -key: "Enter" -options: ""
When Web: Press Key -key: "Escape" -options: ""
When Web: Press Key -key: "Control+A" -options: ""
```

#### Mouseover on Link
Hovers over a link.

```gherkin
When Web: Mouseover on link -field: "homePage.menuLink" -options: ""
```

---

## Best Practices

### 1. Use Background for Common Setup
```gherkin
Background:
  Given Web: Open browser -url: "#{env.BASE_URL}" -options: ""
```

### 2. Tag Your Scenarios
```gherkin
@smoke @login
Scenario: Successful login
```

### 3. Use Scenario Outlines for Data-Driven Tests
```gherkin
Scenario Outline: Login with different users
  When Web: Fill -field: "loginPage.usernameInput" -value: "<username>" -options: ""
  Then Web: Verify text on page -text: "<message>" -options: "{partialMatch: true}"
  
  Examples:
    | username | message |
    | admin    | Admin Dashboard |
    | user     | User Dashboard  |
```

### 4. Keep Steps Reusable
Write steps that can be reused across multiple scenarios.

### 5. Use Pattern Locators
Always prefer pattern locators over direct selectors for maintainability.

### 6. Use Variables for Test Data
Store test data in variables rather than hardcoding in feature files.

### 7. Write Descriptive Scenario Names
Make it clear what each scenario tests.

### 8. One Assertion Per Scenario
Focus each scenario on testing one specific behavior.

---

## Common Patterns

### Login Flow
```gherkin
Scenario: User can login successfully
  Given Web: Open browser -url: "#{env.BASE_URL}/login" -options: ""
  When Web: Fill -field: "loginPage.usernameInput" -value: "#{var.static.username}" -options: ""
  And Web: Fill -field: "loginPage.passwordInput" -value: "#{var.static.password}" -options: ""
  And Web: Click button -field: "loginPage.loginButton" -options: ""
  Then Web: Wait for URL -url: "#{env.BASE_URL}/dashboard" -options: "{partialMatch: true}"
  And Web: Verify text on page -text: "Welcome" -options: "{partialMatch: true}"
```

### Form Submission
```gherkin
Scenario: Submit contact form
  Given Web: Open browser -url: "#{env.BASE_URL}/contact" -options: ""
  When Web: Fill -field: "contactPage.nameInput" -value: "John Doe" -options: ""
  And Web: Fill -field: "contactPage.emailInput" -value: "john@example.com" -options: ""
  And Web: Fill -field: "contactPage.messageInput" -value: "Test message" -options: ""
  And Web: Click button -field: "contactPage.submitButton" -options: ""
  Then Web: Verify text on page -text: "Message sent successfully" -options: "{partialMatch: true}"
```

### Shopping Cart
```gherkin
Scenario: Add item to cart
  Given Web: Open browser -url: "#{env.BASE_URL}/products" -options: ""
  When Web: Click button -field: "productsPage.addToCartButton" -options: ""
  Then Web: Verify text on page -text: "Item added to cart" -options: "{partialMatch: true}"
  When Web: Click link -field: "View Cart" -options: ""
  Then Web: Wait for URL -url: "/cart" -options: "{partialMatch: true}"
  And Web: Verify text at location -field: "cartPage.itemCount" -value: "1" -options: ""
```

---

## Troubleshooting

### Common Issues

#### 1. Undefined Step Definition
**Error**: `Undefined step: Web: Click button -field: "loginButton" -options: ""`

**Solution**: Check that the step definition exists in `src/helper/actions/webStepDefs.ts` and matches the exact syntax.

#### 2. Pattern Locator Not Found
**Error**: `Pattern field "loginPage.usernameInput" not found`

**Solution**: 
- Verify the pattern file exists at `resources/locators/pattern/loginPage.pattern.ts`
- Check that the field is exported correctly
- Ensure the field name matches exactly (case-sensitive)

#### 3. Variable Not Found
**Warning**: `Variable "username" not found, using placeholder as-is`

**Solution**:
- Check that the variable is defined in `resources/variable.ts` or `resources/config.ts`
- Verify the variable syntax: `#{var.static.username}` or `#{env.USERNAME}`

#### 4. Element Not Found
**Error**: `Failed to click element "loginButton". Timeout exceeded`

**Solution**:
- Verify the element exists on the page
- Check if the element is visible and not hidden
- Increase timeout in options: `{actionTimeout: 30000}`
- Use screenshot option to debug: `{screenshot: true}`

#### 5. Scenario Fails Intermittently
**Solution**:
- Add explicit waits: `Web: Wait for URL` or `Web: Wait for Text at Location`
- Increase timeouts in options
- Check for race conditions in the application

### Debugging Tips

#### 1. Use Screenshots
Add screenshot options to capture the page state:
```gherkin
When Web: Click button -field: "submitButton" -options: "{screenshot: true, screenshotText: 'After clicking submit'}"
```

#### 2. Use Screenshot Before Action
Capture the state before an action:
```gherkin
When Web: Click button -field: "submitButton" -options: "{screenshotBefore: true}"
```

#### 3. Check Test Results
Review the HTML report at `test-results/cucumber-report.html` for detailed execution logs and screenshots.

#### 4. Run Specific Scenarios
Use tags to run only the failing scenario:
```bash
npm test -- --tags "@failing-scenario"
```

#### 5. Enable Headed Mode
Run tests in headed mode to see the browser:
```bash
# Set in environment or config
HEADLESS=false npm test
```

---

## Next Steps

- Review the [Step Definition Reference Guide](./cucumber-step-definition-reference.md) for complete step documentation
- Check out example feature files in the `features/` directory
- Learn about [Pattern Locators](../documents/01-pattern-locator-overview.md)
- Explore the [Quick Start Guide](../documents/00-quick-start.md)

---

## Additional Resources

- [Cucumber Documentation](https://cucumber.io/docs/cucumber/)
- [Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)
- [Playwright Documentation](https://playwright.dev/)
- [Pattern Locator Documentation](../documents/01-pattern-locator-overview.md)
