# PlayQ Framework Documentation
## Part 2: Core Systems & Implementation Details

---

## 1. Test Runner System

### 1.1 Runner Detection & Orchestration

**File**: `src/exec/runner.ts`

The runner system supports two modes:
- **Playwright Runner**: Direct TypeScript test execution
- **Cucumber Runner**: BDD Gherkin feature file execution

**Environment Variables**:
```bash
PLAYQ_RUNNER=playwright|cucumber|bdd|cuke
PLAYQ_ENV=<environment_name>
PLAYQ_GREP=<test_filter>
PLAYQ_TAGS=<cucumber_tags>
PLAYQ_PROJECT=<playwright_project>
PLAYQ_RUN_CONFIG=<run_config_name>
PLAYQ_REPORT_OPEN=true|false
```

**Runner Logic**:
```typescript
// Detect runner type
if (process.env.PLAYQ_RUNNER === 'cucumber') {
  // Execute Cucumber with tags
  const cucumberArgs = ['cucumber-js', '--config', 'cucumber.js', '--profile', 'default'];
  if (process.env.PLAYQ_TAGS) cucumberArgs.push('--tags', process.env.PLAYQ_TAGS);
  spawn('npx', cucumberArgs, { stdio: 'inherit', shell: true });
} else {
  // Execute Playwright with grep
  const command = `npx playwright test --config=config/playwright/playwright.config.ts`;
  if (process.env.PLAYQ_GREP) command += ` --grep="${process.env.PLAYQ_GREP}"`;
  spawnSync(command, { stdio: 'inherit', shell: true });
}
```

### 1.2 Run Configuration System

**File**: `resources/run-configs/*.run.ts`

Allows defining multiple test execution configurations:

```typescript
export default {
  "name": "Cross-Browser Suite",
  "runType": "sequential", // or "parallel"
  "runs": [
    { "PLAYQ_GREP": "@smoke", "PLAYQ_ENV": "staging" },
    { "PLAYQ_GREP": "@regression", "PLAYQ_ENV": "production" }
  ]
}
```

**Usage**:
```bash
PLAYQ_RUN_CONFIG=cross_browser npm test
```

---

## 2. Variable Management System

### 2.1 Variable Resolution

**File**: `src/helper/bundle/vars.ts`

**Variable Types**:
1. **Static Variables**: `var.static.*` - Defined in `resources/variable.ts`
2. **Config Variables**: `config.*` - From `resources/config.ts`
3. **Environment Variables**: `env.*` - From `.env` files
4. **Pattern Variables**: `pattern.*` - From pattern files
5. **Auto Variables**: `loc.auto.*` - Generated during locator resolution

**Variable Syntax**:
```gherkin
# In feature files or test data
#{var.static.username}
#{config.baseUrl}
#{env.API_KEY}
#{pattern.uportalOb.fields.button}
```

**Key Functions**:
```typescript
// Get variable value
getValue(key: string, ifEmpty?: boolean): string

// Get config value (auto-prefixes with "config.")
getConfigValue(key: string, ifEmpty?: boolean): string

// Set variable (supports var.static.* persistence)
setValue(key: string, value: string): void

// Replace all variables in string
replaceVariables(input: string): string

// Parse loose JSON with variable support
parseLooseJson(str: string): Record<string, any>
```

### 2.2 Configuration Flattening

Nested configurations are flattened for easy access:

```typescript
// Input config
{
  browser: {
    browserType: "chromium",
    headless: true
  }
}

// Flattened to
{
  "config.browser.browserType": "chromium",
  "config.browser.headless": "true"
}
```

### 2.3 Encrypted Variables

Support for encrypted credentials:

```gherkin
# Encrypted password
#{pwd.encryptedValue}
#{enc.encryptedValue}
```

---

## 3. Locator Resolution System

### 3.1 Locator Types

**File**: `src/helper/fixtures/webLocFixture.ts`

**Supported Locator Formats**:

1. **Direct Playwright Selectors**:
   ```typescript
   "xpath=//button[@id='submit']"
   "css=.btn-primary"
   "chain=div.container >> button"
   ```

2. **Resource Locators (JSON)**:
   ```typescript
   "loc.json.fileName.pageName.fieldName"
   ```
   
   Example JSON file (`resources/locators/loc-json/login.json`):
   ```json
   {
     "loginPage": {
       "usernameField": "input[name='username']",
       "passwordField": "xpath=//input[@type='password']"
     }
   }
   ```

3. **Resource Locators (TypeScript)**:
   ```typescript
   "loc.ts.fileName.pageName.fieldName"
   ```
   
   Example TS file (`resources/locators/loc-ts/login.ts`):
   ```typescript
   export const login = {
     loginPage: {
       usernameField: (page: Page) => page.locator('input[name="username"]'),
       passwordField: (page: Page) => page.getByLabel('Password')
     }
   };
   ```

4. **Pattern-Based Locators (PatternIQ)**:
   ```gherkin
   "{{form::registration}} {section::billing} Street Address[1]"
   ```

5. **SmartAI Locators**:
   Dynamic AI-powered element detection based on context

### 3.2 Locator Resolution Flow

```typescript
export async function webLocResolver(
  type: string,           // Element type: button, input, link, etc.
  selector: string,       // Locator string
  page: Page,            // Playwright page
  overridePattern?: string, // Override pattern config
  timeout?: number,      // Resolution timeout
  smartAiRefresh?: 'before' | 'after' | ''
): Promise<Locator>
```

**Resolution Priority**:
1. Check for Playwright-prefixed selectors (`xpath=`, `css=`, `chain=`)
2. Check for direct XPath/CSS selectors
3. Check for resource locators (`loc.json.*`, `loc.ts.*`)
4. If SmartAI enabled → Use SmartAI engine
5. If PatternIQ enabled → Use PatternIQ engine
6. Fallback to direct locator

---

## 4. PatternIQ Engine

### 4.1 Pattern Syntax

**Format**: `{{location}} {section} FieldName[instance]`

**Components**:
- `{{location::value}}`: Page location/context (optional)
- `{section::value}`: Section within location (optional)
- `FieldName`: Element description
- `[instance]`: Element instance number (default: 1)

**Examples**:
```gherkin
"Username"                                    # Simple field
"{{form::registration}} Email"                # Field in form
"{section::billing} Street Address"           # Field in section
"{{form::checkout}} {section::payment} Card Number[2]"  # Complex pattern
```

### 4.2 Pattern Configuration

**File**: `resources/locators/pattern/*.pattern.ts`

```typescript
export const uportalOb = {
  fields: {
    button: "//button[contains(text(), '#{loc.auto.fieldName}')];" +
            "//input[@type='button' and @value='#{loc.auto.fieldName}']",
    input: "//label[contains(text(), '#{loc.auto.fieldName}')];" +
           "//input[@id='#{loc.auto.forId}'];" +
           "//input[@placeholder='#{loc.auto.fieldName}']",
    link: "//a[contains(text(), '#{loc.auto.fieldName}')]",
    radio: "//input[@type='radio' and @value='#{loc.auto.fieldName}']",
    checkbox: "//input[@type='checkbox']//following-sibling::label[contains(text(), '#{loc.auto.fieldName}')]"
  },
  locations: {
    form: "//form[contains(@class, '#{loc.auto.location.value}')]",
    dialog: "//div[@role='dialog' and contains(@aria-label, '#{loc.auto.location.value}')]"
  },
  sections: {
    billing: "//div[contains(@class, 'billing')]",
    shipping: "//div[contains(@class, 'shipping')]"
  },
  scroll: "//div[@class='scrollable-container']"
};
```

### 4.3 PatternIQ Resolution Process

**File**: `playq-engines-main/engines/patternIq/patternIqEngine.ts`

**Steps**:
1. Parse pattern syntax to extract location, section, field, instance
2. Set auto variables (`loc.auto.*`)
3. Resolve location locator (if specified)
4. Resolve section locator (if specified)
5. Iterate through field locator candidates
6. For each candidate:
   - Check label resolution (for input/select/textarea)
   - Evaluate chained locator (location >> section >> field)
   - Verify visibility and actionability
7. If not found, scroll page and retry
8. Return valid locator or throw timeout error

**Key Features**:
- **Self-Healing**: Multiple locator strategies per element type
- **Context-Aware**: Respects location and section boundaries
- **Lazy Loading Support**: Automatic scrolling to reveal elements
- **Instance Support**: Handle multiple matching elements

