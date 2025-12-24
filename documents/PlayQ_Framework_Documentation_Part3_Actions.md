# PlayQ Framework Documentation
## Part 3: Action System & Web Interactions

---

## 1. Action Architecture

### 1.1 Action Layer Design

**File**: `src/helper/actions/webActions.ts`

**Key Principles**:
- **Hybrid Support**: Works in both Playwright and Cucumber runners
- **Options-Based**: Flexible configuration via JSON options
- **Allure Integration**: Automatic step logging for Playwright
- **Screenshot Support**: Built-in screenshot capabilities
- **Variable Resolution**: Automatic variable replacement

### 1.2 Action Signature Pattern

```typescript
export async function actionName(
  page: Page,                              // Playwright page instance
  field: string | Locator,                 // Element identifier
  value?: string | number,                 // Action value (if applicable)
  options?: string | Record<string, any>   // Configuration options
): Promise<void>
```

**Options Object Structure**:
```typescript
{
  actionTimeout: number,        // Action-specific timeout
  pattern: string,              // Override pattern config
  screenshot: boolean,          // Capture screenshot after action
  screenshotText: string,       // Screenshot description
  screenshotFullPage: boolean,  // Full page vs viewport
  screenshotBefore: boolean,    // Screenshot before action
  screenshotField: boolean,     // Screenshot element only
  iframe: string,               // iframe selector (if applicable)
  smartIQ_refreshLoc: string    // SmartAI refresh mode
}
```

---

## 2. Core Web Actions

### 2.1 Navigation Actions

#### openBrowser
```typescript
await web.openBrowser(page, url, options);
```

**Purpose**: Navigate to URL with optional screenshot

**Options**:
- `screenshot`: Capture after navigation
- `screenshotText`: Description
- `screenshotFullPage`: Full page capture

**Example**:
```typescript
await web.openBrowser(page, "#{config.baseUrl}", {
  screenshot: true,
  screenshotText: "Homepage loaded"
});
```

#### navigateByPath
```typescript
await web.navigateByPath(page, relativePath, options);
```

**Purpose**: Append relative path to current URL

**Example**:
```typescript
await web.navigateByPath(page, "/profile/settings", {
  screenshot: true
});
```

### 2.2 Input Actions

#### fill (aliases: type, input, set, enter)
```typescript
await web.fill(page, field, value, options);
```

**Purpose**: Fill input field with value

**Field Resolution**:
- String: Resolved via webLocResolver
- Locator: Used directly

**Options**:
- `actionTimeout`: Wait timeout
- `pattern`: Pattern override
- `iframe`: iframe selector
- `screenshot`: Post-action screenshot
- `screenshotField`: Screenshot element only

**Examples**:
```typescript
// Simple fill
await web.fill(page, "Username", "john.doe");

// With pattern
await web.fill(page, "{{form::login}} Email", "test@example.com", {
  pattern: "uportalOb"
});

// Resource locator
await web.fill(page, "loc.json.login.loginPage.usernameField", "admin");

// With screenshot
await web.fill(page, "Password", "#{pwd.encrypted}", {
  screenshot: true,
  screenshotField: true
});
```

### 2.3 Click Actions

#### clickButton
```typescript
await web.clickButton(page, field, options);
```

**Purpose**: Click button element

**Options**:
- `isDoubleClick`: Perform double-click
- `screenshotBefore`: Capture before click
- `screenshot`: Capture after click

**Examples**:
```typescript
// Simple click
await web.clickButton(page, "Submit");

// Pattern-based
await web.clickButton(page, "{{form::registration}} Register", {
  screenshot: true,
  screenshotText: "After registration"
});

// Resource locator
await web.clickButton(page, "loc.ts.common.buttons.submitBtn");
```

#### clickLink
```typescript
await web.clickLink(page, field, options);
```

**Purpose**: Click link/anchor element

**Example**:
```typescript
await web.clickLink(page, "Forgot Password", {
  screenshotBefore: true
});
```

#### clickTab
```typescript
await web.clickTab(page, field, options);
```

**Purpose**: Click tab element

#### clickRadioButton
```typescript
await web.clickRadioButton(page, field, options);
```

**Purpose**: Select radio button

**Options**:
- `force`: Force click (ignore actionability)

**Example**:
```typescript
await web.clickRadioButton(page, "{radio_group::Newsletter} Yes", {
  force: true,
  screenshot: true
});
```

#### clickCheckbox
```typescript
await web.clickCheckbox(page, field, options);
```

**Purpose**: Check/uncheck checkbox

### 2.4 Verification Actions

#### waitForTextAtLocation
```typescript
await web.waitForTextAtLocation(page, field, expectedText, options);
```

**Purpose**: Wait for specific text to appear at location

**Options**:
- `partialMatch`: Substring matching
- `ignoreCase`: Case-insensitive comparison
- `actionTimeout`: Wait timeout

**Example**:
```typescript
await web.waitForTextAtLocation(page, "h1", "Welcome Back", {
  partialMatch: true,
  actionTimeout: 10000
});
```

#### waitForHeader
```typescript
await web.waitForHeader(page, header, headerText, options);
```

**Purpose**: Wait for header element with specific text

**Example**:
```typescript
await web.waitForHeader(page, "h1", "Dashboard", {
  ignoreCase: true,
  screenshot: true
});
```

---

## 3. Action Implementation Patterns

### 3.1 Dual Runner Support

```typescript
export async function actionName(page: Page, field: string, options?: any) {
  const options_json = typeof options === "string" 
    ? parseLooseJson(options) 
    : options || {};

  if (isPlaywrightRunner()) {
    await allure.step(`Action: ${field}`, async () => {
      await doAction();
    });
  } else {
    await doAction();
  }

  async function doAction() {
    // Action implementation
  }
}
```

### 3.2 Locator Resolution

```typescript
const target = typeof field === "string"
  ? await webLocResolver("input", field, page, pattern, actionTimeout)
  : field;
```

### 3.3 Screenshot Processing

```typescript
async function processScreenshot(
  page: Page,
  screenshot: boolean,
  screenshotText: string,
  screenshotFullPage: boolean,
  locator?: Locator
) {
  if (!screenshot) return;
  
  const buffer = locator
    ? await locator.screenshot()
    : await page.screenshot({ fullPage: screenshotFullPage });
    
  await attachLog(buffer, "image/png");
}
```

### 3.4 Log Attachment

```typescript
export async function attachLog(
  message: string | Buffer,
  mimeType: string = "text/plain"
) {
  if (isCucumberRunner()) {
    const world = webFixture.getWorld();
    await world.attach(message, mimeType);
  } else if (isPlaywrightRunner()) {
    await playwrightTest.info().attach("Log", { 
      body: message, 
      contentType: mimeType 
    });
  }
}
```

---

## 4. API Actions

### 4.1 API Action Structure

**File**: `src/helper/actions/apiActions.ts`

**Key Features**:
- REST API support
- GraphQL support
- Request/response logging
- Variable substitution
- Authentication handling

**Example Actions**:
```typescript
// GET request
await api.get(url, options);

// POST request
await api.post(url, body, options);

// PUT request
await api.put(url, body, options);

// DELETE request
await api.delete(url, options);

// GraphQL query
await api.graphql(endpoint, query, variables, options);
```

---

## 5. Common Actions

### 5.1 Wait Actions

**File**: `src/helper/actions/commActions.ts`

```typescript
// Wait in milliseconds
await comm.waitInMilliSeconds(duration);

// Wait for condition
await comm.waitForCondition(condition, timeout);
```

### 5.2 Data Actions

```typescript
// Generate test data
const data = faker.person.fullName();
const email = faker.internet.email();
const passport = faker.generatePassportNumber({ countryCode: 'AU' });

// Date manipulation
const formattedDate = utils.formatDate(new Date(), 'YYYY-MM-DD');
```

---

## 6. Action Usage in Tests

### 6.1 Playwright Test

```typescript
import { test } from '@setup/playwrightTest';
import { web } from '@playq';

test('Login test', async ({ page }) => {
  await web.openBrowser(page, "https://example.com");
  await web.fill(page, "Username", "testuser");
  await web.fill(page, "Password", "password123");
  await web.clickButton(page, "Login");
  await web.waitForHeader(page, "h1", "Dashboard");
});
```

### 6.2 Cucumber Step Definition

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { web, webFixture } from '@playq';

Given('Web: Open Browser -url: {string} -options: {string}', 
  async function(url: string, options: string) {
    const page = webFixture.getCurrentPage();
    await web.openBrowser(page, url, options);
  }
);

When('Web: Fill -field: {string} -value: {string} -options: {string}',
  async function(field: string, value: string, options: string) {
    const page = webFixture.getCurrentPage();
    await web.fill(page, field, value, options);
  }
);
```

