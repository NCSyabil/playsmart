# playsmart

A Playwright TypeScript automation framework with advanced pattern-based locator management using the Page Object Model.

## Features

- 🎯 **Pattern-Based Locators**: Dynamic locator generation with automatic fallback strategies
- 📄 **Page Object Model**: Organized, page-specific pattern files for better maintainability
- 🔄 **Automatic Page Detection**: URL-based page object switching
- 🔍 **Smart Element Resolution**: Label-based resolution, chained locators, and retry mechanisms
- 🚀 **High Performance**: Optimized locator caching and efficient DOM queries
- 🔙 **Backward Compatible**: Works alongside existing static locators
- 🧪 **Comprehensive Testing**: Property-based and unit testing support
- 🥒 **Cucumber BDD Integration**: Write human-readable test scenarios using Gherkin syntax

## Quick Start

### 1. Installation

```bash
# Install dependencies and Playwright browsers
npm run playq:install

# Or install separately
npm install
npx playwright install
```

### 2. Verify Installation

```bash
# Check versions
npm run playq:getversions

# Verify pattern files
node verify-pattern-files.js
```

### 3. Run Your First Test

```bash
# Run all tests
npm test

# Run with UI mode (interactive)
npx playwright test --ui

# Run specific example test
npx playwright test playwright-tests/web-examples/pattern-integration/page-object-integration.spec.ts
```

### 4. Configuration

Enable pattern-based locators in `resources/config.ts`:

```typescript
patternIq: {
  enable: true,
  config: "homePage",
  retryTimeout: 30000,
  retryInterval: 2000,
  pageMapping: {
    "/login": "loginPage",
    "/home": "homePage",
    "/checkout": "checkoutPage"
  }
}
```

### Create a Pattern File

Create `resources/locators/pattern/myPage.pattern.ts`:

```typescript
export const myPage = {
  fields: {
    button: "//button[text()='#{loc.auto.fieldName}'];button:has-text('#{loc.auto.fieldName}')",
    input: "//input[@placeholder='#{loc.auto.fieldName}'];input[placeholder='#{loc.auto.fieldName}']"
  },
  sections: {
    "Main Form": "//form[@id='main'];form#main"
  },
  locations: {
    "Content": "//main;main"
  }
};
```

### Use in Tests

```typescript
import { test } from '@playwright/test';
import { fill, clickButton } from './src/helper/actions/webActions';

test('example test', async ({ page }) => {
  await page.goto('/login');
  
  // Uses loginPage patterns automatically
  await fill(page, 'Username', 'john.doe');
  await fill(page, 'Password', 'secret123');
  await clickButton(page, 'Login');
});
```

### Write BDD Tests with Cucumber

Create feature files using Gherkin syntax:

```gherkin
# features/login/user-login.feature
Feature: User Login
  As a user
  I want to log into the application
  So that I can access my account

  Background:
    Given Web: Open browser -url: "#{env.BASE_URL}/login" -options: ""

  @smoke @login
  Scenario: Successful login with valid credentials
    When Web: Fill -field: "loginPage.usernameInput" -value: "testuser" -options: ""
    And Web: Fill -field: "loginPage.passwordInput" -value: "testpass" -options: ""
    And Web: Click button -field: "loginPage.loginButton" -options: ""
    Then Web: Wait for URL -url: "#{env.BASE_URL}/dashboard" -options: "{partialMatch: true}"
    And Web: Verify text on page -text: "Welcome" -options: "{partialMatch: true}"
```

Run Cucumber tests:

```bash
# Run all Cucumber tests
set PLAYQ_RUNNER=cucumber && npm test

# Run with specific tags
set PLAYQ_RUNNER=cucumber && set PLAYQ_TAGS="@smoke" && npm test

# Run with environment
set PLAYQ_RUNNER=cucumber && set PLAYQ_ENV=staging && npm test
```

See the [Cucumber User Guide](docs/cucumber-user-guide.md) for complete documentation.

## Documentation

### Quick Links

- ⚡ **[QUICK START](documents/00-quick-start.md)** - Get running in 5 minutes!
- 🚀 **[HOW TO RUN](HOW_TO_RUN.md)** - Complete guide for running tests
- 🔧 **[TROUBLESHOOTING](TROUBLESHOOTING.md)** - Solutions to common issues
- 📚 **[DOCUMENTATION INDEX](DOCUMENTATION_INDEX.md)** - Complete documentation guide

### Getting Started

- 📘 [Pattern Locator Overview](documents/01-pattern-locator-overview.md) - Introduction and key concepts
- � [Gettiing Started Guide](documents/02-getting-started-with-patterns.md) - Step-by-step tutorial
- 📝 [Pattern Syntax Reference](documents/03-pattern-syntax-reference.md) - Complete syntax guide

### Advanced Topics

- 📖 [Pattern Locator System Guide](docs/pattern-locator-page-object-model.md) - Complete guide to the pattern system
- ⚡ [Quick Reference](docs/pattern-locator-quick-reference.md) - Quick reference for common patterns
- 🔄 [Migration Guide](docs/pattern-locator-migration-guide.md) - Convert existing tests to patterns

### Cucumber BDD Testing

- 🥒 [Cucumber User Guide](docs/cucumber-user-guide.md) - Complete guide to writing BDD tests with Gherkin
- 📚 [Step Definition Reference](docs/cucumber-step-definition-reference.md) - All available step definitions with examples
- 📝 [Feature Examples](features/) - Example feature files demonstrating best practices

### Technical Documentation

- 🏗️ [Design Document](.kiro/specs/pattern-locator-integration/design.md) - Technical design and architecture
- 📋 [Requirements](.kiro/specs/pattern-locator-integration/requirements.md) - System requirements
- ✅ [Implementation Tasks](.kiro/specs/pattern-locator-integration/tasks.md) - Development tasks and status

## Running Tests

### Prerequisites

Before running tests, ensure you have:

1. Node.js installed (v16 or higher recommended)
2. Dependencies installed: `npm install`
3. Playwright browsers installed: `npx playwright install`

Or use the quick install command:

```bash
npm run playq:install
```

### Test Runners

This framework supports two test runners:

#### 1. Playwright Tests (Default)

Run Playwright tests using environment variables:

```bash
# Run all Playwright tests
npm test

# Run with specific environment
set PLAYQ_ENV=dev && npm test

# Run tests matching a pattern
set PLAYQ_GREP="login" && npm test

# Run specific project
set PLAYQ_PROJECT="chromium" && npm test

# Combine multiple options
set PLAYQ_ENV=staging && set PLAYQ_GREP="checkout" && npm test
```

**Direct Playwright Commands:**

```bash
# Run all tests
npx playwright test --config=config/playwright/playwright.config.ts

# Run specific test file
npx playwright test playwright-tests/web-examples/pattern-integration/page-object-integration.spec.ts

# Run with UI mode
npx playwright test --ui

# Run with headed browser
npx playwright test --headed

# Run specific browser
npx playwright test --project=chromium

# Run tests matching pattern
npx playwright test --grep="login"

# Debug mode
npx playwright test --debug

# Generate HTML report
npx playwright show-report
```

#### 2. Cucumber/BDD Tests

Run Cucumber tests using the PLAYQ_RUNNER environment variable:

```bash
# Run all Cucumber tests
set PLAYQ_RUNNER=cucumber && npm test

# Run with specific tags
set PLAYQ_RUNNER=cucumber && set PLAYQ_TAGS="@smoke" && npm test

# Run with environment
set PLAYQ_RUNNER=cucumber && set PLAYQ_ENV=staging && npm test

# Combine options
set PLAYQ_RUNNER=cucumber && set PLAYQ_TAGS="@regression and not @skip" && set PLAYQ_ENV=prod && npm test
```

**Direct Cucumber Commands:**

```bash
# Run all features
npx cucumber-js --config cucumber.js

# Run with specific tags
npx cucumber-js --tags "@smoke"

# Run specific feature file
npx cucumber-js features/login/user-login.feature

# Run with tag expressions
npx cucumber-js --tags "@smoke and @login"
npx cucumber-js --tags "@regression and not @skip"

# Run failed tests
npm run test:failed
```

**Cucumber Features:**

- Write human-readable test scenarios using Gherkin syntax
- Use pattern locators in feature files for maintainability
- Support for variables: `#{env.BASE_URL}`, `#{var.static.username}`
- Data-driven testing with Scenario Outlines and Examples tables
- Tag-based test filtering for smoke, regression, and custom test suites
- Automatic screenshot capture on failures
- HTML and JSON report generation

**Example Feature File:**

```gherkin
Feature: User Login
  @smoke @login
  Scenario: Successful login
    Given Web: Open browser -url: "#{env.BASE_URL}/login" -options: ""
    When Web: Fill -field: "loginPage.usernameInput" -value: "testuser" -options: ""
    And Web: Fill -field: "loginPage.passwordInput" -value: "testpass" -options: ""
    And Web: Click button -field: "loginPage.loginButton" -options: ""
    Then Web: Wait for URL -url: "/dashboard" -options: "{partialMatch: true}"
```

See the [Cucumber User Guide](docs/cucumber-user-guide.md) for complete documentation.

### Unit Tests

Run Jest unit tests for framework components:

```bash
# Run all unit tests
npm run test:unit

# Run in watch mode
npm run test:unit:watch

# Run with coverage
npm run test:unit:coverage
```

### Environment Configuration

Create environment-specific configuration files in the `environments/` folder:

**Example: `environments/dev.env`**

```
dev.baseUrl = https://dev.example.com
dev.username = testuser
dev.password = testpass123
```

**Example: `environments/staging.env`**

```
staging.baseUrl = https://staging.example.com
staging.username = staginguser
staging.password = stagingpass456
```

Load environment using:

```bash
set PLAYQ_ENV=dev && npm test
```

### Run Configurations

For complex test scenarios, create run configuration files in `resources/run-configs/`:

**Example: `resources/run-configs/smoke.run.ts`**

```typescript
export default {
  runs: [
    {
      PLAYQ_ENV: "dev",
      PLAYQ_GREP: "smoke",
      PLAYQ_PROJECT: "chromium"
    },
    {
      PLAYQ_ENV: "staging",
      PLAYQ_GREP: "smoke",
      PLAYQ_PROJECT: "firefox"
    }
  ]
};
```

Run using:

```bash
set PLAYQ_RUN_CONFIG=smoke && npm test
```

### Reporting

#### Allure Reports

```bash
# Generate and open Allure report
npm run report:allure

# Generate single-file report
npm run report:allure:singlefile

# Clean Allure results
npm run report:allure:clean
```

#### Playwright HTML Report

Automatically generated after test runs. View with:

```bash
npx playwright show-report
```

### Utility Commands

```bash
# Get framework and dependency versions
npm run playq:getversions

# Run utility scripts
npm run playq:util

# Verify pattern files
node verify-pattern-files.js

# Test pattern loading
node test-pattern-loading.js
```

### Common Test Scenarios

**Windows (CMD):**

```cmd
# Smoke tests on dev environment
set PLAYQ_ENV=dev && set PLAYQ_GREP="@smoke" && npm test

# Regression tests on staging
set PLAYQ_ENV=staging && set PLAYQ_GREP="@regression" && npm test

# Run Cucumber smoke tests
set PLAYQ_RUNNER=cucumber && set PLAYQ_TAGS="@smoke" && npm test
```

**Windows (PowerShell):**

```powershell
# Smoke tests on dev environment
$env:PLAYQ_ENV="dev"; $env:PLAYQ_GREP="@smoke"; npm test

# Regression tests on staging
$env:PLAYQ_ENV="staging"; $env:PLAYQ_GREP="@regression"; npm test

# Run Cucumber smoke tests
$env:PLAYQ_RUNNER="cucumber"; $env:PLAYQ_TAGS="@smoke"; npm test
```

**Cross-Platform (using cross-env):**

```bash
# Works on Windows, Mac, and Linux
npx cross-env PLAYQ_ENV=dev PLAYQ_GREP="@smoke" npm test
```

**Other Common Scenarios:**

```bash
# Debug specific test
npx playwright test --debug --grep="login flow"

# Run tests in parallel (configured in resources/config.ts)
npm test

# Run single test file with headed browser
npx playwright test playwright-tests/web-examples/pattern-integration/page-object-integration.spec.ts --headed
```

### Troubleshooting

**Tests not finding elements:**
- Check pattern files in `resources/locators/pattern/`
- Verify `patternIq.enable` is `true` in `resources/config.ts`
- Check page mapping configuration matches your URLs

**Environment variables not loading:**
- Ensure environment file exists in `environments/` folder
- Verify `PLAYQ_ENV` matches the filename prefix (e.g., `dev.env` → `PLAYQ_ENV=dev`)

**Browser not launching:**
- Run `npx playwright install` to install browsers
- Check `browser.headless` setting in `resources/config.ts`

**Tests timing out:**
- Adjust timeout values in `resources/config.ts` under `testExecution`
- Increase `actionTimeout`, `navigationTimeout`, or test `timeout`

### Environment Variables Reference

| Variable | Description | Example | Runner |
|----------|-------------|---------|--------|
| `PLAYQ_RUNNER` | Test runner to use | `playwright` or `cucumber` | Both |
| `PLAYQ_ENV` | Environment configuration to load | `dev`, `staging`, `prod` | Both |
| `PLAYQ_GREP` | Pattern to filter Playwright tests | `"login"`, `"@smoke"` | Playwright |
| `PLAYQ_TAGS` | Tags to filter Cucumber scenarios | `"@smoke"`, `"@regression and not @skip"` | Cucumber |
| `PLAYQ_PROJECT` | Browser project to run | `chromium`, `firefox`, `webkit` | Playwright |
| `PLAYQ_RUN_CONFIG` | Run configuration file to use | `smoke`, `regression` | Both |

## Project Structure

```
playsmart/
├── resources/
│   ├── config.ts                          # Main configuration
│   └── locators/
│       └── pattern/                       # Page object pattern files
│           ├── loginPage.pattern.ts
│           ├── homePage.pattern.ts
│           └── checkoutPage.pattern.ts
├── src/
│   └── helper/
│       ├── actions/
│       │   └── webActions.ts              # High-level action methods
│       ├── fixtures/
│       │   └── webLocFixture.ts           # Locator resolver
│       └── bundle/
│           └── vars.ts                    # Configuration manager
├── engines/
│   └── patternIq/
│       └── patternIqEngine.ts             # Pattern resolution engine
├── playwright-tests/                      # Test files
├── docs/                                  # Documentation
└── .kiro/specs/                          # Feature specifications
```

## Key Concepts

### Runtime Variables

Use these variables in your pattern files:

- `#{loc.auto.fieldName}` - Field name as provided
- `#{loc.auto.fieldName.toLowerCase}` - Lowercase field name
- `#{loc.auto.forId}` - Extracted "for" attribute from label
- `#{loc.auto.fieldInstance}` - Element instance number

### Field Name Syntax

```typescript
// Basic field
"Username"

// With instance number
"Submit[2]"

// With section
"{Login Form} Username"

// With location and section
"{{Main Content}} {Login Form} Username"
```

### Page Object Selection

Three ways to specify page objects:

1. **Explicit**: `await fill(page, 'Email', 'test@example.com', { pattern: 'loginPage' })`
2. **URL Mapping**: Automatic detection via `pageMapping` configuration
3. **Default**: Falls back to `config` value

## Contributing

1. Create page object pattern files in `resources/locators/pattern/`
2. Follow the naming convention: `{pageName}.pattern.ts`
3. Use semicolon-separated patterns for fallback strategies
4. Add tests for new patterns
5. Update documentation

## License

[Your License Here]

## Support

For questions and support:
- Review the [Pattern Locator System Guide](docs/pattern-locator-page-object-model.md)
- Check the [Quick Reference](docs/pattern-locator-quick-reference.md)
- Open an issue on GitHub

