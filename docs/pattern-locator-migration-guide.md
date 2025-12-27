# Migration Guide: Centralized Patterns to Page Object Model

This guide provides step-by-step instructions for migrating from a centralized pattern configuration to the Page Object Model approach.

## Table of Contents

1. [Overview](#overview)
2. [Why Migrate?](#why-migrate)
3. [Before You Start](#before-you-start)
4. [Migration Steps](#migration-steps)
5. [Common Scenarios](#common-scenarios)
6. [Troubleshooting](#troubleshooting)
7. [Rollback Plan](#rollback-plan)

## Overview

### Before: Centralized Configuration

```
resources/locators/pattern/
└── uportalOb.pattern.ts  ← Single file with ALL patterns
```

All patterns for all pages mixed together in one file.

### After: Page Object Model

```
resources/locators/pattern/
├── loginPage.pattern.ts      ← Login page patterns only
├── homePage.pattern.ts        ← Home page patterns only
├── checkoutPage.pattern.ts    ← Checkout page patterns only
└── productPage.pattern.ts     ← Product page patterns only
```

Each page has its own focused pattern file.

## Why Migrate?

### Benefits of Page Object Model

✅ **Better Organization**: Each page's patterns are in one place
✅ **Easier Maintenance**: Changes to one page don't affect others
✅ **Clearer Ownership**: Each page object is self-contained
✅ **Scalability**: Adding new pages is straightforward
✅ **Reduced Conflicts**: Multiple developers can work on different pages
✅ **Automatic Switching**: URL-based detection reduces boilerplate
✅ **Improved Testability**: Easier to test page-specific patterns

### When to Migrate

- ✅ Your centralized pattern file is becoming large (>500 lines)
- ✅ Multiple developers work on different pages
- ✅ You have distinct pages with different locator strategies
- ✅ You want automatic page object switching based on URL
- ✅ You need better organization and maintainability

### When NOT to Migrate

- ❌ You have a simple single-page application
- ❌ All pages use identical locator strategies
- ❌ Your team is very small (1-2 developers)
- ❌ You're close to a major release (wait until after)

## Before You Start

### Prerequisites

1. ✅ Backup your current pattern file
2. ✅ Ensure all tests are passing
3. ✅ Document your current page structure
4. ✅ Identify all unique pages in your application
5. ✅ Review the [Pattern Locator System Guide](pattern-locator-page-object-model.md)

### Preparation Checklist

- [ ] Create a backup branch in version control
- [ ] Document current pattern file structure
- [ ] List all pages in your application
- [ ] Identify shared patterns across pages
- [ ] Plan URL-to-page-object mappings
- [ ] Schedule migration during low-activity period
- [ ] Inform team members about migration


## Migration Steps

### Step 1: Analyze Current Patterns

Review your centralized pattern file and categorize patterns by page.

**Example Analysis:**

```typescript
// Current centralized file: uportalOb.pattern.ts
export const uportalOb = {
  fields: {
    button: "...",  // Used on ALL pages
    input: "...",   // Used on ALL pages
  },
  sections: {
    "Login Form": "...",           // → loginPage
    "Registration Form": "...",    // → registrationPage
    "Home Navigation": "...",      // → homePage
    "Product Gallery": "...",      // → productPage
    "Checkout Summary": "...",     // → checkoutPage
    "User Profile": "...",         // → profilePage
  },
  locations: {
    "Main Content": "...",         // → Used on multiple pages
    "Header": "...",               // → Used on multiple pages
    "Footer": "...",               // → Used on multiple pages
  }
}
```

**Create a mapping document:**

```markdown
# Pattern-to-Page Mapping

## Login Page (loginPage.pattern.ts)
- Sections: Login Form, Error Message, Forgot Password
- Locations: Main Content, Header
- Fields: button, input, link, text, label

## Home Page (homePage.pattern.ts)
- Sections: Navigation, Hero Section, Features
- Locations: Main Content, Header, Footer
- Fields: button, link, text, header

## Checkout Page (checkoutPage.pattern.ts)
- Sections: Billing Information, Shipping Information, Payment Details, Order Summary
- Locations: Main Content, Sidebar
- Fields: input, select, button, checkbox, label

## Shared Patterns
- Fields: button, input, link (used on all pages)
- Locations: Main Content, Header, Footer (used on all pages)
```

### Step 2: Create Page Object Files

Create separate pattern files for each page.

**Use the template:**

```bash
# Copy template for each page
cp resources/locators/pattern/TEMPLATE.pattern.ts resources/locators/pattern/loginPage.pattern.ts
cp resources/locators/pattern/TEMPLATE.pattern.ts resources/locators/pattern/homePage.pattern.ts
cp resources/locators/pattern/TEMPLATE.pattern.ts resources/locators/pattern/checkoutPage.pattern.ts
```

**Example: loginPage.pattern.ts**

```typescript
export const loginPage = {
  fields: {
    // Copy relevant field patterns from centralized file
    button: "//button[text()='#{loc.auto.fieldName}'];button:has-text('#{loc.auto.fieldName}')",
    input: "//input[@id='#{loc.auto.forId}'];//input[@placeholder='#{loc.auto.fieldName}']",
    link: "//a[text()='#{loc.auto.fieldName}'];a:text('#{loc.auto.fieldName}')",
    text: "//*[contains(text(), '#{loc.auto.fieldName}')]",
    label: "//label[text()='#{loc.auto.fieldName}'];label:has-text('#{loc.auto.fieldName}')"
  },
  sections: {
    // Copy only login-related sections
    "Login Form": "//form[@id='login'];form#login",
    "Error Message": "//div[@class='error'];div.error",
    "Forgot Password": "//div[@class='forgot-password'];div.forgot-password"
  },
  locations: {
    // Copy relevant locations
    "Main Content": "//main;main",
    "Header": "//header;header"
  },
  scroll: "//div[@class='scrollable'];div.scrollable"
};
```

### Step 3: Handle Shared Patterns

Decide how to handle patterns used across multiple pages.

**Option 1: Duplicate (Recommended)**

Duplicate shared patterns in each page object. This provides flexibility for page-specific customization.

```typescript
// loginPage.pattern.ts
export const loginPage = {
  fields: {
    button: "//button[text()='#{loc.auto.fieldName}']"  // Duplicated
  }
};

// homePage.pattern.ts
export const homePage = {
  fields: {
    button: "//button[text()='#{loc.auto.fieldName}']"  // Duplicated
  }
};
```

**Pros:**
- ✅ Each page can customize patterns independently
- ✅ No dependencies between pages
- ✅ Easier to understand and maintain

**Cons:**
- ❌ Some duplication of code
- ❌ Changes to shared patterns require updates in multiple files

**Option 2: Create Base Patterns (Advanced)**

Create a base pattern file for truly shared patterns.

```typescript
// basePatterns.ts
export const baseFieldPatterns = {
  button: "//button[text()='#{loc.auto.fieldName}'];button:has-text('#{loc.auto.fieldName}')",
  input: "//input[@placeholder='#{loc.auto.fieldName}'];input[placeholder='#{loc.auto.fieldName}']",
  link: "//a[text()='#{loc.auto.fieldName}'];a:text('#{loc.auto.fieldName}')"
};

// loginPage.pattern.ts
import { baseFieldPatterns } from './basePatterns';

export const loginPage = {
  fields: {
    ...baseFieldPatterns,
    // Override or add page-specific patterns
    input: "//input[@id='#{loc.auto.forId}'];//input[@placeholder='#{loc.auto.fieldName}']"
  }
};
```

**Pros:**
- ✅ No duplication
- ✅ Single source of truth for shared patterns
- ✅ Easy to update shared patterns

**Cons:**
- ❌ Creates dependencies between files
- ❌ More complex to understand
- ❌ Harder to customize per page

**Recommendation:** Use Option 1 (Duplicate) unless you have a strong reason for Option 2.


### Step 4: Update Configuration

Update `resources/config.ts` to use the Page Object Model.

**Before:**

```typescript
patternIq: {
  enable: true,
  config: "uportalOb",  // Single centralized pattern
  retryTimeout: 30000,
  retryInterval: 2000
}
```

**After:**

```typescript
patternIq: {
  enable: true,
  config: "homePage",  // Default page object (fallback)
  retryTimeout: 30000,
  retryInterval: 2000,
  pageMapping: {       // NEW: URL-based page detection
    "/": "homePage",
    "/login": "loginPage",
    "/register": "registrationPage",
    "/products": "productListPage",
    "/products/:id": "productDetailPage",
    "/cart": "cartPage",
    "/checkout": "checkoutPage",
    "/checkout/success": "orderConfirmationPage",
    "/profile": "profilePage",
    "/settings": "settingsPage"
  }
}
```

**Key Changes:**

1. **config**: Changed from centralized pattern code to default page object
2. **pageMapping**: NEW - Maps URLs to page objects for automatic detection

### Step 5: Fix Pattern Syntax

Ensure all patterns use semicolon-separated strings (not arrays).

**Before (if using arrays):**

```typescript
button: ["//button[text()='#{loc.auto.fieldName}']", "button:has-text('#{loc.auto.fieldName}')"]
```

**After (semicolon-separated):**

```typescript
button: "//button[text()='#{loc.auto.fieldName}'];button:has-text('#{loc.auto.fieldName}')"
```

**Find and replace:**

```bash
# Search for array patterns
grep -r "\[\"" resources/locators/pattern/

# Manually convert each to semicolon-separated strings
```

### Step 6: Update Tests (If Needed)

Most tests will work without changes if you use URL-based mapping.

**Scenario 1: Tests with page.goto() (No changes needed)**

```typescript
// Before migration
await page.goto('/login');
await fill(page, 'Username', 'john.doe');  // Used uportalOb patterns

// After migration (works automatically)
await page.goto('/login');
await fill(page, 'Username', 'john.doe');  // Uses loginPage patterns (via pageMapping)
```

**Scenario 2: Tests without page.goto() (Add explicit pattern)**

```typescript
// Before migration
await fill(page, 'Username', 'john.doe');  // Used uportalOb patterns

// After migration (add explicit pattern)
await fill(page, 'Username', 'john.doe', { pattern: 'loginPage' });
```

**Scenario 3: Tests with multiple pages (No changes needed)**

```typescript
// Before migration
await page.goto('/login');
await fill(page, 'Username', 'john.doe');
await clickButton(page, 'Login');

await page.goto('/products');
await clickButton(page, 'Add to Cart');

// After migration (works automatically)
await page.goto('/login');
await fill(page, 'Username', 'john.doe');  // Uses loginPage
await clickButton(page, 'Login');

await page.goto('/products');
await clickButton(page, 'Add to Cart');    // Uses productPage
```

### Step 7: Test Each Page Object

Create verification tests for each page object.

```typescript
import { test, expect } from '@playwright/test';
import { fill, clickButton, verifyText } from './src/helper/actions/webActions';

test.describe('Pattern Migration Verification', () => {
  test('loginPage patterns work', async ({ page }) => {
    await page.goto('/login');
    
    // Test basic patterns
    await fill(page, 'Username', 'test@example.com');
    await fill(page, 'Password', 'password123');
    await clickButton(page, 'Login');
    
    // Verify patterns resolved correctly
    expect(await page.locator('input[placeholder="Username"]').count()).toBeGreaterThan(0);
  });
  
  test('homePage patterns work', async ({ page }) => {
    await page.goto('/home');
    
    // Test navigation patterns
    await clickLink(page, 'Products');
    await verifyText(page, 'Welcome');
    
    // Verify patterns resolved correctly
    expect(await page.locator('nav').count()).toBeGreaterThan(0);
  });
  
  test('checkoutPage patterns work', async ({ page }) => {
    await page.goto('/checkout');
    
    // Test form patterns
    await fill(page, '{Billing Information} Full Name', 'John Doe');
    await fill(page, '{Payment Details} Card Number', '4111111111111111');
    await clickButton(page, 'Place Order');
    
    // Verify patterns resolved correctly
    expect(await page.locator('form').count()).toBeGreaterThan(0);
  });
  
  test('automatic page switching works', async ({ page }) => {
    // Navigate between pages and verify automatic switching
    await page.goto('/login');
    await fill(page, 'Username', 'test@example.com');  // Uses loginPage
    
    await page.goto('/home');
    await clickLink(page, 'Products');  // Uses homePage
    
    await page.goto('/checkout');
    await fill(page, '{Billing Information} Email', 'test@example.com');  // Uses checkoutPage
  });
});
```

### Step 8: Remove Old Centralized File

Once all tests pass, remove the old centralized pattern file.

```bash
# Backup first
cp resources/locators/pattern/uportalOb.pattern.ts resources/locators/pattern/uportalOb.pattern.ts.backup

# Remove old file
rm resources/locators/pattern/uportalOb.pattern.ts

# Run all tests to verify
npm test
```

### Step 9: Update Documentation

Update your project documentation to reflect the new structure.

**Update:**
- README.md
- Test writing guidelines
- Onboarding documentation
- Pattern creation guides

**Example README update:**

```markdown
## Pattern Files

Pattern files are organized by page using the Page Object Model:

- `loginPage.pattern.ts` - Login page patterns
- `homePage.pattern.ts` - Home page patterns
- `checkoutPage.pattern.ts` - Checkout page patterns

To create a new page object:
1. Copy `TEMPLATE.pattern.ts`
2. Rename to `{pageName}.pattern.ts`
3. Update patterns for your page
4. Add URL mapping to `config.ts`
```

### Step 10: Train Team

Ensure all team members understand the new structure.

**Training Topics:**
1. Page Object Model concept
2. How to create new page objects
3. How URL mapping works
4. When to use explicit pattern parameter
5. How to troubleshoot pattern issues

**Training Materials:**
- Share [Pattern Locator System Guide](pattern-locator-page-object-model.md)
- Share [Quick Reference](pattern-locator-quick-reference.md)
- Conduct team walkthrough
- Create example pull request


## Common Scenarios

### Scenario 1: Shared Header/Footer Across All Pages

**Problem:** Header and footer appear on all pages with same patterns.

**Solution 1: Duplicate in each page object (Recommended)**

```typescript
// loginPage.pattern.ts
export const loginPage = {
  sections: {
    "Header": "//header;header",
    "Footer": "//footer;footer",
    "Login Form": "//form[@id='login'];form#login"
  }
};

// homePage.pattern.ts
export const homePage = {
  sections: {
    "Header": "//header;header",  // Duplicated
    "Footer": "//footer;footer",  // Duplicated
    "Navigation": "//nav;nav"
  }
};
```

**Solution 2: Create headerPage for header-specific interactions**

```typescript
// headerPage.pattern.ts
export const headerPage = {
  fields: {
    link: "//header//a[text()='#{loc.auto.fieldName}'];header a:text('#{loc.auto.fieldName}')",
    button: "//header//button[text()='#{loc.auto.fieldName}'];header button:has-text('#{loc.auto.fieldName}')"
  }
};

// In tests, use explicit pattern for header elements
await clickLink(page, 'Cart', { pattern: 'headerPage' });
await clickButton(page, 'Logout', { pattern: 'headerPage' });
```

### Scenario 2: Modal Dialogs That Appear on Multiple Pages

**Problem:** Confirmation dialogs, error modals appear on multiple pages.

**Solution: Create modalPage for modal-specific interactions**

```typescript
// modalPage.pattern.ts
export const modalPage = {
  fields: {
    button: "//div[@role='dialog']//button[text()='#{loc.auto.fieldName}'];" +
            "div[role='dialog'] button:has-text('#{loc.auto.fieldName}')",
    text: "//div[@role='dialog']//*[contains(text(), '#{loc.auto.fieldName}')]"
  },
  sections: {
    "Confirmation Dialog": "//div[@role='dialog'][@aria-label='Confirm'];div[role='dialog'][aria-label='Confirm']",
    "Error Dialog": "//div[@role='dialog'][@aria-label='Error'];div[role='dialog'][aria-label='Error']"
  }
};

// In tests
await clickButton(page, 'Delete Item');  // Uses current page patterns
await clickButton(page, 'Confirm', { pattern: 'modalPage' });  // Uses modal patterns
```

### Scenario 3: Dynamic Pages with URL Parameters

**Problem:** Product detail pages have URLs like `/products/123`, `/products/456`.

**Solution: Use pattern matching in pageMapping**

```typescript
patternIq: {
  pageMapping: {
    "/products": "productListPage",
    "/products/:id": "productDetailPage",  // Matches /products/123, /products/456, etc.
    "/products/:id/reviews": "productReviewsPage"
  }
}
```

**Note:** Pattern matching support depends on implementation. If not supported, use explicit pattern:

```typescript
await page.goto('/products/123');
await fill(page, 'Review', 'Great product!', { pattern: 'productDetailPage' });
```

### Scenario 4: Single Page Application (SPA)

**Problem:** URL doesn't change when navigating between views.

**Solution: Use explicit pattern parameters**

```typescript
// Set page context explicitly
await clickButton(page, 'Login', { pattern: 'loginPage' });

// After login, switch to home page patterns
await clickLink(page, 'Products', { pattern: 'homePage' });

// In product view
await clickButton(page, 'Add to Cart', { pattern: 'productPage' });
```

### Scenario 5: Gradual Migration

**Problem:** Want to migrate one page at a time.

**Solution: Keep both centralized and page object patterns**

```typescript
// Keep old centralized file
// uportalOb.pattern.ts (still exists)

// Add new page object files
// loginPage.pattern.ts (new)
// homePage.pattern.ts (new)

// Configuration
patternIq: {
  config: "uportalOb",  // Default to old centralized patterns
  pageMapping: {
    "/login": "loginPage",  // Migrated pages use new patterns
    "/home": "homePage"     // Migrated pages use new patterns
    // Other pages fall back to uportalOb
  }
}

// Gradually add more pages to pageMapping as you migrate them
```

## Troubleshooting

### Issue 1: Tests Fail After Migration

**Symptoms:** Tests that worked before now fail with "element not found" errors.

**Possible Causes:**
1. Pattern syntax error (arrays instead of semicolons)
2. Missing patterns in new page object
3. Wrong page object selected
4. URL mapping not configured correctly

**Solutions:**

```typescript
// 1. Check pattern syntax
// ❌ Wrong
button: ["//button[text()='#{loc.auto.fieldName}']", "button:has-text('#{loc.auto.fieldName}')"]

// ✅ Correct
button: "//button[text()='#{loc.auto.fieldName}'];button:has-text('#{loc.auto.fieldName}')"

// 2. Verify patterns exist
const pattern = getValue('pattern.loginPage.fields.button');
console.log('Button pattern:', pattern);

// 3. Use explicit pattern to test
await fill(page, 'Username', 'test', { pattern: 'loginPage' });

// 4. Check URL mapping
console.log('Current URL:', page.url());
console.log('Expected page object: loginPage');
```

### Issue 2: Pattern Not Loading

**Symptoms:** Error message "Pattern configuration not found" or patterns are undefined.

**Possible Causes:**
1. File naming doesn't match export name
2. File not in correct directory
3. Export statement incorrect
4. Pattern code doesn't match configuration

**Solutions:**

```typescript
// 1. Check file name matches export
// File: loginPage.pattern.ts
// ✅ Correct export
export const loginPage = { ... };

// ❌ Wrong export
export const LoginPage = { ... };  // Wrong case
export const login = { ... };      // Wrong name

// 2. Verify file location
// ✅ Correct: resources/locators/pattern/loginPage.pattern.ts
// ❌ Wrong: resources/locators/loginPage.pattern.ts

// 3. Check export syntax
// ✅ Correct
export const loginPage = { fields: { ... } };

// ❌ Wrong
export default loginPage;  // Don't use default export
const loginPage = { ... }; // Missing export keyword

// 4. Verify pattern code in config
patternIq: {
  config: "loginPage",  // Must match export name
  pageMapping: {
    "/login": "loginPage"  // Must match export name
  }
}
```

### Issue 3: Slow Test Execution

**Symptoms:** Tests take longer after migration.

**Possible Causes:**
1. Too many fallback patterns
2. Inefficient patterns (complex XPath)
3. Retry timeout too high
4. Missing scroll patterns

**Solutions:**

```typescript
// 1. Reduce fallback patterns
// ❌ Too many patterns
button: "pattern1;pattern2;pattern3;pattern4;pattern5;pattern6"

// ✅ Optimal (2-4 patterns)
button: "//button[text()='#{loc.auto.fieldName}'];button:has-text('#{loc.auto.fieldName}')"

// 2. Use efficient patterns
// ❌ Slow (complex XPath)
button: "//div[@class='container']//div[@class='wrapper']//button[contains(text(), '#{loc.auto.fieldName}')]"

// ✅ Fast (simple selector)
button: "//button[text()='#{loc.auto.fieldName}'];button:has-text('#{loc.auto.fieldName}')"

// 3. Adjust timeouts
patternIq: {
  retryTimeout: 20000,  // Reduce from 30000
  retryInterval: 1000   // Reduce from 2000
}

// 4. Add scroll patterns
scroll: "//div[@class='content'];div.content;//main;main"
```

### Issue 4: Wrong Element Selected

**Symptoms:** Action performed on wrong element (e.g., clicking wrong button).

**Possible Causes:**
1. Patterns too generic
2. Multiple elements match pattern
3. Need to use instance number
4. Need to use section/location scoping

**Solutions:**

```typescript
// 1. Make patterns more specific
// ❌ Too generic
button: "//button"

// ✅ More specific
button: "//button[text()='#{loc.auto.fieldName}']"

// 2. Use instance number
await clickButton(page, 'Submit[2]');  // Click second Submit button

// 3. Use section scoping
await clickButton(page, '{Login Form} Submit');  // Submit in Login Form only

// 4. Use location and section scoping
await clickButton(page, '{{Main Content}} {Login Form} Submit');
```

## Rollback Plan

If migration causes critical issues, you can rollback:

### Quick Rollback (Revert Configuration)

```typescript
// Revert config.ts to use centralized pattern
patternIq: {
  enable: true,
  config: "uportalOb",  // Back to centralized
  retryTimeout: 30000,
  retryInterval: 2000
  // Remove or comment out pageMapping
  // pageMapping: { ... }
}

// Keep new page object files for future migration
// Tests will use centralized patterns again
```

### Full Rollback (Remove Page Objects)

```bash
# Restore from backup
git checkout HEAD~1 resources/locators/pattern/
git checkout HEAD~1 resources/config.ts

# Or manually
rm resources/locators/pattern/loginPage.pattern.ts
rm resources/locators/pattern/homePage.pattern.ts
rm resources/locators/pattern/checkoutPage.pattern.ts
# ... remove other new files

# Restore centralized file from backup
cp resources/locators/pattern/uportalOb.pattern.ts.backup resources/locators/pattern/uportalOb.pattern.ts

# Revert configuration
# Edit resources/config.ts to use "uportalOb"
```

## Migration Checklist

Use this checklist to track your migration progress:

### Pre-Migration
- [ ] Backup current pattern file
- [ ] All tests passing
- [ ] Document current structure
- [ ] Identify all pages
- [ ] Review migration guide
- [ ] Create backup branch

### Migration
- [ ] Analyze current patterns
- [ ] Create page-to-pattern mapping
- [ ] Create page object files
- [ ] Handle shared patterns
- [ ] Update configuration
- [ ] Fix pattern syntax
- [ ] Update tests (if needed)
- [ ] Test each page object
- [ ] Remove old centralized file
- [ ] Update documentation

### Post-Migration
- [ ] All tests passing
- [ ] Performance acceptable
- [ ] Team trained
- [ ] Documentation updated
- [ ] Rollback plan documented
- [ ] Monitor for issues

## Summary

Migrating to the Page Object Model provides significant benefits in organization, maintainability, and scalability. Follow this guide step-by-step, test thoroughly, and have a rollback plan ready.

**Key Takeaways:**
1. Analyze before migrating
2. Create page-specific pattern files
3. Use URL mapping for automatic detection
4. Test each page object independently
5. Have a rollback plan
6. Train your team

For additional help, refer to:
- [Pattern Locator System Guide](pattern-locator-page-object-model.md)
- [Quick Reference](pattern-locator-quick-reference.md)
- [Configuration Reference](pattern-locator-page-object-model.md#configuration-reference)

