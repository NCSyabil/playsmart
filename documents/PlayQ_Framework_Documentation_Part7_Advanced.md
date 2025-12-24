# PlayQ Framework Documentation
## Part 7: Advanced Features & Extension System

---

## 1. Extension System Architecture

### 1.1 Addon System

**Purpose**: Domain-specific functionality extensions (e.g., D365 CRM, FinOps)

**Structure**:
```
extend/addons/
├── d365Crm/
│   ├── actions/
│   │   ├── crmActions.ts
│   │   └── index.ts
│   ├── locators/
│   │   └── crm.pattern.ts
│   ├── steps/
│   │   └── crmSteps.ts
│   └── index.ts
└── index.ts
```

**Addon Implementation Pattern**:
```typescript
// extend/addons/d365Crm/index.ts
import * as crmActions from './actions/crmActions';
import { config } from '@playq';

export const d365Crm = {
  enabled: config?.addons?.d365Crm?.enable || false,
  version: config?.addons?.d365Crm?.version || 'v9.2',
  actions: crmActions
};

// Export for global access
if (d365Crm.enabled) {
  console.log(`✅ D365 CRM Addon enabled (${d365Crm.version})`);
}
```

**Global Registration**:
```typescript
// extend/addons/index.ts
import { d365Crm } from './d365Crm';
import { d365FinOps } from './d365FinOps';

export { d365Crm, d365FinOps };
```

### 1.2 Engine System

**Purpose**: Intelligent locator resolution engines (PatternIQ, SmartAI)

**Structure**:
```
extend/engines/
├── patternIq/
│   └── patternIqEngine.ts
├── smartAi/
│   └── smartAiEngine.ts
└── index.ts
```

**Engine Implementation Pattern**:
```typescript
// extend/engines/patternIq/patternIqEngine.ts
import { Page, Locator } from '@playwright/test';
import { vars } from '@playq';

export async function patternIq(
  page: Page,
  type: string,
  selector: string,
  overridePattern?: string,
  timeout?: number
): Promise<Locator> {
  // Engine implementation
  return page.locator(resolvedSelector);
}
```

**Global Registration**:
```typescript
// extend/engines/index.ts
import { patternIq } from './patternIq/patternIqEngine';
import { smartAi } from './smartAi/smartAiEngine';

export { patternIq, smartAi };
```

---

## 2. SmartAI Engine

### 2.1 SmartAI Concept

**Purpose**: AI-powered dynamic element detection with learning capabilities

**Key Features**:
- Context-aware element identification
- Learning from successful interactions
- Fallback strategies
- Confidence scoring

### 2.2 SmartAI Configuration

```typescript
// resources/config.ts
smartAi: {
  enable: true,
  consoleLog: true,
  resolve: "smart",  // "smart" | "always"
  confidenceThreshold: 0.8,
  learningEnabled: true,
  cacheLocation: "_Temp/.cache/smartai_cache.json"
}
```

### 2.3 SmartAI Implementation Pattern

```typescript
export async function smartAi(
  page: Page,
  type: string,
  selector: string,
  refreshMode?: 'before' | 'after' | ''
): Promise<Locator> {
  // 1. Check cache for learned locators
  const cachedLocator = await checkCache(type, selector);
  if (cachedLocator && await validateLocator(page, cachedLocator)) {
    return page.locator(cachedLocator);
  }
  
  // 2. Analyze page context
  const context = await analyzePage(page);
  
  // 3. Generate candidate locators
  const candidates = await generateCandidates(type, selector, context);
  
  // 4. Score and rank candidates
  const rankedCandidates = await scoreCandidates(page, candidates);
  
  // 5. Select best candidate
  const bestCandidate = rankedCandidates[0];
  
  // 6. Learn and cache
  if (bestCandidate.confidence > 0.8) {
    await cacheLocator(type, selector, bestCandidate.locator);
  }
  
  return page.locator(bestCandidate.locator);
}

async function analyzePage(page: Page): Promise<PageContext> {
  return await page.evaluate(() => {
    return {
      url: window.location.href,
      title: document.title,
      forms: Array.from(document.forms).map(f => ({
        id: f.id,
        name: f.name,
        action: f.action
      })),
      labels: Array.from(document.querySelectorAll('label')).map(l => ({
        text: l.textContent,
        for: l.getAttribute('for')
      }))
    };
  });
}

async function generateCandidates(
  type: string,
  selector: string,
  context: PageContext
): Promise<Candidate[]> {
  const candidates: Candidate[] = [];
  
  // Strategy 1: Label-based
  if (type === 'input') {
    candidates.push({
      locator: `//label[contains(text(), '${selector}')]//following::input[1]`,
      strategy: 'label-following',
      confidence: 0.9
    });
  }
  
  // Strategy 2: Placeholder-based
  candidates.push({
    locator: `//input[@placeholder='${selector}']`,
    strategy: 'placeholder',
    confidence: 0.85
  });
  
  // Strategy 3: ARIA-based
  candidates.push({
    locator: `//input[@aria-label='${selector}']`,
    strategy: 'aria-label',
    confidence: 0.9
  });
  
  return candidates;
}
```

---

## 3. Browser Session Management

### 3.1 Session Modes

**Playwright Runner**:
- `shared`: Single browser for all tests
- `isolated`: New browser per test file
- `perTest`: New browser per test
- `perFile`: New browser per file
- `none`: No automatic browser management

**Cucumber Runner**:
- `shared`: Single browser for all scenarios
- `perScenario`: New browser per scenario
- `perFeature`: New browser per feature

### 3.2 Session Implementation

**File**: `config/playwright/playwright.hooks.ts`

```typescript
import { test as base, Browser, BrowserContext, Page } from '@playwright/test';
import { webFixture, vars, config } from '@playq';

let browser: Browser;
let context: BrowserContext;
let page: Page;

const test = base.extend<{ page: Page }>({
  page: async ({}, use) => {
    const sessionMode = config?.browser?.playwrightSession || 'shared';
    
    // Launch browser based on session mode
    if (sessionMode === 'shared' && !browser) {
      browser = await getBrowserInstance().launch({ headless });
      context = await browser.newContext();
    }
    
    if (['isolated', 'perFile'].includes(sessionMode)) {
      browser = await getBrowserInstance().launch({ headless });
      context = await browser.newContext();
    }
    
    // Create page
    page = await context.newPage();
    webFixture.setPlaywrightPage(page);
    
    await use(page);
    
    // Cleanup based on session mode
    if (['isolated', 'perFile', 'perTest'].includes(sessionMode)) {
      await page.close();
      await context?.close();
      await browser?.close();
    }
  }
});

test.afterAll(async () => {
  if (config?.browser?.playwrightSession === 'shared') {
    await context?.close();
    await browser?.close();
  }
});

export { test };
```

---

## 4. Artifact Management

### 4.1 Screenshot System

**Configuration**:
```typescript
artifacts: {
  screenshot: true,
  onFailureOnly: true,
  onSuccessOnly: false
}
```

**Implementation**:
```typescript
async function processScreenshot(
  page: Page,
  screenshot: boolean,
  screenshotText: string,
  screenshotFullPage: boolean,
  locator?: Locator
) {
  if (!screenshot) return;
  
  const buffer = locator
    ? await locator.screenshot()
    : await page.screenshot({ fullPage: screenshotFullPage });
  
  if (isCucumberRunner()) {
    const world = webFixture.getWorld();
    await world.attach(buffer, 'image/png');
  } else {
    await playwrightTest.info().attach(screenshotText || 'Screenshot', {
      body: buffer,
      contentType: 'image/png'
    });
  }
}
```

### 4.2 Video Recording

**Configuration**:
```typescript
use: {
  video: 'on',  // 'on' | 'retain-on-failure' | 'off'
  recordVideo: {
    dir: 'test-results/videos',
    size: { width: 1280, height: 720 }
  }
}
```

### 4.3 Trace Collection

**Configuration**:
```typescript
artifacts: {
  trace: true
}
```

**Implementation**:
```typescript
Before(async function(scenario) {
  const context = webFixture.getContext();
  await context.tracing.start({
    name: scenario.pickle.name,
    screenshots: true,
    snapshots: true,
    sources: true
  });
});

After(async function(scenario) {
  const context = webFixture.getContext();
  if (scenario.result.status === Status.FAILED) {
    await context.tracing.stop({
      path: `test-results/traces/${scenario.pickle.name}.zip`
    });
  } else {
    await context.tracing.stop();
  }
});
```

---

## 5. Reporting System

### 5.1 Allure Integration

**Configuration**:
```typescript
// playwright.config.ts
reporter: [
  ['allure-playwright'],
  ['html', { open: 'never' }],
  ['json', { outputFile: 'playwright-report.json' }]
]
```

**Step Logging**:
```typescript
import * as allure from 'allure-js-commons';

export async function actionWithAllure(page: Page, field: string) {
  if (isPlaywrightRunner()) {
    await allure.step(`Action: ${field}`, async () => {
      await performAction();
    });
  } else {
    await performAction();
  }
}
```

**Annotations**:
```typescript
test('Test with metadata', async ({ page }) => {
  test.info().annotations.push(
    { type: 'tag', description: 'smoke' },
    { type: 'severity', description: 'critical' },
    { type: 'owner', description: 'team-qa' }
  );
  
  await allure.epic('User Management');
  await allure.feature('User Creation');
  await allure.story('Create new user');
  
  // Test implementation
});
```

### 5.2 Post-Test Reporting

**File**: `src/scripts/posttest.ts`

```typescript
import { execSync } from 'child_process';
import { vars } from '@playq';

export function executePostTest() {
  if (process.env.PLAYQ_RUNNER === 'cucumber') {
    // Cucumber reporting
    execSync('npx multiple-cucumber-html-reporter', { stdio: 'inherit' });
  } else {
    // Playwright/Allure reporting
    const singleFile = vars.getConfigValue('report.allure.singleFile') === 'true'
      ? '--single-file'
      : '';
    
    execSync(
      `npx allure generate ${singleFile} ./allure-results --output ./allure-report`,
      { stdio: 'inherit' }
    );
    
    if (vars.getConfigValue('testExecution.autoReportOpen') !== 'false') {
      execSync('npx allure open ./allure-report', { stdio: 'inherit' });
    }
  }
}
```

---

## 6. Data-Driven Testing

### 6.1 Excel Data Source

**Example File**: `test-data/users.xlsx`

| username | email | role | status |
|----------|-------|------|--------|
| user1 | user1@example.com | admin | active |
| user2 | user2@example.com | user | active |
| user3 | user3@example.com | user | inactive |

**Feature File**:
```gherkin
Scenario Outline: Create users from Excel
  Given Web: Fill -field: "Username" -value: "<username>" -options: ""
  And Web: Fill -field: "Email" -value: "<email>" -options: ""
  And Web: Select -field: "Role" -value: "<role>" -options: ""
  
  Examples: {dataFile: "users.xlsx", sheetName: "Sheet1", filter: "status == 'active'"}
```

**Processed Output**:
```gherkin
Examples:
  | username | email | role | status |
  | user1 | user1@example.com | admin | active |
  | user2 | user2@example.com | user | active |
```

### 6.2 CSV Data Source

**Example File**: `test-data/products.csv`

```csv
name,price,category,available
Product A,29.99,Electronics,true
Product B,49.99,Electronics,true
Product C,19.99,Books,false
```

**Feature File**:
```gherkin
Scenario Outline: Add products from CSV
  When Web: Fill -field: "Product Name" -value: "<name>" -options: ""
  And Web: Fill -field: "Price" -value: "<price>" -options: ""
  
  Examples: {dataFile: "products.csv", filter: "available == true && category == 'Electronics'"}
```

---

## 7. Encryption & Security

### 7.1 Encrypted Variables

**Encryption Utility**:
```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY = process.env.ENCRYPTION_KEY || 'default-key-32-characters-long';
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
```

**Usage**:
```gherkin
# In feature file
When Web: Fill -field: "Password" -value: "#{pwd.encryptedValue}" -options: ""

# In variable file
export const var_static = {
  adminPassword: "#{pwd.a1b2c3d4e5f6...}"
};
```

### 7.2 Environment Variable Security

**Best Practices**:
1. Never commit `.env` files
2. Use `.env.example` as template
3. Store secrets in secure vault (Azure Key Vault, AWS Secrets Manager)
4. Rotate credentials regularly
5. Use different credentials per environment

---

## 8. CI/CD Integration

### 8.1 GitHub Actions Example

```yaml
name: PlayQ Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        environment: [staging, production]
        browser: [chromium, firefox, webkit]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run tests
        env:
          PLAYQ_ENV: ${{ matrix.environment }}
          PLAYQ_RUNNER: playwright
          PLAYQ_PROJECT: ${{ matrix.browser }}
        run: npm test
      
      - name: Generate Allure report
        if: always()
        run: npm run report:allure
      
      - name: Upload artifacts
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results-${{ matrix.environment }}-${{ matrix.browser }}
          path: |
            test-results/
            allure-report/
```

### 8.2 Azure DevOps Example

```yaml
trigger:
  - main
  - develop

pool:
  vmImage: 'ubuntu-latest'

variables:
  - group: playq-secrets

stages:
  - stage: Test
    jobs:
      - job: RunTests
        strategy:
          matrix:
            Staging_Chrome:
              PLAYQ_ENV: 'staging'
              BROWSER: 'chromium'
            Production_Chrome:
              PLAYQ_ENV: 'production'
              BROWSER: 'chromium'
        
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '18.x'
          
          - script: npm ci
            displayName: 'Install dependencies'
          
          - script: npx playwright install --with-deps
            displayName: 'Install browsers'
          
          - script: |
              export PLAYQ_ENV=$(PLAYQ_ENV)
              export PLAYQ_PROJECT=$(BROWSER)
              npm test
            displayName: 'Run tests'
          
          - task: PublishTestResults@2
            condition: always()
            inputs:
              testResultsFormat: 'JUnit'
              testResultsFiles: '**/test-results/*.xml'
          
          - task: PublishBuildArtifacts@1
            condition: always()
            inputs:
              pathToPublish: 'allure-report'
              artifactName: 'allure-report-$(PLAYQ_ENV)-$(BROWSER)'
```

