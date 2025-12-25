# PlayQ Automation Framework

Enterprise-grade test automation framework that unifies Playwright and Cucumber BDD testing with intelligent pattern-based locator resolution.

## Features

- **Dual Runner Support**: Seamlessly switch between Playwright (TypeScript) and Cucumber (BDD)
- **PatternIQ Engine**: Intelligent pattern-based locator resolution with natural language field identifiers
- **SmartAI Integration**: Optional AI-powered locator discovery (experimental)
- **Multi-Strategy Locators**: Support for XPath, CSS, resource locators, and pattern matching
- **Variable System**: Comprehensive variable management with encryption support
- **Enterprise Features**: Step groups, data-driven testing, retry logic, parallel execution
- **Comprehensive Reporting**: Allure integration, HTML/JSON reports, screenshots, videos, traces
- **Fixture Management**: Advanced browser context and page management

## Quick Start

### Installation

Install dependencies and Playwright browsers:

```bash
npm run playq:install
```

Or install separately:
```bash
npm install
npx playwright install
```

### Run Your First Test

```bash
# Run Cucumber tests
npm run test:cucumber

# Run Playwright tests
npm run test:playwright
```

## Running Tests

### Cucumber Tests (BDD)

Run Cucumber tests with Gherkin feature files:

```bash
# Run all Cucumber tests
cross-env PLAYQ_RUNNER=cucumber PLAYQ_ENV=dev npm test

# Run with specific tags
cross-env PLAYQ_RUNNER=cucumber PLAYQ_TAGS="@smoke" npm test

# Run with multiple tags
cross-env PLAYQ_RUNNER=cucumber PLAYQ_TAGS="@smoke and @login" npm test
```

### Playwright Tests (TypeScript)

Run Playwright tests using the TypeScript runner:

```bash
# Run all Playwright tests
cross-env PLAYQ_RUNNER=playwright PLAYQ_ENV=dev npm test

# Run specific test file
cross-env PLAYQ_RUNNER=playwright PLAYQ_GREP="login" npm test

# Run with specific project
cross-env PLAYQ_RUNNER=playwright PLAYQ_PROJECT="chromium" npm test
```

### Environment Variables

- `PLAYQ_RUNNER`: Test runner (`cucumber` | `playwright`)
- `PLAYQ_ENV`: Environment config (`dev` | `staging` | `prod`)
- `PLAYQ_TAGS`: Cucumber tags filter (e.g., `@smoke`, `@login`)
- `PLAYQ_GREP`: Playwright test filter (e.g., `login`, `checkout`)
- `PLAYQ_PROJECT`: Playwright project (e.g., `chromium`, `firefox`, `webkit`)

## Project Structure

```
playq-framework/
├── config/                    # Runner configurations
│   ├── cucumber/             # Cucumber hooks and lifecycle
│   │   ├── hooks.ts         # BeforeAll, Before, After, AfterAll
│   │   ├── parameterHook.ts # Parameter type definitions
│   │   └── ...
│   ├── playwright/           # Playwright configuration
│   └── runner.ts            # Runner orchestration
├── documents/                # Framework documentation
│   └── PATTERN_SYSTEM_ARCHITECTURE.md  # Pattern system guide
├── engines/                  # Locator resolution engines
│   ├── patternIq/           # PatternIQ engine
│   │   └── patternIqEngine.ts
│   └── smartAi/             # SmartAI engine (optional)
├── environments/             # Environment configurations
│   ├── dev.env
│   ├── staging.env
│   └── prod.env
├── extend/                   # Framework extensions
│   └── addons/              # Custom addons
├── playwright-tests/         # Playwright test files
├── resources/                # Test resources
│   ├── config.ts            # Main configuration
│   ├── variable.ts          # Static variables
│   └── locators/            # Locator definitions
│       ├── pattern/         # Pattern files
│       │   └── uportalOb.pattern.ts
│       ├── loc-ts/          # TypeScript locators
│       └── loc-json/        # JSON locators
├── src/                      # Framework source code
│   ├── exec/                # Test execution
│   │   ├── runner.ts        # Main runner
│   │   └── preLoader.ts     # Pre-execution setup
│   ├── helper/              # Helper modules
│   │   ├── actions/         # Web actions
│   │   │   └── webActions.ts
│   │   ├── fixtures/        # Fixtures
│   │   │   ├── webFixture.ts
│   │   │   └── webLocFixture.ts
│   │   ├── bundle/          # Utilities
│   │   │   ├── vars.ts      # Variable management
│   │   │   └── env.ts       # Environment loading
│   │   └── util/            # Utilities
│   └── global.ts            # Global exports
├── test/                     # Cucumber BDD tests
│   ├── features/            # Gherkin feature files
│   ├── steps/               # Step definitions
│   │   └── _step_group/    # Reusable step groups
│   └── data/                # Test data
├── test-results/            # Test execution results
├── allure-results/          # Allure report data
├── allure-report/           # Generated Allure reports
└── package.json             # Dependencies and scripts
```

## Configuration

### Environment Files

Configure test environments in `environments/*.env`:

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
```

### Framework Configuration

Main configuration in `resources/config.ts`:

```typescript
export const config = {
  baseUrl: "https://your-app.com",
  
  // Browser configuration
  browser: {
    playwrightSession: "shared",     // "shared" | "isolated" | "perTest" | "perFile"
    cucumberSession: "perScenario",  // "shared" | "perScenario" | "perFeature"
    headless: true,
    browserType: "chromium"          // "chromium" | "firefox" | "webkit"
  },
  
  // Test execution settings
  testExecution: {
    timeout: 60000,
    actionTimeout: 30000,
    navigationTimeout: 60000,
    retryOnFailure: true,
    parallel: true,
    maxInstances: 5,
    maxRetries: 2
  },
  
  // Artifacts configuration
  artifacts: {
    screenshot: true,
    video: true,
    trace: true,
    onFailureOnly: true
  },
  
  // PatternIQ configuration
  patternIq: {
    enable: true,              // Enable PatternIQ engine
    config: "uportalOb",       // Pattern file name
    retryInterval: 2000,       // Retry interval (ms)
    retryTimeout: 30000        // Total timeout (ms)
  },
  
  // SmartAI configuration (optional)
  smartAi: {
    enable: false,             // Enable AI-powered locators
    consoleLog: true,
    resolve: "smart"           // "smart" | "always"
  }
};
```

## Writing Tests

### Cucumber Feature Files

Create feature files in `test/features/` using Gherkin syntax:

```gherkin
@smoke @login
Feature: User Authentication
  
  Scenario: Successful login with valid credentials
    Given I navigate to "https://example.com/login"
    When I fill in "Username" with "john.doe"
    And I fill in "Password" with "secret123"
    And I click the "Submit" button
    Then I should see "Welcome" on the page
  
  Scenario: Login with field in modal
    Given I navigate to "https://example.com"
    When I click the "Sign In" button
    And I fill in "{{Modal::Login}} Username" with "john.doe"
    And I fill in "{{Modal::Login}} Password" with "secret123"
    And I click the "{{Modal::Login}} Submit" button
    Then I should see "Dashboard" on the page
```

### Step Definitions

Create step definitions in `test/steps/`:

```typescript
import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { webFixture } from "@src/helper/fixtures/webFixture";
import * as webActions from "@src/helper/actions/webActions";

// Navigation
Given("I navigate to {string}", async function (url: string) {
  const page = webFixture.getCurrentPage();
  await webActions.openBrowser(page, url, "");
});

// Input actions
When("I fill in {string} with {string}", async function (field: string, value: string) {
  const page = webFixture.getCurrentPage();
  await webActions.fill(page, field, value, "");
});

// Click actions
When("I click the {string} button", async function (field: string) {
  const page = webFixture.getCurrentPage();
  await webActions.clickButton(page, field, "");
});

// Verification
Then("I should see {string} on the page", async function (text: string) {
  const page = webFixture.getCurrentPage();
  await webActions.verifyTextOnPage(page, text, "");
});
```

### Playwright Tests

Create test files in `playwright-tests/`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Login Tests", () => {
  test("successful login", async ({ page }) => {
    await page.goto("https://example.com/login");
    await page.fill("#username", "john.doe");
    await page.fill("#password", "secret123");
    await page.click("button[type='submit']");
    await expect(page).toHaveURL(/dashboard/);
  });
});
```

## PatternIQ - Intelligent Locator System

PatternIQ is the framework's intelligent pattern-based locator resolution system that allows you to write tests using natural language field identifiers instead of brittle XPath or CSS selectors.

### Basic Usage

```typescript
// Instead of technical selectors
await webActions.fill(page, "//input[@id='username']", "john.doe", "");

// Use natural language
await webActions.fill(page, "Username", "john.doe", "");
```

### Advanced Syntax

**Field with Instance:**
```typescript
// For duplicate fields on the same page
await webActions.fill(page, "Email[2]", "second@example.com", "");
```

**Field within Section:**
```typescript
// Target field within a specific section
await webActions.clickRadioButton(page, "{radio_group::Newsletter} Yes", "");
await webActions.clickCheckbox(page, "{accordion::Privacy} Email Notifications", "");
```

**Field within Location:**
```typescript
// Target field within a modal or sidebar
await webActions.fill(page, "{{Modal::Login}} Username", "john.doe", "");
await webActions.clickButton(page, "{{Sidebar::Settings}} Save", "");
```

**Complex Identifiers:**
```typescript
// Combine location, section, field, and instance
await webActions.clickCheckbox(page, "{{Modal::Settings}} {accordion::Privacy} Email[1]", "");
```

### Pattern Files

Define patterns in `resources/locators/pattern/*.pattern.ts`:

```typescript
export const uportalOb = {
  fields: {
    label: ["//label[text()='#{loc.auto.fieldName}']"],
    input: ["//input[@id='#{loc.auto.forId}']"],
    button: ["//button[text()='#{loc.auto.fieldName}']"],
    dropdown: ["//label[text()='#{loc.auto.fieldName}']//..//div[@role='button']"],
    radio: ["//div[@role='radiogroup']//span[text()='#{loc.auto.fieldName}']"],
    checkbox: ["//span[text()='#{loc.auto.fieldName}']/preceding::input[@type='checkbox']"]
  },
  sections: {
    radio_group: "//fieldset[legend[text()='#{loc.auto.section.value}']]",
    accordion: "//button[contains(@class,'accordion')][text()='#{loc.auto.section.value}']"
  },
  locations: {
    modal: "//div[@role='dialog']//h2[text()='#{loc.auto.location.value}']/ancestor::div[@role='dialog']"
  }
};
```

### Locator Resolution Strategies

PatternIQ supports multiple locator strategies (in priority order):

1. **Playwright-Prefixed**: `xpath=//button`, `css=#submit`, `chain=//div >> button`
2. **Direct Selectors**: XPath, CSS, chained selectors
3. **Resource Locators**: `loc.ts.fileName.page.field`, `loc.json.fileName.page.field`
4. **SmartAI**: AI-powered locator discovery (optional)
5. **PatternIQ**: Intelligent pattern matching
6. **Fallback**: Return selector as-is

### Documentation

For complete PatternIQ documentation, see:
- `documents/PATTERN_SYSTEM_ARCHITECTURE.md` - Complete architecture guide

## Variable System

The framework supports comprehensive variable management:

### Variable Types

```typescript
// Static variables (resources/variable.ts)
"#{testUser}"
"#{testPassword}"

// Config variables (resources/config.ts)
"#{config.baseUrl}"
"#{config.browser.headless}"

// Environment variables (environments/*.env)
"#{env.BASE_URL}"
"#{env.TEST_USER}"

// Auto variables (set by PatternIQ)
"#{loc.auto.fieldName}"
"#{loc.auto.forId}"

// Encrypted variables
"#{pwd.encryptedPassword}"
"#{enc.encryptedValue}"
```

### Usage in Tests

```gherkin
Feature: Login with Variables
  Scenario: Login with environment variables
    Given I navigate to "#{env.BASE_URL}/login"
    When I fill in "Username" with "#{env.TEST_USER}"
    And I fill in "Password" with "#{pwd.encryptedPassword}"
    And I click the "Submit" button
    Then I should see "Welcome" on the page
```

## Reports

### Allure Reports

Generate and view comprehensive Allure reports:

```bash
# Generate and open report
npm run report:allure

# Clean previous reports
npm run report:allure:clean
```

Allure reports include:
- Test execution timeline
- Test case details with steps
- Screenshots on failure
- Video recordings
- Trace files
- Test history and trends

### Cucumber Reports

Cucumber HTML reports are automatically generated after test execution:
- Location: `test-results/cucumber-report.html`
- Includes: Scenarios, steps, execution time, pass/fail status

## Troubleshooting

### Installation Issues

**Dependencies not installed:**
```bash
npm install
npx playwright install
```

**Playwright browsers missing:**
```bash
npx playwright install --force
```

### Test Execution Issues

**Tests not running:**
1. Verify environment variables:
   ```bash
   echo %PLAYQ_RUNNER%  # Should be "cucumber" or "playwright"
   echo %PLAYQ_ENV%     # Should be "dev", "staging", or "prod"
   ```
2. Check environment file exists: `environments/%PLAYQ_ENV%.env`
3. Verify test files exist in correct directories

**Import errors:**
Ensure TypeScript paths are configured in `tsconfig.json`:
```json
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

### PatternIQ Issues

**Locator not found:**
```
⚠️ Timeout reached! No valid locator found for type "input" with field name "Username".
```

**Solutions:**
1. Verify field name matches label text exactly
2. Check pattern file has correct patterns for element type
3. Increase retry timeout in config:
   ```typescript
   patternIq: {
     retryTimeout: 60000  // Increase to 60 seconds
   }
   ```
4. Use direct selector as fallback:
   ```typescript
   await webActions.fill(page, "xpath=//input[@id='username']", "john.doe", "");
   ```

**Pattern not found:**
```
⚠️ No valid locators found for type "custom_field".
```

**Solutions:**
1. Add pattern for element type in pattern file
2. Use existing element type (input, button, link, etc.)
3. Use direct XPath/CSS selector

### Browser Issues

**Browser launch failures:**
```bash
# Reinstall browsers
npx playwright install --force

# Check browser installation
npx playwright install --help
```

**Browser crashes:**
1. Disable headless mode for debugging:
   ```typescript
   browser: {
     headless: false
   }
   ```
2. Increase timeouts:
   ```typescript
   testExecution: {
     timeout: 120000,
     actionTimeout: 60000
   }
   ```

### Report Issues

**Allure report not generating:**
```bash
# Install Allure command-line tool
npm install -g allure-commandline

# Clean and regenerate
npm run report:allure:clean
npm run report:allure
```

**Missing screenshots/videos:**
Verify artifacts configuration:
```typescript
artifacts: {
  screenshot: true,
  video: true,
  trace: true,
  onFailureOnly: false  // Set to false to capture on all tests
}
```

## Available Scripts

### Test Execution
- `npm test` - Run tests (respects PLAYQ_RUNNER environment variable)
- `npm run test:cucumber` - Run Cucumber tests
- `npm run test:playwright` - Run Playwright tests
- `npm run pretest` - Pre-test setup
- `npm run posttest` - Post-test cleanup and reporting

### Reporting
- `npm run report:allure` - Generate and open Allure report
- `npm run report:allure:clean` - Clean Allure reports

### Setup & Maintenance
- `npm run playq:install` - Install dependencies and Playwright browsers
- `npm run playq:getversions` - Display framework and dependency versions

### Development
- `npm run lint` - Run linter (if configured)
- `npm run format` - Format code (if configured)

## Documentation

Comprehensive documentation is available in the `documents/` directory:

### Core Documentation
- **PATTERN_SYSTEM_ARCHITECTURE.md** - Complete guide to the PatternIQ system
  - Architecture layers (Cucumber → Playwright)
  - Complete call chain with examples
  - Pattern file structure and best practices
  - Variable replacement system
  - Locator resolution strategies
  - Real-world examples and use cases

### Additional Resources
- Framework configuration guide
- Web actions API reference
- Step definition patterns
- Troubleshooting guide
- Best practices and conventions

## Best Practices

### Test Organization
- Keep feature files focused on single functionality
- Use descriptive scenario names
- Group related tests with tags (@smoke, @regression, @login)
- Organize step definitions by feature area

### Locator Strategy
- Prefer PatternIQ natural language identifiers for maintainability
- Use direct selectors for stable, unique elements
- Create custom pattern files for different UI frameworks
- Document complex locator patterns

### Variable Management
- Store sensitive data in encrypted variables
- Use environment variables for environment-specific values
- Keep static variables in `resources/variable.ts`
- Use meaningful variable names

### Test Data
- Externalize test data to JSON/CSV files
- Use data-driven testing for multiple scenarios
- Keep test data separate from test logic
- Use variables for reusable test data

### Error Handling
- Enable retry logic for flaky tests
- Capture screenshots/videos on failure
- Use meaningful assertion messages
- Log important test steps

## Contributing

When contributing to the framework:

1. Follow existing code structure and naming conventions
2. Add tests for new features
3. Update documentation for significant changes
4. Use TypeScript strict mode
5. Follow the established pattern system architecture

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review documentation in `documents/` folder
3. Check pattern system architecture guide
4. Review example tests in `test/features/` and `playwright-tests/`

## Version Information

Check framework and dependency versions:
```bash
npm run playq:getversions
```

## License

ISC

---

**Framework Version:** 1.0.0  
**Last Updated:** December 25, 2025  
**Maintained by:** PlayQ Framework Team
