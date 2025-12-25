# PlayQ Automation Framework

Enterprise-grade test automation framework that unifies Playwright and Cucumber BDD testing.

## Features

- **Dual Runner Support**: Seamlessly switch between Playwright (TypeScript) and Cucumber (BDD)
- **Intelligent Locators**: PatternIQ engine with self-healing capabilities
- **Enterprise Features**: Step groups, variable management, data-driven testing
- **Comprehensive Reporting**: Allure integration, HTML/JSON reports, artifacts

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

Or use the combined command:
```bash
npm run playq:install
```

## Running Tests

### Playwright Tests

Run Playwright tests using the TypeScript runner:

```bash
# Set environment variable
set PLAYQ_RUNNER=playwright
set PLAYQ_ENV=dev

# Run tests
npm test
```

Or use a single command:
```bash
cross-env PLAYQ_RUNNER=playwright PLAYQ_ENV=dev npm test
```

### Cucumber Tests

Run Cucumber BDD tests with Gherkin feature files:

```bash
# Set environment variable
set PLAYQ_RUNNER=cucumber
set PLAYQ_ENV=dev

# Run tests
npm test
```

Or use a single command:
```bash
cross-env PLAYQ_RUNNER=cucumber PLAYQ_ENV=dev npm test
```

### Run Specific Tests

Use tags to filter tests:

```bash
# Run tests with @smoke tag
set PLAYQ_GREP=@smoke
npm test

# Run tests with multiple tags
set PLAYQ_GREP="@smoke and @login"
npm test
```

## Project Structure

```
playsmart/
├── config/                    # Runner configurations
│   ├── cucumber/             # Cucumber hooks
│   └── playwright/           # Playwright config
├── environments/             # Environment configs
│   ├── dev.env
│   ├── staging.env
│   └── prod.env
├── playwright-tests/         # Playwright test files
├── resources/                # Locators and configs
│   ├── config.ts
│   ├── variable.ts
│   └── locators/
├── src/                      # Framework source
│   ├── exec/                # Test runners
│   └── helper/              # Actions, fixtures, utils
├── test/                     # Cucumber tests
│   ├── features/            # Feature files
│   ├── steps/               # Step definitions
│   └── step_group/          # Step groups
└── test-results/            # Test reports
```

## Configuration

### Environment Files

Configure test environments in `environments/*.env`:

```bash
PLAYQ_ENV=dev
PLAYQ_RUNNER=cucumber
BASE_URL=https://example.com
TEST_USER=test@example.com
TEST_PASSWORD=Test@123
```

### Framework Configuration

Main configuration in `resources/config.ts`:

```typescript
export const config = {
  baseUrl: "https://your-app.com",
  browser: {
    headless: true,
    browserType: "chromium"
  },
  testExecution: {
    timeout: 60000,
    parallel: true,
    maxRetries: 2
  }
};
```

## Writing Tests

### Cucumber Feature File

Create feature files in `test/features/`:

```gherkin
@smoke
Feature: Login
  Scenario: Successful login
    Given I navigate to "https://example.com"
    When I fill in "username" with "test@example.com"
    And I fill in "password" with "password123"
    And I click the "Login" button
    Then I should see "Welcome"
```

### Step Definitions

Create step definitions in `test/steps/`:

```typescript
import { Given, When, Then } from "@cucumber/cucumber";
import { webFixture } from "@src/helper/fixtures/webFixture";
import * as webActions from "@src/helper/actions/webActions";

Given("I navigate to {string}", async function (url: string) {
  const page = webFixture.getCurrentPage();
  await webActions.openBrowser(page, url, "");
});
```

### Playwright Test

Create test files in `playwright-tests/`:

```typescript
import { test, expect } from "@setup/playwrightTest";

test("sample test", async ({ page }) => {
  await page.goto("https://example.com");
  await expect(page).toHaveTitle(/Example/);
});
```

## Reports

### Allure Reports

Generate and view Allure reports:

```bash
npm run report:allure
```

Clean reports:
```bash
npm run report:allure:clean
```

### Cucumber Reports

Cucumber HTML reports are automatically generated in `test-results/cucumber-report.html`

## Troubleshooting

### Dependencies Not Installed

```bash
npm install
npx playwright install
```

### Tests Not Running

1. Check environment variables are set correctly
2. Verify `PLAYQ_RUNNER` is set to either `playwright` or `cucumber`
3. Check `PLAYQ_ENV` points to an existing environment file

### Import Errors

Ensure TypeScript paths are configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@src/*": ["src/*"],
      "@helper/*": ["src/helper/*"],
      "@actions": ["src/helper/actions/index.ts"]
    }
  }
}
```

### Browser Launch Failures

Reinstall Playwright browsers:
```bash
npx playwright install --force
```

## Available Scripts

- `npm test` - Run tests
- `npm run pretest` - Pre-test setup
- `npm run posttest` - Post-test cleanup and reporting
- `npm run report:allure` - Generate and open Allure report
- `npm run playq:install` - Install dependencies and browsers
- `npm run playq:getversions` - Display version information

## Documentation

Comprehensive documentation is available in the `documents/` directory:

- **Part 1**: Framework Overview & Architecture
- **Part 2**: Core Systems & Implementation
- **Part 3**: Action System & Web Interactions
- **Part 4**: Cucumber BDD System
- **Part 5**: Project Setup & Configuration
- **Part 6**: Implementation Guide
- **Part 7**: Advanced Features
- **Part 8**: Quick Reference & Troubleshooting

## Support

For issues or questions, refer to the documentation in the `documents/` folder or check the troubleshooting section above.

## License

ISC
