# PlayQ Framework - Pattern System Architecture

## Complete Guide: From Cucumber Step to Browser Action

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Layers](#architecture-layers)
3. [Complete Call Chain](#complete-call-chain)
4. [PatternIQ Engine Deep Dive](#patterniq-engine-deep-dive)
5. [Pattern File Structure](#pattern-file-structure)
6. [Variable Replacement System](#variable-replacement-system)
7. [Locator Resolution Strategies](#locator-resolution-strategies)
8. [Configuration](#configuration)
9. [Examples](#examples)

---

## Overview

The PlayQ framework implements an intelligent pattern-based locator resolution system called **PatternIQ**. This system allows test automation engineers to write tests using natural language field identifiers (like "Username", "Submit Button") instead of brittle XPath or CSS selectors.

**Key Benefits:**
- Write tests using business language, not technical selectors
- Automatic locator discovery with retry logic
- Support for complex UI patterns (modals, sections, radio groups)
- Fallback strategies for maximum flexibility
- Centralized pattern management for easy maintenance

---

## Architecture Layers

The framework consists of 7 distinct layers:

### Layer 1: Cucumber Feature Files
**Location:** `test/features/*.feature`

Gherkin syntax for BDD test scenarios.

```gherkin
Feature: Login Functionality
  Scenario: Successful login
    Given I navigate to "https://example.com/login"
    When I fill in "Username" with "john.doe"
    And I fill in "Password" with "secret123"
    And I click the "Submit" button
    Then I should see "Welcome" on the page
```


### Layer 2: Step Definitions
**Location:** `test/steps/*.steps.ts`

Maps Gherkin steps to TypeScript functions using Cucumber decorators.

```typescript
import { Given, When, Then } from "@cucumber/cucumber";
import { webFixture } from "@src/helper/fixtures/webFixture";
import * as webActions from "@src/helper/actions/webActions";

When("I fill in {string} with {string}", async function (field: string, value: string) {
  const page = webFixture.getCurrentPage();
  await webActions.fill(page, field, value, "");
});

When("I click the {string} button", async function (field: string) {
  const page = webFixture.getCurrentPage();
  await webActions.clickButton(page, field, "");
});
```

**Responsibilities:**
- Parse Gherkin parameters
- Retrieve current page from webFixture
- Delegate to web actions layer

---

### Layer 3: Web Actions
**Location:** `src/helper/actions/webActions.ts`

High-level browser interaction API with rich options support.

```typescript
export async function fill(
  page: Page,
  field: string,
  value: string,
  options: string
): Promise<void> {
  const parsedOptions = parseLooseJson(options);
  const pattern = parsedOptions.pattern;
  const timeout = parsedOptions.timeout || 30000;
  
  // Resolve locator using intelligent pattern matching
  const locator = await webLocResolver("input", field, page, pattern, timeout);
  
  // Perform the action
  await locator.fill(value, { timeout });
}
```

**Available Actions:**
- Navigation: `openBrowser`, `navigateByPath`
- Input: `fill`, `clickButton`, `clickLink`, `selectDropdown`, `clickRadioButton`, `clickCheckbox`
- Verification: `verifyTextAtLocation`, `verifyInputFieldValue`, `verifyPageTitle`
- Waiting: `waitForTextAtLocation`, `waitForUrl`, `waitForInputState`


---

### Layer 4: Locator Resolver
**Location:** `src/helper/fixtures/webLocFixture.ts`

Routes to appropriate locator strategy based on selector format.

```typescript
export async function webLocResolver(
  type: string,              // Element type: button, input, link, etc.
  selector: string,          // Field identifier or locator string
  pageArg: Page,            // Playwright Page instance
  overridePattern?: string,  // Optional pattern override
  timeout?: number          // Optional timeout
): Promise<Locator>
```

**Resolution Priority (in order):**

1. **Playwright-Prefixed Selectors** → Direct pass-through
   - `xpath=//button[@id='submit']`
   - `css=.submit-btn`
   - `chain=//div >> .button`

2. **XPath/CSS/Chained Detection** → Direct pass-through
   - Starts with `//` or `(` → XPath
   - Contains `>`, `.`, `#` → CSS
   - Contains `>>` → Chained selector

3. **Resource Locators** → Load from files
   - `loc.ts.fileName.pageName.fieldName`
   - `loc.json.fileName.pageName.fieldName`

4. **SmartAI Engine** → AI-powered resolution (optional)
   - Enabled via `smartAi.enable: true`

5. **PatternIQ Engine** → Intelligent pattern matching
   - Enabled via `patternIq.enable: true`
   - Uses pattern files from `resources/locators/pattern/`

6. **Fallback** → Return as-is
   - `page.locator(selector)`


---

### Layer 5: PatternIQ Engine
**Location:** `engines/patternIq/patternIqEngine.ts`

Intelligent locator discovery with retry logic and pattern matching.

```typescript
export async function patternIq(
  page: Page,
  argType: string,           // Element type (button, input, link, etc.)
  argField: string,          // Field name/identifier
  argOverridePattern?: string, // Optional pattern override
  argTimeout?: number        // Optional timeout
): Promise<Locator>
```

**Processing Steps:**

1. **Parse Field Identifier**
   - Extracts location, section, field name, and instance
   - Syntax: `{{location::value}} {section::value} fieldName[instance]`
   - Example: `{{Modal::Login}} {radio_group::Newsletter} Yes[1]`

2. **Variable Substitution**
   - Sets auto-variables: `loc.auto.fieldName`, `loc.auto.forId`, etc.
   - Replaces placeholders in patterns

3. **Pattern Lookup**
   - Loads pattern file from config
   - Retrieves locator arrays for element type

4. **Label Resolution** (for input, select, textarea)
   - Finds associated `<label>` element
   - Extracts `for` attribute
   - Stores in `loc.auto.forId`

5. **Locator Validation Loop**
   - Tries each pattern in sequence
   - Evaluates on page using `page.evaluate()`
   - Checks visibility and existence
   - Retries with scrolling if not found
   - Timeout: 30s (configurable)
   - Interval: 2s (configurable)

6. **Return Locator**
   - Returns Playwright `Locator` object
   - If not found, returns empty locator with warning


---

### Layer 6: Pattern Files
**Location:** `resources/locators/pattern/*.pattern.ts`

Define XPath/CSS patterns for different element types.

```typescript
export const uportalOb = {
  fields: {
    label: [
      "//label[text()='#{loc.auto.fieldName}']",
      "//label[contains(text(),'#{loc.auto.fieldName}')]"
    ],
    input: ["//input[@id='#{loc.auto.forId}']"],
    button: [
      "//button[text()='#{loc.auto.fieldName}']",
      "//button[translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz') = '#{loc.auto.fieldName}']"
    ],
    dropdown: [
      "//label[text()='#{loc.auto.fieldName}']//..//div//div[@role='button']"
    ],
    radio: [
      "//div[@role='radiogroup']//span[text()='#{loc.auto.fieldName}']"
    ],
    checkbox: [
      "//span[lower-case(text())='#{loc.auto.fieldName.toLowerCase}']/preceding::input[@type='checkbox']"
    ],
    link: ["//a[text()='#{loc.auto.fieldName}']"],
    tab: ["//button[@role='tab'][text()='#{loc.auto.fieldName}']"],
    text: ["//p[normalize-space(text())='#{loc.auto.fieldName}']/following::p"]
  },
  sections: {
    field: "//label[text()='#{loc.auto.section.value}']/parent::div",
    radio_group: "//fieldset[legend[normalize-space(text())='#{loc.auto.section.value}']]",
    accordion: "//button[contains(@class,'accordion')][text()='#{loc.auto.section.value}']"
  },
  locations: {},
  scroll: ["h1:first-child", "//h2[1]", "//h3[1]"]
};
```

**Pattern Variables:**
- `#{loc.auto.fieldName}` - Field identifier
- `#{loc.auto.fieldName.toLowerCase}` - Lowercase field name
- `#{loc.auto.forId}` - Associated label's `for` attribute
- `#{loc.auto.fieldInstance}` - Instance number
- `#{loc.auto.location.value}` - Location value
- `#{loc.auto.section.value}` - Section value


---

### Layer 7: Playwright API
**Location:** Playwright library

Executes actual browser interactions.

```typescript
// After locator is resolved, Playwright performs the action
await locator.fill("john.doe");
await locator.click();
await expect(locator).toHaveText("Welcome");
```

---

## Complete Call Chain

### Example: "I fill in 'Username' with 'john.doe'"

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. CUCUMBER FEATURE FILE                                        │
│    When I fill in "Username" with "john.doe"                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. STEP DEFINITION (test/steps/demo-login.steps.ts)            │
│    When("I fill in {string} with {string}", ...)               │
│    → field = "Username"                                         │
│    → value = "john.doe"                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. WEB FIXTURE (src/helper/fixtures/webFixture.ts)             │
│    → webFixture.getCurrentPage() returns Playwright Page        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. WEB ACTIONS (src/helper/actions/webActions.ts)              │
│    → fill(page, "Username", "john.doe", "")                    │
│    → Calls webLocResolver("input", "Username", page, ...)      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. LOCATOR RESOLVER (src/helper/fixtures/webLocFixture.ts)     │
│    → webLocResolver("input", "Username", page, ...)            │
│    → Checks: Playwright-prefixed? NO                           │
│    → Checks: XPath/CSS/Chained? NO                             │
│    → Checks: Resource locator? NO                              │
│    → Checks: PatternIQ enabled? YES                            │
│    → Calls engines.patternIq(page, "input", "Username", ...)   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. PATTERNIQ ENGINE (engines/patternIq/patternIqEngine.ts)     │
│    Step 1: Parse "Username"                                     │
│      → fieldName = "Username"                                   │
│      → instance = 1                                             │
│                                                                 │
│    Step 2: Set auto-variables                                   │
│      → loc.auto.fieldName = "Username"                          │
│      → loc.auto.fieldName.toLowerCase = "username"              │
│                                                                 │
│    Step 3: Load pattern file                                    │
│      → Pattern: "uportalOb" (from config)                       │
│      → File: resources/locators/pattern/uportalOb.pattern.ts   │
│                                                                 │
│    Step 4: Label resolution                                     │
│      → Get label patterns:                                      │
│        ["//label[text()='#{loc.auto.fieldName}']", ...]        │
│      → Replace #{loc.auto.fieldName} → "Username"               │
│        Result: "//label[text()='Username']"                     │
│      → Evaluate on page → finds <label for="username_input">   │
│      → Extract for attribute → "username_input"                 │
│      → Set loc.auto.forId = "username_input"                    │
│                                                                 │
│    Step 5: Field resolution                                     │
│      → Get input patterns:                                      │
│        ["//input[@id='#{loc.auto.forId}']"]                     │
│      → Replace #{loc.auto.forId} → "username_input"             │
│        Result: "//input[@id='username_input']"                  │
│      → Evaluate on page → finds input element                   │
│      → Check visibility → YES                                   │
│      → Return Locator for "//input[@id='username_input']"      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. WEB ACTIONS (continued)                                      │
│    → Receives Locator object                                    │
│    → Calls locator.fill("john.doe", { timeout: 30000 })        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. PLAYWRIGHT API                                               │
│    → Input field receives value "john.doe"                      │
│    → Test continues                                             │
└─────────────────────────────────────────────────────────────────┘
```


---

## PatternIQ Engine Deep Dive

### Field Identifier Syntax

PatternIQ supports complex field identifiers with location, section, and instance modifiers:

```
{{location::value}} {section::value} fieldName[instance]
```

**Components:**
- `{{location::value}}` - Optional location context (e.g., modal, sidebar)
- `{section::value}` - Optional section context (e.g., radio group, accordion)
- `fieldName` - The actual field identifier
- `[instance]` - Optional instance number for duplicate fields (default: 1)

**Examples:**

```typescript
// Simple field
"Username"

// Field with instance
"Email[2]"  // Second email field on page

// Field within section
"{radio_group::Newsletter} Yes"

// Field within location
"{{Modal::Login}} Username"

// Complex: location + section + field + instance
"{{Modal::Settings}} {accordion::Privacy} Email Notifications[1]"
```

### Pattern Matching Algorithm

```typescript
// 1. Parse field identifier
const match = field.match(/^(?:{{([^:}]+)(?:::(.+?))?}}\s*)?(?:{([^:}]+)(?:::(.+?))?}\s*)?(.+?)(?:\[(\d+)\])?$/);

// 2. Extract components
locationName = match[1];    // "Modal"
locationValue = match[2];   // "Login"
sectionName = match[3];     // "radio_group"
sectionValue = match[4];    // "Newsletter"
fieldName = match[5];       // "Yes"
instance = match[6] || "1"; // "1"

// 3. Set auto-variables
vars.setValue("loc.auto.fieldName", fieldName);
vars.setValue("loc.auto.fieldName.toLowerCase", fieldName.toLowerCase());
vars.setValue("loc.auto.fieldInstance", instance);
vars.setValue("loc.auto.location.value", locationValue);
vars.setValue("loc.auto.section.value", sectionValue);

// 4. Load location/section locators from pattern file
locLocation = vars.getValue("pattern.uportalOb.locations." + locationName);
locSection = vars.getValue("pattern.uportalOb.sections." + sectionName);

// 5. Get field patterns
fieldPatterns = vars.getValue("pattern.uportalOb.fields." + type).split(";");

// 6. Try each pattern with retry logic
for (pattern of fieldPatterns) {
  // Replace variables
  pattern = vars.replaceVariables(pattern);
  
  // Build chained locator
  chainedLocator = [locLocation, locSection, pattern].filter(Boolean).join(" >> ");
  
  // Evaluate on page
  result = await page.evaluate(() => {
    // Find element using XPath or CSS
    // Check visibility
    // Return result
  });
  
  if (result.exists && result.visible) {
    return page.locator(chainedLocator);
  }
}

// 7. Scroll and retry
await scrollPage(page);
await page.waitForTimeout(interval);
```


### Label Resolution Strategy

For input fields, PatternIQ uses a two-step resolution:

**Step 1: Find the label**
```typescript
// Pattern: "//label[text()='Username']"
// Finds: <label for="username_input">Username</label>
// Extracts: for="username_input"
// Sets: loc.auto.forId = "username_input"
```

**Step 2: Find the input using the label's `for` attribute**
```typescript
// Pattern: "//input[@id='#{loc.auto.forId}']"
// After replacement: "//input[@id='username_input']"
// Finds: <input id="username_input" type="text" />
```

**Why this approach?**
- Labels are more stable than input IDs
- Labels contain human-readable text
- Follows accessibility best practices
- Works with dynamically generated IDs

### Chained Locator Support

PatternIQ supports chained locators using the `>>` separator:

```typescript
// Location >> Section >> Field
"//div[@class='modal'] >> //fieldset >> //input[@name='email']"
```

**Evaluation:**
1. Find location element: `//div[@class='modal']`
2. Within location, find section: `//fieldset`
3. Within section, find field: `//input[@name='email']`

This allows precise targeting in complex UIs with nested components.

### Retry Logic with Scrolling

PatternIQ implements intelligent retry logic:

```typescript
const timeout = 30000;  // 30 seconds
const interval = 2000;  // 2 seconds
const startTime = Date.now();

while (Date.now() - startTime < timeout) {
  // Try all patterns
  for (pattern of patterns) {
    const result = await evaluateLocator(pattern);
    if (result.exists && result.visible) {
      return result.locator;
    }
  }
  
  // Scroll to reveal lazy-loaded elements
  await scrollPage(page);
  
  // Wait before retry
  await page.waitForTimeout(interval);
}

// Timeout reached
throw new Error("Locator not found");
```

**Scroll Strategy:**
- Scrolls to configured scroll anchors (h1, h2, h3)
- Performs multiple wheel scrolls (10 iterations)
- Waits 500ms between scrolls
- Reveals lazy-loaded content


---

## Pattern File Structure

### Complete Pattern File Example

```typescript
export const uportalOb = {
  // Field patterns - arrays of XPath/CSS selectors
  fields: {
    // Label patterns (used for label resolution)
    label: [
      "//label[text()='#{loc.auto.fieldName}']",
      "//label[contains(text(),'#{loc.auto.fieldName}')]",
      "//label[lower-case(text())='#{loc.auto.fieldName.toLowerCase}']"
    ],
    
    // Input field patterns
    input: [
      "//input[@id='#{loc.auto.forId}']",
      "//input[@name='#{loc.auto.fieldName}']"
    ],
    
    // Button patterns
    button: [
      "//button[text()='#{loc.auto.fieldName}']",
      "//button[contains(text(),'#{loc.auto.fieldName}')]",
      "//button[@aria-label='#{loc.auto.fieldName}']"
    ],
    
    // Dropdown patterns
    dropdown: [
      "//label[text()='#{loc.auto.fieldName}']//..//div//div[@role='button']",
      "//label[text()='#{loc.auto.fieldName}']//..//select"
    ],
    
    // Dropdown option patterns
    dropdown_options: [
      "//ul[@role='listbox']/li[text()='#{loc.auto.fieldName}']",
      "//option[text()='#{loc.auto.fieldName}']"
    ],
    
    // Radio button patterns
    radio: [
      "//div[@role='radiogroup']//span[text()='#{loc.auto.fieldName}']",
      "//label[normalize-space(text())='#{loc.auto.fieldName}']/input[@type='radio']"
    ],
    
    // Checkbox patterns
    checkbox: [
      "//span[text()='#{loc.auto.fieldName}']/preceding::input[@type='checkbox'][1]",
      "//label[text()='#{loc.auto.fieldName}']/input[@type='checkbox']"
    ],
    
    // Link patterns
    link: [
      "//a[text()='#{loc.auto.fieldName}']",
      "//a[contains(text(),'#{loc.auto.fieldName}')]"
    ],
    
    // Tab patterns
    tab: [
      "//button[@role='tab'][text()='#{loc.auto.fieldName}']",
      "//div[@role='tab'][text()='#{loc.auto.fieldName}']"
    ],
    
    // Text patterns (for verification)
    text: [
      "//p[normalize-space(text())='#{loc.auto.fieldName}']",
      "//*[text()='#{loc.auto.fieldName}']"
    ],
    
    // Header patterns
    header: [
      "//h1[text()='#{loc.auto.fieldName}']",
      "//h2[text()='#{loc.auto.fieldName}']",
      "//h3[text()='#{loc.auto.fieldName}']"
    ]
  },
  
  // Section patterns - used with {section::value} syntax
  sections: {
    field: "//label[text()='#{loc.auto.section.value}']/parent::div",
    radio_group: "//fieldset[legend[normalize-space(text())='#{loc.auto.section.value}']]",
    accordion: "//button[contains(@class,'accordion')][text()='#{loc.auto.section.value}']",
    card: "//div[contains(@class,'card')]//h3[text()='#{loc.auto.section.value}']/ancestor::div[contains(@class,'card')]"
  },
  
  // Location patterns - used with {{location::value}} syntax
  locations: {
    modal: "//div[@role='dialog']//h2[text()='#{loc.auto.location.value}']/ancestor::div[@role='dialog']",
    sidebar: "//aside//h2[text()='#{loc.auto.location.value}']/ancestor::aside",
    panel: "//div[contains(@class,'panel')]//h3[text()='#{loc.auto.location.value}']/ancestor::div[contains(@class,'panel')]"
  },
  
  // Scroll anchors - elements to scroll to when searching
  scroll: [
    "h1:first-child",
    "//h2[1]",
    "//h3[1]"
  ]
};
```


### Pattern Best Practices

**1. Order patterns from most specific to most generic:**
```typescript
button: [
  "//button[@data-testid='#{loc.auto.fieldName}']",  // Most specific
  "//button[text()='#{loc.auto.fieldName}']",        // Exact text
  "//button[contains(text(),'#{loc.auto.fieldName}')]" // Partial text
]
```

**2. Use XPath functions for case-insensitive matching:**
```typescript
label: [
  "//label[text()='#{loc.auto.fieldName}']",  // Case-sensitive
  "//label[lower-case(text())='#{loc.auto.fieldName.toLowerCase}']" // Case-insensitive
]
```

**3. Support multiple UI frameworks:**
```typescript
dropdown: [
  "//select[@id='#{loc.auto.forId}']",  // Native select
  "//div[@role='combobox'][@aria-label='#{loc.auto.fieldName}']", // ARIA combobox
  "//label[text()='#{loc.auto.fieldName}']//..//div[@role='button']" // Material UI
]
```

**4. Use accessibility attributes:**
```typescript
button: [
  "//button[@aria-label='#{loc.auto.fieldName}']",
  "//button[@title='#{loc.auto.fieldName}']",
  "//button[text()='#{loc.auto.fieldName}']"
]
```

---

## Variable Replacement System

### Variable Types

**1. Static Variables** - From `resources/variable.ts`
```typescript
export const var_static = {
  testUser: "john.doe",
  testPassword: "secret123",
  baseUrl: "https://example.com"
};

// Usage: #{testUser}
```

**2. Config Variables** - From `resources/config.ts`
```typescript
export const config = {
  browser: {
    headless: true,
    browserType: "chromium"
  }
};

// Usage: #{config.browser.headless}
```

**3. Environment Variables** - From `environments/*.env`
```
BASE_URL=https://staging.example.com
TEST_USER=staging_user
```

```typescript
// Usage: #{env.BASE_URL}
```

**4. Auto Variables** - Set by PatternIQ
```typescript
// Set automatically during pattern resolution
loc.auto.fieldName = "Username"
loc.auto.fieldName.toLowerCase = "username"
loc.auto.forId = "username_input"
loc.auto.fieldInstance = "1"
loc.auto.location.value = "Login"
loc.auto.section.value = "Newsletter"

// Usage: #{loc.auto.fieldName}
```

**5. Encrypted Variables** - Encrypted values
```typescript
// Usage: #{pwd.encryptedValue} or #{enc.encryptedValue}
// Automatically decrypted using cryptoUtil
```


### Variable Replacement Syntax

```typescript
// Basic replacement
"#{variableName}"

// Nested config
"#{config.browser.headless}"

// Environment variable
"#{env.BASE_URL}"

// Auto variable
"#{loc.auto.fieldName}"

// Encrypted variable
"#{pwd.encryptedPassword}"

// Type conversion
"#{timeout.(toNumber)}"
```

### Variable Replacement Implementation

```typescript
function replaceVariables(input: string): string {
  return input.replace(/\#\{([^}]+)\}/g, (_, varName) => {
    // Handle encrypted variables
    if (varName.startsWith("pwd.") || varName.startsWith("enc.")) {
      const encryptedValue = varName.replace(/^(pwd|enc)\./, "");
      return crypto.decrypt(encryptedValue);
    }
    
    // Handle type conversion
    if (varName.endsWith(".(toNumber)")) {
      const baseVar = varName.replace(".(toNumber)", "");
      return Number(getValue(baseVar));
    }
    
    // Handle environment variables
    if (varName.startsWith("env.")) {
      const envKey = varName.slice(4);
      return process.env[envKey];
    }
    
    // Regular variable lookup
    return getValue(varName);
  });
}
```

---

## Locator Resolution Strategies

### Strategy 1: Direct Selectors

**When to use:** You have a stable, unique selector

```typescript
// XPath
await webActions.fill(page, "//input[@id='username']", "john.doe", "");

// CSS
await webActions.fill(page, "#username", "john.doe", "");

// Chained
await webActions.fill(page, "//div[@class='modal'] >> #username", "john.doe", "");
```

### Strategy 2: Playwright-Prefixed Selectors

**When to use:** You want to be explicit about selector type

```typescript
// XPath prefix
await webActions.fill(page, "xpath=//input[@id='username']", "john.doe", "");

// CSS prefix
await webActions.fill(page, "css=#username", "john.doe", "");

// Chain prefix
await webActions.fill(page, "chain=//div[@class='modal'] >> #username", "john.doe", "");
```

### Strategy 3: Resource Locators

**When to use:** You want centralized locator management

```typescript
// TypeScript locator file
// resources/locators/loc-ts/loginPage.ts
export const loginPage = {
  usernameInput: (page: Page) => page.locator("#username"),
  passwordInput: (page: Page) => page.locator("#password"),
  submitButton: (page: Page) => page.locator("button[type='submit']")
};

// Usage in test
await webActions.fill(page, "loc.ts.loginPage.usernameInput", "john.doe", "");
```

```typescript
// JSON locator file
// resources/locators/loc-json/loginPage.json
{
  "loginPage": {
    "usernameInput": "#username",
    "passwordInput": "#password",
    "submitButton": "button[type='submit']"
  }
}

// Usage in test
await webActions.fill(page, "loc.json.loginPage.usernameInput", "john.doe", "");
```


### Strategy 4: PatternIQ (Intelligent Pattern Matching)

**When to use:** You want to write tests using business language

```typescript
// Simple field name
await webActions.fill(page, "Username", "john.doe", "");

// Field with instance
await webActions.fill(page, "Email[2]", "second@example.com", "");

// Field within section
await webActions.clickRadioButton(page, "{radio_group::Newsletter} Yes", "");

// Field within location
await webActions.fill(page, "{{Modal::Login}} Username", "john.doe", "");

// Complex identifier
await webActions.clickCheckbox(page, "{{Modal::Settings}} {accordion::Privacy} Email Notifications[1]", "");
```

### Strategy 5: SmartAI (AI-Powered Resolution)

**When to use:** You want AI to find elements based on context

```typescript
// Enable in config
smartAi: {
  enable: true,
  resolve: "smart"
}

// Usage (same as PatternIQ)
await webActions.fill(page, "Username", "john.doe", "");
// AI analyzes page structure and finds the best match
```

---

## Configuration

### Main Configuration File
**Location:** `resources/config.ts`

```typescript
export const config = {
  baseUrl: "https://your-app.com",
  
  browser: {
    playwrightSession: "shared",
    cucumberSession: "perScenario",
    headless: true,
    browserType: "chromium"
  },
  
  artifacts: {
    screenshot: true,
    video: true,
    trace: true,
    onFailureOnly: true
  },
  
  testExecution: {
    timeout: 60000,
    actionTimeout: 30000,
    navigationTimeout: 60000,
    retryOnFailure: true,
    parallel: true,
    maxInstances: 5,
    maxRetries: 2
  },
  
  // PatternIQ Configuration
  patternIq: {
    enable: true,              // Enable PatternIQ engine
    config: "uportalOb",       // Pattern file name (without .pattern.ts)
    retryInterval: 2000,       // Retry interval in milliseconds
    retryTimeout: 30000        // Total retry timeout in milliseconds
  },
  
  // SmartAI Configuration
  smartAi: {
    enable: false,             // Enable SmartAI engine
    consoleLog: true,          // Log AI decisions
    resolve: "smart"           // Resolution strategy: "smart" | "always"
  }
};
```

### Pattern Configuration

**Pattern file naming:** `[patternName].pattern.ts`

**Location:** `resources/locators/pattern/`

**Configuration:**
```typescript
patternIq: {
  enable: true,
  config: "uportalOb"  // Uses uportalOb.pattern.ts
}
```

**Multiple patterns:**
```typescript
// Create multiple pattern files
resources/locators/pattern/
  ├── uportalOb.pattern.ts      // Default pattern
  ├── materialUi.pattern.ts     // Material UI pattern
  └── bootstrap.pattern.ts      // Bootstrap pattern

// Override pattern per action
await webActions.fill(page, "Username", "john.doe", "pattern: materialUi");
```


---

## Examples

### Example 1: Simple Login Test

**Feature File:**
```gherkin
Feature: Login
  Scenario: Successful login
    Given I navigate to "https://example.com/login"
    When I fill in "Username" with "john.doe"
    And I fill in "Password" with "secret123"
    And I click the "Submit" button
    Then I should see "Welcome" on the page
```

**Pattern Resolution:**
```
"Username" → PatternIQ
  → Label: "//label[text()='Username']" → <label for="user_input">
  → Extract for="user_input"
  → Input: "//input[@id='user_input']" → <input id="user_input">
  → Success!

"Password" → PatternIQ
  → Label: "//label[text()='Password']" → <label for="pass_input">
  → Extract for="pass_input"
  → Input: "//input[@id='pass_input']" → <input id="pass_input">
  → Success!

"Submit" → PatternIQ
  → Button: "//button[text()='Submit']" → <button>Submit</button>
  → Success!
```

### Example 2: Complex Form with Sections

**Feature File:**
```gherkin
Feature: User Registration
  Scenario: Register new user
    Given I navigate to "https://example.com/register"
    When I fill in "Email" with "user@example.com"
    And I fill in "Password" with "secret123"
    And I click the "{radio_group::Newsletter} Yes" radio button
    And I click the "{accordion::Privacy} Email Notifications" checkbox
    And I click the "Register" button
    Then I should see "Registration successful" on the page
```

**Pattern Resolution:**
```
"{radio_group::Newsletter} Yes" → PatternIQ
  → Parse: sectionName="radio_group", sectionValue="Newsletter", fieldName="Yes"
  → Section: "//fieldset[legend[text()='Newsletter']]"
  → Field: "//div[@role='radiogroup']//span[text()='Yes']"
  → Chain: "//fieldset[legend[text()='Newsletter']] >> //div[@role='radiogroup']//span[text()='Yes']"
  → Success!

"{accordion::Privacy} Email Notifications" → PatternIQ
  → Parse: sectionName="accordion", sectionValue="Privacy", fieldName="Email Notifications"
  → Section: "//button[contains(@class,'accordion')][text()='Privacy']"
  → Field: "//span[text()='Email Notifications']/preceding::input[@type='checkbox']"
  → Chain: "//button[contains(@class,'accordion')][text()='Privacy'] >> //span[text()='Email Notifications']/preceding::input[@type='checkbox']"
  → Success!
```

### Example 3: Modal Dialog

**Feature File:**
```gherkin
Feature: User Settings
  Scenario: Update email in modal
    Given I navigate to "https://example.com/settings"
    When I click the "Edit Profile" button
    And I fill in "{{Modal::Edit Profile}} Email" with "newemail@example.com"
    And I click the "{{Modal::Edit Profile}} Save" button
    Then I should see "Profile updated" on the page
```

**Pattern Resolution:**
```
"{{Modal::Edit Profile}} Email" → PatternIQ
  → Parse: locationName="Modal", locationValue="Edit Profile", fieldName="Email"
  → Location: "//div[@role='dialog']//h2[text()='Edit Profile']/ancestor::div[@role='dialog']"
  → Label: "//label[text()='Email']" → <label for="email_input">
  → Extract for="email_input"
  → Field: "//input[@id='email_input']"
  → Chain: "//div[@role='dialog']//h2[text()='Edit Profile']/ancestor::div[@role='dialog'] >> //input[@id='email_input']"
  → Success!
```


### Example 4: Multiple Instances

**Feature File:**
```gherkin
Feature: Contact Form
  Scenario: Add multiple phone numbers
    Given I navigate to "https://example.com/contact"
    When I fill in "Phone Number[1]" with "555-1234"
    And I click the "Add Phone" button
    And I fill in "Phone Number[2]" with "555-5678"
    And I click the "Submit" button
    Then I should see "Contact saved" on the page
```

**Pattern Resolution:**
```
"Phone Number[1]" → PatternIQ
  → Parse: fieldName="Phone Number", instance="1"
  → Label: "(//label[text()='Phone Number'])[1]" → First label
  → Extract for="phone_1"
  → Field: "//input[@id='phone_1']"
  → Success!

"Phone Number[2]" → PatternIQ
  → Parse: fieldName="Phone Number", instance="2"
  → Label: "(//label[text()='Phone Number'])[2]" → Second label
  → Extract for="phone_2"
  → Field: "//input[@id='phone_2']"
  → Success!
```

### Example 5: Options Override

**Feature File:**
```gherkin
Feature: Advanced Options
  Scenario: Use custom pattern and timeout
    Given I navigate to "https://example.com/form"
    When I fill in "Username" with "john.doe" using options "pattern: materialUi, timeout: 60000"
    And I click the "Submit" button using options "screenshot: true"
    Then I should see "Success" on the page
```

**Step Definition:**
```typescript
When("I fill in {string} with {string} using options {string}", 
  async function (field: string, value: string, options: string) {
    const page = webFixture.getCurrentPage();
    await webActions.fill(page, field, value, options);
  }
);
```

**Options Parsing:**
```typescript
// Input: "pattern: materialUi, timeout: 60000"
const parsedOptions = parseLooseJson(options);
// Result: { pattern: "materialUi", timeout: 60000 }

// Override pattern
await webLocResolver("input", "Username", page, "materialUi", 60000);
// Uses materialUi.pattern.ts instead of default uportalOb.pattern.ts
```

### Example 6: Direct Selectors (Bypass PatternIQ)

**Feature File:**
```gherkin
Feature: Direct Selectors
  Scenario: Use XPath directly
    Given I navigate to "https://example.com/form"
    When I fill in "xpath=//input[@data-testid='username']" with "john.doe"
    And I fill in "css=#password" with "secret123"
    And I click the "chain=//div[@class='modal'] >> button[type='submit']" button
    Then I should see "Success" on the page
```

**Pattern Resolution:**
```
"xpath=//input[@data-testid='username']" → Direct pass-through
  → Detected Playwright-prefixed selector
  → Returns page.locator("//input[@data-testid='username']")
  → No pattern matching

"css=#password" → Direct pass-through
  → Detected Playwright-prefixed selector
  → Returns page.locator("#password")
  → No pattern matching

"chain=//div[@class='modal'] >> button[type='submit']" → Direct pass-through
  → Detected Playwright-prefixed chained selector
  → Returns page.locator("//div[@class='modal'] >> button[type='submit']")
  → No pattern matching
```


---

## Advanced Topics

### Custom Pattern Files

Create custom pattern files for different UI frameworks:

**Material UI Pattern:**
```typescript
// resources/locators/pattern/materialUi.pattern.ts
export const materialUi = {
  fields: {
    label: [
      "//label[text()='#{loc.auto.fieldName}']",
      "//label[@class='MuiFormLabel-root'][text()='#{loc.auto.fieldName}']"
    ],
    input: [
      "//input[@id='#{loc.auto.forId}']",
      "//input[@class='MuiInputBase-input'][@aria-label='#{loc.auto.fieldName}']"
    ],
    button: [
      "//button[@class='MuiButton-root'][text()='#{loc.auto.fieldName}']",
      "//button[@aria-label='#{loc.auto.fieldName}']"
    ],
    dropdown: [
      "//div[@role='combobox'][@aria-label='#{loc.auto.fieldName}']",
      "//label[text()='#{loc.auto.fieldName}']//..//div[@role='button']"
    ]
  },
  sections: {
    card: "//div[@class='MuiCard-root']//h2[text()='#{loc.auto.section.value}']/ancestor::div[@class='MuiCard-root']"
  },
  locations: {
    dialog: "//div[@role='dialog']//h2[text()='#{loc.auto.location.value}']/ancestor::div[@role='dialog']"
  },
  scroll: ["h1:first-child"]
};
```

**Usage:**
```typescript
// Set in config
patternIq: {
  enable: true,
  config: "materialUi"
}

// Or override per action
await webActions.fill(page, "Username", "john.doe", "pattern: materialUi");
```

### Pattern Debugging

Enable detailed logging to debug pattern resolution:

```typescript
// In patternIqEngine.ts
function log(message: string) {
  console.log(`Pattern Logging: ${message}`);
}

// Logs output:
// Pattern Logging: Processing label locator: //label[text()='Username']
// Pattern Logging: Processing Field locator: //input[@id='username_input']
// Pattern Logging: Valid locator found: //input[@id='username_input']
```

### Performance Optimization

**1. Reduce retry timeout for fast tests:**
```typescript
patternIq: {
  retryTimeout: 10000,  // 10 seconds instead of 30
  retryInterval: 1000   // 1 second instead of 2
}
```

**2. Use direct selectors for stable elements:**
```typescript
// Instead of PatternIQ
await webActions.fill(page, "Username", "john.doe", "");

// Use direct selector
await webActions.fill(page, "#username", "john.doe", "");
```

**3. Cache pattern files:**
```typescript
cucumber: {
  stepGroupCache: true  // Cache step groups
}
```

### Error Handling

**Timeout Error:**
```
⚠️ Timeout reached! No valid locator found for type "input" with field name "Username".
```

**Solution:**
- Check if field name matches label text exactly
- Verify pattern file has correct patterns
- Increase retry timeout
- Use direct selector as fallback

**Pattern Not Found:**
```
⚠️ No valid locators found for type "custom_field".
```

**Solution:**
- Add pattern for "custom_field" in pattern file
- Use existing field type (input, button, etc.)
- Use direct selector


---

## Summary

The PlayQ framework's pattern system provides a powerful abstraction layer that allows test automation engineers to write tests using business language instead of technical selectors. Here's the complete flow:

### Key Components

1. **Cucumber Feature Files** - Business-readable test scenarios
2. **Step Definitions** - Map Gherkin to TypeScript functions
3. **Web Actions** - High-level browser interaction API
4. **Locator Resolver** - Intelligent routing to locator strategies
5. **PatternIQ Engine** - Pattern-based locator discovery with retry logic
6. **Pattern Files** - Centralized XPath/CSS pattern definitions
7. **Playwright API** - Actual browser automation

### Resolution Strategies (Priority Order)

1. **Playwright-Prefixed** - `xpath=`, `css=`, `chain=`
2. **Direct Selectors** - XPath, CSS, chained
3. **Resource Locators** - `loc.ts.*`, `loc.json.*`
4. **SmartAI** - AI-powered resolution (optional)
5. **PatternIQ** - Intelligent pattern matching
6. **Fallback** - Return as-is

### PatternIQ Features

- **Natural Language** - Use field names like "Username", "Submit Button"
- **Location Context** - `{{Modal::Login}} Username`
- **Section Context** - `{radio_group::Newsletter} Yes`
- **Instance Support** - `Email[2]` for duplicate fields
- **Label Resolution** - Automatic label-to-input mapping
- **Retry Logic** - Configurable timeout and interval
- **Scroll Support** - Reveals lazy-loaded content
- **Chained Locators** - Location >> Section >> Field

### Variable System

- **Static Variables** - `#{testUser}`
- **Config Variables** - `#{config.browser.headless}`
- **Environment Variables** - `#{env.BASE_URL}`
- **Auto Variables** - `#{loc.auto.fieldName}`
- **Encrypted Variables** - `#{pwd.encryptedValue}`

### Configuration

```typescript
patternIq: {
  enable: true,
  config: "uportalOb",
  retryInterval: 2000,
  retryTimeout: 30000
}
```

### Best Practices

1. Order patterns from specific to generic
2. Use XPath functions for case-insensitive matching
3. Support multiple UI frameworks in patterns
4. Use accessibility attributes when available
5. Create custom pattern files for different applications
6. Use direct selectors for stable, unique elements
7. Enable caching for better performance
8. Add detailed logging for debugging

---

## Conclusion

The PlayQ framework's pattern system represents a sophisticated approach to test automation that prioritizes maintainability, readability, and flexibility. By abstracting away brittle selectors and providing intelligent locator resolution, it enables teams to write tests that are resilient to UI changes and easy to understand for both technical and non-technical stakeholders.

The multi-layered architecture ensures that tests can be written at the appropriate level of abstraction - from high-level business language using PatternIQ, to precise technical selectors when needed. This flexibility, combined with powerful features like retry logic, chained locators, and variable substitution, makes the PlayQ framework a robust solution for enterprise test automation.

---

**Document Version:** 1.0  
**Last Updated:** December 25, 2025  
**Author:** PlayQ Framework Documentation Team
