# Migration Guide: Playwright to Cucumber BDD

## Table of Contents

1. [Overview](#overview)
2. [Why Migrate to Cucumber?](#why-migrate-to-cucumber)
3. [When to Use Cucumber vs Playwright](#when-to-use-cucumber-vs-playwright)
4. [Before You Start](#before-you-start)
5. [Migration Strategy](#migration-strategy)
6. [Conversion Examples](#conversion-examples)
7. [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)
8. [Troubleshooting](#troubleshooting)
9. [Migration Checklist](#migration-checklist)

---

## Overview

This guide helps you migrate existing Playwright tests to Cucumber BDD format. The framework supports both Playwright and Cucumber tests running side-by-side, allowing for gradual migration.

### Before: Playwright Test

```typescript
// playwright-tests/login.spec.ts
import { test, expect } from '@playwright/test';

test('user can login with valid credentials', async ({ page }) => {
  await page.goto('https://example.com/login');
  await page.fill('input[placeholder="Username"]', 'testuser');
  await page.fill('input[placeholder="Password"]', 'testpass');
  await page.click('button:has-text("Login")');
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.locator('text=Welcome')).toBeVisible();
});
```

### After: Cucumber Feature

```gherkin
# features/login/user-login.feature
Feature: User Login
  As a user
  I want to log into the application
  So that I can access my account

  @smoke
  Scenario: User can login with valid credentials
    Given Web: Open browser -url: "#{env.BASE_URL}/login" -options: ""
    When Web: Fill -field: "loginPage.usernameInput" -value: "testuser" -options: ""
    And Web: Fill -field: "loginPage.passwordInput" -value: "testpass" -options: ""
    And Web: Click button -field: "loginPage.loginButton" -options: ""
    Then Web: Wait for URL -url: "/dashboard" -options: "{partialMatch: true}"
    And Web: Verify text on page -text: "Welcome" -options: "{partialMatch: true}"
```

**Key Differences:**
- Human-readable Gherkin syntax
- Pattern locators instead of raw selectors
- Variable system integration
- Reusable step definitions
- Business-focused language

---

## Why Migrate to Cucumber?

### Benefits of Cucumber BDD

✅ **Business Readability**: Non-technical stakeholders can read and understand tests
✅ **Living Documentation**: Feature files serve as up-to-date documentation
✅ **Reusable Steps**: Step definitions can be reused across multiple scenarios
✅ **Collaboration**: Business analysts can write scenarios before implementation
✅ **Traceability**: Clear mapping between requirements and tests
✅ **Pattern Locators**: Maintainable element identification
✅ **Variable System**: Environment-specific configuration built-in

### When Cucumber Adds Value

- ✅ Tests need to be reviewed by non-technical stakeholders
- ✅ Requirements are written in user story format
- ✅ Multiple tests share common workflows
- ✅ Tests serve as living documentation
- ✅ Business analysts participate in test creation
- ✅ Regulatory compliance requires readable test evidence

### When Playwright Might Be Better

- ❌ Highly technical tests (performance, security)
- ❌ Complex test logic with many conditionals
- ❌ Tests that require extensive TypeScript code
- ❌ Rapid prototyping and experimentation
- ❌ Tests that don't map to user stories

---

## When to Use Cucumber vs Playwright

### Decision Matrix

| Criteria | Use Cucumber | Use Playwright |
|----------|--------------|----------------|
| **Audience** | Business + Technical | Technical only |
| **Test Type** | User acceptance, E2E | Unit, Integration, Performance |
| **Complexity** | Simple to moderate | Simple to complex |
| **Reusability** | High (step definitions) | Moderate (functions) |
| **Readability** | Very high (Gherkin) | Moderate (TypeScript) |
| **Flexibility** | Moderate (step-based) | Very high (code-based) |
| **Setup Time** | Higher (patterns + steps) | Lower (direct code) |
| **Maintenance** | Lower (pattern locators) | Higher (raw selectors) |

### Recommended Approach

**Use Cucumber for:**
- Smoke tests
- Regression tests
- User acceptance tests
- Happy path scenarios
- Tests that map to user stories

**Use Playwright for:**
- Complex test logic
- Performance tests
- Visual regression tests
- API integration tests
- Exploratory testing

**Both Can Coexist:**
The framework supports running both Playwright and Cucumber tests. You don't need to migrate everything.

---

## Before You Start

### Prerequisites

1. ✅ Framework is set up with Cucumber support
2. ✅ Pattern locators are defined for your pages
3. ✅ All existing Playwright tests are passing
4. ✅ Team understands Gherkin syntax basics
5. ✅ Variable system is configured

### Preparation Checklist

- [ ] Review [Cucumber User Guide](cucumber-user-guide.md)
- [ ] Review [Step Definition Reference](cucumber-step-definition-reference.md)
- [ ] Identify tests to migrate (start with simple ones)
- [ ] Create pattern locator files for your pages
- [ ] Set up environment variables
- [ ] Create backup branch in version control

---

## Migration Strategy

### Phased Approach (Recommended)

#### Phase 1: Pilot Migration (Week 1-2)
- Select 3-5 simple, stable tests
- Convert to Cucumber format
- Create necessary pattern locators
- Validate tests pass consistently
- Gather team feedback

#### Phase 2: Expand Coverage (Week 3-4)
- Migrate smoke test suite
- Migrate critical path tests
- Create reusable step definitions
- Document patterns and conventions

#### Phase 3: Gradual Migration (Ongoing)
- Migrate tests as they need updates
- New tests written in Cucumber
- Keep complex tests in Playwright
- Maintain both test types

#### Phase 4: Stabilization (Month 2-3)
- Optimize pattern locators
- Refactor duplicate steps
- Update documentation
- Train team members

### Migration Patterns

#### Pattern 1: Direct Conversion
Convert test line-by-line to Gherkin steps.

**Best for:** Simple, linear tests

#### Pattern 2: Scenario Outline
Convert data-driven tests to Scenario Outlines.

**Best for:** Tests with multiple data sets

#### Pattern 3: Background Extraction
Extract common setup to Background section.

**Best for:** Tests with shared preconditions

#### Pattern 4: Hybrid Approach
Keep complex logic in Playwright, use Cucumber for user flows.

**Best for:** Tests with complex calculations or conditionals

---

## Conversion Examples

### Example 1: Simple Login Test

#### Before: Playwright

```typescript
import { test, expect } from '@playwright/test';

test('successful login', async ({ page }) => {
  await page.goto('https://example.com/login');
  await page.fill('input[placeholder="Username"]', 'testuser');
  await page.fill('input[placeholder="Password"]', 'testpass');
  await page.click('button:has-text("Login")');
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.locator('text=Welcome')).toBeVisible();
});
```

#### After: Cucumber

**Step 1: Create pattern locator**

```typescript
// resources/locators/pattern/loginPage.pattern.ts
export const loginPage = {
  fields: {
    button: "//button[text()='#{loc.auto.fieldName}'];button:has-text('#{loc.auto.fieldName}')",
    input: "//input[@placeholder='#{loc.auto.fieldName}'];input[placeholder='#{loc.auto.fieldName}']"
  },
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
  }
};
```

**Step 2: Create feature file**

```gherkin
# features/login/user-login.feature
Feature: User Login
  As a user
  I want to log into the application
  So that I can access my account

  Background:
    Given Web: Open browser -url: "#{env.BASE_URL}/login" -options: ""

  @smoke
  Scenario: Successful login with valid credentials
    When Web: Fill -field: "loginPage.usernameInput" -value: "testuser" -options: ""
    And Web: Fill -field: "loginPage.passwordInput" -value: "testpass" -options: ""
    And Web: Click button -field: "loginPage.loginButton" -options: ""
    Then Web: Wait for URL -url: "/dashboard" -options: "{partialMatch: true}"
    And Web: Verify text on page -text: "Welcome" -options: "{partialMatch: true}"
```

### Example 2: Data-Driven Test

#### Before: Playwright

```typescript
import { test, expect } from '@playwright/test';

const testData = [
  { username: 'admin', password: 'admin123', expected: 'Admin Dashboard' },
  { username: 'user', password: 'user123', expected: 'User Dashboard' },
  { username: 'guest', password: 'guest123', expected: 'Guest Dashboard' }
];

testData.forEach(({ username, password, expected }) => {
  test(`login as ${username}`, async ({ page }) => {
    await page.goto('https://example.com/login');
    await page.fill('input[placeholder="Username"]', username);
    await page.fill('input[placeholder="Password"]', password);
    await page.click('button:has-text("Login")');
    await expect(page.locator(`text=${expected}`)).toBeVisible();
  });
});
```

#### After: Cucumber

```gherkin
# features/login/user-login.feature
Feature: User Login
  As a user
  I want to log into the application
  So that I can access my account

  Background:
    Given Web: Open browser -url: "#{env.BASE_URL}/login" -options: ""

  @regression
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

**Key Changes:**
- Loop converted to Scenario Outline
- Test data moved to Examples table
- More readable for non-technical stakeholders

### Example 3: Form Submission with Multiple Fields

#### Before: Playwright

```typescript
import { test, expect } from '@playwright/test';

test('submit checkout form', async ({ page }) => {
  await page.goto('https://example.com/checkout');
  
  // Fill billing information
  await page.fill('#firstname', 'John');
  await page.fill('#lastname', 'Doe');
  await page.fill('#email', 'john.doe@example.com');
  await page.fill('#address', '123 Main St');
  await page.fill('#city', 'New York');
  await page.fill('#zipcode', '10001');
  
  // Select country
  await page.selectOption('#country', 'United States');
  
  // Fill payment details
  await page.fill('#cardnumber', '4111111111111111');
  await page.fill('#cvv', '123');
  await page.fill('#expiry', '12/25');
  
  // Submit
  await page.click('button:has-text("Place Order")');
  
  // Verify
  await expect(page.locator('text=Order Confirmed')).toBeVisible();
});
```

#### After: Cucumber

**Step 1: Create pattern locator**

```typescript
// resources/locators/pattern/checkoutPage.pattern.ts
export const checkoutPage = {
  fields: {
    input: "//input[@id='#{loc.auto.forId}'];input##{loc.auto.forId}",
    select: "//select[@id='#{loc.auto.forId}'];select##{loc.auto.forId}",
    button: "//button[text()='#{loc.auto.fieldName}'];button:has-text('#{loc.auto.fieldName}')"
  },
  sections: {
    "Billing Information": "//div[@id='billing'];div#billing",
    "Payment Details": "//div[@id='payment'];div#payment"
  }
};
```

**Step 2: Create feature file**

```gherkin
# features/checkout/shopping-cart.feature
Feature: Checkout Process
  As a customer
  I want to complete the checkout process
  So that I can purchase items

  Background:
    Given Web: Open browser -url: "#{env.BASE_URL}/checkout" -options: ""

  @smoke @checkout
  Scenario: Complete checkout with valid information
    When Web: Fill -field: "{Billing Information} firstname" -value: "John" -options: ""
    And Web: Fill -field: "{Billing Information} lastname" -value: "Doe" -options: ""
    And Web: Fill -field: "{Billing Information} email" -value: "john.doe@example.com" -options: ""
    And Web: Fill -field: "{Billing Information} address" -value: "123 Main St" -options: ""
    And Web: Fill -field: "{Billing Information} city" -value: "New York" -options: ""
    And Web: Fill -field: "{Billing Information} zipcode" -value: "10001" -options: ""
    And Web: Select Dropdown -field: "{Billing Information} country" -value: "United States" -options: ""
    And Web: Fill -field: "{Payment Details} cardnumber" -value: "4111111111111111" -options: ""
    And Web: Fill -field: "{Payment Details} cvv" -value: "123" -options: ""
    And Web: Fill -field: "{Payment Details} expiry" -value: "12/25" -options: ""
    And Web: Click button -field: "Place Order" -options: ""
    Then Web: Verify text on page -text: "Order Confirmed" -options: "{partialMatch: true}"
```

**Key Changes:**
- Section scoping (`{Billing Information}`, `{Payment Details}`)
- Pattern locators instead of CSS selectors
- More descriptive step text

### Example 4: Test with Conditional Logic

#### Before: Playwright

```typescript
import { test, expect } from '@playwright/test';

test('add item to cart', async ({ page }) => {
  await page.goto('https://example.com/products');
  
  // Check if item is in stock
  const inStock = await page.locator('.stock-status').textContent();
  
  if (inStock === 'In Stock') {
    await page.click('button:has-text("Add to Cart")');
    await expect(page.locator('text=Item added')).toBeVisible();
  } else {
    await page.click('button:has-text("Notify Me")');
    await expect(page.locator('text=We will notify you')).toBeVisible();
  }
});
```

#### After: Cucumber (Option 1 - Separate Scenarios)

```gherkin
# features/products/add-to-cart.feature
Feature: Add Item to Cart
  As a customer
  I want to add items to my cart
  So that I can purchase them

  Background:
    Given Web: Open browser -url: "#{env.BASE_URL}/products" -options: ""

  @smoke
  Scenario: Add in-stock item to cart
    Given Web: Verify text on page -text: "In Stock" -options: ""
    When Web: Click button -field: "Add to Cart" -options: ""
    Then Web: Verify text on page -text: "Item added" -options: "{partialMatch: true}"

  @smoke
  Scenario: Request notification for out-of-stock item
    Given Web: Verify text on page -text: "Out of Stock" -options: ""
    When Web: Click button -field: "Notify Me" -options: ""
    Then Web: Verify text on page -text: "We will notify you" -options: "{partialMatch: true}"
```

#### After: Playwright (Keep Complex Logic)

**Recommendation:** Keep tests with complex conditional logic in Playwright. Cucumber is best for linear, predictable flows.

```typescript
// Keep this test in Playwright
test('add item to cart with stock check', async ({ page }) => {
  await page.goto('https://example.com/products');
  
  const inStock = await page.locator('.stock-status').textContent();
  
  if (inStock === 'In Stock') {
    await page.click('button:has-text("Add to Cart")');
    await expect(page.locator('text=Item added')).toBeVisible();
  } else {
    await page.click('button:has-text("Notify Me")');
    await expect(page.locator('text=We will notify you')).toBeVisible();
  }
});
```

**Key Insight:** Not all tests should be migrated. Keep complex logic in Playwright.

### Example 5: Test with Custom Actions

#### Before: Playwright

```typescript
import { test, expect } from '@playwright/test';

test('search for product', async ({ page }) => {
  await page.goto('https://example.com');
  
  // Custom action: search
  await page.fill('input[placeholder="Search"]', 'laptop');
  await page.press('input[placeholder="Search"]', 'Enter');
  
  // Wait for results
  await page.waitForSelector('.search-results');
  
  // Custom verification: count results
  const resultCount = await page.locator('.product-card').count();
  expect(resultCount).toBeGreaterThan(0);
  
  // Custom action: filter by price
  await page.click('button:has-text("Filter")');
  await page.fill('input[name="minPrice"]', '500');
  await page.fill('input[name="maxPrice"]', '1000');
  await page.click('button:has-text("Apply")');
  
  // Verify filtered results
  await expect(page.locator('text=Showing')).toContainText('results');
});
```

#### After: Cucumber (Option 1 - Use Existing Steps)

```gherkin
# features/products/search.feature
Feature: Product Search
  As a customer
  I want to search for products
  So that I can find what I need

  Background:
    Given Web: Open browser -url: "#{env.BASE_URL}" -options: ""

  @smoke @search
  Scenario: Search for laptop and filter by price
    When Web: Fill -field: "homePage.searchInput" -value: "laptop" -options: ""
    And Web: Press Key -key: "Enter" -options: ""
    Then Web: Verify text on page -text: "Search Results" -options: "{partialMatch: true}"
    When Web: Click button -field: "Filter" -options: ""
    And Web: Fill -field: "searchPage.minPriceInput" -value: "500" -options: ""
    And Web: Fill -field: "searchPage.maxPriceInput" -value: "1000" -options: ""
    And Web: Click button -field: "Apply" -options: ""
    Then Web: Verify text on page -text: "Showing" -options: "{partialMatch: true}"
    And Web: Verify text on page -text: "results" -options: "{partialMatch: true}"
```

#### After: Cucumber (Option 2 - Create Custom Step)

**If you need custom logic, create a custom step definition:**

```typescript
// test/steps/searchSteps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { webFixture } from '../../src/helper/fixtures/webFixture';

When('I search for {string}', async function (searchTerm: string) {
  const page = webFixture.getCurrentPage();
  await page.fill('input[placeholder="Search"]', searchTerm);
  await page.press('input[placeholder="Search"]', 'Enter');
  await page.waitForSelector('.search-results');
});

Then('I should see at least {int} search results', async function (minCount: number) {
  const page = webFixture.getCurrentPage();
  const resultCount = await page.locator('.product-card').count();
  expect(resultCount).toBeGreaterThanOrEqual(minCount);
});
```

```gherkin
# features/products/search.feature
Feature: Product Search

  @smoke @search
  Scenario: Search returns results
    Given Web: Open browser -url: "#{env.BASE_URL}" -options: ""
    When I search for "laptop"
    Then I should see at least 1 search results
```

**Key Insight:** Create custom steps for actions not covered by existing step definitions.

---

## Common Pitfalls and Solutions

### Pitfall 1: Over-Detailed Steps

**Problem:** Steps that are too technical and lose business readability.

**Bad Example:**
```gherkin
When I fill the input field with xpath "//input[@id='username']" with value "testuser"
And I click the button with css selector "button.login-btn"
```

**Good Example:**
```gherkin
When Web: Fill -field: "loginPage.usernameInput" -value: "testuser" -options: ""
And Web: Click button -field: "loginPage.loginButton" -options: ""
```

**Solution:** Use pattern locators and descriptive field names.

---

### Pitfall 2: Too Many Steps

**Problem:** Breaking down actions into too many granular steps.

**Bad Example:**
```gherkin
When I click on the username field
And I type "t"
And I type "e"
And I type "s"
And I type "t"
And I type "u"
And I type "s"
And I type "e"
And I type "r"
```

**Good Example:**
```gherkin
When Web: Fill -field: "loginPage.usernameInput" -value: "testuser" -options: ""
```

**Solution:** Use appropriate level of abstraction. One step per meaningful action.

---

### Pitfall 3: Hardcoded Test Data

**Problem:** Test data hardcoded in feature files instead of using variables.

**Bad Example:**
```gherkin
Given Web: Open browser -url: "https://staging.example.com/login" -options: ""
When Web: Fill -field: "loginPage.usernameInput" -value: "testuser@example.com" -options: ""
```

**Good Example:**
```gherkin
Given Web: Open browser -url: "#{env.BASE_URL}/login" -options: ""
When Web: Fill -field: "loginPage.usernameInput" -value: "#{var.static.testUsername}" -options: ""
```

**Solution:** Use variable system for environment-specific and reusable data.

---

### Pitfall 4: Missing Pattern Locators

**Problem:** Using raw selectors instead of pattern locators.

**Bad Example:**
```gherkin
When Web: Fill -field: "xpath=//input[@id='username']" -value: "testuser" -options: ""
```

**Good Example:**
```gherkin
When Web: Fill -field: "loginPage.usernameInput" -value: "testuser" -options: ""
```

**Solution:** Create pattern locator files for all pages before migration.

### Pitfall 5: Not Using Background

**Problem:** Repeating setup steps in every scenario.

**Bad Example:**
```gherkin
Scenario: Login with valid credentials
  Given Web: Open browser -url: "#{env.BASE_URL}/login" -options: ""
  When Web: Fill -field: "loginPage.usernameInput" -value: "testuser" -options: ""
  # ... rest of steps

Scenario: Login with invalid credentials
  Given Web: Open browser -url: "#{env.BASE_URL}/login" -options: ""
  When Web: Fill -field: "loginPage.usernameInput" -value: "baduser" -options: ""
  # ... rest of steps
```

**Good Example:**
```gherkin
Background:
  Given Web: Open browser -url: "#{env.BASE_URL}/login" -options: ""

Scenario: Login with valid credentials
  When Web: Fill -field: "loginPage.usernameInput" -value: "testuser" -options: ""
  # ... rest of steps

Scenario: Login with invalid credentials
  When Web: Fill -field: "loginPage.usernameInput" -value: "baduser" -options: ""
  # ... rest of steps
```

**Solution:** Extract common setup to Background section.

---

### Pitfall 6: Mixing Abstraction Levels

**Problem:** Mixing high-level business language with low-level technical details.

**Bad Example:**
```gherkin
Scenario: User completes purchase
  Given I am on the checkout page
  When I fill the input with id "cardnumber" with "4111111111111111"
  And I click the submit button using xpath "//button[@type='submit']"
  Then I should see the order confirmation
```

**Good Example:**
```gherkin
Scenario: User completes purchase
  Given Web: Open browser -url: "#{env.BASE_URL}/checkout" -options: ""
  When Web: Fill -field: "checkoutPage.cardNumberInput" -value: "4111111111111111" -options: ""
  And Web: Click button -field: "checkoutPage.submitButton" -options: ""
  Then Web: Verify text on page -text: "Order Confirmed" -options: "{partialMatch: true}"
```

**Solution:** Maintain consistent abstraction level throughout the scenario.

---

### Pitfall 7: Not Using Tags

**Problem:** No way to run subsets of tests.

**Bad Example:**
```gherkin
Scenario: Login test
  # ... steps
```

**Good Example:**
```gherkin
@smoke @login @critical
Scenario: Login with valid credentials
  # ... steps
```

**Solution:** Tag scenarios for filtering and organization.

---

### Pitfall 8: Ignoring Scenario Outlines

**Problem:** Duplicating scenarios for different data sets.

**Bad Example:**
```gherkin
Scenario: Login as admin
  When Web: Fill -field: "loginPage.usernameInput" -value: "admin" -options: ""
  And Web: Fill -field: "loginPage.passwordInput" -value: "admin123" -options: ""
  # ... rest

Scenario: Login as user
  When Web: Fill -field: "loginPage.usernameInput" -value: "user" -options: ""
  And Web: Fill -field: "loginPage.passwordInput" -value: "user123" -options: ""
  # ... rest
```

**Good Example:**
```gherkin
Scenario Outline: Login with different user types
  When Web: Fill -field: "loginPage.usernameInput" -value: "<username>" -options: ""
  And Web: Fill -field: "loginPage.passwordInput" -value: "<password>" -options: ""
  # ... rest

  Examples:
    | username | password  |
    | admin    | admin123  |
    | user     | user123   |
```

**Solution:** Use Scenario Outlines for data-driven tests.

---

## Troubleshooting

### Issue 1: Step Definition Not Found

**Symptoms:** Error message "Undefined step: Web: Click button..."

**Possible Causes:**
1. Step definition doesn't exist
2. Step syntax doesn't match exactly
3. Step definition file not loaded

**Solutions:**

```bash
# 1. Check available step definitions
grep -r "Given\|When\|Then" src/helper/actions/webStepDefs.ts

# 2. Verify step syntax matches exactly
# Feature file:
When Web: Click button -field: "loginButton" -options: ""

# Step definition must match:
When("Web: Click button -field: {param} -options: {param}", ...)

# 3. Ensure step definition file is loaded in cucumber.js
# Check cucumber.js includes:
require: [
  "./src/helper/actions/webStepDefs.ts"
]
```

---

### Issue 2: Pattern Locator Not Resolved

**Symptoms:** Error "Pattern field 'loginPage.usernameInput' not found"

**Possible Causes:**
1. Pattern file doesn't exist
2. Pattern field not defined
3. Pattern file not exported correctly

**Solutions:**

```typescript
// 1. Verify pattern file exists
// resources/locators/pattern/loginPage.pattern.ts

// 2. Check pattern field is defined
export const loginPage = {
  usernameInput: {  // ← Must match field name in feature
    text: "Username",
    type: "input"
  }
};

// 3. Verify export syntax
// ✅ Correct
export const loginPage = { ... };

// ❌ Wrong
export default loginPage;
const loginPage = { ... };  // Missing export
```

---

### Issue 3: Variable Not Replaced

**Symptoms:** Literal "#{env.BASE_URL}" appears instead of actual URL

**Possible Causes:**
1. Variable not defined
2. Wrong variable syntax
3. Variable system not initialized

**Solutions:**

```typescript
// 1. Check variable is defined
// resources/config.ts or resources/variable.ts
export const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000'
};

// 2. Use correct syntax
// ✅ Correct
"#{env.BASE_URL}"
"#{var.static.username}"
"#{config.baseUrl}"

// ❌ Wrong
"{{BASE_URL}}"  // Wrong delimiters
"${env.BASE_URL}"  // Wrong syntax
"#env.BASE_URL"  // Missing braces

// 3. Verify vars system is initialized
// Check src/global.ts loads vars
```

### Issue 4: Tests Pass in Playwright but Fail in Cucumber

**Symptoms:** Same test logic works in Playwright but fails in Cucumber

**Possible Causes:**
1. Timing issues (Cucumber may be faster/slower)
2. Browser context differences
3. Pattern locator resolution issues
4. Missing waits

**Solutions:**

```gherkin
# 1. Add explicit waits
Then Web: Wait for URL -url: "/dashboard" -options: "{partialMatch: true}"
Then Web: Wait for Text at Location -field: "statusMessage" -text: "Success" -options: ""

# 2. Increase timeout in options
When Web: Click button -field: "submitButton" -options: "{actionTimeout: 30000}"

# 3. Use screenshots to debug
When Web: Click button -field: "submitButton" -options: "{screenshot: true, screenshotText: 'After submit'}"

# 4. Verify element is visible before interaction
Then Web: Verify input field is present -field: "loginPage.usernameInput" -options: ""
When Web: Fill -field: "loginPage.usernameInput" -value: "testuser" -options: ""
```

---

### Issue 5: Scenario Fails Intermittently

**Symptoms:** Test passes sometimes, fails other times

**Possible Causes:**
1. Race conditions
2. Insufficient waits
3. Dynamic content loading
4. Parallel execution conflicts

**Solutions:**

```gherkin
# 1. Add explicit waits for dynamic content
Given Web: Open browser -url: "#{env.BASE_URL}/products" -options: ""
Then Web: Wait for Text at Location -field: "productList" -text: "Loading" -options: ""
Then Web: Verify text on page -text: "Products" -options: "{partialMatch: true}"

# 2. Wait for URL changes
When Web: Click button -field: "loginButton" -options: ""
Then Web: Wait for URL -url: "/dashboard" -options: "{partialMatch: true}"

# 3. Disable parallel execution for debugging
# In cucumber.js:
parallel: 1  // Run sequentially

# 4. Use unique test data
When Web: Fill -field: "emailInput" -value: "test-#{timestamp}@example.com" -options: ""
```

---

### Issue 6: Can't Find Element with Pattern Locator

**Symptoms:** Element exists but pattern locator can't find it

**Possible Causes:**
1. Pattern too specific
2. Element in iframe
3. Element not visible
4. Wrong pattern type

**Solutions:**

```typescript
// 1. Simplify pattern
// ❌ Too specific
usernameInput: {
  text: "Username",
  type: "input",
  attributes: { id: "username", class: "form-control" }
}

// ✅ Simpler
usernameInput: {
  text: "Username",
  type: "input"
}

// 2. Handle iframes
// In feature file:
When Web: Fill -field: "loginPage.usernameInput" -value: "testuser" -options: "{iframe: 'loginFrame'}"

// 3. Wait for element to be visible
Then Web: Verify input field is present -field: "loginPage.usernameInput" -options: ""

// 4. Try different pattern type
// Instead of text-based:
usernameInput: {
  text: "Username",
  type: "input"
}

// Try attribute-based:
usernameInput: {
  attributes: { placeholder: "Username" },
  type: "input"
}
```

---

## Migration Checklist

### Pre-Migration
- [ ] Review Cucumber User Guide
- [ ] Review Step Definition Reference
- [ ] Identify tests to migrate
- [ ] Create pattern locator files
- [ ] Set up environment variables
- [ ] Create backup branch

### During Migration
- [ ] Convert test to Gherkin
- [ ] Create/update pattern locators
- [ ] Use variables for test data
- [ ] Add appropriate tags
- [ ] Use Background for common setup
- [ ] Use Scenario Outline for data-driven tests
- [ ] Run test to verify it passes
- [ ] Review with team for readability

### Post-Migration
- [ ] All migrated tests passing
- [ ] Pattern locators documented
- [ ] Variables documented
- [ ] Team trained on new format
- [ ] Update test documentation
- [ ] Archive old Playwright test (optional)

---

## Summary

Migrating from Playwright to Cucumber provides significant benefits in readability and collaboration. Follow this guide step-by-step, start with simple tests, and maintain both test types as needed.

**Key Takeaways:**
1. Not all tests should be migrated - keep complex logic in Playwright
2. Create pattern locators before migration
3. Use variables for environment-specific data
4. Start with simple, stable tests
5. Use Background and Scenario Outlines effectively
6. Tag scenarios for organization
7. Both Playwright and Cucumber can coexist

**Next Steps:**
- Review [Cucumber User Guide](cucumber-user-guide.md)
- Review [Step Definition Reference](cucumber-step-definition-reference.md)
- Check example feature files in `features/` directory
- Start with pilot migration of 3-5 tests

---

## Additional Resources

- [Cucumber User Guide](cucumber-user-guide.md)
- [Step Definition Reference](cucumber-step-definition-reference.md)
- [Pattern Locator Documentation](../documents/01-pattern-locator-overview.md)
- [Cucumber Official Documentation](https://cucumber.io/docs/cucumber/)
- [Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)
