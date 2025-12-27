# Getting Started with Pattern Locators

This guide walks you through creating your first pattern file and using it in tests.

## Prerequisites

- Framework installed (`npm install`)
- Playwright browsers installed (`npx playwright install`)
- Basic understanding of XPath or CSS selectors

## Step 1: Enable Pattern Locators

Edit `resources/config.ts`:

```typescript
export const config = {
  // ... other config
  patternIq: {
    enable: true,              // Enable pattern system
    config: "homePage",        // Default page object
    retryTimeout: 30000,       // Max retry time (30 seconds)
    retryInterval: 2000,       // Retry interval (2 seconds)
    pageMapping: {             // URL to page object mapping
      "/": "homePage",
      "/login": "loginPage",
      "/checkout": "checkoutPage"
    }
  }
};
```

## Step 2: Create Your First Pattern File

### Option A: Copy Template

```bash
cp resources/locators/pattern/TEMPLATE.pattern.ts resources/locators/pattern/myPage.pattern.ts
```

### Option B: Create from Scratch

Create `resources/locators/pattern/loginPage.pattern.ts`:

```typescript
export const loginPage = {
  fields: {
    // Input fields (text, email, password, etc.)
    input: "//input[@placeholder='#{loc.auto.fieldName}'];input[placeholder='#{loc.auto.fieldName}']",
    
    // Buttons
    button: "//button[text()='#{loc.auto.fieldName}'];button:has-text('#{loc.auto.fieldName}')",
    
    // Links
    link: "//a[text()='#{loc.auto.fieldName}'];a:text('#{loc.auto.fieldName}')",
    
    // Text elements
    text: "//*[contains(text(), '#{loc.auto.fieldName}')]",
    
    // Labels
    label: "//label[text()='#{loc.auto.fieldName}'];label:has-text('#{loc.auto.fieldName}')"
  },
  
  sections: {
    // Define page sections for scoped searches
    "Login Form": "//form[@id='login'];form#login",
    "Error Message": "//div[@class='error'];div.error"
  },
  
  locations: {
    // Define page regions
    "Main Content": "//main;main",
    "Header": "//header;header"
  },
  
  // Optional: Define scrollable container
  scroll: "//div[@class='scrollable'];div.scrollable"
};
```

## Step 3: Understand Pattern Syntax

### Basic Pattern Structure

```typescript
fieldType: "xpath_pattern;css_pattern;another_fallback"
```

- **Semicolon-separated**: Multiple patterns for fallback
- **Variables**: Use `#{loc.auto.fieldName}` for dynamic values
- **XPath or CSS**: Mix both selector types

### Available Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `#{loc.auto.fieldName}` | Field name as provided | "Username" |
| `#{loc.auto.fieldName.toLowerCase}` | Lowercase field name | "username" |
| `#{loc.auto.forId}` | Extracted from label's "for" attribute | "user-input" |
| `#{loc.auto.fieldInstance}` | Instance number | "1", "2", "3" |

### Example Patterns

```typescript
// Input with placeholder
input: "//input[@placeholder='#{loc.auto.fieldName}'];input[placeholder='#{loc.auto.fieldName}']"

// Button with text
button: "//button[text()='#{loc.auto.fieldName}'];button:has-text('#{loc.auto.fieldName}')"

// Input by name attribute (lowercase)
input: "//input[@name='#{loc.auto.fieldName.toLowerCase}'];input[name='#{loc.auto.fieldName.toLowerCase}']"

// Label-based input (uses forId)
input: "//input[@id='#{loc.auto.forId}']"
```

## Step 4: Write Your First Test

### Playwright Test

Create `tests/login.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { fill, clickButton, verifyText } from '../src/helper/actions/webActions';

test.describe('Login Tests', () => {
  test('successful login', async ({ page }) => {
    // Navigate to login page (automatically uses loginPage patterns)
    await page.goto('/login');
    
    // Fill username field
    await fill(page, 'Username', 'john.doe@example.com');
    
    // Fill password field
    await fill(page, 'Password', 'SecurePass123!');
    
    // Click login button
    await clickButton(page, 'Login');
    
    // Verify success
    await verifyText(page, 'Welcome', 'Welcome back, John!');
  });
  
  test('login with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await fill(page, 'Username', 'invalid@example.com');
    await fill(page, 'Password', 'wrongpass');
    await clickButton(page, 'Login');
    
    // Verify error message
    await verifyText(page, 'Error', 'Invalid credentials');
  });
});
```

### Cucumber Feature File

Create `features/login.feature`:

```gherkin
Feature: User Login
  As a user
  I want to log into the application
  So that I can access my account

  Background:
    Given I navigate to "/login"

  Scenario: Successful login
    When I fill "Username" with "john.doe@example.com"
    And I fill "Password" with "SecurePass123!"
    And I click button "Login"
    Then I should see text "Welcome back, John!"

  Scenario: Failed login with invalid credentials
    When I fill "Username" with "invalid@example.com"
    And I fill "Password" with "wrongpass"
    And I click button "Login"
    Then I should see text "Invalid credentials"
```

## Step 5: Run Your Tests

```bash
# Run Playwright tests
npm test

# Run specific test file
npx playwright test tests/login.spec.ts

# Run with UI mode
npx playwright test --ui

# Run Cucumber tests
set PLAYQ_RUNNER=cucumber && npm test
```

## Step 6: Verify Pattern Resolution

Add logging to see what's happening:

```typescript
test('debug pattern resolution', async ({ page }) => {
  await page.goto('/login');
  
  // The framework logs pattern resolution automatically
  // Check console output for:
  // - "Pattern attempt: //input[@placeholder='Username']"
  // - "Pattern resolved successfully"
  
  await fill(page, 'Username', 'test@example.com');
});
```

## Common Patterns for Different Elements

### Input Fields

```typescript
// By placeholder
input: "//input[@placeholder='#{loc.auto.fieldName}'];input[placeholder='#{loc.auto.fieldName}']"

// By name attribute
input: "//input[@name='#{loc.auto.fieldName.toLowerCase}'];input[name='#{loc.auto.fieldName.toLowerCase}']"

// By label association
input: "//input[@id='#{loc.auto.forId}']"

// By aria-label
input: "//input[@aria-label='#{loc.auto.fieldName}'];input[aria-label='#{loc.auto.fieldName}']"
```

### Buttons

```typescript
// By text content
button: "//button[text()='#{loc.auto.fieldName}'];button:has-text('#{loc.auto.fieldName}')"

// By aria-label
button: "//button[@aria-label='#{loc.auto.fieldName}'];button[aria-label='#{loc.auto.fieldName}']"

// By data-testid
button: "//button[@data-testid='#{loc.auto.fieldName.toLowerCase}'];button[data-testid='#{loc.auto.fieldName.toLowerCase}']"
```

### Links

```typescript
// By text content
link: "//a[text()='#{loc.auto.fieldName}'];a:text('#{loc.auto.fieldName}')"

// By href containing text
link: "//a[contains(@href, '#{loc.auto.fieldName.toLowerCase}')];a[href*='#{loc.auto.fieldName.toLowerCase}']"
```

### Dropdowns

```typescript
// By label
select: "//select[@aria-label='#{loc.auto.fieldName}'];select[aria-label='#{loc.auto.fieldName}']"

// By name
select: "//select[@name='#{loc.auto.fieldName.toLowerCase}'];select[name='#{loc.auto.fieldName.toLowerCase}']"
```

### Checkboxes & Radio Buttons

```typescript
// By label text
checkbox: "//input[@type='checkbox' and following-sibling::text()='#{loc.auto.fieldName}']"

// By name
checkbox: "//input[@type='checkbox' and @name='#{loc.auto.fieldName.toLowerCase}']"
```

## Testing Your Patterns

### Verify Pattern File Loads

```bash
node verify-pattern-files.js
```

Expected output:
```
✓ loginPage.pattern.ts loaded successfully
✓ homePage.pattern.ts loaded successfully
✓ checkoutPage.pattern.ts loaded successfully
```

### Test Pattern Loading

```bash
node test-pattern-loading.js
```

### Run Unit Tests

```bash
npm run test:unit
```

## Troubleshooting First Steps

### Pattern Not Found

**Problem**: Error "Pattern configuration not found"

**Solution**:
1. Check file name matches export name:
   - File: `loginPage.pattern.ts`
   - Export: `export const loginPage = { ... }`
2. Verify file is in `resources/locators/pattern/`
3. Check config.ts has correct pattern code

### Element Not Found

**Problem**: Test fails with "element not found"

**Solution**:
1. Inspect the page to see actual element structure
2. Update pattern to match actual HTML
3. Add more fallback patterns
4. Check if element is in a section/location

### Wrong Element Selected

**Problem**: Action performed on wrong element

**Solution**:
1. Make patterns more specific
2. Use section scoping: `{Login Form} Submit`
3. Use instance number: `Submit[2]`

## Next Steps

Now that you have basic patterns working:

1. **[Pattern Syntax Reference](03-pattern-syntax-reference.md)** - Learn advanced syntax
2. **[Advanced Features](04-advanced-pattern-features.md)** - Sections, locations, chaining
3. **[Best Practices](06-pattern-best-practices.md)** - Write maintainable patterns
4. **[Migration Guide](../docs/pattern-locator-migration-guide.md)** - Convert existing tests

## Quick Reference Card

```typescript
// Basic usage
await fill(page, 'FieldName', 'value');
await clickButton(page, 'ButtonName');
await clickLink(page, 'LinkName');

// With section
await fill(page, '{SectionName} FieldName', 'value');

// With location and section
await fill(page, '{{LocationName}} {SectionName} FieldName', 'value');

// With instance number
await clickButton(page, 'Submit[2]');

// With explicit pattern override
await fill(page, 'FieldName', 'value', { pattern: 'loginPage' });
```

Happy testing! 🚀
