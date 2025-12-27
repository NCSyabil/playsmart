# How to Run PlaySmart Framework

Complete guide for running tests in the PlaySmart automation framework.

## Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Running Playwright Tests](#running-playwright-tests)
- [Running Cucumber Tests](#running-cucumber-tests)
- [Running Unit Tests](#running-unit-tests)
- [Environment Configuration](#environment-configuration)
- [Run Configurations](#run-configurations)
- [Reporting](#reporting)
- [Platform-Specific Commands](#platform-specific-commands)
- [Troubleshooting](#troubleshooting)
- [Environment Variables](#environment-variables)

---

## Quick Start

### 1. Install Everything

```bash
# Install dependencies and Playwright browsers
npm run playq:install
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

# Run with UI mode (recommended for first-time users)
npx playwright test --ui
```

---

## Installation

### Prerequisites

- **Node.js**: v16 or higher
- **npm**: v7 or higher
- **Operating System**: Windows, macOS, or Linux

### Step-by-Step Installation

```bash
# 1. Clone the repository (if not already done)
git clone <repository-url>
cd playsmart

# 2. Install Node.js dependencies
npm install

# 3. Install Playwright browsers
npx playwright install

# 4. Verify installation
npm run playq:getversions
```

### Quick Install (All-in-One)

```bash
npm run playq:install
```

---

## Running Playwright Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run all tests with default config
npx playwright test --config=config/playwright/playwright.config.ts
```

### Run Specific Tests

```bash
# Run specific test file
npx playwright test playwright-tests/web-examples/pattern-integration/page-object-integration.spec.ts

# Run tests matching a pattern
npx playwright test --grep="login"

# Run tests in a specific folder
npx playwright test playwright-tests/web-examples/
```

### Interactive Modes

```bash
# UI Mode (interactive test runner)
npx playwright test --ui

# Debug Mode (step through tests)
npx playwright test --debug

# Headed Mode (see browser)
npx playwright test --headed
```

### Browser Selection

```bash
# Run on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run on all browsers
npx playwright test --project=chromium --project=firefox --project=webkit
```

### Using Environment Variables

**Windows CMD:**

```cmd
# Run with specific environment
set PLAYQ_ENV=dev && npm test

# Run tests matching pattern
set PLAYQ_GREP="login" && npm test

# Run specific browser project
set PLAYQ_PROJECT="chromium" && npm test

# Combine multiple options
set PLAYQ_ENV=staging && set PLAYQ_GREP="checkout" && set PLAYQ_PROJECT="firefox" && npm test
```

**Windows PowerShell:**

```powershell
# Run with specific environment
$env:PLAYQ_ENV="dev"; npm test

# Run tests matching pattern
$env:PLAYQ_GREP="login"; npm test

# Combine multiple options
$env:PLAYQ_ENV="staging"; $env:PLAYQ_GREP="checkout"; npm test
```

**Linux/macOS:**

```bash
# Run with specific environment
PLAYQ_ENV=dev npm test

# Run tests matching pattern
PLAYQ_GREP="login" npm test

# Combine multiple options
PLAYQ_ENV=staging PLAYQ_GREP="checkout" npm test
```

**Cross-Platform (using cross-env):**

```bash
# Works on all platforms
npx cross-env PLAYQ_ENV=dev PLAYQ_GREP="login" npm test
```

---

## Running Cucumber Tests

### Basic Commands

```bash
# Run all Cucumber tests (Windows CMD)
set PLAYQ_RUNNER=cucumber && npm test

# Run all Cucumber tests (PowerShell)
$env:PLAYQ_RUNNER="cucumber"; npm test

# Run all Cucumber tests (Linux/macOS)
PLAYQ_RUNNER=cucumber npm test
```

### Run with Tags

```bash
# Run smoke tests (Windows CMD)
set PLAYQ_RUNNER=cucumber && set PLAYQ_TAGS="@smoke" && npm test

# Run regression tests (Windows CMD)
set PLAYQ_RUNNER=cucumber && set PLAYQ_TAGS="@regression" && npm test

# Run tests with multiple tags (Windows CMD)
set PLAYQ_RUNNER=cucumber && set PLAYQ_TAGS="@smoke and not @skip" && npm test
```

### Run with Environment

```bash
# Run on dev environment (Windows CMD)
set PLAYQ_RUNNER=cucumber && set PLAYQ_ENV=dev && npm test

# Run on staging with tags (Windows CMD)
set PLAYQ_RUNNER=cucumber && set PLAYQ_ENV=staging && set PLAYQ_TAGS="@smoke" && npm test
```

### Direct Cucumber Commands

```bash
# Run all features
npx cucumber-js --config cucumber.js

# Run with specific tags
npx cucumber-js --tags "@smoke"

# Run specific feature file
npx cucumber-js features/login.feature

# Run failed tests
npm run test:failed
```

---

## Running Unit Tests

### Jest Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run in watch mode (auto-rerun on changes)
npm run test:unit:watch

# Run with coverage report
npm run test:unit:coverage

# Run specific test file
npx jest src/helper/actions/webActions.test.ts

# Run tests matching pattern
npx jest --testNamePattern="should fill input field"
```

---

## Environment Configuration

### Creating Environment Files

Environment files are stored in the `environments/` folder.

**Example: `environments/dev.env`**

```
dev.baseUrl = https://dev.example.com
dev.username = testuser
dev.password = testpass123
dev.apiKey = dev-api-key-12345
```

**Example: `environments/staging.env`**

```
staging.baseUrl = https://staging.example.com
staging.username = staginguser
staging.password = stagingpass456
staging.apiKey = staging-api-key-67890
```

**Example: `environments/prod.env`**

```
prod.baseUrl = https://www.example.com
prod.username = produser
prod.password = prodpass789
prod.apiKey = prod-api-key-abcde
```

### Using Environment Files

```bash
# Load dev environment (Windows CMD)
set PLAYQ_ENV=dev && npm test

# Load staging environment (Windows CMD)
set PLAYQ_ENV=staging && npm test

# Load prod environment (Windows CMD)
set PLAYQ_ENV=prod && npm test
```

### Accessing Environment Variables in Tests

```typescript
// In your test files
const baseUrl = process.env.baseUrl;
const username = process.env.username;
const password = process.env.password;

test('login test', async ({ page }) => {
  await page.goto(baseUrl);
  await fill(page, 'Username', username);
  await fill(page, 'Password', password);
});
```

---

## Run Configurations

For complex test scenarios with multiple environments and settings.

### Creating Run Configuration Files

Create files in `resources/run-configs/` folder.

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

**Example: `resources/run-configs/regression.run.ts`**

```typescript
export default {
  runs: [
    {
      PLAYQ_ENV: "dev",
      PLAYQ_GREP: "regression",
      PLAYQ_PROJECT: "chromium"
    },
    {
      PLAYQ_ENV: "staging",
      PLAYQ_GREP: "regression",
      PLAYQ_PROJECT: "chromium"
    },
    {
      PLAYQ_ENV: "prod",
      PLAYQ_GREP: "smoke",
      PLAYQ_PROJECT: "chromium"
    }
  ]
};
```

### Using Run Configurations

```bash
# Run smoke configuration (Windows CMD)
set PLAYQ_RUN_CONFIG=smoke && npm test

# Run regression configuration (Windows CMD)
set PLAYQ_RUN_CONFIG=regression && npm test
```

---

## Reporting

### Playwright HTML Report

Automatically generated after test runs.

```bash
# View last test report
npx playwright show-report

# Generate report manually
npx playwright test --reporter=html
```

### Allure Reports

```bash
# Generate and open Allure report
npm run report:allure

# Generate single-file report
npm run report:allure:singlefile

# Clean Allure results
npm run report:allure:clean
```

**Note**: Allure must be installed on your system. Install with:

```bash
# Windows (using Scoop)
scoop install allure

# macOS (using Homebrew)
brew install allure

# Linux
# Download from https://github.com/allure-framework/allure2/releases
```

### Jest Coverage Report

```bash
# Generate coverage report
npm run test:unit:coverage

# View coverage report
# Open coverage/lcov-report/index.html in browser
```

---

## Platform-Specific Commands

### Windows CMD

```cmd
# Set single variable
set PLAYQ_ENV=dev

# Set multiple variables
set PLAYQ_ENV=dev
set PLAYQ_GREP="login"

# Run with variables
set PLAYQ_ENV=dev && npm test

# Chain multiple commands
set PLAYQ_ENV=dev && set PLAYQ_GREP="login" && npm test
```

### Windows PowerShell

```powershell
# Set single variable
$env:PLAYQ_ENV="dev"

# Set multiple variables
$env:PLAYQ_ENV="dev"
$env:PLAYQ_GREP="login"

# Run with variables
$env:PLAYQ_ENV="dev"; npm test

# Chain multiple commands
$env:PLAYQ_ENV="dev"; $env:PLAYQ_GREP="login"; npm test
```

### Linux/macOS (Bash/Zsh)

```bash
# Set single variable
export PLAYQ_ENV=dev

# Run with inline variable
PLAYQ_ENV=dev npm test

# Chain multiple variables
PLAYQ_ENV=dev PLAYQ_GREP="login" npm test
```

### Cross-Platform (using cross-env)

```bash
# Works on all platforms
npx cross-env PLAYQ_ENV=dev npm test
npx cross-env PLAYQ_ENV=dev PLAYQ_GREP="login" npm test
```

---

## Troubleshooting

### Tests Not Finding Elements

**Symptoms:**
- Error: "Element not found"
- Timeout errors
- Tests fail on element location

**Solutions:**

1. **Check pattern files exist:**
   ```bash
   node verify-pattern-files.js
   ```

2. **Verify patternIq is enabled in `resources/config.ts`:**
   ```typescript
   patternIq: {
     enable: true,  // Must be true
     config: "homePage"
   }
   ```

3. **Check page mapping:**
   ```typescript
   pageMapping: {
     "/login": "loginPage",  // URL must match
     "/home": "homePage"
   }
   ```

4. **Inspect actual HTML:**
   - Run test with `--headed` flag
   - Use browser DevTools to inspect elements
   - Update patterns to match actual HTML structure

### Environment Variables Not Loading

**Symptoms:**
- Tests use wrong URL
- Credentials not found
- Environment-specific config not applied

**Solutions:**

1. **Check environment file exists:**
   ```bash
   # File should exist
   environments/dev.env
   ```

2. **Verify file naming:**
   - File: `dev.env`
   - Variable: `PLAYQ_ENV=dev`
   - They must match!

3. **Check file format:**
   ```
   dev.baseUrl = https://dev.example.com
   dev.username = testuser
   ```

4. **Verify variable is set:**
   ```bash
   # Windows CMD
   echo %PLAYQ_ENV%
   
   # PowerShell
   echo $env:PLAYQ_ENV
   
   # Linux/macOS
   echo $PLAYQ_ENV
   ```

### Browser Not Launching

**Symptoms:**
- Error: "Browser not found"
- Tests fail immediately
- No browser window appears

**Solutions:**

1. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

2. **Install specific browser:**
   ```bash
   npx playwright install chromium
   npx playwright install firefox
   npx playwright install webkit
   ```

3. **Check headless setting in `resources/config.ts`:**
   ```typescript
   browser: {
     headless: false,  // Set to false to see browser
     browserType: "chromium"
   }
   ```

4. **Run with --headed flag:**
   ```bash
   npx playwright test --headed
   ```

### Tests Timing Out

**Symptoms:**
- Error: "Test timeout exceeded"
- Tests hang indefinitely
- Slow test execution

**Solutions:**

1. **Increase timeouts in `resources/config.ts`:**
   ```typescript
   testExecution: {
     timeout: 120000,        // Test timeout (2 minutes)
     actionTimeout: 60000,   // Action timeout (1 minute)
     navigationTimeout: 90000 // Navigation timeout (1.5 minutes)
   }
   ```

2. **Increase retry settings:**
   ```typescript
   patternIq: {
     retryTimeout: 60000,   // 60 seconds
     retryInterval: 3000    // 3 seconds
   }
   ```

3. **Check network connectivity:**
   - Ensure application is accessible
   - Check VPN/proxy settings
   - Verify firewall rules

### Pattern Resolution Failures

**Symptoms:**
- Error: "Pattern configuration not found"
- Wrong elements selected
- Patterns not working

**Solutions:**

1. **Verify pattern file structure:**
   ```typescript
   // File: loginPage.pattern.ts
   export const loginPage = {  // Export name must match filename
     fields: { ... },
     sections: { ... },
     locations: { ... }
   };
   ```

2. **Check pattern syntax:**
   ```typescript
   // Correct: semicolon-separated
   button: "//button[text()='#{loc.auto.fieldName}'];button:has-text('#{loc.auto.fieldName}')"
   
   // Wrong: comma-separated
   button: "//button[text()='#{loc.auto.fieldName}'],button:has-text('#{loc.auto.fieldName}')"
   ```

3. **Test pattern loading:**
   ```bash
   node test-pattern-loading.js
   ```

4. **Enable debug logging:**
   - Check console output for pattern resolution details
   - Look for "Pattern attempt:" messages

### Cucumber Tests Not Running

**Symptoms:**
- No tests execute
- Feature files not found
- Step definitions not recognized

**Solutions:**

1. **Verify PLAYQ_RUNNER is set:**
   ```bash
   # Windows CMD
   set PLAYQ_RUNNER=cucumber && npm test
   ```

2. **Check feature files location:**
   - Feature files should be in `_TEMP/execution/` after pretest
   - Original features in your feature folder

3. **Verify step definitions:**
   - Check `cucumber.js` config
   - Ensure step files are in correct location

4. **Run with verbose output:**
   ```bash
   npx cucumber-js --config cucumber.js --format progress
   ```

---

## Environment Variables

### Complete Reference

| Variable | Description | Values | Default | Runner |
|----------|-------------|--------|---------|--------|
| `PLAYQ_RUNNER` | Test runner to use | `playwright`, `cucumber` | `playwright` | Both |
| `PLAYQ_ENV` | Environment config to load | `dev`, `staging`, `prod`, etc. | None | Both |
| `PLAYQ_GREP` | Pattern to filter Playwright tests | Any string or regex | None | Playwright |
| `PLAYQ_TAGS` | Tags to filter Cucumber scenarios | Cucumber tag expression | None | Cucumber |
| `PLAYQ_PROJECT` | Browser project to run | `chromium`, `firefox`, `webkit` | All projects | Playwright |
| `PLAYQ_RUN_CONFIG` | Run configuration file | Filename without extension | None | Both |

### Tag Expression Examples (Cucumber)

```bash
# Single tag
PLAYQ_TAGS="@smoke"

# Multiple tags (AND)
PLAYQ_TAGS="@smoke and @login"

# Multiple tags (OR)
PLAYQ_TAGS="@smoke or @regression"

# Exclude tags (NOT)
PLAYQ_TAGS="@smoke and not @skip"

# Complex expressions
PLAYQ_TAGS="(@smoke or @regression) and not @wip"
```

### Grep Pattern Examples (Playwright)

```bash
# Match test name
PLAYQ_GREP="login"

# Match multiple words
PLAYQ_GREP="login.*success"

# Case-insensitive
PLAYQ_GREP="(?i)login"

# Exclude tests
PLAYQ_GREP="^(?!.*skip).*"
```

---

## Common Test Scenarios

### Scenario 1: Run Smoke Tests on Dev

```bash
# Windows CMD
set PLAYQ_ENV=dev && set PLAYQ_GREP="smoke" && npm test

# PowerShell
$env:PLAYQ_ENV="dev"; $env:PLAYQ_GREP="smoke"; npm test

# Linux/macOS
PLAYQ_ENV=dev PLAYQ_GREP="smoke" npm test
```

### Scenario 2: Run Regression on Staging

```bash
# Windows CMD
set PLAYQ_ENV=staging && set PLAYQ_GREP="regression" && npm test

# PowerShell
$env:PLAYQ_ENV="staging"; $env:PLAYQ_GREP="regression"; npm test
```

### Scenario 3: Debug Specific Test

```bash
# Run with debug mode
npx playwright test --debug --grep="login flow"

# Run with headed browser
npx playwright test --headed --grep="login flow"

# Run with UI mode
npx playwright test --ui
```

### Scenario 4: Run on Multiple Browsers

```bash
# Run on all browsers
npx playwright test --project=chromium --project=firefox --project=webkit

# Run specific test on all browsers
npx playwright test tests/login.spec.ts --project=chromium --project=firefox
```

### Scenario 5: Run Cucumber Smoke Tests

```bash
# Windows CMD
set PLAYQ_RUNNER=cucumber && set PLAYQ_TAGS="@smoke" && npm test

# PowerShell
$env:PLAYQ_RUNNER="cucumber"; $env:PLAYQ_TAGS="@smoke"; npm test
```

### Scenario 6: CI/CD Pipeline

```bash
# Run all tests with reporting
npx cross-env PLAYQ_ENV=staging npm test
npm run report:allure:singlefile
```

---

## Utility Commands

```bash
# Get framework and dependency versions
npm run playq:getversions

# Run utility scripts
npm run playq:util

# Verify pattern files
node verify-pattern-files.js

# Test pattern loading
node test-pattern-loading.js

# Clean test artifacts
npm run report:allure:clean

# List available npm scripts
npm run
```

---

## Additional Resources

- **[README.md](README.md)** - Framework overview and features
- **[Pattern Locator Overview](documents/01-pattern-locator-overview.md)** - Introduction to patterns
- **[Getting Started Guide](documents/02-getting-started-with-patterns.md)** - Step-by-step tutorial
- **[Pattern Syntax Reference](documents/03-pattern-syntax-reference.md)** - Complete syntax guide
- **[Migration Guide](docs/pattern-locator-migration-guide.md)** - Convert existing tests

---

## Getting Help

If you encounter issues not covered in this guide:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [Documentation](#additional-resources)
3. Run verification scripts:
   ```bash
   npm run playq:getversions
   node verify-pattern-files.js
   ```
4. Check console output for error messages
5. Open an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)

---

**Happy Testing! 🚀**
