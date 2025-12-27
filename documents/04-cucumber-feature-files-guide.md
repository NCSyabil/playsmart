# Cucumber Feature Files - Complete Guide

## Table of Contents

1. [Introduction](#introduction)
2. [How Feature Files Work](#how-feature-files-work)
3. [Feature File to Step Definition Connection](#feature-file-to-step-definition-connection)
4. [IDE Integration (Ctrl+Click Navigation)](#ide-integration-ctrlclick-navigation)
5. [Creating New Step Definitions](#creating-new-step-definitions)
6. [File Organization](#file-organization)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Introduction

Cucumber feature files use Gherkin syntax to describe test scenarios in plain English. These scenarios are connected to executable code through **step definitions**. This guide explains how this connection works and how to create your own step definitions.

### What You'll Learn

- How feature files connect to TypeScript code
- How to navigate from feature files to step definitions (Ctrl+Click)
- How to create new step definitions
- How to organize and maintain your test code
- Best practices for writing maintainable tests

---

## How Feature Files Work

### The Big Picture

```
┌─────────────────────────────────────────────────────────────┐
│  Feature File (.feature)                                     │
│  Written in Gherkin (plain English)                         │
│                                                              │
│  Scenario: User can login                                   │
│    When Web: Fill -field: "Username" -value: "john" ...     │
│    And Web: Click button -field: "Login" ...                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Cucumber matches text patterns
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Step Definition (webStepDefs.ts)                           │
│  Written in TypeScript                                      │
│                                                              │
│  Given("Web: Fill -field: {param} -value: {param} ...",     │
│    async function (field, value, options) {                 │
│      await webActions.fill(page, field, value, options);    │
│    }                                                         │
│  );                                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Calls implementation
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Web Actions (webActions.ts)                                │
│  Actual Playwright automation code                          │
│                                                              │
│  export async function fill(page, field, value, options) {  │
│    const locator = await webLocResolver(...);               │
│    await locator.fill(value);                               │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

### The Flow

1. **Feature File**: You write a scenario in plain English
2. **Cucumber**: Matches the text to a step definition using regex patterns
3. **Step Definition**: Extracts parameters and calls the implementation
4. **Web Actions**: Executes the actual Playwright automation code

---

## Feature File to Step Definition Connection

### How Cucumber Matches Steps

Cucumber uses **text pattern matching** to connect feature file steps to step definitions.

#### Example 1: Simple Match

**Feature File:**
```gherkin
When Web: Click button -field: "Login" -options: ""
```

**Step Definition:**
```typescript
Given("Web: Click button -field: {param} -options: {param}", 
  async function (field, options) {
    // field = "Login"
    // options = ""
    await webActions.clickButton(page, field, options);
  }
);
```

**How it works:**
- Cucumber sees: `Web: Click button -field: "Login" -options: ""`
- Matches pattern: `Web: Click button -field: {param} -options: {param}`
- Extracts: `field = "Login"`, `options = ""`
- Calls function with these parameters

#### Example 2: Multiple Parameters

**Feature File:**
```gherkin
When Web: Fill -field: "loginPage.usernameInput" -value: "testuser" -options: ""
```

**Step Definition:**
```typescript
Given("Web: Fill -field: {param} -value: {param} -options: {param}", 
  async function (field, value, options) {
    // field = "loginPage.usernameInput"
    // value = "testuser"
    // options = ""
    await webActions.fill(page, field, value, options);
  }
);
```

### Parameter Types

The framework uses a custom parameter type `{param}` that captures quoted strings:

```typescript
// Defined in Cucumber configuration
defineParameterType({
  name: 'param',
  regexp: /"([^"]*)"/,  // Matches anything between quotes
  transformer: s => s
});
```

This means:
- `"Login"` → captures `Login`
- `"loginPage.usernameInput"` → captures `loginPage.usernameInput`
- `"{screenshot: true}"` → captures `{screenshot: true}`
- `""` → captures empty string

---

## IDE Integration (Ctrl+Click Navigation)

### How Ctrl+Click Works

Modern IDEs (VS Code, IntelliJ, WebStorm) can navigate from feature files to step definitions.

#### Setup for VS Code

1. **Install Cucumber Extension**
   ```
   Extension: Cucumber (Gherkin) Full Support
   ID: alexkrechik.cucumberautocomplete
   ```

2. **Configure in `.vscode/settings.json`**
   ```json
   {
     "cucumberautocomplete.steps": [
       "src/helper/actions/webStepDefs.ts",
       "src/helper/actions/commStepDefs.ts"
     ],
     "cucumberautocomplete.syncfeatures": "features/**/*.feature",
     "cucumberautocomplete.strictGherkinCompletion": true
   }
   ```

3. **Usage**
   - Open any `.feature` file
   - Hover over a step (e.g., `When Web: Click button...`)
   - Press `Ctrl+Click` (Windows/Linux) or `Cmd+Click` (Mac)
   - IDE jumps to the step definition in `webStepDefs.ts`

#### What You'll See

**Before (Feature File):**
```gherkin
When Web: Fill -field: "Username" -value: "john" -options: ""
     ↑ Ctrl+Click here
```

**After (Step Definition):**
```typescript
Given("Web: Fill -field: {param} -value: {param} -options: {param}", 
  async function (field, value, options) {
    // ← You land here
    let page = webFixture.getCurrentPage();
    await webActions.fill(page, field, value, options);
  }
);
```

### Autocomplete Support

With the Cucumber extension, you get:

1. **Step Autocomplete**: Type `When Web:` and see all available steps
2. **Parameter Hints**: See what parameters each step expects
3. **Syntax Highlighting**: Gherkin keywords highlighted
4. **Error Detection**: Undefined steps marked with warnings

---

## Creating New Step Definitions

### When to Create New Step Definitions

Create new step definitions when:
- You need a new action not covered by existing steps
- You want to simplify complex workflows
- You need domain-specific steps for your application

### Step-by-Step Guide

#### Step 1: Identify the Need

Let's say you want to add a step to upload files:

```gherkin
When Web: Upload file -field: "fileInput" -filePath: "test.pdf" -options: ""
```

#### Step 2: Choose the Right File

Add your step definition to:
- `src/helper/actions/webStepDefs.ts` - For web UI actions
- `src/helper/actions/commStepDefs.ts` - For common/API actions
- Create new file if needed for specific domain

#### Step 3: Write the Step Definition

```typescript
/**
 * Step Definition: Upload File
 * 
 * Uploads a file to a file input element.
 * 
 * @param {string} field - The file input identifier
 * @param {string} filePath - Path to the file to upload
 * @param {string} options - JSON string with optional parameters
 * 
 * @example
 * When Web: Upload file -field: "fileInput" -filePath: "test.pdf" -options: ""
 * When Web: Upload file -field: "uploadPage.documentInput" -filePath: "#{env.TEST_DATA}/doc.pdf" -options: ""
 * 
 * @see {@link webActions.uploadFile}
 */
Given("Web: Upload file -field: {param} -filePath: {param} -options: {param}", 
  async function (field, filePath, options) {
    let page = webFixture.getCurrentPage();
    await webActions.uploadFile(page, field, filePath, options);
  }
);
```

#### Step 4: Implement the Action (if needed)

If the action doesn't exist in `webActions.ts`, create it:

```typescript
// In src/helper/actions/webActions.ts

/**
 * Uploads a file to a file input element
 * @param page - Playwright page object
 * @param field - File input identifier
 * @param filePath - Path to file
 * @param options - Optional parameters
 */
export async function uploadFile(
  page: Page,
  field: string,
  filePath: string,
  options: string = ""
): Promise<void> {
  try {
    // Parse options
    const opts = parseOptions(options);
    
    // Resolve the file input locator
    const locator = await webLocResolver("input[type='file']", field, page);
    
    // Upload the file
    await locator.setInputFiles(filePath);
    
    // Take screenshot if requested
    if (opts.screenshot) {
      await takeScreenshot(page, opts.screenshotText || "After file upload");
    }
    
    logger.info(`File uploaded successfully: ${filePath}`);
  } catch (error) {
    logger.error(`Failed to upload file: ${error.message}`);
    throw error;
  }
}
```

#### Step 5: Test Your New Step

Create a test scenario:

```gherkin
@smoke @upload
Scenario: Upload document
  Given Web: Open browser -url: "#{env.BASE_URL}/upload" -options: ""
  When Web: Upload file -field: "documentInput" -filePath: "test-data/sample.pdf" -options: ""
  Then Web: Verify text on page -text: "File uploaded successfully" -options: "{partialMatch: true}"
```

Run the test:
```bash
npm test -- --tags "@upload"
```

### Complete Example: Custom Step for Multi-Select

#### 1. Feature File Usage
```gherkin
When Web: Select multiple options -field: "skillsSelect" -values: "JavaScript,TypeScript,Python" -options: ""
```

#### 2. Step Definition
```typescript
/**
 * Step Definition: Select Multiple Options
 * 
 * Selects multiple options from a multi-select dropdown.
 * 
 * @param {string} field - The select element identifier
 * @param {string} values - Comma-separated list of values to select
 * @param {string} options - JSON string with optional parameters
 * 
 * @example
 * When Web: Select multiple options -field: "skillsSelect" -values: "JS,TS" -options: ""
 */
Given("Web: Select multiple options -field: {param} -values: {param} -options: {param}", 
  async function (field, values, options) {
    let page = webFixture.getCurrentPage();
    const valueArray = values.split(',').map(v => v.trim());
    await webActions.selectMultipleOptions(page, field, valueArray, options);
  }
);
```

#### 3. Implementation
```typescript
export async function selectMultipleOptions(
  page: Page,
  field: string,
  values: string[],
  options: string = ""
): Promise<void> {
  try {
    const opts = parseOptions(options);
    const locator = await webLocResolver("select[multiple]", field, page);
    
    // Select multiple options
    await locator.selectOption(values);
    
    logger.info(`Selected multiple options: ${values.join(', ')}`);
    
    if (opts.screenshot) {
      await takeScreenshot(page, opts.screenshotText || "After multi-select");
    }
  } catch (error) {
    logger.error(`Failed to select multiple options: ${error.message}`);
    throw error;
  }
}
```

---

## File Organization

### Current Structure

```
src/helper/actions/
├── webStepDefs.ts          ← Web UI step definitions
├── commStepDefs.ts         ← Common/API step definitions
├── webActions.ts           ← Web action implementations
├── commActions.ts          ← Common action implementations
└── apiActions.ts           ← API action implementations

features/
├── login/
│   └── user-login.feature  ← Login scenarios
├── checkout/
│   └── shopping-cart.feature
└── navigation/
    └── web-actions.feature

resources/locators/pattern/
├── loginPage.pattern.ts    ← Pattern locators for login page
├── checkoutPage.pattern.ts
└── homePage.pattern.ts
```

### Where to Add New Code

| What You're Adding | Where to Put It |
|-------------------|-----------------|
| New web step definition | `src/helper/actions/webStepDefs.ts` |
| New API step definition | `src/helper/actions/commStepDefs.ts` |
| New web action implementation | `src/helper/actions/webActions.ts` |
| New API action implementation | `src/helper/actions/apiActions.ts` |
| New feature file | `features/{domain}/{feature-name}.feature` |
| New pattern locators | `resources/locators/pattern/{pageName}.pattern.ts` |

### Creating Domain-Specific Step Files

For large projects, you might want domain-specific step definitions:

```typescript
// src/helper/actions/checkoutStepDefs.ts

import { Given, When, Then } from "@cucumber/cucumber";
import { webFixture } from "@src/global";
import * as checkoutActions from './checkoutActions';

/**
 * Checkout-specific step definitions
 */

Given("Checkout: Add item to cart -productId: {param} -quantity: {param}", 
  async function (productId, quantity) {
    let page = webFixture.getCurrentPage();
    await checkoutActions.addToCart(page, productId, parseInt(quantity));
  }
);

Given("Checkout: Apply promo code -code: {param}", 
  async function (code) {
    let page = webFixture.getCurrentPage();
    await checkoutActions.applyPromoCode(page, code);
  }
);
```

---

## Best Practices

### 1. Use Descriptive Step Names

**Good:**
```typescript
Given("Web: Fill login credentials -username: {param} -password: {param}", ...)
```

**Bad:**
```typescript
Given("Fill {param} {param}", ...)
```

### 2. Add JSDoc Comments

Always document your step definitions:

```typescript
/**
 * Step Definition: Click Button
 * 
 * Clicks a button element identified by text, pattern locator, or selector.
 * 
 * @param {string} field - The button identifier
 * @param {string} options - JSON string with optional parameters
 * 
 * @example
 * When Web: Click button -field: "Submit" -options: ""
 * When Web: Click button -field: "loginPage.submitButton" -options: "{screenshot: true}"
 * 
 * @see {@link webActions.clickButton}
 */
```

### 3. Keep Step Definitions Thin

Step definitions should be thin wrappers:

**Good:**
```typescript
Given("Web: Click button -field: {param} -options: {param}", 
  async function (field, options) {
    let page = webFixture.getCurrentPage();
    await webActions.clickButton(page, field, options);
  }
);
```

**Bad:**
```typescript
Given("Web: Click button -field: {param} -options: {param}", 
  async function (field, options) {
    // Don't put complex logic here
    let page = webFixture.getCurrentPage();
    const locator = await page.locator(field);
    await locator.waitFor();
    await locator.click();
    // ... more logic
  }
);
```

### 4. Reuse Existing Actions

Before creating new actions, check if similar functionality exists:

```typescript
// Reuse existing action
Given("Web: Submit form -formId: {param}", 
  async function (formId) {
    let page = webFixture.getCurrentPage();
    // Reuse existing clickButton action
    await webActions.clickButton(page, `${formId}.submitButton`, "");
  }
);
```

### 5. Use Consistent Naming Conventions

Follow the existing pattern:

```
Web: [Action] -param1: {param} -param2: {param} -options: {param}
API: [Action] -param1: {param} -param2: {param}
```

Examples:
- `Web: Click button -field: {param} -options: {param}`
- `Web: Fill -field: {param} -value: {param} -options: {param}`
- `API: Send request -endpoint: {param} -method: {param}`

### 6. Handle Errors Gracefully

```typescript
Given("Web: Custom action -field: {param}", 
  async function (field) {
    try {
      let page = webFixture.getCurrentPage();
      await webActions.customAction(page, field);
    } catch (error) {
      logger.error(`Custom action failed: ${error.message}`);
      throw error; // Re-throw to fail the scenario
    }
  }
);
```

### 7. Support Options Parameter

Always include an options parameter for flexibility:

```typescript
Given("Web: New action -field: {param} -options: {param}", 
  async function (field, options) {
    let page = webFixture.getCurrentPage();
    const opts = parseOptions(options);
    
    // Use options
    if (opts.screenshot) {
      // Take screenshot
    }
    
    await webActions.newAction(page, field, options);
  }
);
```

---

## Troubleshooting

### Issue 1: Step Not Found

**Error:**
```
Undefined step: Web: Upload file -field: "fileInput" -filePath: "test.pdf" -options: ""
```

**Solutions:**
1. Check step definition exists in `webStepDefs.ts`
2. Verify exact text match (case-sensitive)
3. Ensure all parameters are included
4. Check Cucumber is loading the step definition file

**Debug:**
```bash
# List all step definitions
npx cucumber-js --dry-run
```

### Issue 2: Ctrl+Click Not Working

**Solutions:**
1. Install Cucumber extension in VS Code
2. Configure `.vscode/settings.json`:
   ```json
   {
     "cucumberautocomplete.steps": [
       "src/helper/actions/**/*.ts"
     ]
   }
   ```
3. Reload VS Code window
4. Check step definition syntax matches pattern

### Issue 3: Parameter Not Captured

**Problem:**
```gherkin
When Web: Fill -field: Username -value: "john" -options: ""
                      ↑ Missing quotes
```

**Solution:**
Always use quotes around parameters:
```gherkin
When Web: Fill -field: "Username" -value: "john" -options: ""
```

### Issue 4: Step Definition Not Executing

**Check:**
1. Step definition file is imported in Cucumber config
2. Function is properly async
3. No syntax errors in step definition
4. Cucumber hooks are configured correctly

**Verify in `cucumber.js`:**
```javascript
module.exports = {
  require: [
    'src/helper/actions/webStepDefs.ts',
    'src/helper/actions/commStepDefs.ts'
  ],
  // ...
};
```

### Issue 5: Multiple Step Definitions Match

**Error:**
```
Multiple step definitions match: Web: Click button...
```

**Solution:**
Make step patterns more specific:

**Before:**
```typescript
Given("Click {param}", ...)
Given("Click button {param}", ...)  // Conflict!
```

**After:**
```typescript
Given("Web: Click element -field: {param}", ...)
Given("Web: Click button -field: {param}", ...)  // Unique!
```

---

## Quick Reference

### Creating a New Step Definition

1. **Add to `webStepDefs.ts`:**
   ```typescript
   Given("Web: [Action] -param: {param} -options: {param}", 
     async function (param, options) {
       let page = webFixture.getCurrentPage();
       await webActions.actionName(page, param, options);
     }
   );
   ```

2. **Implement in `webActions.ts`:**
   ```typescript
   export async function actionName(
     page: Page,
     param: string,
     options: string = ""
   ): Promise<void> {
     // Implementation
   }
   ```

3. **Use in feature file:**
   ```gherkin
   When Web: [Action] -param: "value" -options: ""
   ```

### Common Imports

```typescript
// Step definitions file
import { Given, When, Then } from "@cucumber/cucumber";
import { webFixture, logFixture, vars } from "@src/global";
import * as webActions from '@src/helper/actions/webActions';
import type { Page } from "@playwright/test";

// Actions file
import type { Page, Locator } from "@playwright/test";
import { webLocResolver } from "@src/global";
import { logger } from "@src/helper/util/logger";
```

### Testing Your Step

```bash
# Run specific scenario
npm test -- --name "Your scenario name"

# Run with tag
npm test -- --tags "@your-tag"

# Dry run (check step definitions)
npx cucumber-js --dry-run

# List all steps
npx cucumber-js --dry-run --format usage
```

---

## Additional Resources

- [Cucumber User Guide](./cucumber-user-guide.md) - Complete guide to writing feature files
- [Step Definition Reference](../docs/cucumber-step-definition-reference.md) - All available steps
- [Web Actions Source](../src/helper/actions/webActions.ts) - Implementation examples
- [Cucumber Documentation](https://cucumber.io/docs/cucumber/) - Official Cucumber docs
- [Gherkin Reference](https://cucumber.io/docs/gherkin/reference/) - Gherkin syntax guide

---

## Summary

You now know:
- ✅ How feature files connect to step definitions
- ✅ How to use Ctrl+Click to navigate between them
- ✅ How to create new step definitions
- ✅ How to organize your test code
- ✅ Best practices for maintainable tests

**Next Steps:**
1. Try navigating from a feature file to a step definition using Ctrl+Click
2. Create a simple custom step definition
3. Write a feature file that uses your new step
4. Run your test and verify it works

Happy testing! 🚀
