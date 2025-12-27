# Cucumber Test Execution Guide

This guide explains how to run Cucumber tests using the various npm scripts and profiles configured in this framework.

## Available npm Scripts

### Basic Execution

```bash
# Run all Cucumber tests with default profile
npm run test:cucumber

# Run tests with custom tags
npm run test:cucumber:tags -- "@smoke and not @wip"
```

### Test Type Profiles

```bash
# Run smoke tests (tagged with @smoke)
npm run test:cucumber:smoke

# Run regression tests (tagged with @regression)
npm run test:cucumber:regression

# Run end-to-end tests (tagged with @e2e)
npm run test:cucumber:e2e
```

### Environment-Specific Execution

```bash
# Run tests in development environment
npm run test:cucumber:dev

# Run tests in staging environment
npm run test:cucumber:staging

# Run tests in production environment
npm run test:cucumber:prod
```

### Parallel Execution

```bash
# Run tests in parallel with 4 workers
npm run test:cucumber:parallel
```

### Rerun Failed Tests

```bash
# Rerun only the tests that failed in the last run
npm run test:cucumber:rerun

# Alternative command (same as above)
npm run test:failed
```

## Profile Configuration Details

### Default Profile
- **Paths**: `./features/**/*.feature` and `./_TEMP/execution/**/*.feature`
- **Parallel**: 1 worker (sequential execution)
- **Reports**: HTML, JSON, and rerun file

### Smoke Profile
- **Paths**: `./features/**/*.feature`
- **Tags**: `@smoke`
- **Parallel**: 2 workers
- **Reports**: HTML and JSON (no rerun file)

### Regression Profile
- **Paths**: `./features/**/*.feature`
- **Tags**: `@regression`
- **Parallel**: 2 workers
- **Reports**: HTML, JSON, and rerun file

### E2E Profile
- **Paths**: `./features/**/*.feature`
- **Tags**: `@e2e`
- **Parallel**: 2 workers
- **Reports**: HTML, JSON, and rerun file

### Rerun Profile
- **Paths**: `@rerun.txt` (reads failed scenarios from this file)
- **Parallel**: 1 worker (sequential execution)
- **Reports**: HTML and JSON

### Environment Profiles (dev, staging, prod)
- **Paths**: `./features/**/*.feature`
- **Parallel**: 
  - dev: 1 worker
  - staging: 2 workers
  - prod: 2 workers
- **World Parameters**: Sets `environment` parameter for use in tests
- **Reports**: HTML, JSON, and rerun file

## Using Profiles Directly

You can also use Cucumber profiles directly with the `cucumber-js` command:

```bash
# Run with a specific profile
npx cucumber-js -p smoke

# Run with multiple profiles (not recommended, may cause conflicts)
npx cucumber-js -p dev -p smoke

# Override profile settings with command-line options
npx cucumber-js -p smoke --parallel 4
```

## Tag Expressions

You can use complex tag expressions to filter scenarios:

```bash
# Run scenarios tagged with @smoke OR @regression
npm run test:cucumber:tags -- "@smoke or @regression"

# Run scenarios tagged with @smoke AND NOT @wip
npm run test:cucumber:tags -- "@smoke and not @wip"

# Run scenarios tagged with @smoke OR (@regression AND @api)
npm run test:cucumber:tags -- "@smoke or (@regression and @api)"
```

## Parallel Execution Considerations

- Parallel execution uses multiple worker processes
- Each worker gets its own browser context (isolated)
- Scenarios are distributed across workers automatically
- Use `--parallel N` to specify the number of workers
- Default parallel setting varies by profile (1-4 workers)

## Report Locations

After test execution, reports are generated in the following locations:

- **HTML Report**: `test-results/cucumber-report.html`
- **JSON Report**: `test-results/cucumber-report.json`
- **Rerun File**: `@rerun.txt` (contains failed scenario locations)
- **Screenshots**: `test-results/scenarios/<scenario-name>/screenshot.png`
- **Videos**: `test-results/scenarios/<scenario-name>/video.webm` (if enabled)
- **Traces**: `test-results/scenarios/<scenario-name>/trace.zip` (if enabled)

## Environment Variables

The framework supports environment-specific configuration through the vars system:

```bash
# Set environment before running tests
set PLAYQ_ENV=dev
npm run test:cucumber

# Or use environment-specific profile
npm run test:cucumber:dev
```

## Examples

### Run smoke tests in development environment
```bash
npm run test:cucumber:dev -- --tags "@smoke"
```

### Run specific feature file
```bash
npx cucumber-js features/login/user-login.feature
```

### Run specific scenario by line number
```bash
npx cucumber-js features/login/user-login.feature:10
```

### Run with custom parallel workers
```bash
npx cucumber-js --parallel 8 --tags "@smoke"
```

### Dry run to check step definitions
```bash
npx cucumber-js --dry-run
```

## Troubleshooting

### Tests not running
- Check that feature files exist in `features/` directory
- Verify tags match the profile's tag filter
- Check `@rerun.txt` exists when using rerun profile

### Parallel execution issues
- Reduce number of workers if experiencing resource constraints
- Check for shared state between scenarios (should be isolated)
- Review browser context management in hooks

### Missing step definitions
- Run with `--dry-run` to see undefined steps
- Check that step definition files are loaded in `cucumber.js`
- Verify step patterns match Gherkin step text

## Additional Resources

- [Cucumber User Guide](./cucumber-user-guide.md)
- [Step Definition Reference](./cucumber-step-definition-reference.md)
- [Pattern Locator Integration](./pattern-locator-quick-reference.md)
