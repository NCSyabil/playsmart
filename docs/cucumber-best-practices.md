# Cucumber BDD Best Practices Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Gherkin Writing Best Practices](#gherkin-writing-best-practices)
3. [Pattern Locator Naming Conventions](#pattern-locator-naming-conventions)
4. [Feature File Organization](#feature-file-organization)
5. [Step Definition Reusability](#step-definition-reusability)
6. [Performance Optimization](#performance-optimization)
7. [Testing Strategy](#testing-strategy)
8. [Code Review Guidelines](#code-review-guidelines)

---

## Introduction

This guide provides best practices for writing effective Cucumber BDD tests in the Playwright automation framework. Following these practices will help you create maintainable, readable, and reliable tests.

### Core Principles

1. **Readability First**: Tests should be readable by non-technical stakeholders
2. **Maintainability**: Tests should be easy to update when requirements change
3. **Reusability**: Steps and patterns should be reusable across tests
4. **Reliability**: Tests should be deterministic and not flaky
5. **Performance**: Tests should run efficiently

---

## Gherkin Writing Best Practices

### 1. Use Declarative Language

Write what the system should do, not how it does it.

**❌ Bad (Imperative):**
```gherkin
Scenario: Login
  Given I open the browser
  And I navigate to "https://example.com/login"
  And I find the username field
  And I type "testuser" into the username field
  And I find the password field
  And I type "testpass" into the password field
  And I find the login button
  And I click the login button
  Then I should see the dashboard
```

**✅ Good (Declarative):**
```gherkin
Scenario: User logs in with valid credentials
  Given I am on the login page
  When I login with username "testuser" and password "testpass"
  Then I should see the dashboard
```

**✅ Better (Using Framework Steps):**
```gherkin
Scenario: User logs in with valid credentials
  Given Web: Open browser -url: "#{env.BASE_URL}/login" -options: ""
  When Web: Fill -field: "loginPage.usernameInput" -value: "testuser" -options: ""
  And Web: Fill -field: "loginPage.passwordInput" -value: "testpass" -options: ""
  And Web: Click button -field: "loginPage.loginButton" -options: ""
  Then Web: Wait for URL -url: "/dashboard" -options: "{partialMatch: true}"
```

### 2. Write from User Perspective

Focus on user goals and outcomes, not technical implementation.

**❌ Bad:**
```gherkin
Scenario: Test the login API endpoint
  Given the database has a user with id 123
  When I POST to /api/login with credentials
  Then the response code should be 200
```

**✅ Good:**
```gherkin
Scenario: User logs in successfully
  Given I am a registered user
  When I login with valid credentials
  Then I should be logged in
```

### 3. Keep Scenarios Focused

Each scenario should test one specific behavior.

**❌ Bad (Multiple Behaviors):**
```gherkin
Scenario: User can login and add items to cart and checkout
  Given Web: Open browser -url: "#{env.BASE_URL}/login" -options: ""
  When Web: Fill -field: "loginPage.usernameInput" -value: "testuser" -options: ""
  And Web: Fill -field: "loginPage.passwordInput" -value: "testpass" -options: ""
  And Web: Click button -field: "loginPage.loginButton" -options: ""
  Then Web: Wait for URL -url: "/dashboard" -options: "{partialMatch: true}"
  When Web: Click link -field: "Products" -options: ""
  And Web: Click button -field: "Add to Cart" -options: ""
  Then Web: Verify text on page -text: "Item added" -options: "{partialMatch: true}"
  When Web: Click link -field: "Cart" -options: ""
  And Web: Click button -field: "Checkout" -options: ""
  # ... many more steps
```

**✅ Good (Focused Scenarios):**
```gherkin
@smoke @login
Scenario: User can login with valid credentials
  Given Web: Open browser -url: "#{env.BASE_URL}/login" -options: ""
  When Web: Fill -field: "loginPage.usernameInput" -value: "testuser" -options: ""
  And Web: Fill -field: "loginPage.passwordInput" -value: "testpass" -options: ""
  And Web: Click button -field: "loginPage.loginButton" -options: ""
  Then Web: Wait for URL -url: "/dashboard" -options: "{partialMatch: true}"

@smoke @cart
Scenario: User can add item to cart
  Given I am logged in
  And I am on the products page
  When Web: Click button -field: "Add to Cart" -options: ""
  Then Web: Verify text on page -text: "Item added" -options: "{partialMatch: true}"

@smoke @checkout
Scenario: User can complete checkout
  Given I am logged in
  And I have items in my cart
  When Web: Click button -field: "Checkout" -options: ""
  # ... checkout steps
```

### 4. Use Descriptive Scenario Names

Scenario names should clearly describe what is being tested.

**❌ Bad:**
```gherkin
Scenario: Test 1
Scenario: Login test
Scenario: Check if it works
```

**✅ Good:**
```gherkin
Scenario: User logs in with valid credentials
Scenario: User sees error message with invalid password
Scenario: User can reset forgotten password
```

### 5. Use Background for Common Setup

Extract repeated setup steps to Background section.

**❌ Bad (Repetition):**
```gherkin
Scenario: Add item to cart
  Given Web: Open browser -url: "#{env.BASE_URL}" -options: ""
  And Web: Click link -field: "Products" -options: ""
  When Web: Click button -field: "Add to Cart" -options: ""
  # ...

Scenario: View item details
  Given Web: Open browser -url: "#{env.BASE_URL}" -options: ""
  And Web: Click link -field: "Products" -options: ""
  When Web: Click link -field: "View Details" -options: ""
  # ...
```

**✅ Good (Using Background):**
```gherkin
Background:
  Given Web: Open browser -url: "#{env.BASE_URL}" -options: ""
  And Web: Click link -field: "Products" -options: ""

Scenario: Add item to cart
  When Web: Click button -field: "Add to Cart" -options: ""
  # ...

Scenario: View item details
  When Web: Click link -field: "View Details" -options: ""
  # ...
```

### 6. Use Scenario Outlines for Data-Driven Tests

When testing the same behavior with different data, use Scenario Outlines.

**❌ Bad (Duplicate Scenarios):**
```gherkin
Scenario: Login as admin
  When Web: Fill -field: "loginPage.usernameInput" -value: "admin" -options: ""
  And Web: Fill -field: "loginPage.passwordInput" -value: "admin123" -options: ""
  # ...

Scenario: Login as user
  When Web: Fill -field: "loginPage.usernameInput" -value: "user" -options: ""
  And Web: Fill -field: "loginPage.passwordInput" -value: "user123" -options: ""
  # ...

Scenario: Login as guest
  When Web: Fill -field: "loginPage.usernameInput" -value: "guest" -options: ""
  And Web: Fill -field: "loginPage.passwordInput" -value: "guest123" -options: ""
  # ...
```

**✅ Good (Scenario Outline):**
```gherkin
Scenario Outline: Login with different user types
  When Web: Fill -field: "loginPage.usernameInput" -value: "<username>" -options: ""
  And Web: Fill -field: "loginPage.passwordInput" -value: "<password>" -options: ""
  And Web: Click button -field: "loginPage.loginButton" -options: ""
  Then Web: Verify text on page -text: "<expectedMessage>" -options: "{partialMatch: true}"

  Examples:
    | username | password  | expectedMessage  |
    | admin    | admin123  | Admin Dashboard  |
    | user     | user123   | User Dashboard   |
    | guest    | guest123  | Guest Dashboard  |
```

### 7. Use Tags Effectively

Tags help organize and filter scenarios.

**Tag Categories:**

```gherkin
# Test Type Tags
@smoke       # Critical path tests (run on every commit)
@regression  # Full regression suite
@e2e         # End-to-end tests
@integration # Integration tests

# Feature Tags
@login
@checkout
@search
@cart

# Priority Tags
@critical    # Must pass before release
@high
@medium
@low

# Status Tags
@wip         # Work in progress (skip in CI)
@bug         # Known bug (skip until fixed)
@manual      # Manual test (not automated)

# Environment Tags
@staging     # Only run in staging
@production  # Safe for production

# Example Usage
@smoke @login @critical
Scenario: User logs in with valid credentials
  # ...

@regression @checkout @high
Scenario: User completes checkout with credit card
  # ...

@wip @search
Scenario: User filters search results by price
  # ... (still being developed)
```

**Running Tagged Tests:**
```bash
# Run smoke tests
npm test -- --tags "@smoke"

# Run login tests
npm test -- --tags "@login"

# Run critical tests excluding WIP
npm test -- --tags "@critical and not @wip"

# Run smoke OR regression
npm test -- --tags "@smoke or @regression"
```

### 8. Avoid Technical Details in Gherkin

Keep Gherkin business-focused, hide technical details in step definitions.

**❌ Bad (Too Technical):**
```gherkin
Scenario: Login
  Given I send a GET request to "/api/session"
  And the response code is 401
  When I POST to "/api/login" with body:
    """
    {"username": "testuser", "password": "testpass"}
    """
  Then the response code should be 200
  And the response should contain a JWT token
  And I store the token in localStorage
```

**✅ Good (Business-Focused):**
```gherkin
Scenario: User logs in successfully
  Given I am not logged in
  When I login with valid credentials
  Then I should be logged in
```

### 9. Use Consistent Step Phrasing

Use consistent patterns for Given/When/Then steps.

**Recommended Patterns:**

```gherkin
# Given - Preconditions (state)
Given I am on the login page
Given I am logged in as "admin"
Given I have items in my cart
Given the product "Laptop" is in stock

# When - Actions
When I login with username "testuser" and password "testpass"
When I click the "Add to Cart" button
When I fill the checkout form
When I submit the order

# Then - Assertions (outcomes)
Then I should see the dashboard
Then I should see "Order Confirmed"
Then the cart should contain 3 items
Then I should receive a confirmation email
```

### 10. Keep Steps at Same Abstraction Level

Don't mix high-level and low-level steps in the same scenario.

**❌ Bad (Mixed Levels):**
```gherkin
Scenario: Complete purchase
  Given I am on the products page
  When I add "Laptop" to cart
  And I fill the input field with id "email" with "test@example.com"
  And I click the element with xpath "//button[@type='submit']"
  Then I should see the order confirmation
```

**✅ Good (Consistent Level):**
```gherkin
Scenario: Complete purchase
  Given I am on the products page
  When I add "Laptop" to cart
  And I fill the checkout form with my details
  And I submit the order
  Then I should see the order confirmation
```

---

## Pattern Locator Naming Conventions

### 1. Use Descriptive Names

Pattern locator names should clearly describe the element.

**❌ Bad:**
```typescript
export const loginPage = {
  input1: { text: "Username", type: "input" },
  input2: { text: "Password", type: "input" },
  btn1: { text: "Login", type: "button" }
};
```

**✅ Good:**
```typescript
export const loginPage = {
  usernameInput: { text: "Username", type: "input" },
  passwordInput: { text: "Password", type: "input" },
  loginButton: { text: "Login", type: "button" }
};
```

### 2. Follow Naming Conventions

Use consistent naming patterns across all pattern files.

**Recommended Conventions:**

```typescript
// Inputs: {purpose}Input
usernameInput
passwordInput
emailInput
searchInput
firstNameInput

// Buttons: {action}Button
loginButton
submitButton
cancelButton
addToCartButton
checkoutButton

// Links: {destination}Link
homeLink
productsLink
cartLink
logoutLink

// Checkboxes: {purpose}Checkbox
termsCheckbox
rememberMeCheckbox
subscribeCheckbox

// Radio Buttons: {option}Radio
creditCardRadio
paypalRadio
guestCheckoutRadio

// Dropdowns: {purpose}Dropdown
countryDropdown
stateDropdown
quantityDropdown

// Text/Labels: {purpose}Text or {purpose}Label
welcomeText
errorMessageText
totalPriceLabel
statusLabel

// Sections: {purpose} (no suffix)
"Login Form"
"Billing Information"
"Order Summary"
"Navigation Menu"

// Locations: {area} (no suffix)
"Main Content"
"Header"
"Footer"
"Sidebar"
```

### 3. Use Page-Specific Prefixes

Pattern file names should match the page they represent.

**File Structure:**
```
resources/locators/pattern/
├── loginPage.pattern.ts      # Login page patterns
├── homePage.pattern.ts        # Home page patterns
├── checkoutPage.pattern.ts    # Checkout page patterns
├── productPage.pattern.ts     # Product page patterns
└── cartPage.pattern.ts        # Cart page patterns
```

**Export Names:**
```typescript
// loginPage.pattern.ts
export const loginPage = { ... };

// homePage.pattern.ts
export const homePage = { ... };

// checkoutPage.pattern.ts
export const checkoutPage = { ... };
```

### 4. Group Related Patterns

Organize patterns logically within each file.

**✅ Good Organization:**
```typescript
export const checkoutPage = {
  // Generic field patterns
  fields: {
    input: "...",
    button: "...",
    select: "..."
  },
  
  // Billing section
  billingFirstNameInput: { ... },
  billingLastNameInput: { ... },
  billingEmailInput: { ... },
  billingAddressInput: { ... },
  
  // Shipping section
  shippingFirstNameInput: { ... },
  shippingLastNameInput: { ... },
  shippingAddressInput: { ... },
  
  // Payment section
  cardNumberInput: { ... },
  cvvInput: { ... },
  expiryInput: { ... },
  
  // Actions
  submitButton: { ... },
  cancelButton: { ... },
  
  // Sections
  sections: {
    "Billing Information": "...",
    "Shipping Information": "...",
    "Payment Details": "...",
    "Order Summary": "..."
  }
};
```

### 5. Use Semantic Section Names

Section names should describe the content, not the HTML structure.

**❌ Bad:**
```typescript
sections: {
  "div1": "//div[@class='container']",
  "form-wrapper": "//div[@id='form-wrapper']"
}
```

**✅ Good:**
```typescript
sections: {
  "Login Form": "//form[@id='login'];form#login",
  "Error Message": "//div[@class='error'];div.error",
  "Forgot Password": "//div[@class='forgot-password'];div.forgot-password"
}
```

---

## Feature File Organization

### 1. Directory Structure

Organize feature files by functional area or user journey.

**✅ Recommended Structure:**
```
features/
├── authentication/
│   ├── login.feature
│   ├── logout.feature
│   ├── registration.feature
│   └── password-reset.feature
├── products/
│   ├── product-search.feature
│   ├── product-details.feature
│   └── product-reviews.feature
├── cart/
│   ├── add-to-cart.feature
│   ├── update-cart.feature
│   └── remove-from-cart.feature
├── checkout/
│   ├── guest-checkout.feature
│   ├── registered-checkout.feature
│   └── payment-methods.feature
└── account/
    ├── profile-management.feature
    ├── order-history.feature
    └── address-book.feature
```

### 2. Feature File Naming

Use descriptive, kebab-case names.

**❌ Bad:**
```
test1.feature
LoginTest.feature
login_test.feature
```

**✅ Good:**
```
user-login.feature
guest-checkout.feature
product-search.feature
password-reset.feature
```

### 3. Feature File Structure

Follow a consistent structure in all feature files.

**Template:**
```gherkin
# Feature title and description
Feature: Feature Name
  Brief description of the feature
  Additional context if needed

# Background (optional - common setup)
Background:
  Given [common precondition]

# Scenarios grouped by priority
@smoke @critical
Scenario: Most critical happy path
  # ...

@smoke
Scenario: Other important happy path
  # ...

@regression
Scenario: Edge case 1
  # ...

@regression
Scenario: Edge case 2
  # ...

# Data-driven scenarios
@regression
Scenario Outline: Parameterized test
  # ...
  Examples:
    | param1 | param2 |
    | value1 | value2 |
```

### 4. Limit Scenarios Per Feature

Keep feature files focused and manageable.

**Guidelines:**
- **Ideal**: 3-7 scenarios per feature file
- **Maximum**: 15 scenarios per feature file
- **If more**: Split into multiple feature files

**Example Split:**
```
# Instead of one large file:
products.feature (30 scenarios)

# Split into focused files:
products/
├── product-search.feature (5 scenarios)
├── product-filtering.feature (6 scenarios)
├── product-sorting.feature (4 scenarios)
├── product-details.feature (7 scenarios)
└── product-reviews.feature (8 scenarios)
```

### 5. Use Meaningful Feature Descriptions

Feature descriptions should explain the business value.

**❌ Bad:**
```gherkin
Feature: Login
```

**✅ Good:**
```gherkin
Feature: User Authentication
  As a registered user
  I want to log into the application
  So that I can access my personalized content and account features
  
  Business Rules:
  - Users must provide valid credentials
  - Failed login attempts are logged
  - Users are redirected to their intended destination after login
```

### 6. Group Related Features

Use subdirectories to group related features.

**Example:**
```
features/
├── e2e/                    # End-to-end user journeys
│   ├── complete-purchase.feature
│   └── user-onboarding.feature
├── smoke/                  # Critical smoke tests
│   └── quick-smoke.feature
└── regression/             # Full regression suite
    ├── authentication/
    ├── products/
    └── checkout/
```

---

## Step Definition Reusability

### 1. Use Framework Step Definitions

Leverage existing step definitions before creating custom ones.

**Available Framework Steps:**
- Navigation: `Web: Open browser`, `Web: Navigate by path`
- Clicks: `Web: Click button`, `Web: Click link`, `Web: Click checkbox`
- Input: `Web: Fill`, `Web: Select Dropdown`, `Web: Press Key`
- Verification: `Web: Verify text on page`, `Web: Verify text at location`
- Waits: `Web: Wait for URL`, `Web: Wait for Text at Location`

**✅ Use Framework Steps:**
```gherkin
When Web: Fill -field: "loginPage.usernameInput" -value: "testuser" -options: ""
And Web: Click button -field: "loginPage.loginButton" -options: ""
```

**❌ Don't Create Unnecessary Custom Steps:**
```gherkin
# Don't create this custom step:
When I fill the username field with "testuser"

# When you can use:
When Web: Fill -field: "loginPage.usernameInput" -value: "testuser" -options: ""
```

### 2. Create Custom Steps for Business Logic

Create custom steps for domain-specific actions.

**✅ Good Custom Steps:**
```typescript
// test/steps/authSteps.ts
import { Given, When } from '@cucumber/cucumber';
import { webFixture } from '../../src/helper/fixtures/webFixture';
import { fill, clickButton } from '../../src/helper/actions/webActions';

Given('I am logged in as {string}', async function (userType: string) {
  const page = webFixture.getCurrentPage();
  const credentials = getCredentialsForUserType(userType);
  
  await page.goto(process.env.BASE_URL + '/login');
  await fill(page, 'loginPage.usernameInput', credentials.username);
  await fill(page, 'loginPage.passwordInput', credentials.password);
  await clickButton(page, 'loginPage.loginButton');
  await page.waitForURL(/.*dashboard/);
});

When('I add {string} to cart', async function (productName: string) {
  const page = webFixture.getCurrentPage();
  
  // Navigate to product
  await page.goto(process.env.BASE_URL + '/products');
  await page.click(`text=${productName}`);
  
  // Add to cart
  await clickButton(page, 'Add to Cart');
  await page.waitForSelector('text=Item added');
});
```

**Usage in Feature Files:**
```gherkin
Scenario: User purchases product
  Given I am logged in as "customer"
  When I add "Laptop" to cart
  And I complete checkout
  Then I should see order confirmation
```

### 3. Parameterize Steps

Make steps reusable by using parameters.

**❌ Bad (Hardcoded):**
```typescript
When('I login as admin', async function () {
  await fill(page, 'loginPage.usernameInput', 'admin');
  await fill(page, 'loginPage.passwordInput', 'admin123');
});

When('I login as user', async function () {
  await fill(page, 'loginPage.usernameInput', 'user');
  await fill(page, 'loginPage.passwordInput', 'user123');
});
```

**✅ Good (Parameterized):**
```typescript
When('I login with username {string} and password {string}', 
  async function (username: string, password: string) {
    const page = webFixture.getCurrentPage();
    await fill(page, 'loginPage.usernameInput', username);
    await fill(page, 'loginPage.passwordInput', password);
    await clickButton(page, 'loginPage.loginButton');
  }
);
```

### 4. Avoid Step Definition Duplication

Don't create multiple step definitions for the same action.

**❌ Bad (Duplication):**
```typescript
When('I click the login button', async function () { ... });
When('I press the login button', async function () { ... });
When('I submit the login form', async function () { ... });
```

**✅ Good (Single Step):**
```typescript
When('I {click/press/submit} the login {button/form}', async function () {
  // One step handles all variations
});

// Or better, use framework step:
When Web: Click button -field: "loginPage.loginButton" -options: ""
```

### 5. Use Step Definition Helpers

Extract common logic into helper functions.

**✅ Good Pattern:**
```typescript
// test/steps/helpers/authHelpers.ts
export async function loginAs(page: Page, userType: string) {
  const credentials = getCredentialsForUserType(userType);
  await page.goto(process.env.BASE_URL + '/login');
  await fill(page, 'loginPage.usernameInput', credentials.username);
  await fill(page, 'loginPage.passwordInput', credentials.password);
  await clickButton(page, 'loginPage.loginButton');
  await page.waitForURL(/.*dashboard/);
}

// test/steps/authSteps.ts
import { loginAs } from './helpers/authHelpers';

Given('I am logged in as {string}', async function (userType: string) {
  const page = webFixture.getCurrentPage();
  await loginAs(page, userType);
});

Given('I am logged in', async function () {
  const page = webFixture.getCurrentPage();
  await loginAs(page, 'default');
});
```

---

## Performance Optimization

### 1. Minimize Browser Launches

Reuse browser contexts when possible.

**❌ Bad (Multiple Browser Launches):**
```gherkin
Scenario: Test 1
  Given Web: Open browser -url: "#{env.BASE_URL}" -options: ""
  # ... test steps
  # Browser closes after scenario

Scenario: Test 2
  Given Web: Open browser -url: "#{env.BASE_URL}" -options: ""
  # ... test steps
  # Browser closes after scenario
```

**✅ Good (Background):**
```gherkin
Background:
  Given Web: Open browser -url: "#{env.BASE_URL}" -options: ""

Scenario: Test 1
  # ... test steps (reuses browser from Background)

Scenario: Test 2
  # ... test steps (reuses browser from Background)
```

### 2. Use Efficient Pattern Locators

Optimize pattern locators for performance.

**❌ Slow (Complex XPath):**
```typescript
button: "//div[@class='container']//div[@class='wrapper']//div[@class='content']//button[contains(text(), '#{loc.auto.fieldName}')]"
```

**✅ Fast (Simple Selectors):**
```typescript
button: "//button[text()='#{loc.auto.fieldName}'];button:has-text('#{loc.auto.fieldName}')"
```

**Performance Tips:**
- Prefer CSS selectors over complex XPath
- Use specific selectors (id, data-testid) when available
- Limit fallback patterns to 2-4 options
- Avoid `contains()` and `//*` when possible

### 3. Reduce Explicit Waits

Use smart waits instead of arbitrary timeouts.

**❌ Bad (Arbitrary Waits):**
```gherkin
When Web: Click button -field: "submitButton" -options: ""
And I wait 5 seconds
Then Web: Verify text on page -text: "Success" -options: ""
```

**✅ Good (Smart Waits):**
```gherkin
When Web: Click button -field: "submitButton" -options: ""
Then Web: Wait for Text at Location -field: "statusMessage" -text: "Success" -options: ""
```

### 4. Run Tests in Parallel

Enable parallel execution for faster test runs.

**Configuration:**
```javascript
// cucumber.js
module.exports = {
  default: {
    parallel: 4,  // Run 4 scenarios in parallel
    // ...
  }
};
```

**Tag Strategy for Parallel Execution:**
```gherkin
# Mark tests that can't run in parallel
@serial
Scenario: Test that modifies shared state
  # ...

# Most tests can run in parallel
@smoke
Scenario: Independent test
  # ...
```

**Run Configuration:**
```bash
# Run most tests in parallel
npm test -- --tags "not @serial" --parallel 4

# Run serial tests separately
npm test -- --tags "@serial" --parallel 1
```

### 5. Optimize Pattern Locator Caching

Leverage the framework's locator caching.

**Pattern Locator Caching:**
- Locators are cached after first resolution
- Reusing the same pattern reference is fast
- Cache is cleared between scenarios

**✅ Good (Reuse Pattern References):**
```gherkin
Scenario: Fill form
  When Web: Fill -field: "checkoutPage.firstNameInput" -value: "John" -options: ""
  And Web: Fill -field: "checkoutPage.lastNameInput" -value: "Doe" -options: ""
  And Web: Fill -field: "checkoutPage.emailInput" -value: "john@example.com" -options: ""
  # All use cached checkoutPage patterns
```

### 6. Reduce Screenshot Overhead

Use screenshots strategically, not on every step.

**❌ Bad (Too Many Screenshots):**
```gherkin
When Web: Fill -field: "usernameInput" -value: "test" -options: "{screenshot: true}"
And Web: Fill -field: "passwordInput" -value: "pass" -options: "{screenshot: true}"
And Web: Click button -field: "loginButton" -options: "{screenshot: true}"
Then Web: Verify text on page -text: "Welcome" -options: "{screenshot: true}"
```

**✅ Good (Strategic Screenshots):**
```gherkin
When Web: Fill -field: "usernameInput" -value: "test" -options: ""
And Web: Fill -field: "passwordInput" -value: "pass" -options: ""
And Web: Click button -field: "loginButton" -options: "{screenshot: true, screenshotText: 'After login'}"
Then Web: Verify text on page -text: "Welcome" -options: ""
```

**Screenshot Strategy:**
- Automatic screenshots on failure (built-in)
- Manual screenshots at key verification points
- Use `screenshotBefore: true` for debugging
- Avoid screenshots in loops or repeated steps

### 7. Use Headless Mode in CI

Run tests in headless mode for faster CI execution.

**Configuration:**
```typescript
// resources/config.ts
export const config = {
  browser: {
    headless: process.env.CI === 'true' || process.env.HEADLESS === 'true',
    // ...
  }
};
```

**Local Development:**
```bash
# Headed mode (see browser)
npm test

# Headless mode (faster)
HEADLESS=true npm test
```

---

## Testing Strategy

### 1. Test Pyramid

Follow the test pyramid principle.

```
        /\
       /  \      E2E Tests (Few)
      /____\     - Full user journeys
     /      \    - Critical paths
    /        \   
   /__________\  Integration Tests (Some)
  /            \ - Feature workflows
 /              \- Multi-page flows
/________________\
                  Unit Tests (Many)
                  - Component logic
                  - Utilities
                  - Validations
```

**Cucumber Focus:**
- Use Cucumber for E2E and Integration tests
- Keep Cucumber tests focused on user workflows
- Use Playwright for unit and component tests

### 2. Smoke Test Suite

Create a fast smoke test suite for quick validation.

**Characteristics:**
- Runs in < 5 minutes
- Covers critical user paths
- Runs on every commit
- Tagged with `@smoke`

**Example:**
```gherkin
@smoke @critical
Scenario: User can login
  # ...

@smoke @critical
Scenario: User can search for products
  # ...

@smoke @critical
Scenario: User can add item to cart
  # ...

@smoke @critical
Scenario: User can complete checkout
  # ...
```

**Run Command:**
```bash
npm test -- --tags "@smoke"
```

### 3. Regression Test Suite

Maintain comprehensive regression coverage.

**Characteristics:**
- Covers all features
- Includes edge cases
- Runs nightly or before release
- Tagged with `@regression`

**Organization:**
```gherkin
@regression @login
Scenario: Login with invalid password
  # ...

@regression @login
Scenario: Login with locked account
  # ...

@regression @checkout
Scenario: Checkout with expired credit card
  # ...

@regression @checkout
Scenario: Checkout with invalid shipping address
  # ...
```

### 4. Data-Driven Testing

Use Scenario Outlines for data variations.

**✅ Good Use Cases:**
- Testing with different user types
- Testing with different input formats
- Testing with different configurations
- Testing boundary conditions

**Example:**
```gherkin
@regression @validation
Scenario Outline: Email validation
  When Web: Fill -field: "emailInput" -value: "<email>" -options: ""
  And Web: Click button -field: "submitButton" -options: ""
  Then Web: Verify text on page -text: "<expectedMessage>" -options: "{partialMatch: true}"

  Examples:
    | email                  | expectedMessage        |
    | valid@example.com      | Success                |
    | invalid.email          | Invalid email format   |
    | @example.com           | Invalid email format   |
    | user@                  | Invalid email format   |
    | user@domain            | Invalid email format   |
```

### 5. Test Independence

Ensure tests can run independently and in any order.

**✅ Good (Independent):**
```gherkin
Scenario: Add item to cart
  Given I am logged in
  And I am on the products page
  When Web: Click button -field: "Add to Cart" -options: ""
  Then Web: Verify text on page -text: "Item added" -options: "{partialMatch: true}"
```

**❌ Bad (Dependent):**
```gherkin
Scenario: Login
  When Web: Fill -field: "usernameInput" -value: "test" -options: ""
  # ... login steps

Scenario: Add item to cart
  # Assumes user is already logged in from previous scenario
  When Web: Click button -field: "Add to Cart" -options: ""
  # ...
```

### 6. Test Data Management

Use appropriate test data strategies.

**Strategies:**

**1. Static Test Data (Variables):**
```gherkin
When Web: Fill -field: "usernameInput" -value: "#{var.static.testUser}" -options: ""
```

**2. Dynamic Test Data (Faker):**
```gherkin
When Web: Fill -field: "emailInput" -value: "#{faker.internet.email}" -options: ""
```

**3. Test Data Setup (Background):**
```gherkin
Background:
  Given the following products exist:
    | name   | price | stock |
    | Laptop | 999   | 10    |
    | Mouse  | 29    | 50    |
```

**4. Test Data Cleanup (After Hooks):**
```typescript
After(async function () {
  // Clean up test data
  await cleanupTestData();
});
```

---

## Code Review Guidelines

### 1. Feature File Review Checklist

When reviewing feature files, check:

**Readability:**
- [ ] Scenario names are descriptive
- [ ] Steps use business language
- [ ] No technical implementation details
- [ ] Consistent step phrasing

**Structure:**
- [ ] Background used for common setup
- [ ] Scenario Outlines used for data-driven tests
- [ ] Appropriate tags applied
- [ ] Scenarios are focused (one behavior each)

**Maintainability:**
- [ ] Pattern locators used (not raw selectors)
- [ ] Variables used for test data
- [ ] No hardcoded URLs or credentials
- [ ] Reusable steps preferred over custom steps

**Quality:**
- [ ] Scenarios test meaningful behavior
- [ ] Edge cases covered
- [ ] Error scenarios included
- [ ] Tests are independent

### 2. Pattern Locator Review Checklist

When reviewing pattern locators, check:

**Naming:**
- [ ] Descriptive names used
- [ ] Consistent naming conventions
- [ ] Semantic section names
- [ ] Logical grouping

**Performance:**
- [ ] Simple, efficient selectors
- [ ] Limited fallback patterns (2-4)
- [ ] No overly complex XPath
- [ ] Appropriate pattern types used

**Maintainability:**
- [ ] Patterns are reusable
- [ ] No duplication across files
- [ ] Clear organization
- [ ] Comments for complex patterns

### 3. Step Definition Review Checklist

When reviewing step definitions, check:

**Reusability:**
- [ ] Framework steps used when possible
- [ ] Custom steps are parameterized
- [ ] No duplicate step definitions
- [ ] Helper functions extracted

**Quality:**
- [ ] Error handling included
- [ ] Appropriate waits used
- [ ] Screenshots used strategically
- [ ] Clean, readable code

**Testing:**
- [ ] Step definitions tested
- [ ] Edge cases handled
- [ ] Error messages are clear
- [ ] Logging included

### 4. Common Review Comments

**Feature Files:**

```gherkin
# ❌ Comment: "Scenario name is too generic"
Scenario: Test login

# ✅ Suggestion: "Use descriptive scenario name"
Scenario: User logs in with valid credentials

# ❌ Comment: "Hardcoded URL - use variable"
Given Web: Open browser -url: "https://staging.example.com" -options: ""

# ✅ Suggestion: "Use environment variable"
Given Web: Open browser -url: "#{env.BASE_URL}" -options: ""

# ❌ Comment: "Raw selector - use pattern locator"
When Web: Fill -field: "xpath=//input[@id='username']" -value: "test" -options: ""

# ✅ Suggestion: "Use pattern locator"
When Web: Fill -field: "loginPage.usernameInput" -value: "test" -options: ""

# ❌ Comment: "Duplicate scenarios - use Scenario Outline"
Scenario: Login as admin
Scenario: Login as user
Scenario: Login as guest

# ✅ Suggestion: "Combine into Scenario Outline"
Scenario Outline: Login with different user types
  Examples:
    | userType |
    | admin    |
    | user     |
    | guest    |
```

**Pattern Locators:**

```typescript
// ❌ Comment: "Name is not descriptive"
btn1: { text: "Submit", type: "button" }

// ✅ Suggestion: "Use descriptive name"
submitButton: { text: "Submit", type: "button" }

// ❌ Comment: "Pattern is too complex"
button: "//div[@class='container']//div[@class='wrapper']//button[contains(text(), '#{loc.auto.fieldName}')]"

// ✅ Suggestion: "Simplify pattern"
button: "//button[text()='#{loc.auto.fieldName}'];button:has-text('#{loc.auto.fieldName}')"

// ❌ Comment: "Too many fallback patterns"
input: "pattern1;pattern2;pattern3;pattern4;pattern5;pattern6;pattern7"

// ✅ Suggestion: "Limit to 2-4 patterns"
input: "//input[@placeholder='#{loc.auto.fieldName}'];input[placeholder='#{loc.auto.fieldName}']"
```

---

## Summary

Following these best practices will help you create maintainable, readable, and reliable Cucumber BDD tests.

**Key Takeaways:**

1. **Gherkin Writing:**
   - Use declarative language
   - Write from user perspective
   - Keep scenarios focused
   - Use tags effectively

2. **Pattern Locators:**
   - Use descriptive names
   - Follow naming conventions
   - Optimize for performance
   - Organize logically

3. **Feature Organization:**
   - Group by functional area
   - Limit scenarios per file
   - Use meaningful descriptions
   - Maintain consistent structure

4. **Step Definitions:**
   - Reuse framework steps
   - Parameterize custom steps
   - Extract helper functions
   - Avoid duplication

5. **Performance:**
   - Minimize browser launches
   - Use efficient patterns
   - Run tests in parallel
   - Use headless mode in CI

6. **Testing Strategy:**
   - Follow test pyramid
   - Maintain smoke test suite
   - Ensure test independence
   - Manage test data properly

---

## Additional Resources

- [Cucumber User Guide](cucumber-user-guide.md)
- [Migration Guide](cucumber-migration-guide.md)
- [Step Definition Reference](cucumber-step-definition-reference.md)
- [Pattern Locator Documentation](../documents/01-pattern-locator-overview.md)
- [Cucumber Official Documentation](https://cucumber.io/docs/cucumber/)
- [Gherkin Best Practices](https://cucumber.io/docs/bdd/better-gherkin/)
