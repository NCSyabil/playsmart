# Pattern Locator System - Overview

## What is the Pattern Locator System?

The Pattern Locator System is an advanced element location strategy for Playwright automation that uses **template-based patterns** to dynamically generate element locators at runtime. Instead of hard-coding XPath or CSS selectors in your tests, you define reusable patterns that adapt to different field names, sections, and page contexts.

## Why Use Pattern Locators?

### Traditional Approach Problems

```typescript
// ❌ Traditional hard-coded locators
await page.locator("//input[@id='username']").fill('john.doe');
await page.locator("//input[@id='password']").fill('secret123');
await page.locator("//button[@type='submit']").click();

// Problems:
// - Brittle: Breaks when IDs change
// - Repetitive: Similar patterns repeated everywhere
// - Hard to maintain: Changes require updating many files
// - Not reusable: Each element needs its own locator
```

### Pattern Locator Approach

```typescript
// ✅ Pattern-based locators
await fill(page, 'Username', 'john.doe');
await fill(page, 'Password', 'secret123');
await clickButton(page, 'Submit');

// Benefits:
// - Resilient: Multiple fallback strategies
// - Readable: Uses logical field names
// - Maintainable: Patterns defined once, used everywhere
// - Reusable: Same pattern works for all similar elements
```

## Key Concepts

### 1. Pattern Templates

Pattern templates are reusable locator definitions with placeholders:

```typescript
// Pattern template
button: "//button[text()='#{loc.auto.fieldName}'];button:has-text('#{loc.auto.fieldName}')"

// At runtime, becomes:
// "//button[text()='Submit'];button:has-text('Submit')"
```

### 2. Page Object Model

Each page has its own pattern file:

```
resources/locators/pattern/
├── loginPage.pattern.ts      ← Login page patterns
├── homePage.pattern.ts        ← Home page patterns
└── checkoutPage.pattern.ts    ← Checkout page patterns
```

### 3. Automatic Fallback

Multiple patterns separated by semicolons provide automatic fallback:

```typescript
// Try XPath first, then CSS if XPath fails
button: "//button[text()='#{loc.auto.fieldName}'];button:has-text('#{loc.auto.fieldName}')"
```

### 4. Dynamic Resolution

Locators are generated at runtime based on:
- Field name (e.g., "Username")
- Section context (e.g., "{Login Form}")
- Location context (e.g., "{{Main Content}}")
- Instance number (e.g., "Submit[2]")

### 5. Intelligent Features

- **Label Resolution**: Finds inputs by their associated labels
- **Lazy Loading**: Automatically scrolls to reveal hidden elements
- **Retry Mechanism**: Retries with different patterns until timeout
- **Chained Locators**: Combines location >> section >> field for precise targeting

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Test Layer                                │
│  await fill(page, 'Username', 'john.doe')                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                WebActions Layer                              │
│  fill() → webLocResolver()                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Locator Resolver                                │
│  Decides: Static? Pattern? SmartAI?                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Pattern Engine                                  │
│  1. Parse field name                                        │
│  2. Load patterns from page object                          │
│  3. Substitute variables                                    │
│  4. Try patterns with fallback                              │
│  5. Return Playwright locator                               │
└─────────────────────────────────────────────────────────────┘
```

## How It Works - Simple Example

### Step 1: Define Pattern

```typescript
// loginPage.pattern.ts
export const loginPage = {
  fields: {
    input: "//input[@placeholder='#{loc.auto.fieldName}'];input[placeholder='#{loc.auto.fieldName}']"
  }
};
```

### Step 2: Configure

```typescript
// resources/config.ts
patternIq: {
  enable: true,
  config: "loginPage",
  pageMapping: {
    "/login": "loginPage"
  }
}
```

### Step 3: Use in Test

```typescript
// test.spec.ts
await page.goto('/login');
await fill(page, 'Username', 'john.doe');
```

### Step 4: What Happens Under the Hood

1. **Test calls** `fill(page, 'Username', 'john.doe')`
2. **WebActions** calls `webLocResolver('input', 'Username', page)`
3. **Locator Resolver** detects pattern mode enabled, delegates to Pattern Engine
4. **Pattern Engine**:
   - Parses field name: "Username"
   - Loads pattern: `"//input[@placeholder='#{loc.auto.fieldName}'];input[placeholder='#{loc.auto.fieldName}']"`
   - Sets variable: `loc.auto.fieldName = "Username"`
   - Substitutes: `"//input[@placeholder='Username'];input[placeholder='Username']"`
   - Tries XPath: `//input[@placeholder='Username']` → Found! ✓
   - Returns: `page.locator("//input[@placeholder='Username']")`
5. **WebActions** fills the located element with 'john.doe'

## When to Use Pattern Locators

### ✅ Use Pattern Locators When:

- You have multiple pages with similar element structures
- Elements follow consistent naming patterns
- You want resilient tests that handle UI changes
- You need to reduce locator maintenance overhead
- Your team wants readable, logical test code

### ❌ Don't Use Pattern Locators When:

- Elements have completely unique, one-off locators
- You need maximum performance (static locators are faster)
- Your application has no consistent patterns
- You're testing a single simple page

## Quick Comparison

| Feature | Static Locators | Pattern Locators |
|---------|----------------|------------------|
| **Setup** | None | Initial pattern definition |
| **Maintenance** | High (update each locator) | Low (update pattern once) |
| **Readability** | Low (technical selectors) | High (logical names) |
| **Resilience** | Low (single strategy) | High (multiple fallbacks) |
| **Performance** | Fastest | Slightly slower (resolution overhead) |
| **Learning Curve** | Easy | Moderate |

## Next Steps

- **[Getting Started Guide](02-getting-started-with-patterns.md)** - Create your first pattern file
- **[Pattern Syntax Reference](03-pattern-syntax-reference.md)** - Learn pattern template syntax
- **[Advanced Features](04-advanced-pattern-features.md)** - Sections, locations, chaining
- **[Troubleshooting Guide](05-pattern-troubleshooting.md)** - Common issues and solutions

## Real-World Example

### Before: Static Locators (50 lines)

```typescript
await page.locator("//input[@id='billing-name']").fill('John Doe');
await page.locator("//input[@id='billing-email']").fill('john@example.com');
await page.locator("//input[@id='billing-phone']").fill('555-1234');
await page.locator("//input[@id='billing-address']").fill('123 Main St');
await page.locator("//select[@id='billing-country']").selectOption('US');
await page.locator("//input[@id='shipping-name']").fill('Jane Doe');
await page.locator("//input[@id='shipping-email']").fill('jane@example.com');
// ... 43 more lines
```

### After: Pattern Locators (10 lines)

```typescript
await fill(page, '{Billing Information} Name', 'John Doe');
await fill(page, '{Billing Information} Email', 'john@example.com');
await fill(page, '{Billing Information} Phone', '555-1234');
await fill(page, '{Billing Information} Address', '123 Main St');
await selectDropdown(page, '{Billing Information} Country', 'US');
await fill(page, '{Shipping Information} Name', 'Jane Doe');
await fill(page, '{Shipping Information} Email', 'jane@example.com');
// ... 3 more lines
```

**Result**: 80% less code, 100% more readable, infinitely more maintainable!
