# PlayQ Framework Documentation
## Part 5: Project Setup & Configuration

---

## 1. Project Structure

### 1.1 User Project Template

```
playq-project/
├── environments/              # Environment configurations
│   ├── dev.env
│   ├── staging.env
│   └── production.env
│
├── extend/                    # Project extensions
│   ├── addons/               # Custom addons
│   └── engines/              # Custom engines
│
├── playwright-tests/          # Playwright test files
│   └── *.spec.ts
│
├── resources/                 # Project resources
│   ├── api/                  # API configurations
│   ├── locators/             # Locator definitions
│   │   ├── loc-json/        # JSON locators
│   │   ├── loc-ts/          # TypeScript locators
│   │   └── pattern/         # Pattern definitions
│   ├── run-configs/         # Run configurations
│   ├── config.ts            # Main configuration
│   └── variable.ts          # Static variables
│
├── test/                     # Cucumber tests
│   ├── features/            # Feature files
│   ├── pages/               # Page objects
│   ├── step_group/          # Step group definitions
│   └── steps/               # Step definitions
│       └── _step_group/     # Generated step group steps
│
├── test-data/               # Test data files
│   ├── users.xlsx
│   └── products.csv
│
├── .vscode/                 # VS Code settings
│   ├── settings.json
│   └── extensions.json
│
└── package.json
```

---

## 2. Configuration Files

### 2.1 Main Configuration

**File**: `resources/config.ts`

```typescript
export const config = {
  baseUrl: "https://your-app.com",
  
  cucumber: {
    featureFileCache: false,    // Enable feature file caching
    stepGroupCache: true        // Enable step group caching
  },
  
  browser: {
    playwrightSession: "shared",  // shared | isolated | perTest | perFile
    cucumberSession: "perScenario", // shared | perScenario | perFeature
    headless: true,
    browserType: "chromium"       // chromium | firefox | webkit
  },
  
  artifacts: {
    screenshot: true,
    video: true,
    trace: true,
    onFailureOnly: true,
    onSuccessOnly: false,
    cleanUpBeforeRun: true
  },
  
  testExecution: {
    timeout: 60000,              // Test timeout (ms)
    actionTimeout: 30000,        // Action timeout (ms)
    navigationTimeout: 60000,    // Navigation timeout (ms)
    retryOnFailure: true,
    parallel: true,
    maxInstances: 5,
    maxRetries: 2,
    retryDelay: 1000,
    retryInterval: 2000,
    retryTimeout: 30000,
    order: "sequential",         // sequential | random
    autoReportOpen: true
  },
  
  apiTest: {
    maxUrlRedirects: 5,
    timeout: 10000
  },
  
  patternIq: {
    enable: true,
    config: "uportalOb",         // Pattern file name
    retryInterval: 2000,
    retryTimeout: 30000
  },
  
  smartAi: {
    enable: false,
    consoleLog: true,
    resolve: "smart"             // smart | always
  },
  
  addons: {
    d365Crm: {
      enable: false,
      version: "v9.2"
    },
    d365FinOps: {
      enable: false,
      version: "v9.2"
    }
  },
  
  report: {
    allure: {
      singleFile: false
    }
  },
  
  featureFlags: {
    enableBetaUI: true,
    useMockBackend: false
  },
  
  supportedLanguages: ["en", "fr", "es"]
};
```

### 2.2 Variable Configuration

**File**: `resources/variable.ts`

```typescript
export const var_static = {
  // User credentials
  testUser: "test.user@example.com",
  testPassword: "Test@123",
  adminUser: "admin@example.com",
  
  // Application URLs
  loginUrl: "/login",
  dashboardUrl: "/dashboard",
  
  // Test data
  companyName: "Test Company Inc.",
  phoneNumber: "+1-555-0123",
  
  // API endpoints
  apiBaseUrl: "https://api.example.com",
  apiVersion: "v1"
};
```

### 2.3 Environment Configuration

**File**: `environments/dev.env`

```bash
# Environment
PLAYQ_ENV=dev
PLAYQ_RUNNER=playwright

# Application URLs
BASE_URL=https://dev.example.com
API_URL=https://api-dev.example.com

# Credentials
TEST_USER=dev.user@example.com
TEST_PASSWORD=DevPass123

# API Keys
API_KEY=dev_api_key_12345
AUTH_TOKEN=dev_token_67890

# Database
DB_HOST=dev-db.example.com
DB_PORT=5432
DB_NAME=dev_database

# Feature Flags
ENABLE_BETA_FEATURES=true
USE_MOCK_SERVICES=false

# Test Configuration
PARALLEL_WORKERS=3
RETRY_COUNT=2
TIMEOUT=60000
```

### 2.4 TypeScript Configuration

**File**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "lib": ["es2021", "dom"],
    "typeRoots": [
      "./node_modules/@types",
      "./src/helper/types"
    ],
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "paths": {
      "@src/*": ["src/*"],
      "@extend/*": ["extend/*"],
      "@helper/*": ["src/helper/*"],
      "@actions": ["src/helper/actions/index.ts"],
      "@config/*": ["config/*"],
      "@env/*": ["environments/*"],
      "@playwright-hook": ["config/playwright/playwright.hooks.ts"],
      "@setup/playwrightTest": ["config/playwright/playwright.test.ts"],
      "@resources/*": ["resources/*"],
      "@global": ["src/global"],
      "@playq": ["src/global"],
      "@extend": ["extend"]
    },
    "module": "CommonJS",
    "target": "es2017",
    "downlevelIteration": true
  },
  "include": [
    "src",
    "test",
    "playwright-tests",
    "config",
    "resources",
    "extend",
    "resources/locators/loc-ts"
  ]
}
```

---

## 3. Package Configuration

### 3.1 package.json

```json
{
  "name": "playq-automation-framework",
  "version": "1.0.0",
  "description": "End-to-end automation framework",
  "scripts": {
    "test": "cross-env npx ts-node -r tsconfig-paths/register src/exec/runner.ts",
    "pretest": "npx ts-node -r tsconfig-paths/register src/scripts/pretest.ts",
    "posttest": "npx ts-node -r tsconfig-paths/register src/scripts/posttest.ts",
    "test:failed": "cucumber-js -p rerun @rerun.txt",
    "report:allure": "npx allure generate ./allure-results --output ./allure-report && npx allure open ./allure-report",
    "report:allure:clean": "rimraf ./allure-report && rimraf ./allure-results",
    "playq:install": "npm install && npx playwright install",
    "playq:getversions": "npx ts-node src/scripts/get-versions.ts"
  },
  "devDependencies": {
    "@cucumber/cucumber": "^12.1.0",
    "@e965/xlsx": "^0.20.3",
    "@faker-js/faker": "^9.6.0",
    "@playwright/test": "^1.53.1",
    "allure-playwright": "^3.3.0",
    "axios": "^1.10.0",
    "cross-env": "^7.0.3",
    "csv-parser": "^3.2.0",
    "dotenv": "^16.0.3",
    "fs-extra": "^11.1.1",
    "minimist": "^1.2.8",
    "multiple-cucumber-html-reporter": "^3.3.0",
    "rimraf": "^6.0.1",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "winston": "^3.8.2"
  }
}
```

---

## 4. Locator Configuration

### 4.1 JSON Locators

**File**: `resources/locators/loc-json/login.json`

```json
{
  "loginPage": {
    "usernameField": "input[name='username']",
    "passwordField": "input[name='password']",
    "loginButton": "button[type='submit']",
    "forgotPasswordLink": "a[href='/forgot-password']",
    "errorMessage": ".error-message"
  },
  "dashboardPage": {
    "welcomeHeader": "h1.welcome",
    "userMenu": "button[aria-label='User menu']",
    "logoutButton": "xpath=//button[text()='Logout']"
  }
}
```

**Usage**:
```typescript
await web.fill(page, "loc.json.login.loginPage.usernameField", "user@example.com");
```

### 4.2 TypeScript Locators

**File**: `resources/locators/loc-ts/login.ts`

```typescript
import { Page } from '@playwright/test';

export const login = {
  loginPage: {
    usernameField: (page: Page) => page.locator('input[name="username"]'),
    passwordField: (page: Page) => page.getByLabel('Password'),
    loginButton: (page: Page) => page.getByRole('button', { name: 'Login' }),
    forgotPasswordLink: (page: Page) => page.getByText('Forgot Password?'),
    errorMessage: (page: Page) => page.locator('.error-message')
  },
  dashboardPage: {
    welcomeHeader: (page: Page) => page.locator('h1.welcome'),
    userMenu: (page: Page) => page.getByRole('button', { name: 'User menu' }),
    logoutButton: (page: Page) => page.getByRole('button', { name: 'Logout' })
  }
};
```

**Usage**:
```typescript
await web.fill(page, "loc.ts.login.loginPage.usernameField", "user@example.com");
```

### 4.3 Pattern Locators

**File**: `resources/locators/pattern/uportalOb.pattern.ts`

```typescript
export const uportalOb = {
  fields: {
    button: [
      "//button[contains(text(), '#{loc.auto.fieldName}')]",
      "//input[@type='button' and @value='#{loc.auto.fieldName}']",
      "//a[@role='button' and contains(text(), '#{loc.auto.fieldName}')]"
    ].join(";"),
    
    input: [
      "//label[contains(text(), '#{loc.auto.fieldName}')]",
      "//input[@id='#{loc.auto.forId}']",
      "//input[@placeholder='#{loc.auto.fieldName}']",
      "//input[@name='#{loc.auto.fieldName.toLowerCase}']"
    ].join(";"),
    
    link: [
      "//a[contains(text(), '#{loc.auto.fieldName}')]",
      "//a[@title='#{loc.auto.fieldName}']"
    ].join(";"),
    
    radio: [
      "//input[@type='radio' and @value='#{loc.auto.fieldName}']",
      "//label[contains(text(), '#{loc.auto.fieldName}')]//input[@type='radio']"
    ].join(";"),
    
    checkbox: [
      "//input[@type='checkbox']//following-sibling::label[contains(text(), '#{loc.auto.fieldName}')]",
      "//label[contains(text(), '#{loc.auto.fieldName}')]//input[@type='checkbox']"
    ].join(";"),
    
    select: [
      "//label[contains(text(), '#{loc.auto.fieldName}')]",
      "//select[@id='#{loc.auto.forId}']",
      "//select[@name='#{loc.auto.fieldName.toLowerCase}']"
    ].join(";"),
    
    label: [
      "//label[contains(text(), '#{loc.auto.fieldName}')]"
    ].join(";")
  },
  
  locations: {
    form: "//form[contains(@class, '#{loc.auto.location.value}') or contains(@id, '#{loc.auto.location.value}')]",
    dialog: "//div[@role='dialog' and contains(@aria-label, '#{loc.auto.location.value}')]",
    modal: "//div[contains(@class, 'modal') and contains(., '#{loc.auto.location.value}')]",
    section: "//section[contains(@class, '#{loc.auto.location.value}')]"
  },
  
  sections: {
    billing: "//div[contains(@class, 'billing') or contains(@id, 'billing')]",
    shipping: "//div[contains(@class, 'shipping') or contains(@id, 'shipping')]",
    payment: "//div[contains(@class, 'payment') or contains(@id, 'payment')]",
    personal: "//div[contains(@class, 'personal-info')]"
  },
  
  scroll: "//div[@class='scrollable-container'];body"
};
```

**Usage**:
```gherkin
When Web: Fill -field: "{{form::registration}} Email" -value: "test@example.com" -options: ""
```

---

## 5. Run Configurations

### 5.1 Run Config File

**File**: `resources/run-configs/smoke_tests.run.ts`

```typescript
export default {
  "name": "Smoke Test Suite",
  "runType": "sequential",
  "runs": [
    {
      "PLAYQ_GREP": "@smoke and @login",
      "PLAYQ_ENV": "staging"
    },
    {
      "PLAYQ_GREP": "@smoke and @checkout",
      "PLAYQ_ENV": "staging"
    }
  ]
};
```

### 5.2 Parallel Execution Config

```typescript
export default {
  "name": "Parallel Regression",
  "runType": "parallel",
  "runs": [
    { "PLAYQ_GREP": "@module:user", "PLAYQ_ENV": "staging" },
    { "PLAYQ_GREP": "@module:product", "PLAYQ_ENV": "staging" },
    { "PLAYQ_GREP": "@module:order", "PLAYQ_ENV": "staging" }
  ]
};
```

**Usage**:
```bash
PLAYQ_RUN_CONFIG=smoke_tests npm test
```

