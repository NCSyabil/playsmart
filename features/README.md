# Feature Files Directory

This directory contains Cucumber feature files organized by test category.

## Directory Structure

```
features/
├── login/              # Login and authentication features
├── checkout/           # Shopping cart and checkout features
├── navigation/         # Navigation and web actions demonstrations
├── smoke/              # Quick smoke test features
└── README.md           # This file
```

## Running Feature Files

### Run all features
```bash
npm run test:cucumber
```

### Run smoke tests only
```bash
npm run test:cucumber:smoke
```

### Run regression tests only
```bash
npm run test:cucumber:regression
```

### Run with specific tags
```bash
npm run test:cucumber:tags "@smoke and @login"
```

### Run in parallel (4 workers)
```bash
npm run test:cucumber:parallel
```

### Rerun failed tests
```bash
npm run test:cucumber:rerun
```

## Feature File Guidelines

### Tags
- `@smoke` - Quick smoke tests for critical functionality
- `@regression` - Comprehensive regression tests
- `@login` - Login-related tests
- `@checkout` - Checkout-related tests
- `@navigation` - Navigation tests
- `@actions` - Web action demonstrations
- `@quick` - Very fast tests

### Pattern Locators
Use pattern locators in the format: `pageName.fieldName`

Example:
```gherkin
When Web: Fill -field: "loginPage.usernameInput" -value: "testuser" -options: ""
```

### Variables
Use variables with double curly braces: `{{variableName}}`

Example:
```gherkin
Given Web: Open browser -url: "{{baseUrl}}/login" -options: ""
```

### Options
Pass options as JSON strings:

Example:
```gherkin
Then Web: Verify text on page -text: "Welcome" -options: "{partialMatch: true, screenshot: true}"
```

## Available Step Definitions

See `src/helper/actions/webStepDefs.ts` for all available step definitions.

Common patterns:
- `Web: Open browser -url: {param} -options: {param}`
- `Web: Click button -field: {param} -options: {param}`
- `Web: Fill -field: {param} -value: {param} -options: {param}`
- `Web: Verify text on page -text: {param} -options: {param}`
- `Web: Wait for URL -url: {param} -options: {param}`

## Reports

After running tests, reports are generated in:
- HTML Report: `test-results/cucumber-report.html`
- JSON Report: `test-results/cucumber-report.json`
- Screenshots: `test-results/scenarios/<scenario-name>/`
