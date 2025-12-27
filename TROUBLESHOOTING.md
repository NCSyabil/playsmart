# Troubleshooting Guide

Common issues and solutions for the PlaySmart framework.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Test Execution Issues](#test-execution-issues)
- [Pattern Locator Issues](#pattern-locator-issues)
- [Environment Configuration Issues](#environment-configuration-issues)
- [Browser Issues](#browser-issues)
- [Reporting Issues](#reporting-issues)
- [Performance Issues](#performance-issues)

---

## Installation Issues

### Issue: npm install fails

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Use legacy peer deps:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Update npm:**
   ```bash
   npm install -g npm@latest
   ```

### Issue: Playwright install fails

**Symptoms:**
```
Error: Failed to download browser
```

**Solutions:**

1. **Install with sudo (Linux/macOS):**
   ```bash
   sudo npx playwright install-deps
   npx playwright install
   ```

2. **Install specific browser:**
   ```bash
   npx playwright install chromium
   ```

3. **Check internet connection and proxy settings:**
   ```bash
   # Set proxy if needed
   export HTTP_PROXY=http://proxy.company.com:8080
   export HTTPS_PROXY=http://proxy.company.com:8080
   npx playwright install
   ```

### Issue: TypeScript errors during installation

**Symptoms:**
```
error TS2307: Cannot find module '@playwright/test'
```

**Solutions:**

1. **Install TypeScript:**
   ```bash
   npm install -D typescript
   ```

2. **Rebuild TypeScript:**
   ```bash
   npx tsc --build --clean
   npx tsc --build
   ```

---

## Test Execution Issues

### Issue: Tests not running

**Symptoms:**
- No tests execute
- "No tests found" message
- Empty test results

**Solutions:**

1. **Check test file location:**
   ```bash
   # Tests should be in playwright-tests/ folder
   ls playwright-tests/
   ```

2. **Verify test file naming:**
   - Files should end with `.spec.ts` or `.test.ts`
   - Example: `login.spec.ts`

3. **Check Playwright config:**
   ```typescript
   // config/playwright/playwright.config.ts
   testDir: './playwright-tests',
   testMatch: '**/*.spec.ts'
   ```

4. **Run with verbose output:**
   ```bash
   npx playwright test --list
   npx playwright test --reporter=list
   ```

### Issue: Tests timeout

**Symptoms:**
```
Error: Test timeout of 30000ms exceeded
```

**Solutions:**

1. **Increase test timeout in config:**
   ```typescript
   // resources/config.ts
   testExecution: {
     timeout: 120000,  // 2 minutes
     actionTimeout: 60000,  // 1 minute
     navigationTimeout: 90000  // 1.5 minutes
   }
   ```

2. **Increase timeout for specific test:**
   ```typescript
   test('slow test', async ({ page }) => {
     test.setTimeout(120000);  // 2 minutes
     // ... test code
   });
   ```

3. **Check network connectivity:**
   - Ensure application is accessible
   - Check VPN/proxy settings
   - Verify firewall rules

4. **Optimize test:**
   - Remove unnecessary waits
   - Use more specific locators
   - Reduce navigation steps

### Issue: Tests fail randomly (flaky tests)

**Symptoms:**
- Tests pass sometimes, fail other times
- Different results on different runs
- Timing-related failures

**Solutions:**

1. **Add proper waits:**
   ```typescript
   // Bad: Hard wait
   await page.waitForTimeout(5000);
   
   // Good: Wait for specific condition
   await page.waitForSelector('button:has-text("Submit")');
   await page.waitForLoadState('networkidle');
   ```

2. **Use auto-waiting actions:**
   ```typescript
   // These wait automatically
   await fill(page, 'Username', 'test');
   await clickButton(page, 'Submit');
   ```

3. **Increase retry attempts:**
   ```typescript
   // resources/config.ts
   testExecution: {
     maxRetries: 3,
     retryDelay: 2000
   }
   ```

4. **Enable retries in Playwright config:**
   ```typescript
   // config/playwright/playwright.config.ts
   retries: 2
   ```

### Issue: Tests fail in CI but pass locally

**Symptoms:**
- Tests pass on local machine
- Tests fail in CI/CD pipeline
- Different behavior in different environments

**Solutions:**

1. **Run in headless mode locally:**
   ```bash
   npx playwright test --headed=false
   ```

2. **Match CI environment:**
   ```typescript
   // resources/config.ts
   browser: {
     headless: process.env.CI === 'true'
   }
   ```

3. **Add CI-specific timeouts:**
   ```typescript
   testExecution: {
     timeout: process.env.CI ? 120000 : 60000
   }
   ```

4. **Check CI environment variables:**
   ```bash
   # In CI config
   PLAYQ_ENV=staging
   CI=true
   ```

---

## Pattern Locator Issues

### Issue: Pattern configuration not found

**Symptoms:**
```
Error: Pattern configuration 'loginPage' not found
```

**Solutions:**

1. **Verify file exists:**
   ```bash
   ls resources/locators/pattern/loginPage.pattern.ts
   ```

2. **Check export name matches filename:**
   ```typescript
   // File: loginPage.pattern.ts
   export const loginPage = {  // Must match filename
     fields: { ... }
   };
   ```

3. **Verify pattern is enabled:**
   ```typescript
   // resources/config.ts
   patternIq: {
     enable: true,  // Must be true
     config: "loginPage"
   }
   ```

4. **Run verification script:**
   ```bash
   node verify-pattern-files.js
   ```

### Issue: Element not found with pattern

**Symptoms:**
```
Error: Element not found: Username
Timeout exceeded while waiting for element
```

**Solutions:**

1. **Inspect actual HTML:**
   ```bash
   # Run with headed mode
   npx playwright test --headed
   ```
   - Use browser DevTools to inspect element
   - Check actual attributes and structure

2. **Update pattern to match HTML:**
   ```typescript
   // If HTML is: <input placeholder="Enter username">
   input: "//input[@placeholder='Enter #{loc.auto.fieldName.toLowerCase}']"
   ```

3. **Add more fallback patterns:**
   ```typescript
   input: "//input[@placeholder='#{loc.auto.fieldName}'];" +
          "//input[@name='#{loc.auto.fieldName.toLowerCase}'];" +
          "//input[@id='#{loc.auto.fieldName.toLowerCase}']"
   ```

4. **Use section scoping:**
   ```typescript
   // In test
   await fill(page, '{Login Form} Username', 'test');
   
   // In pattern file
   sections: {
     "Login Form": "//form[@id='login'];form#login"
   }
   ```

5. **Enable debug logging:**
   - Check console for pattern resolution attempts
   - Look for "Pattern attempt:" messages

### Issue: Wrong element selected

**Symptoms:**
- Action performed on incorrect element
- Multiple elements match pattern
- Unexpected test behavior

**Solutions:**

1. **Make pattern more specific:**
   ```typescript
   // Too generic
   button: "//button"
   
   // More specific
   button: "//button[text()='#{loc.auto.fieldName}']"
   ```

2. **Use instance number:**
   ```typescript
   // Select second Submit button
   await clickButton(page, 'Submit[2]');
   ```

3. **Use section scoping:**
   ```typescript
   // Select Submit in specific section
   await clickButton(page, '{Login Form} Submit');
   ```

4. **Use location and section:**
   ```typescript
   // Most specific
   await clickButton(page, '{{Main Content}} {Login Form} Submit');
   ```

### Issue: Pattern variables not substituting

**Symptoms:**
- Literal `#{loc.auto.fieldName}` appears in locator
- Variables not replaced with actual values
- Pattern resolution fails

**Solutions:**

1. **Check variable syntax:**
   ```typescript
   // Correct
   "//input[@placeholder='#{loc.auto.fieldName}']"
   
   // Wrong
   "//input[@placeholder='${loc.auto.fieldName}']"  // Wrong delimiter
   "//input[@placeholder='#{fieldName}']"  // Missing loc.auto
   ```

2. **Verify pattern engine is enabled:**
   ```typescript
   // resources/config.ts
   patternIq: {
     enable: true
   }
   ```

3. **Check pattern file structure:**
   ```typescript
   export const loginPage = {
     fields: {  // Must have 'fields' object
       input: "pattern here"
     }
   };
   ```

---

## Environment Configuration Issues

### Issue: Environment variables not loading

**Symptoms:**
- Tests use wrong URL
- Credentials not found
- Default values used instead of environment-specific

**Solutions:**

1. **Check environment file exists:**
   ```bash
   ls environments/dev.env
   ```

2. **Verify file naming convention:**
   - File: `dev.env`
   - Variable: `PLAYQ_ENV=dev`
   - They must match!

3. **Check file format:**
   ```
   # Correct format
   dev.baseUrl = https://dev.example.com
   dev.username = testuser
   
   # Wrong format
   baseUrl=https://dev.example.com  # Missing prefix
   dev.baseUrl: https://dev.example.com  # Wrong separator
   ```

4. **Verify environment variable is set:**
   ```bash
   # Windows CMD
   echo %PLAYQ_ENV%
   
   # PowerShell
   echo $env:PLAYQ_ENV
   
   # Linux/macOS
   echo $PLAYQ_ENV
   ```

5. **Check variable access in code:**
   ```typescript
   // Correct
   const baseUrl = process.env.baseUrl;
   
   // Wrong
   const baseUrl = process.env.dev.baseUrl;  // Don't include prefix
   ```

### Issue: Environment file not found

**Symptoms:**
```
Error: Environment file not found: dev.env
```

**Solutions:**

1. **Create environment file:**
   ```bash
   # Create file
   touch environments/dev.env
   
   # Add content
   echo "dev.baseUrl = https://dev.example.com" > environments/dev.env
   ```

2. **Check folder structure:**
   ```
   project-root/
   └── environments/
       ├── dev.env
       ├── staging.env
       └── prod.env
   ```

3. **Use correct environment name:**
   ```bash
   # If file is dev.env
   set PLAYQ_ENV=dev && npm test
   
   # Not
   set PLAYQ_ENV=development && npm test  # Wrong!
   ```

---

## Browser Issues

### Issue: Browser not launching

**Symptoms:**
```
Error: Browser not found
Error: Failed to launch browser
```

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

3. **Install system dependencies (Linux):**
   ```bash
   sudo npx playwright install-deps
   ```

4. **Check browser path:**
   ```bash
   # Find browser location
   npx playwright install --dry-run
   ```

5. **Run with different browser:**
   ```bash
   npx playwright test --project=chromium
   ```

### Issue: Browser crashes during test

**Symptoms:**
- Browser closes unexpectedly
- "Browser closed" error
- Tests fail mid-execution

**Solutions:**

1. **Increase browser timeout:**
   ```typescript
   // config/playwright/playwright.config.ts
   timeout: 120000
   ```

2. **Disable browser features:**
   ```typescript
   use: {
     launchOptions: {
       args: ['--disable-dev-shm-usage', '--no-sandbox']
     }
   }
   ```

3. **Check system resources:**
   - Ensure sufficient RAM
   - Close other applications
   - Check disk space

4. **Update Playwright:**
   ```bash
   npm install -D @playwright/test@latest
   npx playwright install
   ```

### Issue: Headless mode behaves differently

**Symptoms:**
- Tests pass in headed mode
- Tests fail in headless mode
- Different behavior with/without visible browser

**Solutions:**

1. **Run in headed mode:**
   ```bash
   npx playwright test --headed
   ```

2. **Disable headless in config:**
   ```typescript
   // resources/config.ts
   browser: {
     headless: false
   }
   ```

3. **Add viewport size:**
   ```typescript
   // config/playwright/playwright.config.ts
   use: {
     viewport: { width: 1920, height: 1080 }
   }
   ```

4. **Wait for elements to be visible:**
   ```typescript
   await page.waitForSelector('button', { state: 'visible' });
   ```

---

## Reporting Issues

### Issue: Allure report not generating

**Symptoms:**
```
Error: allure: command not found
```

**Solutions:**

1. **Install Allure:**
   ```bash
   # Windows (using Scoop)
   scoop install allure
   
   # macOS (using Homebrew)
   brew install allure
   
   # Linux
   # Download from https://github.com/allure-framework/allure2/releases
   ```

2. **Verify Allure installation:**
   ```bash
   allure --version
   ```

3. **Generate report manually:**
   ```bash
   npx allure generate ./allure-results --output ./allure-report
   npx allure open ./allure-report
   ```

### Issue: HTML report not showing

**Symptoms:**
- No report generated
- Empty report
- Report not opening

**Solutions:**

1. **Generate report:**
   ```bash
   npx playwright test --reporter=html
   ```

2. **Open report:**
   ```bash
   npx playwright show-report
   ```

3. **Check report location:**
   ```bash
   # Default location
   ls playwright-report/index.html
   ```

4. **Specify reporter in config:**
   ```typescript
   // config/playwright/playwright.config.ts
   reporter: [['html', { open: 'never' }]]
   ```

---

## Performance Issues

### Issue: Tests running slowly

**Symptoms:**
- Tests take too long to complete
- Slow element location
- High CPU/memory usage

**Solutions:**

1. **Enable parallel execution:**
   ```typescript
   // resources/config.ts
   testExecution: {
     parallel: true,
     maxInstances: 5
   }
   ```

2. **Optimize locators:**
   ```typescript
   // Slow: Complex XPath
   "//div[@class='container']//form//input[@type='text']"
   
   // Fast: Direct CSS
   "input[type='text']"
   ```

3. **Reduce unnecessary waits:**
   ```typescript
   // Remove hard waits
   // await page.waitForTimeout(5000);  // Remove this
   
   // Use specific waits
   await page.waitForLoadState('networkidle');
   ```

4. **Use locator caching:**
   - Pattern locators cache automatically
   - Reuse locators when possible

5. **Disable video/screenshots in dev:**
   ```typescript
   // resources/config.ts
   artifacts: {
     video: false,
     screenshot: false
   }
   ```

### Issue: High memory usage

**Symptoms:**
- System slows down during tests
- Out of memory errors
- Browser crashes

**Solutions:**

1. **Reduce parallel workers:**
   ```typescript
   // config/playwright/playwright.config.ts
   workers: 2  // Reduce from default
   ```

2. **Close pages after use:**
   ```typescript
   test('example', async ({ page }) => {
     // ... test code
     await page.close();
   });
   ```

3. **Disable artifacts:**
   ```typescript
   artifacts: {
     video: false,
     screenshot: false,
     trace: false
   }
   ```

4. **Increase system resources:**
   - Close other applications
   - Increase available RAM
   - Use SSD for better I/O

---

---

## Cucumber-Specific Issues

### Issue: Undefined step definition

**Symptoms:**
```
Undefined step: Web: Click button -field: "loginButton" -options: ""
```

**Solutions:**

1. **Verify step syntax matches exactly:**
   ```gherkin
   # Correct
   When Web: Click button -field: "loginButton" -options: ""
   
   # Wrong (missing colon)
   When Web Click button -field: "loginButton" -options: ""
   
   # Wrong (wrong parameter format)
   When Web: Click button field: "loginButton" options: ""
   ```

2. **Check step definition file is loaded:**
   ```javascript
   // cucumber.js
   require: [
     "./src/helper/actions/webStepDefs.ts"  // Must be included
   ]
   ```

3. **List available step definitions:**
   ```bash
   npx cucumber-js --dry-run
   ```

4. **Check for typos in step text:**
   - Step definitions are case-sensitive
   - Spaces and punctuation must match exactly
   - Parameter placeholders must use `{param}` syntax

### Issue: Feature file not found

**Symptoms:**
```
No scenarios found
0 scenarios
0 steps
```

**Solutions:**

1. **Check feature file location:**
   ```bash
   # Features should be in features/ folder
   ls features/
   ```

2. **Verify file extension:**
   - Files must end with `.feature`
   - Example: `user-login.feature`

3. **Check cucumber.js paths:**
   ```javascript
   // cucumber.js
   paths: [
     "./features/**/*.feature",  // Correct
     "./_TEMP/execution/**/*.feature"
   ]
   ```

4. **Run specific feature file:**
   ```bash
   npx cucumber-js features/login/user-login.feature
   ```

### Issue: Pattern locator not resolved in Cucumber

**Symptoms:**
```
Pattern field "loginPage.usernameInput" not found
Element not found: loginPage.usernameInput
```

**Solutions:**

1. **Verify pattern file exists:**
   ```bash
   ls resources/locators/pattern/loginPage.pattern.ts
   ```

2. **Check pattern export:**
   ```typescript
   // File: loginPage.pattern.ts
   export const loginPage = {  // Must match filename
     usernameInput: {
       text: "Username",
       type: "input"
     }
   };
   ```

3. **Verify pattern is loaded:**
   - Check console output for "Loaded page object pattern: loginPage"
   - Pattern files are loaded automatically at startup

4. **Use correct field reference:**
   ```gherkin
   # Correct
   When Web: Fill -field: "loginPage.usernameInput" -value: "test" -options: ""
   
   # Wrong (missing page prefix)
   When Web: Fill -field: "usernameInput" -value: "test" -options: ""
   ```

### Issue: Variable not replaced in Cucumber

**Symptoms:**
```
Literal "#{env.BASE_URL}" appears in URL
Browser navigates to "#{env.BASE_URL}/login"
```

**Solutions:**

1. **Check variable syntax:**
   ```gherkin
   # Correct
   Given Web: Open browser -url: "#{env.BASE_URL}" -options: ""
   
   # Wrong (wrong delimiters)
   Given Web: Open browser -url: "{{BASE_URL}}" -options: ""
   Given Web: Open browser -url: "${env.BASE_URL}" -options: ""
   ```

2. **Verify environment variable is set:**
   ```bash
   # Windows CMD
   echo %PLAYQ_ENV%
   
   # PowerShell
   echo $env:PLAYQ_ENV
   ```

3. **Check variable is defined:**
   ```typescript
   // resources/config.ts or environments/dev.env
   dev.baseUrl = https://dev.example.com
   ```

4. **Use correct variable prefix:**
   ```gherkin
   # Environment variables
   "#{env.VARIABLE_NAME}"
   
   # Static variables
   "#{var.static.variableName}"
   
   # Config variables
   "#{config.propertyName}"
   ```

### Issue: Cucumber hooks not executing

**Symptoms:**
- Browser not launching
- No screenshots captured
- Cleanup not happening

**Solutions:**

1. **Verify hooks file is loaded:**
   ```javascript
   // cucumber.js
   require: [
     "config/cucumber/hooks.ts"  // Must be included
   ]
   ```

2. **Check hook syntax:**
   ```typescript
   // Correct
   Before(async function () { ... });
   After(async function () { ... });
   
   // Wrong
   before(async function () { ... });  // Lowercase
   ```

3. **Check hook execution order:**
   - BeforeAll → Before → Steps → After → AfterAll
   - After hooks run even if scenario fails

4. **Enable hook debugging:**
   - Add console.log statements in hooks
   - Check test output for hook execution

### Issue: Scenario fails with timeout

**Symptoms:**
```
Error: function timed out, ensure the promise resolves within 60000 milliseconds
```

**Solutions:**

1. **Increase Cucumber timeout:**
   ```javascript
   // cucumber.js
   timeout: 120000  // 2 minutes
   ```

2. **Increase action timeout in options:**
   ```gherkin
   When Web: Click button -field: "submitButton" -options: "{actionTimeout: 30000}"
   ```

3. **Add explicit waits:**
   ```gherkin
   When Web: Click button -field: "submitButton" -options: ""
   Then Web: Wait for URL -url: "/dashboard" -options: "{partialMatch: true}"
   ```

4. **Check element is visible:**
   ```gherkin
   Then Web: Verify input field is present -field: "loginPage.usernameInput" -options: ""
   When Web: Fill -field: "loginPage.usernameInput" -value: "test" -options: ""
   ```

### Issue: Parallel execution conflicts

**Symptoms:**
- Tests pass sequentially but fail in parallel
- Random failures in parallel mode
- State leakage between scenarios

**Solutions:**

1. **Reduce parallel workers:**
   ```javascript
   // cucumber.js
   parallel: 2  // Reduce from 4
   ```

2. **Ensure test independence:**
   - Each scenario should set up its own data
   - Don't rely on execution order
   - Clean up after each scenario

3. **Use unique test data:**
   ```gherkin
   # Use timestamps or random values
   When Web: Fill -field: "emailInput" -value: "test-#{timestamp}@example.com" -options: ""
   ```

4. **Run serially for debugging:**
   ```bash
   npx cucumber-js --parallel 1
   ```

### Issue: Tags not filtering scenarios

**Symptoms:**
- All scenarios run despite tag filter
- Wrong scenarios execute
- Tag filter ignored

**Solutions:**

1. **Check tag syntax:**
   ```gherkin
   # Correct
   @smoke @login
   Scenario: User logs in
   
   # Wrong (no @ symbol)
   smoke login
   Scenario: User logs in
   ```

2. **Use correct tag expression:**
   ```bash
   # Run scenarios with @smoke tag
   npx cucumber-js --tags "@smoke"
   
   # Run scenarios with @smoke AND @login
   npx cucumber-js --tags "@smoke and @login"
   
   # Run scenarios with @smoke OR @regression
   npx cucumber-js --tags "@smoke or @regression"
   
   # Run scenarios with @smoke but NOT @wip
   npx cucumber-js --tags "@smoke and not @wip"
   ```

3. **Check profile configuration:**
   ```javascript
   // cucumber.js
   smoke: {
     tags: "@smoke"  // Must match tag in feature file
   }
   ```

4. **Verify tags are on Scenario, not Feature:**
   ```gherkin
   # Tags on Scenario (correct)
   @smoke
   Scenario: User logs in
   
   # Tags on Feature (applies to all scenarios)
   @smoke
   Feature: User Login
   ```

### Issue: Data table not parsed correctly

**Symptoms:**
- Data table values not passed to step
- Empty or undefined values
- Step fails with data table

**Solutions:**

1. **Check data table format:**
   ```gherkin
   # Correct (with header row)
   When I fill the form with:
     | field     | value    |
     | username  | testuser |
     | password  | testpass |
   
   # Wrong (missing header)
   When I fill the form with:
     | username  | testuser |
     | password  | testpass |
   ```

2. **Access data table in step definition:**
   ```typescript
   When('I fill the form with:', async function (dataTable) {
     const rows = dataTable.hashes();  // Convert to array of objects
     for (const row of rows) {
       await fill(page, row.field, row.value);
     }
   });
   ```

3. **Check column names match:**
   - Column names are case-sensitive
   - Must match exactly in step definition

### Issue: Report not generated

**Symptoms:**
- No HTML report after test run
- Empty report
- Report file missing

**Solutions:**

1. **Check report configuration:**
   ```javascript
   // cucumber.js
   format: [
     "html:test-results/cucumber-report.html",
     "json:test-results/cucumber-report.json"
   ]
   ```

2. **Verify test-results folder exists:**
   ```bash
   mkdir test-results
   ```

3. **Check report location:**
   ```bash
   ls test-results/cucumber-report.html
   ```

4. **Generate report manually:**
   ```bash
   npx cucumber-js --format html:test-results/cucumber-report.html
   ```

---

## Getting More Help

If your issue isn't covered here:

1. **Check documentation:**
   - [HOW_TO_RUN.md](HOW_TO_RUN.md)
   - [Quick Start](documents/00-quick-start.md)
   - [Pattern Locator Overview](documents/01-pattern-locator-overview.md)
   - [Cucumber User Guide](docs/cucumber-user-guide.md)
   - [Cucumber Step Definition Reference](docs/cucumber-step-definition-reference.md)

2. **Run diagnostic commands:**
   ```bash
   npm run playq:getversions
   node verify-pattern-files.js
   node test-pattern-loading.js
   npx cucumber-js --dry-run  # List all step definitions
   ```

3. **Enable debug logging:**
   - Check console output
   - Look for error messages
   - Review stack traces
   - Check pattern resolution logs

4. **Create minimal reproduction:**
   - Isolate the issue
   - Create simple test case
   - Document steps to reproduce

5. **Open GitHub issue with:**
   - Error message
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)
   - Relevant configuration files
   - Feature file and step definitions

---

**Need immediate help? Check the [Quick Start Guide](documents/00-quick-start.md) or [HOW_TO_RUN.md](HOW_TO_RUN.md)!**
