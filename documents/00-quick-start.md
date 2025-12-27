# Quick Start Guide

Get up and running with PlaySmart in 5 minutes!

## 1. Install (2 minutes)

```bash
# One command to install everything
npm run playq:install
```

This installs:
- All Node.js dependencies
- Playwright browsers (Chromium, Firefox, WebKit)

## 2. Verify (30 seconds)

```bash
# Check everything is installed correctly
npm run playq:getversions

# Verify pattern files
node verify-pattern-files.js
```

Expected output:
```
✓ All dependencies installed
✓ Playwright browsers ready
✓ Pattern files loaded successfully
```

## 3. Run Your First Test (1 minute)

### Option A: Interactive UI Mode (Recommended)

```bash
npx playwright test --ui
```

This opens an interactive test runner where you can:
- See all available tests
- Run tests one by one
- Watch tests execute in real-time
- Debug failures easily

### Option B: Run All Tests

```bash
npm test
```

### Option C: Run Specific Example

```bash
npx playwright test playwright-tests/web-examples/pattern-integration/page-object-integration.spec.ts --headed
```

## 4. View Results (30 seconds)

```bash
# View HTML report
npx playwright show-report
```

## What's Next?

### Learn Pattern Locators

Pattern locators make your tests more maintainable and readable:

```typescript
// Instead of this:
await page.locator("//input[@id='username']").fill('john.doe');

// Write this:
await fill(page, 'Username', 'john.doe');
```

**Read:** [Pattern Locator Overview](01-pattern-locator-overview.md)

### Create Your First Pattern File

**Read:** [Getting Started with Patterns](02-getting-started-with-patterns.md)

### Run Tests with Different Configurations

**Read:** [HOW_TO_RUN.md](../HOW_TO_RUN.md)

## Common Commands Cheat Sheet

```bash
# Run all tests
npm test

# Run with UI (interactive)
npx playwright test --ui

# Run with visible browser
npx playwright test --headed

# Run specific test
npx playwright test path/to/test.spec.ts

# Run tests matching pattern
npx playwright test --grep="login"

# Debug mode
npx playwright test --debug

# Run unit tests
npm run test:unit

# View report
npx playwright show-report
```

## Platform-Specific Commands

### Windows CMD

```cmd
# Run with environment
set PLAYQ_ENV=dev && npm test

# Run with grep pattern
set PLAYQ_GREP="login" && npm test
```

### Windows PowerShell

```powershell
# Run with environment
$env:PLAYQ_ENV="dev"; npm test

# Run with grep pattern
$env:PLAYQ_GREP="login"; npm test
```

### Linux/macOS

```bash
# Run with environment
PLAYQ_ENV=dev npm test

# Run with grep pattern
PLAYQ_GREP="login" npm test
```

## Troubleshooting

### Browser Not Found

```bash
# Reinstall browsers
npx playwright install
```

### Tests Not Finding Elements

1. Check pattern files exist: `node verify-pattern-files.js`
2. Verify `patternIq.enable: true` in `resources/config.ts`
3. Run with headed mode to see what's happening: `npx playwright test --headed`

### Environment Variables Not Working

1. Check file exists: `environments/dev.env`
2. Verify naming: File `dev.env` → Variable `PLAYQ_ENV=dev`
3. Check format: `dev.baseUrl = https://example.com`

## Need Help?

- **Full Run Guide:** [HOW_TO_RUN.md](../HOW_TO_RUN.md)
- **Pattern Guide:** [Getting Started with Patterns](02-getting-started-with-patterns.md)
- **Syntax Reference:** [Pattern Syntax Reference](03-pattern-syntax-reference.md)
- **Main README:** [README.md](../README.md)

## Example Test

Here's a complete example to get you started:

```typescript
import { test, expect } from '@playwright/test';
import { fill, clickButton, verifyText } from '../src/helper/actions/webActions';

test.describe('Login Tests', () => {
  test('successful login', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Fill form using pattern locators
    await fill(page, 'Username', 'john.doe@example.com');
    await fill(page, 'Password', 'SecurePass123!');
    
    // Click button
    await clickButton(page, 'Login');
    
    // Verify success
    await verifyText(page, 'Welcome', 'Welcome back, John!');
  });
});
```

**That's it! You're ready to start testing.** 🚀

For more advanced features, check out the [complete documentation](01-pattern-locator-overview.md).
