# Pattern-Based Locator System - Page Object Model Guide

## Overview

This guide provides comprehensive documentation for the pattern-based locator system using the **Page Object Model (POM)** pattern. The system enables centralized locator management through page-specific pattern files, where each page object has its own `.pattern.ts` file containing locator strategies specific to that page.

### Key Benefits

- **Page-Specific Organization**: Each page has its own pattern file, making locator strategies easy to find and maintain
- **Reduced Brittleness**: Multiple fallback patterns automatically handle application changes
- **Logical Naming**: Tests use human-readable field names (e.g., "Username") instead of complex XPath expressions
- **Dynamic Resolution**: Locators are generated at runtime based on page context and field name
- **Scalability**: Adding new pages doesn't clutter a central configuration file
- **Backward Compatible**: Existing static locators and tests continue to work without modification
- **Clear Ownership**: Each page object owns its locator strategies, following POM principles

## Quick Start

### 1. Enable Pattern System

In `resources/config.ts`:

```typescript
patternIq: {
  enable: true,                    // Enable pattern-based resolution
  config: "loginPage",             // Default page object to use
  retryTimeout: 30000,             // Maximum retry time (ms)
  retryInterval: 2000,             // Interval between retries (ms)
  pageMapping: {                   // URL-based page detection
    "/login": "loginPage",
    "/home": "homePage",
    "/checkout": "checkoutPage"
  }
}
```

### 2. Create a Page Object Pattern File

Create `resources/locators/pattern/myPage.pattern.ts`:

```typescript
export const myPage = {
  fields: {
    button: "//button[text()='#{loc.auto.fieldName}'];button:has-text('#{loc.auto.fieldName}')",
    input: "//input[@placeholder='#{loc.auto.fieldName}'];input[placeholder='#{loc.auto.fieldName}']",
    link: "//a[text()='#{loc.auto.fieldName}'];a:text('#{loc.auto.fieldName}')"
  },
  sections: {
    "Main Form": "//form[@id='main'];form#main"
  },
  locations: {
    "Content Area": "//main;main"
  }
};
```


### 3. Use in Tests

```typescript
import { test } from '@playwright/test';
import { fill, clickButton } from './src/helper/actions/webActions';

test('login test', async ({ page }) => {
  await page.goto('/login');
  
  // Uses loginPage patterns automatically (via pageMapping)
  await fill(page, 'Username', 'john.doe');
  await fill(page, 'Password', 'secret123');
  await clickButton(page, 'Login');
  
  // Explicit page object override
  await clickButton(page, 'Submit', { pattern: 'checkoutPage' });
});
```

## Available Runtime Variables

When creating pattern files, you can use these runtime variables that are automatically substituted:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `#{loc.auto.fieldName}` | Field name as provided | "Username" |
| `#{loc.auto.fieldName.toLowerCase}` | Lowercase field name | "username" |
| `#{loc.auto.forId}` | Extracted "for" attribute from label | "username-input" |
| `#{loc.auto.fieldInstance}` | Element instance number | "1" (default) |
| `#{loc.auto.location.value}` | Location value from field string | "Main Content" |
| `#{loc.auto.location.name}` | Location name from field string | "Main Content" |
| `#{loc.auto.section.value}` | Section value from field string | "Login Form" |
| `#{loc.auto.section.name}` | Section name from field string | "Login Form" |

### Example Usage

```typescript
// Pattern using multiple variables
input: "//input[@id='#{loc.auto.forId}'];//input[@name='#{loc.auto.fieldName.toLowerCase}']"

// When resolving "Username" field:
// 1st attempt: //input[@id='username-input']  (if label found)
// 2nd attempt: //input[@name='username']
```


## Creating New Page Object Pattern Files

### Step-by-Step Guide

#### Step 1: Create the Pattern File

Create a new file in `resources/locators/pattern/` with the naming convention `{pageName}.pattern.ts`:

```
resources/locators/pattern/
├── loginPage.pattern.ts
├── homePage.pattern.ts
├── checkoutPage.pattern.ts
└── myNewPage.pattern.ts  ← Your new file
```

#### Step 2: Define the Pattern Structure

```typescript
/* 
Available runtime variables:
- loc.auto.fieldName: The field name as provided
- loc.auto.fieldName.toLowerCase: Lowercase version of field name
- loc.auto.forId: Extracted "for" attribute from label (for label-based resolution)
- loc.auto.fieldInstance: Element instance number (default: "1")
- loc.auto.location.value: Location value from field string
- loc.auto.location.name: Location name from field string
- loc.auto.section.value: Section value from field string
- loc.auto.section.name: Section name from field string
*/

export const myNewPage = {
  fields: {
    // Define patterns for each element type
  },
  sections: {
    // Define logical sections on the page
  },
  locations: {
    // Define major page regions
  },
  scroll: "//div[@class='scrollable'];div.scrollable"  // Optional scroll container
};
```

#### Step 3: Define Field Patterns

Field patterns support multiple fallback strategies separated by semicolons:

```typescript
fields: {
  // Button patterns - multiple fallback strategies
  button: "//button[text()='#{loc.auto.fieldName}'];" +
          "//button[@aria-label='#{loc.auto.fieldName}'];" +
          "button:has-text('#{loc.auto.fieldName}')",
  
  // Input patterns - with label resolution support
  input: "//input[@id='#{loc.auto.forId}'];" +
         "//input[@placeholder='#{loc.auto.fieldName}'];" +
         "//input[@name='#{loc.auto.fieldName.toLowerCase}'];" +
         "input[placeholder='#{loc.auto.fieldName}']",
  
  // Link patterns
  link: "//a[text()='#{loc.auto.fieldName}'];" +
        "//a[@title='#{loc.auto.fieldName}'];" +
        "a:has-text('#{loc.auto.fieldName}')",
  
  // Select dropdown patterns
  select: "//select[@id='#{loc.auto.fieldName.toLowerCase}'];" +
          "//select[@name='#{loc.auto.fieldName.toLowerCase}'];" +
          "select[name='#{loc.auto.fieldName.toLowerCase}']",
  
  // Checkbox patterns
  checkbox: "//input[@type='checkbox'][@name='#{loc.auto.fieldName.toLowerCase}'];" +
            "//input[@type='checkbox'][@id='#{loc.auto.fieldName.toLowerCase}']",
  
  // Radio button patterns
  radio: "//input[@type='radio'][@value='#{loc.auto.fieldName.toLowerCase}'];" +
         "//label[text()='#{loc.auto.fieldName}']/input[@type='radio']",
  
  // Text/label patterns
  text: "//*[text()='#{loc.auto.fieldName}'];" +
        "//span[contains(text(), '#{loc.auto.fieldName}')];" +
        "//p[contains(text(), '#{loc.auto.fieldName}')]",
  
  // Header patterns
  header: "//h1[text()='#{loc.auto.fieldName}'];" +
          "//h2[text()='#{loc.auto.fieldName}'];" +
          "h1:text('#{loc.auto.fieldName}')",
  
  // Label patterns (for label-based resolution)
  label: "//label[text()='#{loc.auto.fieldName}'];" +
         "//label[contains(text(), '#{loc.auto.fieldName}')];" +
         "label:has-text('#{loc.auto.fieldName}')",
  
  // Tab patterns
  tab: "//button[@role='tab'][text()='#{loc.auto.fieldName}'];" +
       "//div[@role='tab'][text()='#{loc.auto.fieldName}']"
}
```


#### Step 4: Define Sections

Sections represent logical groupings or containers within a page:

```typescript
sections: {
  // Form sections
  "Login Form": "//form[@id='login'];//form[@class='login-form'];form#login",
  "Registration Form": "//form[@id='register'];form#register",
  
  // Content sections
  "Main Content": "//div[@id='main-content'];div#main-content",
  "Sidebar": "//aside[@class='sidebar'];aside.sidebar",
  
  // Navigation sections
  "Header Navigation": "//nav[@class='header-nav'];nav.header-nav",
  "Footer": "//footer;footer",
  
  // Modal/Dialog sections
  "Confirmation Dialog": "//div[@role='dialog'][@aria-label='Confirm'];div[role='dialog']",
  
  // Error/Message sections
  "Error Message": "//div[@class='error'];div.error;div[role='alert']"
}
```

**Usage in tests:**
```typescript
// Field within a section
await fill(page, '{Login Form} Username', 'john.doe');
await fill(page, '{Login Form} Password', 'secret');
```

#### Step 5: Define Locations

Locations represent major page regions or containers:

```typescript
locations: {
  // Main page areas
  "Main Content": "//main;main",
  "Header": "//header;header",
  "Footer": "//footer;footer",
  
  // Specific regions
  "Left Panel": "//div[@class='left-panel'];div.left-panel",
  "Right Panel": "//div[@class='right-panel'];div.right-panel",
  
  // Modal/Overlay regions
  "Modal": "//div[@class='modal'];div.modal",
  "Overlay": "//div[@class='overlay'];div.overlay"
}
```

**Usage in tests:**
```typescript
// Field within location and section
await fill(page, '{{Main Content}} {Login Form} Username', 'john.doe');
```

#### Step 6: Define Scroll Pattern (Optional)

Specify scrollable containers for lazy-loaded content:

```typescript
// Single scroll container
scroll: "//div[@class='scrollable'];div.scrollable"

// Multiple fallback scroll containers
scroll: "//div[@class='content-wrapper'];div.content-wrapper;//main;main"
```


### Complete Example: Product Page

```typescript
// resources/locators/pattern/productPage.pattern.ts

/* 
Available runtime variables:
- loc.auto.fieldName: The field name as provided
- loc.auto.fieldName.toLowerCase: Lowercase version of field name
- loc.auto.forId: Extracted "for" attribute from label (for label-based resolution)
- loc.auto.fieldInstance: Element instance number (default: "1")
- loc.auto.location.value: Location value from field string
- loc.auto.location.name: Location name from field string
- loc.auto.section.value: Section value from field string
- loc.auto.section.name: Section name from field string
*/

export const productPage = {
  fields: {
    // Product-specific button patterns
    button: "//button[@data-action='#{loc.auto.fieldName.toLowerCase}'];" +
            "//button[contains(@class, 'product-btn')][text()='#{loc.auto.fieldName}'];" +
            "button[data-action='#{loc.auto.fieldName.toLowerCase}']",
    
    // Product input patterns (quantity, search, etc.)
    input: "//input[@data-field='#{loc.auto.fieldName.toLowerCase}'];" +
           "//input[@placeholder='#{loc.auto.fieldName}'];" +
           "input[data-field='#{loc.auto.fieldName.toLowerCase}']",
    
    // Product links (categories, details, etc.)
    link: "//a[@data-category='#{loc.auto.fieldName.toLowerCase}'];" +
          "//a[text()='#{loc.auto.fieldName}'];" +
          "a[data-category='#{loc.auto.fieldName.toLowerCase}']",
    
    // Product text (price, description, etc.)
    text: "//span[@class='product-#{loc.auto.fieldName.toLowerCase}'];" +
          "//div[contains(@class, 'product-info')]//*[contains(text(), '#{loc.auto.fieldName}')]",
    
    // Product select dropdowns (size, color, etc.)
    select: "//select[@name='#{loc.auto.fieldName.toLowerCase}'];" +
            "select[name='#{loc.auto.fieldName.toLowerCase}']",
    
    // Product images
    image: "//img[@alt='#{loc.auto.fieldName}'];" +
           "img[alt='#{loc.auto.fieldName}']"
  },
  
  sections: {
    "Product Details": "//div[@class='product-details'];div.product-details",
    "Product Images": "//div[@class='product-gallery'];div.product-gallery",
    "Product Options": "//div[@class='product-options'];div.product-options",
    "Add to Cart": "//div[@class='add-to-cart-section'];div.add-to-cart-section",
    "Product Reviews": "//div[@id='reviews'];div#reviews",
    "Related Products": "//section[@class='related-products'];section.related-products"
  },
  
  locations: {
    "Main Product Area": "//main[@class='product-main'];main.product-main",
    "Sidebar": "//aside[@class='product-sidebar'];aside.product-sidebar",
    "Recommendations": "//div[@class='recommendations'];div.recommendations"
  },
  
  scroll: "//div[@class='product-container'];div.product-container;//main;main"
};
```

### Pattern File Best Practices

1. **Use Semicolon Separators**: Always separate multiple patterns with semicolons
   ```typescript
   // ✅ Correct
   button: "//button[text()='#{loc.auto.fieldName}'];button:has-text('#{loc.auto.fieldName}')"
   
   // ❌ Wrong - Don't use arrays
   button: ["//button[text()='#{loc.auto.fieldName}']", "button:has-text('#{loc.auto.fieldName}')"]
   ```

2. **Order Patterns by Specificity**: Place most specific patterns first
   ```typescript
   input: "//input[@id='#{loc.auto.forId}'];" +           // Most specific (from label)
          "//input[@name='#{loc.auto.fieldName.toLowerCase}'];" +  // Specific
          "//input[@placeholder='#{loc.auto.fieldName}']"          // Less specific
   ```

3. **Mix XPath and CSS**: Provide both XPath and CSS alternatives
   ```typescript
   button: "//button[text()='#{loc.auto.fieldName}'];" +  // XPath
           "button:has-text('#{loc.auto.fieldName}')"      // CSS
   ```

4. **Use Lowercase for Attributes**: Many HTML attributes are case-insensitive
   ```typescript
   input: "//input[@name='#{loc.auto.fieldName.toLowerCase}']"
   ```

5. **Include Label Patterns**: Always define label patterns for form elements
   ```typescript
   label: "//label[text()='#{loc.auto.fieldName}'];" +
          "//label[contains(text(), '#{loc.auto.fieldName}')]"
   ```

6. **Document Complex Patterns**: Add comments for non-obvious patterns
   ```typescript
   // Special pattern for PrimeNG dropdown components
   dropdown: "//p-dropdown[@placeholder='#{loc.auto.fieldName}']//div[contains(@class, 'ui-dropdown')]"
   ```


## Three Ways to Specify Page Objects

The pattern system provides three flexible ways to specify which page object to use:

### 1. Explicit Page Object Selection (Highest Priority)

Use the `pattern` parameter in WebActions methods to explicitly specify a page object:

```typescript
import { fill, clickButton } from './src/helper/actions/webActions';

// Explicitly use loginPage patterns
await fill(page, 'Username', 'john.doe', { pattern: 'loginPage' });

// Explicitly use checkoutPage patterns
await clickButton(page, 'Place Order', { pattern: 'checkoutPage' });

// Mix different page objects in same test
await fill(page, 'Email', 'test@example.com', { pattern: 'loginPage' });
await clickButton(page, 'Continue', { pattern: 'homePage' });
```

**When to use:**
- Cross-page element interactions
- Overriding automatic detection
- Testing components that appear on multiple pages
- Debugging locator issues

### 2. Default Configuration (Medium Priority)

Set a default page object in `resources/config.ts`:

```typescript
patternIq: {
  enable: true,
  config: "loginPage",  // Default page object for all actions
  retryTimeout: 30000,
  retryInterval: 2000
}
```

**When to use:**
- Single-page applications
- Tests focused on one page
- Setting a fallback when URL mapping doesn't match

**Example:**
```typescript
// All actions use loginPage patterns (from config.patternIq.config)
await fill(page, 'Username', 'john.doe');
await fill(page, 'Password', 'secret');
await clickButton(page, 'Login');
```

### 3. URL-Based Automatic Detection (Lowest Priority)

Configure URL-to-page-object mapping in `resources/config.ts`:

```typescript
patternIq: {
  enable: true,
  config: "homePage",  // Fallback default
  retryTimeout: 30000,
  retryInterval: 2000,
  pageMapping: {
    "/login": "loginPage",
    "/home": "homePage",
    "/checkout": "checkoutPage",
    "/products": "productPage",
    "/cart": "cartPage"
  }
}
```

**How it works:**
- System checks current page URL
- Matches URL against `pageMapping` patterns
- Automatically selects corresponding page object
- Falls back to `config` value if no match

**Example:**
```typescript
// Navigate to /login - automatically uses loginPage patterns
await page.goto('/login');
await fill(page, 'Username', 'john.doe');  // Uses loginPage.fields.input

// Navigate to /checkout - automatically uses checkoutPage patterns
await page.goto('/checkout');
await fill(page, 'Card Number', '4111111111111111');  // Uses checkoutPage.fields.input
```

**When to use:**
- Multi-page test flows
- Automatic page object switching
- Reducing explicit pattern parameters
- Cleaner test code

### Priority Order

When multiple methods are used, the system follows this priority:

```
1. Explicit pattern parameter (highest)
   ↓
2. URL-based pageMapping
   ↓
3. Default config value (lowest)
```

**Example demonstrating priority:**

```typescript
// Config:
patternIq: {
  config: "homePage",           // Priority 3: Default
  pageMapping: {
    "/login": "loginPage"       // Priority 2: URL mapping
  }
}

// Test:
await page.goto('/login');

// Uses loginPage (Priority 2 - URL mapping)
await fill(page, 'Username', 'john.doe');

// Uses checkoutPage (Priority 1 - Explicit override)
await fill(page, 'Email', 'test@example.com', { pattern: 'checkoutPage' });

// Uses loginPage again (Priority 2 - URL mapping)
await clickButton(page, 'Login');
```

### Recommendation

For most projects, use **URL-based automatic detection** as the primary method:

```typescript
patternIq: {
  enable: true,
  config: "homePage",  // Fallback for unmapped URLs
  pageMapping: {
    "/": "homePage",
    "/login": "loginPage",
    "/register": "registrationPage",
    "/products": "productPage",
    "/cart": "cartPage",
    "/checkout": "checkoutPage",
    "/profile": "profilePage"
  }
}
```

This provides:
- ✅ Automatic page object switching
- ✅ Clean test code (no explicit pattern parameters)
- ✅ Easy maintenance (centralized mapping)
- ✅ Flexibility (can still override when needed)


## Migration Guide: Centralized to Page Object Model

This guide helps you migrate from a centralized pattern configuration to the Page Object Model approach.

### Before: Centralized Configuration

**Old structure:**
```
resources/locators/
└── pattern/
    └── uportalOb.pattern.ts  ← Single file with all patterns
```

**Old pattern file:**
```typescript
export const uportalOb = {
  fields: {
    button: "//button[text()='#{loc.auto.fieldName}']",
    input: "//input[@placeholder='#{loc.auto.fieldName}']",
    // ... all patterns for all pages mixed together
  },
  sections: {
    "Login Form": "//form[@id='login']",
    "Home Navigation": "//nav[@class='main-nav']",
    "Checkout Summary": "//div[@id='summary']",
    // ... sections from all pages mixed together
  }
}
```

### After: Page Object Model

**New structure:**
```
resources/locators/pattern/
├── loginPage.pattern.ts      ← Login page patterns
├── homePage.pattern.ts        ← Home page patterns
├── checkoutPage.pattern.ts    ← Checkout page patterns
└── productPage.pattern.ts     ← Product page patterns
```

**New pattern files (separated by page):**

Each page has its own focused pattern file with only relevant patterns.

### Migration Steps

#### Step 1: Analyze Current Patterns

Review your centralized pattern file and identify which patterns belong to which pages:

```typescript
// Centralized file analysis
export const uportalOb = {
  fields: {
    button: "...",  // Used on all pages
    input: "...",   // Used on all pages
  },
  sections: {
    "Login Form": "...",        // → loginPage
    "Home Navigation": "...",   // → homePage
    "Checkout Summary": "...",  // → checkoutPage
    "Product Gallery": "...",   // → productPage
  }
}
```

#### Step 2: Create Page Object Files

Create separate files for each page:

**loginPage.pattern.ts:**
```typescript
export const loginPage = {
  fields: {
    button: "//button[text()='#{loc.auto.fieldName}'];button:has-text('#{loc.auto.fieldName}')",
    input: "//input[@placeholder='#{loc.auto.fieldName}'];input[placeholder='#{loc.auto.fieldName}']",
    link: "//a[text()='#{loc.auto.fieldName}'];a:text('#{loc.auto.fieldName}')"
  },
  sections: {
    "Login Form": "//form[@id='login'];form#login",
    "Error Message": "//div[@class='error'];div.error"
  },
  locations: {
    "Main Content": "//main;main"
  }
};
```

**homePage.pattern.ts:**
```typescript
export const homePage = {
  fields: {
    button: "//button[@data-testid='#{loc.auto.fieldName.toLowerCase}'];button[data-testid='#{loc.auto.fieldName.toLowerCase}']",
    link: "//nav//a[text()='#{loc.auto.fieldName}'];nav a:text('#{loc.auto.fieldName}')",
    text: "//h1[text()='#{loc.auto.fieldName}'];h1:text('#{loc.auto.fieldName}')"
  },
  sections: {
    "Navigation": "//nav[@class='main-nav'];nav.main-nav",
    "Hero Section": "//section[@class='hero'];section.hero"
  },
  locations: {
    "Main Content": "//div[@id='content'];div#content"
  }
};
```

**checkoutPage.pattern.ts:**
```typescript
export const checkoutPage = {
  fields: {
    input: "//input[@name='#{loc.auto.fieldName.toLowerCase}'];input[name='#{loc.auto.fieldName.toLowerCase}']",
    select: "//select[@id='#{loc.auto.fieldName.toLowerCase}'];select##{loc.auto.fieldName.toLowerCase}",
    button: "//button[@type='submit'][text()='#{loc.auto.fieldName}'];button[type='submit']:has-text('#{loc.auto.fieldName}')"
  },
  sections: {
    "Billing Information": "//div[@id='billing'];div#billing",
    "Shipping Information": "//div[@id='shipping'];div#shipping",
    "Order Summary": "//div[@id='summary'];div#summary"
  },
  locations: {
    "Main Content": "//main[@class='checkout-main'];main.checkout-main"
  }
};
```


#### Step 3: Update Configuration

Update `resources/config.ts` to use page object model:

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
  config: "homePage",  // Default page object
  retryTimeout: 30000,
  retryInterval: 2000,
  pageMapping: {       // NEW: URL-based page detection
    "/login": "loginPage",
    "/home": "homePage",
    "/checkout": "checkoutPage",
    "/products": "productPage"
  }
}
```

#### Step 4: Update Tests (If Needed)

Most tests will work without changes if you use URL-based mapping. For tests that need explicit page objects:

**Before:**
```typescript
// All actions used the same "uportalOb" pattern
await fill(page, 'Username', 'john.doe');
await clickButton(page, 'Login');
```

**After (with URL mapping):**
```typescript
// Automatically uses correct page object based on URL
await page.goto('/login');
await fill(page, 'Username', 'john.doe');  // Uses loginPage
await clickButton(page, 'Login');          // Uses loginPage

await page.goto('/home');
await clickButton(page, 'Products');       // Uses homePage
```

**After (with explicit override):**
```typescript
// Explicitly specify page object when needed
await fill(page, 'Username', 'john.doe', { pattern: 'loginPage' });
await clickButton(page, 'Login', { pattern: 'loginPage' });
```

#### Step 5: Verify Migration

Create a test to verify all page objects load correctly:

```typescript
import { test, expect } from '@playwright/test';

test('verify page object patterns load', async ({ page }) => {
  // Test loginPage patterns
  await page.goto('/login');
  await expect(page.locator('input[placeholder="Username"]')).toBeVisible();
  
  // Test homePage patterns
  await page.goto('/home');
  await expect(page.locator('nav')).toBeVisible();
  
  // Test checkoutPage patterns
  await page.goto('/checkout');
  await expect(page.locator('form')).toBeVisible();
});
```

### Migration Checklist

- [ ] Analyze centralized pattern file
- [ ] Identify patterns by page
- [ ] Create separate page object files
- [ ] Update configuration with pageMapping
- [ ] Test each page object independently
- [ ] Update tests if using explicit pattern parameters
- [ ] Remove old centralized pattern file
- [ ] Update documentation
- [ ] Train team on new structure

### Benefits After Migration

✅ **Better Organization**: Each page's patterns are in one place
✅ **Easier Maintenance**: Changes to one page don't affect others
✅ **Clearer Ownership**: Each page object is self-contained
✅ **Scalability**: Adding new pages is straightforward
✅ **Reduced Conflicts**: Multiple developers can work on different pages
✅ **Automatic Switching**: URL-based detection reduces boilerplate

### Common Migration Issues

#### Issue 1: Shared Patterns Across Pages

**Problem**: Some patterns are used on multiple pages

**Solution**: Duplicate the patterns in each page object, or create a base pattern:

```typescript
// Option 1: Duplicate (recommended for flexibility)
// loginPage.pattern.ts
export const loginPage = {
  fields: {
    button: "//button[text()='#{loc.auto.fieldName}']"
  }
};

// homePage.pattern.ts
export const homePage = {
  fields: {
    button: "//button[text()='#{loc.auto.fieldName}']"
  }
};

// Option 2: Create base patterns (for truly shared patterns)
// basePatterns.ts
export const baseFieldPatterns = {
  button: "//button[text()='#{loc.auto.fieldName}']",
  input: "//input[@placeholder='#{loc.auto.fieldName}']"
};

// loginPage.pattern.ts
import { baseFieldPatterns } from './basePatterns';

export const loginPage = {
  fields: {
    ...baseFieldPatterns,
    // Add page-specific overrides
    input: "//input[@id='#{loc.auto.forId}'];input[@placeholder='#{loc.auto.fieldName}']"
  }
};
```

#### Issue 2: Tests Don't Know Which Page They're On

**Problem**: Tests navigate between pages without explicit page.goto()

**Solution**: Use explicit pattern parameters or ensure URL changes:

```typescript
// Option 1: Explicit pattern
await clickButton(page, 'Submit', { pattern: 'loginPage' });

// Option 2: Ensure URL changes trigger mapping
await page.goto('/checkout');  // Triggers pageMapping
await fill(page, 'Card Number', '4111111111111111');
```

#### Issue 3: Pattern Arrays Instead of Semicolons

**Problem**: Old pattern files used arrays

**Solution**: Convert arrays to semicolon-separated strings:

```typescript
// ❌ Before (arrays)
button: ["//button[text()='#{loc.auto.fieldName}']", "button:has-text('#{loc.auto.fieldName}')"]

// ✅ After (semicolon-separated)
button: "//button[text()='#{loc.auto.fieldName}'];button:has-text('#{loc.auto.fieldName}')"
```


## Configuration Reference

### Complete Configuration Options

```typescript
// resources/config.ts

export const config = {
  // ... other config options ...
  
  patternIq: {
    // Enable/disable pattern-based locator resolution
    // Type: boolean
    // Default: false
    enable: true,
    
    // Default page object Pattern_Code to use
    // Type: string
    // Default: undefined
    // Used when no URL mapping matches and no explicit pattern provided
    config: "homePage",
    
    // Maximum time to retry locator resolution (milliseconds)
    // Type: number
    // Default: 30000 (30 seconds)
    // The system will retry with fallback patterns and scrolling until timeout
    retryTimeout: 30000,
    
    // Interval between retry attempts (milliseconds)
    // Type: number
    // Default: 2000 (2 seconds)
    // Time to wait between each retry cycle
    retryInterval: 2000,
    
    // URL-based page object detection mapping
    // Type: object (URL pattern → Pattern_Code)
    // Default: undefined
    // Maps URL paths to page object Pattern_Codes for automatic detection
    pageMapping: {
      "/": "homePage",
      "/login": "loginPage",
      "/register": "registrationPage",
      "/products": "productPage",
      "/products/:id": "productDetailPage",
      "/cart": "cartPage",
      "/checkout": "checkoutPage",
      "/checkout/success": "orderConfirmationPage",
      "/profile": "profilePage",
      "/settings": "settingsPage"
    }
  }
};
```

### Configuration Properties Explained

#### `enable` (boolean)

Controls whether pattern-based locator resolution is active.

```typescript
enable: true   // Use pattern-based locators
enable: false  // Use only static locators
```

**When to disable:**
- Debugging locator issues
- Comparing pattern vs static locator performance
- Temporarily reverting to static locators

#### `config` (string)

Default page object to use when no URL mapping matches.

```typescript
config: "homePage"  // Use homePage patterns as default
```

**Use cases:**
- Fallback for unmapped URLs
- Single-page applications
- Default for all tests

#### `retryTimeout` (number)

Maximum time (ms) to retry locator resolution.

```typescript
retryTimeout: 30000  // 30 seconds (default)
retryTimeout: 60000  // 60 seconds (for slow pages)
retryTimeout: 15000  // 15 seconds (for fast pages)
```

**Considerations:**
- Longer timeout = more resilient to slow loading
- Shorter timeout = faster test failures
- Balance between reliability and speed

#### `retryInterval` (number)

Time (ms) between retry attempts.

```typescript
retryInterval: 2000  // 2 seconds (default)
retryInterval: 1000  // 1 second (faster retries)
retryInterval: 5000  // 5 seconds (slower retries)
```

**Considerations:**
- Shorter interval = more retry attempts
- Longer interval = less CPU usage
- Match to your application's loading patterns

#### `pageMapping` (object)

Maps URL patterns to page object Pattern_Codes.

```typescript
pageMapping: {
  "/login": "loginPage",           // Exact match
  "/products": "productPage",      // Exact match
  "/products/:id": "productDetailPage",  // With parameter
  "/checkout/*": "checkoutPage"    // Wildcard (if supported)
}
```

**Matching rules:**
- Exact path match first
- Prefix match if no exact match
- Falls back to `config` if no match

**Example matching:**
```
URL: /login          → loginPage
URL: /products       → productPage
URL: /products/123   → productDetailPage (if :id pattern supported)
URL: /checkout/step1 → checkoutPage (if wildcard supported)
URL: /unknown        → homePage (from config)
```

### Environment-Specific Configuration

Override configuration per environment:

```typescript
// config.ts
const baseConfig = {
  patternIq: {
    enable: true,
    config: "homePage",
    retryTimeout: 30000,
    retryInterval: 2000
  }
};

// Development environment - more logging, longer timeouts
const devConfig = {
  ...baseConfig,
  patternIq: {
    ...baseConfig.patternIq,
    retryTimeout: 60000,  // Longer timeout for debugging
    retryInterval: 3000   // Longer interval to observe behavior
  }
};

// Production environment - optimized for speed
const prodConfig = {
  ...baseConfig,
  patternIq: {
    ...baseConfig.patternIq,
    retryTimeout: 20000,  // Shorter timeout
    retryInterval: 1000   // Faster retries
  }
};

// Export based on environment
export const config = process.env.NODE_ENV === 'production' ? prodConfig : devConfig;
```

### Configuration Validation

Add validation to catch configuration errors early:

```typescript
// src/helper/bundle/vars.ts or similar

export function validatePatternConfig() {
  const config = getConfigValue('patternIq');
  
  if (!config) {
    console.warn('⚠️  PatternIQ configuration not found');
    return false;
  }
  
  if (config.enable && !config.config) {
    console.warn('⚠️  PatternIQ enabled but no default config specified');
  }
  
  if (config.retryTimeout < config.retryInterval) {
    console.error('❌ retryTimeout must be greater than retryInterval');
    return false;
  }
  
  if (config.pageMapping) {
    const mappingCount = Object.keys(config.pageMapping).length;
    console.log(`✅ PatternIQ configured with ${mappingCount} page mappings`);
  }
  
  return true;
}
```

### Configuration Best Practices

1. **Always define pageMapping**: Enables automatic page object switching
2. **Set reasonable timeouts**: Balance between reliability and speed
3. **Use environment-specific configs**: Different settings for dev/test/prod
4. **Validate configuration**: Catch errors early in test execution
5. **Document custom mappings**: Help team understand URL patterns
6. **Keep config in version control**: Ensure consistency across team


## Advanced Topics

### Field Name Syntax

The pattern system supports rich field name syntax for complex locator scenarios:

#### Basic Field Name
```typescript
await fill(page, 'Username', 'john.doe');
// Resolves: pattern.{pageObject}.fields.input with fieldName="Username"
```

#### Field with Instance Number
```typescript
await clickButton(page, 'Submit[2]');
// Resolves: Second instance of Submit button
// Sets: loc.auto.fieldInstance = "2"
```

#### Field within Section
```typescript
await fill(page, '{Login Form} Username', 'john.doe');
// Resolves: pattern.{pageObject}.sections.Login Form >> pattern.{pageObject}.fields.input
// Sets: loc.auto.section.name = "Login Form"
```

#### Field within Location and Section
```typescript
await fill(page, '{{Main Content}} {Login Form} Username', 'john.doe');
// Resolves: pattern.{pageObject}.locations.Main Content >> 
//           pattern.{pageObject}.sections.Login Form >> 
//           pattern.{pageObject}.fields.input
// Sets: loc.auto.location.name = "Main Content"
//       loc.auto.section.name = "Login Form"
```

#### Complex Field Name with Values
```typescript
await clickButton(page, '{{top_menu:: Home}} {submenu:: Products} View All');
// Resolves with custom location and section values
// Sets: loc.auto.location.name = "top_menu"
//       loc.auto.location.value = "Home"
//       loc.auto.section.name = "submenu"
//       loc.auto.section.value = "Products"
```

### Label-Based Resolution

The system automatically attempts label-based resolution for eligible elements (input, select, textarea):

#### How It Works

1. System looks for label patterns first
2. Extracts the `for` attribute from the label
3. Uses the `for` value to find the target element
4. Falls back to direct patterns if label not found

#### Example

**HTML:**
```html
<label for="user-email">Email Address</label>
<input id="user-email" type="email" />
```

**Pattern:**
```typescript
fields: {
  label: "//label[text()='#{loc.auto.fieldName}'];label:text('#{loc.auto.fieldName}')",
  input: "//input[@id='#{loc.auto.forId}'];//input[@placeholder='#{loc.auto.fieldName}']"
}
```

**Test:**
```typescript
await fill(page, 'Email Address', 'test@example.com');
// 1. Finds label with text "Email Address"
// 2. Extracts for="user-email"
// 3. Sets loc.auto.forId = "user-email"
// 4. Resolves //input[@id='user-email']
```

### Chained Locators

Chained locators use the `>>` separator to traverse DOM hierarchy:

```typescript
// Pattern resolves to:
"//main >> //form[@id='login'] >> //input[@placeholder='Username']"

// Playwright evaluates as:
page.locator('//main').locator('//form[@id="login"]').locator('//input[@placeholder="Username"]')
```

### Scroll and Retry Mechanism

The system automatically handles lazy-loaded content:

1. **Initial Attempt**: Try all fallback patterns
2. **Scroll**: If not found, scroll the page/container
3. **Retry**: Wait for retry interval, try patterns again
4. **Repeat**: Continue until element found or timeout reached

**Scroll patterns:**
```typescript
// Scroll specific container
scroll: "//div[@class='scrollable'];div.scrollable"

// Scroll main content area
scroll: "//main;main"

// Multiple fallback scroll containers
scroll: "//div[@class='content'];div.content;//main;main"
```

### Custom Element Types

Add custom element types to your pattern files:

```typescript
export const myPage = {
  fields: {
    // Standard types
    button: "...",
    input: "...",
    
    // Custom types
    card: "//div[@class='card'][.//h3[text()='#{loc.auto.fieldName}']]",
    tile: "//div[@class='tile'][@data-title='#{loc.auto.fieldName}']",
    accordion: "//div[@class='accordion'][.//button[text()='#{loc.auto.fieldName}']]",
    tooltip: "//div[@role='tooltip'][contains(text(), '#{loc.auto.fieldName}')]",
    badge: "//span[@class='badge'][text()='#{loc.auto.fieldName}']"
  }
};
```

**Usage:**
```typescript
// Use custom element type in WebActions
await clickElement(page, 'card', 'Product Card');
await verifyElement(page, 'badge', 'New');
```

### Performance Optimization

#### Pattern Caching

Patterns are cached during resolution to avoid repeated lookups:

```typescript
// First resolution: Loads patterns from config
await fill(page, 'Username', 'john.doe');

// Subsequent resolutions: Uses cached patterns (within same resolution)
await fill(page, 'Password', 'secret');
```

#### Efficient Chained Evaluation

Chained locators are evaluated in a single `page.evaluate()` call to minimize context switches:

```typescript
// Single evaluation for entire chain
const result = await page.evaluate(() => {
  // Evaluate: location >> section >> field
  // Returns: exists, visible, enabled
});
```

#### Early Termination

Resolution stops as soon as a visible element is found:

```typescript
// Patterns: pattern1;pattern2;pattern3;pattern4
// If pattern2 finds visible element, pattern3 and pattern4 are skipped
```

### Debugging Tips

#### Enable Verbose Logging

Add logging to pattern resolution:

```typescript
// In patternIqEngine.ts
console.log(`[PatternIQ] Resolving: ${argField} (type: ${argType}, page: ${patternCode})`);
console.log(`[PatternIQ] Attempting pattern: ${pattern}`);
console.log(`[PatternIQ] Result: exists=${result.exists}, visible=${result.visible}`);
```

#### Inspect Resolved Locators

Log the final resolved locator:

```typescript
const locator = await patternIq(page, 'button', 'Submit', 'loginPage');
console.log(`[PatternIQ] Resolved locator: ${locator}`);
```

#### Test Individual Patterns

Test patterns in isolation:

```typescript
// Test specific pattern
const pattern = "//button[text()='Submit']";
const element = await page.locator(pattern);
console.log(`Pattern found: ${await element.count()} elements`);
```

#### Verify Pattern Loading

Check that patterns are loaded correctly:

```typescript
import { getValue } from './src/helper/bundle/vars';

// Check if pattern exists
const buttonPattern = getValue('pattern.loginPage.fields.button');
console.log(`Button pattern: ${buttonPattern}`);
```

### Troubleshooting Common Issues

#### Issue: Element Not Found

**Symptoms**: Timeout error, no element found

**Solutions:**
1. Verify pattern syntax is correct
2. Check element actually exists on page
3. Increase retry timeout
4. Add more fallback patterns
5. Check page object is correct

#### Issue: Wrong Element Selected

**Symptoms**: Action performed on wrong element

**Solutions:**
1. Make patterns more specific
2. Use instance numbers: `Button[2]`
3. Use sections/locations to scope
4. Reorder patterns (most specific first)

#### Issue: Slow Resolution

**Symptoms**: Tests take long time

**Solutions:**
1. Reduce retry timeout
2. Reduce retry interval
3. Optimize patterns (remove slow XPath)
4. Use CSS selectors instead of XPath
5. Reduce number of fallback patterns

#### Issue: Pattern Not Loading

**Symptoms**: Error about missing pattern

**Solutions:**
1. Verify file name: `{pageName}.pattern.ts`
2. Check file location: `resources/locators/pattern/`
3. Verify export: `export const {pageName} = {...}`
4. Check pattern code matches file name
5. Restart test runner to reload patterns


## Examples and Use Cases

### Example 1: E-Commerce Application

Complete page object setup for an e-commerce site:

**Configuration:**
```typescript
patternIq: {
  enable: true,
  config: "homePage",
  retryTimeout: 30000,
  retryInterval: 2000,
  pageMapping: {
    "/": "homePage",
    "/products": "productListPage",
    "/products/:id": "productDetailPage",
    "/cart": "cartPage",
    "/checkout": "checkoutPage",
    "/checkout/success": "orderConfirmationPage"
  }
}
```

**Test Flow:**
```typescript
test('complete purchase flow', async ({ page }) => {
  // Home page - automatic detection
  await page.goto('/');
  await clickLink(page, 'Products');  // Uses homePage patterns
  
  // Product list - automatic detection
  await page.goto('/products');
  await clickButton(page, 'View Details[1]');  // Uses productListPage patterns
  
  // Product detail - automatic detection
  await fill(page, 'Quantity', '2');  // Uses productDetailPage patterns
  await clickButton(page, 'Add to Cart');
  
  // Cart - automatic detection
  await page.goto('/cart');
  await clickButton(page, 'Proceed to Checkout');  // Uses cartPage patterns
  
  // Checkout - automatic detection
  await page.goto('/checkout');
  await fill(page, '{Billing Information} Full Name', 'John Doe');
  await fill(page, '{Billing Information} Email', 'john@example.com');
  await fill(page, '{Payment Details} Card Number', '4111111111111111');
  await clickButton(page, 'Place Order');  // Uses checkoutPage patterns
  
  // Order confirmation - automatic detection
  await expect(page).toHaveURL('/checkout/success');
  await verifyText(page, 'Order Confirmed');  // Uses orderConfirmationPage patterns
});
```

### Example 2: Multi-Step Form

Handling complex forms with sections:

**Pattern File:**
```typescript
export const registrationPage = {
  fields: {
    input: "//input[@name='#{loc.auto.fieldName.toLowerCase}'];input[name='#{loc.auto.fieldName.toLowerCase}']",
    select: "//select[@name='#{loc.auto.fieldName.toLowerCase}'];select[name='#{loc.auto.fieldName.toLowerCase}']",
    checkbox: "//input[@type='checkbox'][@name='#{loc.auto.fieldName.toLowerCase}']",
    button: "//button[text()='#{loc.auto.fieldName}'];button:has-text('#{loc.auto.fieldName}')"
  },
  sections: {
    "Personal Information": "//fieldset[@id='personal'];fieldset#personal",
    "Contact Information": "//fieldset[@id='contact'];fieldset#contact",
    "Account Details": "//fieldset[@id='account'];fieldset#account",
    "Preferences": "//fieldset[@id='preferences'];fieldset#preferences"
  }
};
```

**Test:**
```typescript
test('user registration', async ({ page }) => {
  await page.goto('/register');
  
  // Personal Information section
  await fill(page, '{Personal Information} First Name', 'John');
  await fill(page, '{Personal Information} Last Name', 'Doe');
  await fill(page, '{Personal Information} Date of Birth', '1990-01-01');
  
  // Contact Information section
  await fill(page, '{Contact Information} Email', 'john@example.com');
  await fill(page, '{Contact Information} Phone', '555-1234');
  await fill(page, '{Contact Information} Address', '123 Main St');
  
  // Account Details section
  await fill(page, '{Account Details} Username', 'johndoe');
  await fill(page, '{Account Details} Password', 'SecurePass123!');
  await fill(page, '{Account Details} Confirm Password', 'SecurePass123!');
  
  // Preferences section
  await clickCheckbox(page, '{Preferences} Newsletter');
  await selectDropdown(page, '{Preferences} Language', 'English');
  
  await clickButton(page, 'Register');
});
```

### Example 3: Dashboard with Multiple Widgets

Handling complex layouts with locations:

**Pattern File:**
```typescript
export const dashboardPage = {
  fields: {
    button: "//button[@data-action='#{loc.auto.fieldName.toLowerCase}'];button[data-action='#{loc.auto.fieldName.toLowerCase}']",
    text: "//*[contains(text(), '#{loc.auto.fieldName}')]",
    link: "//a[text()='#{loc.auto.fieldName}'];a:text('#{loc.auto.fieldName}')"
  },
  sections: {
    "Sales Widget": "//div[@data-widget='sales'];div[data-widget='sales']",
    "Analytics Widget": "//div[@data-widget='analytics'];div[data-widget='analytics']",
    "Tasks Widget": "//div[@data-widget='tasks'];div[data-widget='tasks']",
    "Notifications Widget": "//div[@data-widget='notifications'];div[data-widget='notifications']"
  },
  locations: {
    "Left Panel": "//div[@class='left-panel'];div.left-panel",
    "Center Panel": "//div[@class='center-panel'];div.center-panel",
    "Right Panel": "//div[@class='right-panel'];div.right-panel"
  }
};
```

**Test:**
```typescript
test('dashboard interactions', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Interact with left panel widgets
  await clickButton(page, '{{Left Panel}} {Sales Widget} Refresh');
  await verifyText(page, '{{Left Panel}} {Sales Widget} Total Sales');
  
  // Interact with center panel widgets
  await clickLink(page, '{{Center Panel}} {Analytics Widget} View Report');
  await clickButton(page, '{{Center Panel}} {Tasks Widget} Add Task');
  
  // Interact with right panel widgets
  await clickButton(page, '{{Right Panel}} {Notifications Widget} Mark All Read');
});
```

### Example 4: Modal Dialogs

Handling dynamic modals:

**Pattern File:**
```typescript
export const modalPage = {
  fields: {
    button: "//button[text()='#{loc.auto.fieldName}'];button:has-text('#{loc.auto.fieldName}')",
    input: "//input[@placeholder='#{loc.auto.fieldName}'];input[placeholder='#{loc.auto.fieldName}']",
    text: "//*[contains(text(), '#{loc.auto.fieldName}')]"
  },
  sections: {
    "Confirmation Dialog": "//div[@role='dialog'][@aria-label='Confirm'];div[role='dialog'][aria-label='Confirm']",
    "Delete Dialog": "//div[@role='dialog'][@aria-label='Delete'];div[role='dialog'][aria-label='Delete']",
    "Edit Dialog": "//div[@role='dialog'][@aria-label='Edit'];div[role='dialog'][aria-label='Edit']"
  },
  locations: {
    "Modal Overlay": "//div[@class='modal-overlay'];div.modal-overlay"
  }
};
```

**Test:**
```typescript
test('modal interactions', async ({ page }) => {
  await page.goto('/items');
  
  // Open delete dialog
  await clickButton(page, 'Delete Item');
  
  // Interact within modal
  await verifyText(page, '{{Modal Overlay}} {Delete Dialog} Are you sure?');
  await clickButton(page, '{{Modal Overlay}} {Delete Dialog} Confirm');
  
  // Open edit dialog
  await clickButton(page, 'Edit Item');
  await fill(page, '{{Modal Overlay}} {Edit Dialog} Item Name', 'Updated Name');
  await clickButton(page, '{{Modal Overlay}} {Edit Dialog} Save');
});
```

### Example 5: Cross-Page Element Interaction

Using explicit pattern override for cross-page elements:

**Test:**
```typescript
test('cross-page interactions', async ({ page }) => {
  await page.goto('/products');
  
  // Use productPage patterns for main content
  await clickButton(page, 'Add to Cart');
  
  // Use headerPage patterns for header elements (appears on all pages)
  await clickButton(page, 'Cart Icon', { pattern: 'headerPage' });
  
  // Use cartPage patterns for cart content
  await verifyText(page, 'Shopping Cart');
  
  // Use headerPage patterns for navigation
  await clickLink(page, 'Home', { pattern: 'headerPage' });
});
```

## Summary

The Pattern-Based Locator System with Page Object Model provides:

### Key Features
- ✅ Page-specific pattern organization
- ✅ Automatic page object detection via URL mapping
- ✅ Multiple fallback strategies per element type
- ✅ Runtime variable substitution
- ✅ Label-based resolution for form elements
- ✅ Chained locator support for complex DOM traversal
- ✅ Automatic scroll and retry for lazy-loaded content
- ✅ Backward compatibility with static locators

### Best Practices
1. Create separate pattern files for each page
2. Use URL-based page mapping for automatic detection
3. Define multiple fallback patterns (XPath and CSS)
4. Use sections and locations for complex layouts
5. Leverage runtime variables for dynamic patterns
6. Test patterns independently before integration
7. Document complex patterns with comments
8. Keep patterns maintainable and readable

### Getting Help
- Review existing pattern files for examples
- Check configuration reference for all options
- Use debugging tips to troubleshoot issues
- Refer to migration guide when converting from centralized patterns

For additional support, consult the design document at `.kiro/specs/pattern-locator-integration/design.md` and requirements document at `.kiro/specs/pattern-locator-integration/requirements.md`.

