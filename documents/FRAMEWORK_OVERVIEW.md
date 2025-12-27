# PlayQ Automation Framework - Complete Overview

## Executive Summary

The PlayQ Automation Framework is an enterprise-grade test automation solution that unifies Playwright and Cucumber BDD testing with an intelligent pattern-based locator resolution system called **PatternIQ**. The framework enables teams to write maintainable, readable tests using natural language field identifiers while providing the flexibility to use traditional selectors when needed.

**Key Differentiators:**
- Dual-runner architecture supporting both Playwright (TypeScript) and Cucumber (BDD)
- PatternIQ engine for intelligent, self-healing locator resolution
- Comprehensive variable management with encryption support
- Enterprise-ready features: parallel execution, retry logic, comprehensive reporting
- Multi-strategy locator resolution with automatic fallback

---

## Table of Contents

1. [Framework Architecture](#framework-architecture)
2. [Core Components](#core-components)
3. [Test Execution Flow](#test-execution-flow)
4. [PatternIQ System](#patterniq-system)
5. [Directory Structure](#directory-structure)
6. [Configuration System](#configuration-system)
7. [Test Writing Approaches](#test-writing-approaches)
8. [Reporting & Artifacts](#reporting--artifacts)
9. [Setup & Installation](#setup--installation)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## Framework Architecture

### High-Level Architecture

The PlayQ framework follows a **dual-runner architecture** that allows seamless switching between Playwright and Cucumber test execution:

```
┌─────────────────────────────────────────┐
│         Test Execution Entry            │
│    (npm test / runner.ts)               │
└──────────────┬──────────────────────────┘
               │
               ├─── PLAYQ_RUNNER=playwright ──┐
               │                               │
               └─── PLAYQ_RUNNER=cucumber ────┤
                                               │
┌──────────────────────────────────────────────┴─────┐
│                                                     │
│  ┌─────────────────┐      ┌──────────────────┐   │
│  │  Playwright     │      │   Cucumber       │   │
│  │  Runner         │      │   Runner         │   │
│  │  (.spec.ts)     │      │   (.feature)     │   │
│  └────────┬────────┘      └────────┬─────────┘   │
│           │                         │              │
│           └──────────┬──────────────┘              │
│                      │                             │
│           ┌──────────▼──────────┐                 │
│           │   Action Layer      │                 │
│           │  (webActions, etc)  │                 │
│           └──────────┬──────────┘                 │
│                      │                             │
│           ┌──────────▼──────────┐                 │
│           │  Locator Resolution │                 │
│           │  (JSON/TS/Pattern)  │                 │
│           └──────────┬──────────┘                 │
│                      │                             │
│           ┌──────────▼──────────┐                 │
│           │   Playwright API    │                 │
│           └─────────────────────┘                 │
└─────────────────────────────────────────────────────┘
```


### Architectural Layers

The framework consists of **7 distinct layers** from test definition to browser execution:

1. **Test Definition Layer** - Cucumber feature files or Playwright test files
2. **Step Definition Layer** - Maps Gherkin steps to TypeScript functions
3. **Action Layer** - High-level browser interaction API (webActions)
4. **Locator Resolution Layer** - Intelligent routing to locator strategies
5. **Pattern Engine Layer** - PatternIQ and SmartAI engines
6. **Pattern Definition Layer** - Centralized pattern files
7. **Browser Automation Layer** - Playwright API

**Key Design Principles:**
- **Separation of Concerns**: Each layer has a single, well-defined responsibility
- **Abstraction**: Higher layers don't need to know implementation details of lower layers
- **Flexibility**: Multiple strategies at each layer with automatic fallback
- **Maintainability**: Centralized configuration and pattern management

---

## Core Components

### 1. Runner System (`config/runner.ts`)

**Purpose**: Orchestrates test execution based on environment variables

**Key Features:**
- Detects runner type from `PLAYQ_RUNNER` environment variable
- Spawns appropriate test runner (Playwright or Cucumber)
- Handles environment configuration loading
- Manages test lifecycle hooks

**Runner Selection:**
```bash
# Playwright Runner
PLAYQ_RUNNER=playwright npm test

# Cucumber Runner
PLAYQ_RUNNER=cucumber npm test
```

### 2. Web Actions (`src/helper/actions/webActions.ts`)

**Purpose**: Provides unified API for browser interactions across both runners

**Available Actions:**

**Navigation:**
- `openBrowser(page, url, options)` - Navigate to URL
- `navigateByPath(page, path, options)` - Navigate by relative path

**Input Interactions:**
- `fill(page, field, value, options)` - Fill input field
- `clickButton(page, field, options)` - Click button
- `clickLink(page, field, options)` - Click link
- `clickTab(page, field, options)` - Click tab
- `clickRadioButton(page, field, options)` - Select radio button
- `clickCheckbox(page, field, options)` - Check/uncheck checkbox
- `selectDropdown(page, field, value, options)` - Select dropdown option

**Verification:**
- `verifyTextAtLocation(page, field, text, options)` - Verify text at location
- `verifyTextOnPage(page, text, options)` - Verify text exists on page
- `verifyInputFieldPresent(page, field, options)` - Verify field exists
- `verifyInputFieldValue(page, field, value, options)` - Verify field value
- `verifyPageTitle(page, text, options)` - Verify page title
- `verifyHeaderText(page, text, options)` - Verify header text

**Waiting:**
- `waitForTextAtLocation(page, field, text, options)` - Wait for text
- `waitForHeader(page, header, text, options)` - Wait for header
- `waitForUrl(page, url, options)` - Wait for URL
- `waitForInputState(page, field, state, options)` - Wait for input state

**Key Features:**
- Options parsing for flexible configuration
- Screenshot capture on demand
- Timeout handling
- Logging and debugging support
- Works with both Playwright and Cucumber runners


### 3. Locator Resolver (`src/helper/fixtures/webLocFixture.ts`)

**Purpose**: Routes to appropriate locator strategy based on selector format

**Resolution Priority:**

1. **Playwright-Prefixed Selectors** (Direct pass-through)
   - `xpath=//button[@id='submit']`
   - `css=.submit-btn`
   - `chain=//div >> .button`

2. **XPath/CSS/Chained Detection** (Direct pass-through)
   - Starts with `//` or `(` → XPath
   - Contains `>`, `.`, `#` → CSS
   - Contains `>>` → Chained selector

3. **Resource Locators** (Load from files)
   - `loc.ts.fileName.pageName.fieldName`
   - `loc.json.fileName.pageName.fieldName`

4. **SmartAI Engine** (AI-powered resolution - optional)
   - Enabled via `smartAi.enable: true`

5. **PatternIQ Engine** (Intelligent pattern matching)
   - Enabled via `patternIq.enable: true`
   - Default strategy for natural language identifiers

6. **Fallback** (Return as-is)
   - `page.locator(selector)`

### 4. Fixture Management (`src/helper/fixtures/webFixture.ts`)

**Purpose**: Manages browser instances, contexts, and pages

**Key Responsibilities:**
- Browser lifecycle management (launch, close)
- Context creation and management
- Multiple page support with named pages
- Current page tracking
- Cucumber World integration
- SmartIQ data storage

**Key Methods:**
```typescript
webFixture.launchBrowser()           // Launch browser
webFixture.newContext(options)       // Create new context
webFixture.newPage(name)             // Create new page
webFixture.getCurrentPage()          // Get current page
webFixture.setCurrentPage(name)      // Switch page
webFixture.getWorld()                // Get Cucumber World
webFixture.setWorld(world)           // Set Cucumber World
webFixture.closeAll()                // Close all resources
```

### 5. Variable Management (`src/helper/bundle/vars.ts`)

**Purpose**: Comprehensive variable management with multiple sources

**Variable Types:**

1. **Static Variables** (`resources/variable.ts`)
   ```typescript
   export const var_static = {
     testUser: "john.doe",
     testPassword: "secret123"
   };
   // Usage: #{testUser}
   ```

2. **Config Variables** (`resources/config.ts`)
   ```typescript
   export const config = {
     browser: { headless: true }
   };
   // Usage: #{config.browser.headless}
   ```

3. **Environment Variables** (`environments/*.env`)
   ```bash
   BASE_URL=https://example.com
   # Usage: #{env.BASE_URL}
   ```

4. **Auto Variables** (Set by PatternIQ)
   ```typescript
   // Set automatically during pattern resolution
   loc.auto.fieldName = "Username"
   loc.auto.forId = "username_input"
   // Usage: #{loc.auto.fieldName}
   ```

5. **Encrypted Variables**
   ```typescript
   // Usage: #{pwd.encryptedValue} or #{enc.encryptedValue}
   // Automatically decrypted using cryptoUtil
   ```

**Key Functions:**
```typescript
vars.getValue(key)                   // Get variable value
vars.getConfigValue(key)             // Get config value
vars.setValue(key, value)            // Set variable value
vars.replaceVariables(input)         // Replace all variables in string
vars.parseLooseJson(str)             // Parse loose JSON options
```


### 6. Cucumber Hooks (`config/cucumber/hooks.ts`)

**Purpose**: Manage Cucumber test lifecycle

**Hook Types:**

**BeforeAll:**
- Setup environment and browser
- Load configuration
- Initialize global state

**Before:**
- Handle scenario setup
- Launch browser (if needed)
- Create new context and page
- Set attachment function
- Set Cucumber World reference
- Support `@auth` tag for authenticated scenarios

**After:**
- Check for soft assertion failures
- Handle scenario teardown
- Capture artifacts (screenshots, videos, traces)
- Close page/context (based on session config)

**AfterAll:**
- Shutdown browser
- Clean up resources
- Generate reports

### 7. Environment Loader (`src/helper/bundle/env.ts`)

**Purpose**: Load and merge environment configurations

**Features:**
- Loads environment files from `environments/` directory
- Merges with process.env
- Supports multiple environments (dev, staging, prod)
- Variable interpolation support

---

## Test Execution Flow

### Cucumber Test Execution Flow

```
1. User runs: npm test (with PLAYQ_RUNNER=cucumber)
   ↓
2. Runner detects Cucumber mode
   ↓
3. BeforeAll hook executes
   - Load environment configuration
   - Initialize framework
   ↓
4. For each scenario:
   a. Before hook executes
      - Launch browser (if needed)
      - Create context and page
      - Set Cucumber World
   ↓
   b. Execute scenario steps
      - Parse Gherkin step
      - Match to step definition
      - Execute step definition function
      - Call web action
      - Resolve locator (PatternIQ)
      - Perform browser action
   ↓
   c. After hook executes
      - Check soft assertions
      - Capture artifacts
      - Close page/context
   ↓
5. AfterAll hook executes
   - Shutdown browser
   - Generate reports
```

### Playwright Test Execution Flow

```
1. User runs: npm test (with PLAYQ_RUNNER=playwright)
   ↓
2. Runner detects Playwright mode
   ↓
3. Playwright config loads
   - Load environment configuration
   - Configure browser options
   ↓
4. For each test:
   a. Test setup
      - Launch browser
      - Create context
      - Create page
   ↓
   b. Execute test
      - Run test function
      - Use Playwright API directly
      - Or use web actions
   ↓
   c. Test teardown
      - Capture artifacts (if configured)
      - Close page/context
   ↓
5. Generate reports
```


---

## PatternIQ System

### Overview

PatternIQ is the framework's intelligent pattern-based locator resolution system that enables writing tests using natural language field identifiers instead of brittle XPath or CSS selectors.

**Benefits:**
- Write tests using business language, not technical selectors
- Automatic locator discovery with retry logic
- Support for complex UI patterns (modals, sections, radio groups)
- Centralized pattern management for easy maintenance
- Self-healing capabilities through pattern fallback

### Field Identifier Syntax

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

### Pattern Files

Pattern files define XPath/CSS patterns for different element types.

**Location:** `resources/locators/pattern/*.pattern.ts`

**Example Pattern File:**
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
      "//button[contains(text(),'#{loc.auto.fieldName}')]"
    ],
    dropdown: [
      "//label[text()='#{loc.auto.fieldName}']//..//div[@role='button']"
    ],
    radio: [
      "//div[@role='radiogroup']//span[text()='#{loc.auto.fieldName}']"
    ],
    checkbox: [
      "//span[text()='#{loc.auto.fieldName}']/preceding::input[@type='checkbox']"
    ],
    link: ["//a[text()='#{loc.auto.fieldName}']"],
    tab: ["//button[@role='tab'][text()='#{loc.auto.fieldName}']"]
  },
  sections: {
    radio_group: "//fieldset[legend[text()='#{loc.auto.section.value}']]",
    accordion: "//button[contains(@class,'accordion')][text()='#{loc.auto.section.value}']"
  },
  locations: {
    modal: "//div[@role='dialog']//h2[text()='#{loc.auto.location.value}']/ancestor::div[@role='dialog']"
  },
  scroll: ["h1:first-child", "//h2[1]"]
};
```

### PatternIQ Resolution Process

```
1. Parse field identifier
   "{{Modal::Login}} Username" →
   location: "Modal::Login"
   fieldName: "Username"

2. Set auto-variables
   loc.auto.fieldName = "Username"
   loc.auto.location.value = "Login"

3. Load pattern file (from config)
   Pattern: "uportalOb"

4. Resolve location locator
   Pattern: "//div[@role='dialog']//h2[text()='Login']/ancestor::div[@role='dialog']"

5. Resolve label (for input fields)
   Pattern: "//label[text()='Username']"
   Find: <label for="username_input">Username</label>
   Extract: for="username_input"
   Set: loc.auto.forId = "username_input"

6. Resolve field locator
   Pattern: "//input[@id='username_input']"

7. Build chained locator
   Result: "//div[@role='dialog']//h2[text()='Login']/ancestor::div[@role='dialog'] >> //input[@id='username_input']"

8. Validate locator on page
   - Evaluate using page.evaluate()
   - Check visibility
   - Retry with scrolling if not found

9. Return Playwright Locator
```

### Configuration

```typescript
// resources/config.ts
patternIq: {
  enable: true,              // Enable PatternIQ engine
  config: "uportalOb",       // Pattern file name
  retryInterval: 2000,       // Retry interval (ms)
  retryTimeout: 30000        // Total timeout (ms)
}
```

**For complete PatternIQ documentation, see:** `documents/PATTERN_SYSTEM_ARCHITECTURE.md`


---

## Directory Structure

```
playq-framework/
├── .kiro/                    # Kiro IDE configuration
│   └── specs/               # Specification documents
│       └── framework-setup/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
├── config/                   # Runner configurations
│   ├── cucumber/            # Cucumber hooks and lifecycle
│   │   ├── hooks.ts        # BeforeAll, Before, After, AfterAll
│   │   ├── parameterHook.ts # Parameter type definitions
│   │   ├── scenarioHooks.ts # Scenario setup/teardown
│   │   ├── supportHooks.ts  # Support functions
│   │   └── testLifecycleHooks.ts
│   ├── playwright/          # Playwright configuration
│   │   └── playwright.config.ts
│   └── runner.ts           # Runner orchestration
├── documents/               # Framework documentation
│   ├── PATTERN_SYSTEM_ARCHITECTURE.md  # Pattern system guide
│   └── FRAMEWORK_OVERVIEW.md           # This document
├── engines/                 # Locator resolution engines
│   ├── patternIq/          # PatternIQ engine
│   │   └── patternIqEngine.ts
│   └── smartAi/            # SmartAI engine (optional)
├── environments/            # Environment configurations
│   ├── dev.env
│   ├── staging.env
│   └── prod.env
├── extend/                  # Framework extensions
│   └── addons/             # Custom addons
├── playwright-tests/        # Playwright test files
│   └── demo-login.spec.ts
├── resources/               # Test resources
│   ├── config.ts           # Main configuration
│   ├── variable.ts         # Static variables
│   └── locators/           # Locator definitions
│       ├── pattern/        # Pattern files
│       │   └── uportalOb.pattern.ts
│       ├── loc-ts/         # TypeScript locators
│       └── loc-json/       # JSON locators
├── src/                     # Framework source code
│   ├── exec/               # Test execution
│   │   ├── runner.ts       # Main runner
│   │   └── preLoader.ts    # Pre-execution setup
│   ├── helper/             # Helper modules
│   │   ├── actions/        # Web actions
│   │   │   ├── webActions.ts
│   │   │   └── commActions.ts
│   │   ├── fixtures/       # Fixtures
│   │   │   ├── webFixture.ts
│   │   │   └── webLocFixture.ts
│   │   ├── bundle/         # Utilities
│   │   │   ├── vars.ts     # Variable management
│   │   │   └── env.ts      # Environment loading
│   │   └── util/           # Utilities
│   └── global.ts           # Global exports
├── test/                    # Cucumber BDD tests
│   ├── features/           # Gherkin feature files
│   │   └── sample.feature
│   ├── steps/              # Step definitions
│   │   ├── demo-login.steps.ts
│   │   ├── sample.steps.ts
│   │   └── _step_group/   # Auto-generated step groups
│   ├── step_group/         # Step group definitions
│   └── data/               # Test data
├── test-results/           # Test execution results
├── allure-results/         # Allure report data
├── allure-report/          # Generated Allure reports
├── playwright-report/      # Playwright HTML reports
├── .gitignore
├── cucumber.js             # Cucumber configuration
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── README.md               # Framework README
```

### Key Directories

**config/** - Runner configurations and hooks
- Cucumber lifecycle management
- Playwright test configuration
- Runner orchestration logic

**engines/** - Locator resolution engines
- PatternIQ: Pattern-based resolution
- SmartAI: AI-powered resolution (optional)

**environments/** - Environment-specific configurations
- Separate files for dev, staging, prod
- Contains URLs, credentials, feature flags

**resources/** - Test resources and configurations
- Main framework configuration
- Static variables
- Locator definitions (patterns, TypeScript, JSON)

**src/** - Framework source code
- Core framework implementation
- Actions, fixtures, utilities
- Global exports and initialization

**test/** - Cucumber BDD tests
- Feature files (Gherkin)
- Step definitions
- Step groups
- Test data

**playwright-tests/** - Playwright TypeScript tests
- Direct Playwright test files
- Can use framework actions or Playwright API directly


---

## Configuration System

### Main Configuration (`resources/config.ts`)

```typescript
export const config = {
  // Base URL for application
  baseUrl: "https://your-app.com",
  
  // Cucumber configuration
  cucumber: {
    featureFileCache: false,  // Cache feature files
    stepGroupCache: true      // Cache step groups
  },
  
  // Browser configuration
  browser: {
    playwrightSession: "shared",     // "shared" | "isolated" | "perTest" | "perFile" | "none"
    cucumberSession: "perScenario",  // "shared" | "perScenario" | "perFeature"
    headless: true,                  // Run in headless mode
    browserType: "chromium"          // "chromium" | "firefox" | "webkit"
  },
  
  // Artifacts configuration
  artifacts: {
    screenshot: true,        // Capture screenshots
    video: true,            // Record videos
    trace: true,            // Capture traces
    onFailureOnly: true,    // Only on failures
    onSuccessOnly: false,   // Only on success
    cleanUpBeforeRun: true  // Clean before run
  },
  
  // Test execution settings
  testExecution: {
    timeout: 60000,              // Test timeout (ms)
    actionTimeout: 30000,        // Action timeout (ms)
    navigationTimeout: 60000,    // Navigation timeout (ms)
    retryOnFailure: true,        // Retry failed tests
    parallel: true,              // Run tests in parallel
    maxInstances: 5,             // Max parallel instances
    maxRetries: 2,               // Max retry attempts
    retryDelay: 1000,            // Delay between retries (ms)
    retryInterval: 2000,         // Retry interval (ms)
    retryTimeout: 30000,         // Retry timeout (ms)
    order: "sequential",         // "sequential" | "random"
    autoReportOpen: true         // Auto-open reports
  },
  
  // API testing configuration
  apiTest: {
    maxUrlRedirects: 5,     // Max redirects
    timeout: 10000          // API timeout (ms)
  },
  
  // PatternIQ configuration
  patternIq: {
    enable: true,           // Enable PatternIQ
    config: "uportalOb",    // Pattern file name
    retryInterval: 2000,    // Retry interval (ms)
    retryTimeout: 30000     // Retry timeout (ms)
  },
  
  // SmartAI configuration
  smartAi: {
    enable: false,          // Enable SmartAI
    consoleLog: true,       // Log AI decisions
    resolve: "smart"        // "smart" | "always"
  }
};
```

### Environment Configuration (`environments/*.env`)

```bash
# Environment settings
PLAYQ_ENV=dev
PLAYQ_RUNNER=cucumber

# Application URLs
BASE_URL=https://example.com
API_URL=https://api.example.com

# Test credentials
TEST_USER=test@example.com
TEST_PASSWORD=Test@123

# Feature flags
ENABLE_FEATURE_X=true

# Execution options
PLAYQ_PARALLEL=true
PLAYQ_HEADLESS=true
```

### Static Variables (`resources/variable.ts`)

```typescript
export const var_static = {
  // Test users
  testUser: "john.doe",
  testPassword: "secret123",
  adminUser: "admin@example.com",
  
  // Test data
  validEmail: "test@example.com",
  invalidEmail: "invalid-email",
  
  // URLs
  loginUrl: "/login",
  dashboardUrl: "/dashboard",
  
  // Timeouts
  shortWait: "5000",
  mediumWait: "10000",
  longWait: "30000"
};
```

### Configuration Priority

Configuration values are loaded and merged in the following order (later overrides earlier):

1. Default framework values
2. `resources/config.ts`
3. `resources/variable.ts`
4. `environments/[PLAYQ_ENV].env`
5. Process environment variables
6. Runtime overrides (via options parameter)


---

## Test Writing Approaches

### Approach 1: Cucumber BDD with PatternIQ

**Best for:** Business-readable tests, collaboration with non-technical stakeholders

**Feature File** (`test/features/login.feature`):
```gherkin
@smoke @login
Feature: User Authentication
  As a user
  I want to log in to the application
  So that I can access my account

  Scenario: Successful login with valid credentials
    Given I navigate to "#{env.BASE_URL}/login"
    When I fill in "Username" with "#{testUser}"
    And I fill in "Password" with "#{testPassword}"
    And I click the "Submit" button
    Then I should see "Welcome" on the page
  
  Scenario: Login via modal dialog
    Given I navigate to "#{env.BASE_URL}"
    When I click the "Sign In" button
    And I fill in "{{Modal::Login}} Username" with "#{testUser}"
    And I fill in "{{Modal::Login}} Password" with "#{testPassword}"
    And I click the "{{Modal::Login}} Submit" button
    Then I should see "Dashboard" on the page
```

**Step Definitions** (`test/steps/login.steps.ts`):
```typescript
import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { webFixture } from "@src/helper/fixtures/webFixture";
import * as webActions from "@src/helper/actions/webActions";

Given("I navigate to {string}", async function (url: string) {
  const page = webFixture.getCurrentPage();
  await webActions.openBrowser(page, url, "");
});

When("I fill in {string} with {string}", async function (field: string, value: string) {
  const page = webFixture.getCurrentPage();
  await webActions.fill(page, field, value, "");
});

When("I click the {string} button", async function (field: string) {
  const page = webFixture.getCurrentPage();
  await webActions.clickButton(page, field, "");
});

Then("I should see {string} on the page", async function (text: string) {
  const page = webFixture.getCurrentPage();
  await webActions.verifyTextOnPage(page, text, "");
});
```

**Run:**
```bash
cross-env PLAYQ_RUNNER=cucumber PLAYQ_ENV=dev npm test
```

### Approach 2: Playwright with Framework Actions

**Best for:** Technical teams, complex test logic, TypeScript benefits

**Test File** (`playwright-tests/login.spec.ts`):
```typescript
import { test, expect } from "@playwright/test";
import * as webActions from "@src/helper/actions/webActions";

test.describe("Login Tests", () => {
  test("successful login with PatternIQ", async ({ page }) => {
    // Using framework actions with PatternIQ
    await webActions.openBrowser(page, "https://example.com/login", "");
    await webActions.fill(page, "Username", "john.doe", "");
    await webActions.fill(page, "Password", "secret123", "");
    await webActions.clickButton(page, "Submit", "");
    await webActions.verifyTextOnPage(page, "Welcome", "");
  });
  
  test("login with direct selectors", async ({ page }) => {
    // Using framework actions with direct selectors
    await webActions.openBrowser(page, "https://example.com/login", "");
    await webActions.fill(page, "#username", "john.doe", "");
    await webActions.fill(page, "#password", "secret123", "");
    await webActions.clickButton(page, "button[type='submit']", "");
    await expect(page).toHaveURL(/dashboard/);
  });
});
```

**Run:**
```bash
cross-env PLAYQ_RUNNER=playwright PLAYQ_ENV=dev npm test
```

### Approach 3: Pure Playwright API

**Best for:** Maximum control, Playwright-specific features

**Test File** (`playwright-tests/advanced.spec.ts`):
```typescript
import { test, expect } from "@playwright/test";

test("advanced Playwright features", async ({ page }) => {
  await page.goto("https://example.com");
  
  // Use Playwright API directly
  await page.fill("#username", "john.doe");
  await page.fill("#password", "secret123");
  await page.click("button[type='submit']");
  
  // Advanced Playwright features
  await page.waitForURL(/dashboard/);
  await expect(page.locator(".welcome-message")).toBeVisible();
  
  // Network interception
  await page.route("**/api/users", route => {
    route.fulfill({ status: 200, body: JSON.stringify({ name: "John" }) });
  });
});
```

### Approach 4: Hybrid Approach

**Best for:** Flexibility, gradual migration

```typescript
import { test, expect } from "@playwright/test";
import * as webActions from "@src/helper/actions/webActions";

test("hybrid approach", async ({ page }) => {
  // Use framework actions for common operations
  await webActions.openBrowser(page, "https://example.com/login", "");
  await webActions.fill(page, "Username", "john.doe", "");
  
  // Use Playwright API for specific needs
  await page.keyboard.press("Tab");
  await page.fill("#password", "secret123");
  
  // Back to framework actions
  await webActions.clickButton(page, "Submit", "");
  
  // Playwright assertions
  await expect(page).toHaveURL(/dashboard/);
});
```


---

## Reporting & Artifacts

### Allure Reports

**Features:**
- Comprehensive test execution timeline
- Test case details with steps
- Screenshots on failure
- Video recordings
- Trace files
- Test history and trends
- Categorization and tagging

**Generate Report:**
```bash
npm run report:allure
```

**Clean Reports:**
```bash
npm run report:allure:clean
```

**Report Location:**
- Data: `allure-results/`
- Generated: `allure-report/`

### Cucumber Reports

**Features:**
- HTML report with scenarios and steps
- Execution time tracking
- Pass/fail status
- Step-by-step breakdown

**Report Location:**
- `test-results/cucumber-report.html`

**Automatically generated after Cucumber test execution**

### Playwright Reports

**Features:**
- HTML report with test results
- Screenshots and videos
- Trace viewer integration
- Test retry information

**Report Location:**
- `playwright-report/`

**View Report:**
```bash
npx playwright show-report
```

### Artifacts Configuration

Control artifact capture in `resources/config.ts`:

```typescript
artifacts: {
  screenshot: true,        // Capture screenshots
  video: true,            // Record videos
  trace: true,            // Capture traces
  onFailureOnly: true,    // Only capture on failures
  onSuccessOnly: false,   // Only capture on success
  cleanUpBeforeRun: true  // Clean before run
}
```

### Artifact Locations

- **Screenshots**: `test-results/screenshots/`
- **Videos**: `test-results/videos/`
- **Traces**: `test-results/traces/`
- **Allure Attachments**: `allure-results/`

---

## Setup & Installation

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Git (for version control)

### Installation Steps

**1. Clone or download the framework**

**2. Install dependencies:**
```bash
npm install
```

**3. Install Playwright browsers:**
```bash
npx playwright install
```

**Or use combined command:**
```bash
npm run playq:install
```

**4. Verify installation:**
```bash
npm run playq:getversions
```

### Quick Start

**Run Cucumber tests:**
```bash
npm run test:cucumber
```

**Run Playwright tests:**
```bash
npm run test:playwright
```

**Run with specific environment:**
```bash
cross-env PLAYQ_ENV=staging npm test
```

**Run with tags:**
```bash
cross-env PLAYQ_TAGS="@smoke" npm run test:cucumber
```

### Environment Setup

**1. Create environment file** (`environments/dev.env`):
```bash
PLAYQ_ENV=dev
PLAYQ_RUNNER=cucumber
BASE_URL=https://dev.example.com
TEST_USER=test@example.com
TEST_PASSWORD=Test@123
```

**2. Configure framework** (`resources/config.ts`):
- Set base URL
- Configure browser options
- Enable/disable PatternIQ
- Set timeouts and retries

**3. Create pattern file** (if using PatternIQ):
- Copy `resources/locators/pattern/uportalOb.pattern.ts`
- Customize patterns for your application
- Update config to use your pattern file

### Verification

**1. Run sample test:**
```bash
cross-env PLAYQ_RUNNER=cucumber PLAYQ_ENV=dev npm test
```

**2. Check test results:**
- Console output shows test execution
- `test-results/` contains reports
- `allure-results/` contains Allure data

**3. Generate Allure report:**
```bash
npm run report:allure
```


---

## Best Practices

### Test Organization

**1. Feature Files:**
- One feature per file
- Use descriptive feature names
- Group related scenarios
- Use tags for categorization (@smoke, @regression, @login)

**2. Step Definitions:**
- Keep steps reusable and generic
- Avoid business logic in steps
- Use parameters for flexibility
- Organize by feature area

**3. Test Data:**
- Externalize test data to JSON/CSV files
- Use variables for reusable data
- Keep sensitive data encrypted
- Separate test data from test logic

### Locator Strategy

**1. PatternIQ First:**
```typescript
// Preferred: Natural language
await webActions.fill(page, "Username", "john.doe", "");

// Fallback: Direct selector
await webActions.fill(page, "#username", "john.doe", "");
```

**2. Pattern File Organization:**
- Order patterns from specific to generic
- Use XPath functions for case-insensitive matching
- Support multiple UI frameworks
- Document complex patterns

**3. Custom Patterns:**
- Create pattern files for different applications
- Use meaningful pattern names
- Test patterns thoroughly
- Version control pattern files

### Variable Management

**1. Variable Hierarchy:**
```typescript
// Static variables for constants
var_static.testUser = "john.doe"

// Config variables for framework settings
config.browser.headless = true

// Environment variables for environment-specific values
env.BASE_URL = "https://dev.example.com"

// Auto variables for runtime values
loc.auto.fieldName = "Username"
```

**2. Encryption:**
```typescript
// Encrypt sensitive data
#{pwd.encryptedPassword}

// Never commit plain text passwords
```

**3. Variable Naming:**
- Use camelCase for variable names
- Use descriptive names
- Group related variables
- Document variable purpose

### Error Handling

**1. Retry Logic:**
```typescript
testExecution: {
  retryOnFailure: true,
  maxRetries: 2,
  retryDelay: 1000
}
```

**2. Timeouts:**
```typescript
testExecution: {
  timeout: 60000,        // Test timeout
  actionTimeout: 30000,  // Action timeout
  navigationTimeout: 60000 // Navigation timeout
}
```

**3. Assertions:**
- Use meaningful assertion messages
- Verify expected state before actions
- Use soft assertions for multiple checks
- Log important verification points

### Performance

**1. Parallel Execution:**
```typescript
testExecution: {
  parallel: true,
  maxInstances: 5
}
```

**2. Browser Sessions:**
```typescript
browser: {
  playwrightSession: "shared",    // Reuse browser
  cucumberSession: "perScenario"  // New context per scenario
}
```

**3. Caching:**
```typescript
cucumber: {
  featureFileCache: false,
  stepGroupCache: true
}
```

### Maintenance

**1. Regular Updates:**
- Update dependencies regularly
- Review and update patterns
- Refactor duplicate code
- Update documentation

**2. Code Review:**
- Review test code like production code
- Check for code smells
- Ensure consistency
- Verify best practices

**3. Monitoring:**
- Track test execution time
- Monitor flaky tests
- Review failure patterns
- Analyze test coverage


---

## Troubleshooting

### Installation Issues

**Problem: Dependencies not installing**
```bash
# Solution: Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Problem: Playwright browsers not installing**
```bash
# Solution: Force reinstall browsers
npx playwright install --force
```

**Problem: Permission errors**
```bash
# Solution: Run with appropriate permissions
# Windows: Run as Administrator
# Mac/Linux: Use sudo if necessary
sudo npm install
```

### Test Execution Issues

**Problem: Tests not running**
```bash
# Check environment variables
echo %PLAYQ_RUNNER%  # Should be "cucumber" or "playwright"
echo %PLAYQ_ENV%     # Should be "dev", "staging", or "prod"

# Verify environment file exists
dir environments\%PLAYQ_ENV%.env
```

**Problem: Import errors**
```typescript
// Verify tsconfig.json paths
{
  "compilerOptions": {
    "paths": {
      "@src/*": ["src/*"],
      "@helper/*": ["src/helper/*"],
      "@actions": ["src/helper/actions/index.ts"],
      "@playq": ["src/global.ts"],
      "@resources/*": ["resources/*"]
    }
  }
}
```

**Problem: Browser launch failures**
```bash
# Reinstall browsers
npx playwright install --force

# Check browser installation
npx playwright install --help

# Disable headless for debugging
# In resources/config.ts:
browser: {
  headless: false
}
```

### PatternIQ Issues

**Problem: Locator not found**
```
⚠️ Timeout reached! No valid locator found for type "input" with field name "Username".
```

**Solutions:**
1. Verify field name matches label text exactly
2. Check pattern file has patterns for element type
3. Increase retry timeout:
   ```typescript
   patternIq: {
     retryTimeout: 60000  // Increase to 60 seconds
   }
   ```
4. Use direct selector as fallback:
   ```typescript
   await webActions.fill(page, "xpath=//input[@id='username']", "john.doe", "");
   ```
5. Enable debug logging to see pattern resolution

**Problem: Pattern not found**
```
⚠️ No valid locators found for type "custom_field".
```

**Solutions:**
1. Add pattern for element type in pattern file
2. Use existing element type (input, button, link, etc.)
3. Use direct XPath/CSS selector

**Problem: Wrong element selected**
```
Element found but it's not the expected one
```

**Solutions:**
1. Use instance syntax: `"Email[2]"` for second email field
2. Use section context: `"{section::value} Field"`
3. Use location context: `"{{Modal::Login}} Field"`
4. Make pattern more specific in pattern file

### Configuration Issues

**Problem: Environment variables not loading**
```bash
# Verify environment file format
# environments/dev.env should have:
PLAYQ_ENV=dev
BASE_URL=https://example.com

# No spaces around =
# No quotes needed
```

**Problem: Config values not applying**
```typescript
// Check config loading order:
// 1. Default values
// 2. resources/config.ts
// 3. resources/variable.ts
// 4. environments/[env].env
// 5. Process environment variables
// 6. Runtime overrides

// Later values override earlier ones
```

### Report Issues

**Problem: Allure report not generating**
```bash
# Install Allure command-line tool
npm install -g allure-commandline

# Clean and regenerate
npm run report:allure:clean
npm run report:allure
```

**Problem: Missing screenshots/videos**
```typescript
// Verify artifacts configuration
artifacts: {
  screenshot: true,
  video: true,
  trace: true,
  onFailureOnly: false  // Set to false to capture on all tests
}
```

### Common Errors

**Error: "Cannot find module '@src/...'"**
- Check tsconfig.json paths configuration
- Verify file exists at specified path
- Restart TypeScript server

**Error: "Page is closed"**
- Check browser session configuration
- Verify page is not closed prematurely
- Check for race conditions

**Error: "Timeout exceeded"**
- Increase timeout values in config
- Check network connectivity
- Verify element exists on page
- Check for slow page loads

**Error: "Element not visible"**
- Wait for element to be visible
- Check if element is in viewport
- Verify element is not hidden by CSS
- Use scrollIntoView if needed

### Getting Help

**1. Check Documentation:**
- `README.md` - Framework overview and quick start
- `documents/PATTERN_SYSTEM_ARCHITECTURE.md` - PatternIQ details
- `documents/FRAMEWORK_OVERVIEW.md` - This document

**2. Review Examples:**
- `test/features/sample.feature` - Sample Cucumber test
- `test/steps/demo-login.steps.ts` - Sample step definitions
- `playwright-tests/demo-login.spec.ts` - Sample Playwright test

**3. Enable Debug Logging:**
```typescript
// Add console.log statements
console.log("Current page URL:", page.url());
console.log("Locator:", locator);

// Enable Playwright debug mode
DEBUG=pw:api npm test
```

**4. Check Framework Versions:**
```bash
npm run playq:getversions
```

---

## Summary

The PlayQ Automation Framework provides a comprehensive solution for test automation with:

**Key Strengths:**
- **Dual-runner architecture** for flexibility
- **PatternIQ system** for maintainable locators
- **Comprehensive variable management** with encryption
- **Enterprise features** for scalability
- **Rich reporting** with Allure integration

**Best Use Cases:**
- Enterprise applications with complex UIs
- Teams needing BDD collaboration
- Projects requiring maintainable test suites
- Applications with frequent UI changes
- Multi-environment testing needs

**Getting Started:**
1. Install dependencies: `npm run playq:install`
2. Configure environment: `environments/dev.env`
3. Write tests: Cucumber features or Playwright tests
4. Run tests: `npm test`
5. View reports: `npm run report:allure`

**Next Steps:**
- Review `documents/PATTERN_SYSTEM_ARCHITECTURE.md` for PatternIQ details
- Explore sample tests in `test/features/` and `playwright-tests/`
- Customize pattern files for your application
- Configure environments for your needs
- Start writing your own tests!

---

**Document Version:** 1.0  
**Last Updated:** December 25, 2025  
**Framework Version:** 1.0.0  
**Author:** PlayQ Framework Documentation Team

**Related Documentation:**
- `README.md` - Quick start and installation
- `PATTERN_SYSTEM_ARCHITECTURE.md` - Complete PatternIQ guide
- `.kiro/specs/framework-setup/` - Requirements, design, and tasks
