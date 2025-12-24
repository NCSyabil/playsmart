# PlayQ Framework Documentation
## Part 6: Implementation Guide & Best Practices

---

## 1. Framework Implementation Steps

### 1.1 Core Framework Setup

**Step 1: Initialize Project Structure**
```bash
mkdir playq-framework
cd playq-framework
npm init -y
```

**Step 2: Install Dependencies**
```json
{
  "devDependencies": {
    "@cucumber/cucumber": "^12.1.0",
    "@playwright/test": "^1.53.1",
    "@faker-js/faker": "^9.6.0",
    "@e965/xlsx": "^0.20.3",
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
    "winston": "^3.8.2",
    "yargs": "^18.0.0"
  }
}
```

**Step 3: Create Directory Structure**
```bash
mkdir -p config/{cucumber,playwright}
mkdir -p src/{exec,helper/{actions,fixtures,bundle,browsers,faker,report,util,wrapper},scripts}
mkdir -p test/{features,pages,step_group,steps/_step_group}
mkdir -p resources/{api,locators/{loc-json,loc-ts,pattern},run-configs}
mkdir -p environments
mkdir -p extend/{addons,engines}
mkdir -p playwright-tests
mkdir -p test-data
```

### 1.2 Core File Implementation

**File 1: src/global.ts**
```typescript
import * as vars from './helper/bundle/vars';
import { webFixture } from './helper/fixtures/webFixture';
import { logFixture } from './helper/fixtures/logFixture';
import * as utils from './helper/util/utils';
import { faker } from '@helper/faker/customFaker';
import { webLocResolver } from './helper/fixtures/webLocFixture';
import * as comm from './helper/actions/commActions';
import * as web from './helper/actions/webActions';
import * as api from './helper/actions/apiActions';
import { dataTest } from '@helper/util/test-data/dataTest';

const addons: any = (() => {
  try {
    return require('@extend/addons');
  } catch {
    return undefined;
  }
})();

const engines: any = (() => {
  try {
    return require('@extend/engines');
  } catch {
    return undefined;
  }
})();

const config: any = (() => {
  try {
    return require('../resources/config').config;
  } catch {
    return {};
  }
})();

const testType = process.env.TEST_TYPE;
const allowedTypes = ['ui', 'api', 'mobile'] as const;

globalThis.runType = allowedTypes.includes(testType as any)
  ? (testType as typeof allowedTypes[number])
  : 'ui';

globalThis.vars = vars;
globalThis.webLocResolver = webLocResolver;
globalThis.uiFixture = webFixture;
globalThis.logFixture = logFixture;
globalThis.utils = utils;
globalThis.faker = faker;
globalThis.comm = comm;
globalThis.web = web;
globalThis.api = api;
globalThis.dataTest = dataTest;
globalThis.addons = addons;
globalThis.engines = engines;

export { vars, webLocResolver, webFixture, logFixture, utils, faker, comm, web, api, dataTest, addons, engines, config };
```

**File 2: config/runner.ts**
```typescript
export function isPlaywrightRunner() {
  return process.env.TEST_RUNNER === 'playwright';
}

export function isCucumberRunner() {
  return process.env.TEST_RUNNER === 'cucumber';
}
```

**File 3: src/helper/bundle/env.ts**
```typescript
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

export const loadEnv = (env?: string) => {
  if (!process.env['PLAYQ_PROJECT_ROOT']) {
    process.env['PLAYQ_PROJECT_ROOT'] = findProjectRoot();
  }
  
  process.env['PLAYQ_CORE_ROOT'] = path.resolve(process.env['PLAYQ_PROJECT_ROOT'], 'src');
  
  if (!process.env.PLAYQ_REPORT_OPEN) {
    process.env.PLAYQ_REPORT_OPEN = 'true';
  }
  
  if (process.env.PLAYQ_RUNNER && ['bdd', 'cuke', 'cucumber'].includes(process.env.PLAYQ_RUNNER.trim())) {
    process.env.PLAYQ_RUNNER = 'cucumber';
  } else {
    process.env.PLAYQ_RUNNER = 'playwright';
  }
  
  let envPath;
  let playqEnvMem = process.env['PLAYQ_ENV'];
  let playqRunnerMem = process.env['PLAYQ_RUNNER'];
  
  if (env) {
    envPath = path.resolve(process.env.PLAYQ_PROJECT_ROOT, 'environments', `${env}.env`);
    dotenv.config({ override: true, path: envPath });
  } else if (process.env.PLAYQ_ENV) {
    process.env.PLAYQ_ENV = process.env.PLAYQ_ENV.trim();
    envPath = path.resolve(process.env.PLAYQ_PROJECT_ROOT, 'environments', `${process.env.PLAYQ_ENV}.env`);
    dotenv.config({ override: true, path: envPath });
  }
  
  process.env['PLAYQ_RUNNER'] = playqRunnerMem;
  if (playqEnvMem) process.env['PLAYQ_ENV'] = playqEnvMem;
  
  try {
    const { initVars } = require('./vars');
    if (typeof initVars === 'function') {
      initVars();
    }
  } catch (error) {
    console.warn('Warning: Could not initialize vars:', error.message);
  }
};

function findProjectRoot(): string {
  if (process.env.PLAYQ_PROJECT_ROOT) {
    return process.env.PLAYQ_PROJECT_ROOT;
  }
  
  let currentDir = process.cwd();
  while (currentDir !== path.dirname(currentDir)) {
    if (fs.existsSync(path.join(currentDir, 'package.json'))) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  
  return process.cwd();
}
```

---

## 2. Implementing Key Components

### 2.1 Variable Management Implementation

**Key Functions to Implement**:

1. **getValue**: Retrieve variable value
2. **setValue**: Store variable value
3. **replaceVariables**: Replace placeholders in strings
4. **flattenConfig**: Flatten nested objects
5. **initVars**: Initialize variable system

**Implementation Pattern**:
```typescript
const storedVars: Record<string, string> = {};

function getValue(key: string, ifEmpty?: boolean): string {
  if (key.startsWith("env.")) {
    return process.env[key.slice(4)] || (ifEmpty ? "" : key);
  }
  return storedVars[key] || (ifEmpty ? "" : key);
}

function setValue(key: string, value: string): void {
  storedVars[key] = value;
  if (key.startsWith("var.static.")) {
    updateVarStaticJson(key.slice(11), value);
  }
}

function replaceVariables(input: string): string {
  return input.replace(/\#\{([^}]+)\}/g, (_, varName) => {
    return getValue(varName);
  });
}
```

### 2.2 Locator Resolver Implementation

**Core Logic**:
```typescript
export async function webLocResolver(
  type: string,
  selector: string,
  page: Page,
  overridePattern?: string,
  timeout?: number
): Promise<Locator> {
  // 1. Check Playwright-prefixed selectors
  if (selector.startsWith("xpath=") || selector.startsWith("css=")) {
    return page.locator(selector.replace(/^(xpath|css)=/, ""));
  }
  
  // 2. Check direct XPath/CSS
  if (selector.startsWith("//") || selector.includes(">")) {
    return page.locator(selector);
  }
  
  // 3. Check resource locators
  if (selector.startsWith("loc.json.")) {
    const [, , fileName, pageName, fieldName] = selector.split(".");
    const jsonLocatorMap = await import(`@resources/locators/loc-json/${fileName}.json`);
    return page.locator(jsonLocatorMap[pageName][fieldName]);
  }
  
  if (selector.startsWith("loc.ts.")) {
    const [, , fileName, pageName, fieldName] = selector.split(".");
    const globalLoc = (globalThis as any).loc;
    return globalLoc[fileName][pageName][fieldName](page);
  }
  
  // 4. Check SmartAI
  if (isSmartAiEnabled) {
    return await engines.smartAi(page, type, selector);
  }
  
  // 5. Check PatternIQ
  if (isPatternEnabled) {
    return await engines.patternIq(page, type, selector, overridePattern, timeout);
  }
  
  // 6. Fallback
  return page.locator(selector);
}
```

### 2.3 PatternIQ Engine Implementation

**Core Algorithm**:
```typescript
export async function patternIq(
  page: Page,
  argType: string,
  argField: string,
  argOverridePattern?: string,
  argTimeout?: number
): Promise<Locator> {
  // 1. Parse pattern syntax
  const pattern = /^(?:{{([^:}]+)(?:::(.+?))?}}\s*)?(?:{([^:}]+)(?:::(.+?))?}\s*)?(.+?)(?:\[(\d+)\])?$/;
  const match = argField.match(pattern);
  
  const locationName = match[1] || "";
  const locationValue = match[2] || "";
  const sectionName = match[3] || "";
  const sectionValue = match[4] || "";
  const fieldName = match[5] || "";
  const instance = match[6] || "1";
  
  // 2. Set auto variables
  vars.setValue("loc.auto.fieldName", fieldName);
  vars.setValue("loc.auto.fieldInstance", instance);
  vars.setValue("loc.auto.location.name", locationName);
  vars.setValue("loc.auto.location.value", locationValue);
  vars.setValue("loc.auto.section.name", sectionName);
  vars.setValue("loc.auto.section.value", sectionValue);
  
  // 3. Get locator candidates
  const patternConfig = argOverridePattern || vars.getConfigValue("patternIq.config");
  const fieldLocators = vars.getValue(`pattern.${patternConfig}.fields.${argType}`).split(";");
  const locationLocator = locationName ? vars.getValue(`pattern.${patternConfig}.locations.${locationName}`) : null;
  const sectionLocator = sectionName ? vars.getValue(`pattern.${patternConfig}.sections.${sectionName}`) : null;
  
  // 4. Try each locator candidate
  const timeout = argTimeout || 30000;
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    for (const locator of fieldLocators) {
      const resolvedLocator = vars.replaceVariables(locator);
      const chainedLocator = [locationLocator, sectionLocator, resolvedLocator]
        .filter(Boolean)
        .join(" >> ");
      
      try {
        const element = page.locator(chainedLocator);
        if (await element.isVisible()) {
          return element;
        }
      } catch (error) {
        continue;
      }
    }
    
    // Scroll and retry
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(2000);
  }
  
  throw new Error(`Timeout: No valid locator found for ${argField}`);
}
```

### 2.4 Step Group Generator Implementation

**Core Logic**:
```typescript
export function generateStepGroups(options: { force?: boolean } = {}) {
  const stepGroupDir = path.resolve('test/step_group');
  const outputFilePath = path.resolve('test/steps/_step_group/stepGroup_steps.ts');
  const cacheFilePath = path.resolve('_Temp/.cache/stepGroupMeta.json');
  
  // 1. Load cache
  const cache = loadCache(cacheFilePath);
  
  // 2. Get step group files
  const files = fs.readdirSync(stepGroupDir)
    .filter(f => f.endsWith('.feature'))
    .map(file => ({
      file,
      fullPath: path.join(stepGroupDir, file),
      mtimeMs: fs.statSync(path.join(stepGroupDir, file)).mtimeMs
    }));
  
  // 3. Check if regeneration needed
  if (!options.force && !needsRegeneration(files, cache)) {
    console.log('⏩ Step groups up-to-date');
    return;
  }
  
  // 4. Extract step groups
  const allGroups: StepGroup[] = [];
  for (const { file, fullPath } of files) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const groups = extractStepGroups(content, file);
    allGroups.push(...groups);
  }
  
  // 5. Generate step definitions
  const output = generateStepDefinitions(allGroups);
  fs.writeFileSync(outputFilePath, output, 'utf8');
  
  // 6. Generate cache
  const stepGroupCache = {};
  allGroups.forEach(group => {
    stepGroupCache[group.name] = {
      description: group.description,
      steps: group.steps
    };
  });
  fs.writeFileSync(
    path.resolve('_Temp/.cache/stepGroup_cache.json'),
    JSON.stringify(stepGroupCache, null, 2),
    'utf8'
  );
  
  // 7. Update cache metadata
  saveCache(cacheFilePath, files, outputFilePath);
}

function extractStepGroups(content: string, filename: string): StepGroup[] {
  const stepGroupTagRegex = /^@StepGroup:([a-zA-Z0-9_]+)\.sg$/;
  const scenarioRegex = /^Scenario:\s*(.*)$/;
  
  const lines = content.split(/\r?\n/);
  const stepGroups: StepGroup[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const tagMatch = line.match(stepGroupTagRegex);
    
    if (tagMatch) {
      const groupName = `${tagMatch[1]}.sg`;
      
      // Find scenario
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === '') j++;
      
      const descLine = lines[j].trim();
      const descMatch = descLine.match(scenarioRegex);
      
      if (descMatch) {
        const description = descMatch[1].trim();
        const steps: string[] = [];
        
        // Collect steps
        let k = j + 1;
        while (k < lines.length && !lines[k].trim().startsWith('@')) {
          const stepLine = lines[k];
          if (stepLine.trim().startsWith('*') || 
              stepLine.trim().startsWith('Given') ||
              stepLine.trim().startsWith('When') ||
              stepLine.trim().startsWith('Then')) {
            steps.push(stepLine);
          }
          k++;
        }
        
        stepGroups.push({ name: groupName, description, steps });
        i = k - 1;
      }
    }
  }
  
  return stepGroups;
}
```

---

## 3. Testing Patterns

### 3.1 Playwright Test Pattern

```typescript
import { test } from '@setup/playwrightTest';
import { web, vars } from '@playq';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await web.openBrowser(page, vars.getValue('config.baseUrl'));
  });
  
  test('Create new user', async ({ page }) => {
    await web.fill(page, "Username", "newuser");
    await web.fill(page, "Email", "newuser@example.com");
    await web.clickButton(page, "Create User");
    await web.waitForHeader(page, "h1", "User Created");
  });
});
```

### 3.2 Cucumber Test Pattern

**Feature File**:
```gherkin
@user_management
Feature: User Management

  Background:
    Given Web: Open Browser -url: "#{config.baseUrl}" -options: ""
    
  @create_user
  Scenario: Create new user
    When Web: Fill -field: "Username" -value: "newuser" -options: ""
    And Web: Fill -field: "Email" -value: "newuser@example.com" -options: ""
    And Web: Click Button -field: "Create User" -options: ""
    Then Web: Wait for Header -header: "h1" -text: "User Created" -options: ""
```

**Step Definition**:
```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { web, webFixture } from '@playq';

Given('Web: Open Browser -url: {string} -options: {string}',
  async function(url: string, options: string) {
    const page = webFixture.getCurrentPage();
    await web.openBrowser(page, url, options);
  }
);
```

---

## 4. Best Practices

### 4.1 Locator Strategy

1. **Prefer Semantic Locators**: Use role, label, text over CSS/XPath
2. **Use Resource Locators**: Centralize locators in JSON/TS files
3. **Pattern for Dynamic Content**: Use PatternIQ for flexible matching
4. **Avoid Brittle Selectors**: Don't rely on implementation details

### 4.2 Test Organization

1. **Feature-Based Structure**: Group tests by feature/module
2. **Reusable Step Groups**: Extract common workflows
3. **Data-Driven Tests**: Use Examples with data files
4. **Tag Strategy**: Consistent tagging for filtering

### 4.3 Variable Management

1. **Environment Separation**: Use .env files per environment
2. **Sensitive Data**: Use encrypted variables for credentials
3. **Configuration Hierarchy**: config > env > static variables
4. **Variable Naming**: Use descriptive, hierarchical names

### 4.4 Error Handling

1. **Meaningful Messages**: Include context in error messages
2. **Screenshots on Failure**: Automatic screenshot capture
3. **Retry Logic**: Configure retries for flaky tests
4. **Logging**: Comprehensive logging at key points

