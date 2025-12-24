# PlayQ Framework Documentation
## Part 4: Cucumber BDD System & Step Groups

---

## 1. Cucumber Configuration

### 1.1 Cucumber Setup

**File**: `cucumber.js`

```javascript
module.exports = {
  default: {
    formatOptions: {
      snippetInterface: "async-await"
    },
    paths: [
      "./_TEMP/execution/**/*.feature"  // Preprocessed features
    ],
    dryRun: false,
    require: [
      "ts-node/register",
      "tsconfig-paths/register",
      "./src/global.ts",              // Global exports
      "./test/steps/**/*.ts",         // Step definitions
      "./extend/addons/**/*.ts",      // Addon steps
      "./src/helper/actions/*.ts",    // Action steps
      "config/cucumber/hooks.ts"      // Cucumber hooks
    ],
    requireModule: [
      "ts-node/register",
      "tsconfig-paths/register"
    ],
    format: [
      "progress-bar",
      "html:test-results/cucumber-report.html",
      "json:test-results/cucumber-report.json",
      "rerun:@rerun.txt"
    ],
    parallel: 1
  }
}
```

### 1.2 Cucumber Hooks

**File**: `config/cucumber/hooks.ts`

**Hook Types**:
- `BeforeAll`: Global setup
- `Before`: Scenario setup
- `After`: Scenario teardown
- `AfterAll`: Global teardown

**Example Implementation**:
```typescript
import { Before, After, BeforeAll, AfterAll, Status } from '@cucumber/cucumber';
import { webFixture } from '@playq';

BeforeAll(async function() {
  console.log('🚀 Starting test suite');
  await webFixture.launchBrowser();
});

Before(async function(scenario) {
  console.log(`📝 Starting scenario: ${scenario.pickle.name}`);
  webFixture.setWorld(this);
  
  const context = await webFixture.newContext();
  const page = await webFixture.newPage();
});

After(async function(scenario) {
  if (scenario.result.status === Status.FAILED) {
    const page = webFixture.getCurrentPage();
    const screenshot = await page.screenshot();
    await this.attach(screenshot, 'image/png');
  }
  
  await webFixture.closeContext();
});

AfterAll(async function() {
  await webFixture.closeAll();
  console.log('✅ Test suite completed');
});
```

---

## 2. Feature File Preprocessing

### 2.1 Preprocessing Pipeline

**File**: `src/exec/preProcessEntry.ts`

**Process Flow**:
1. Generate step groups (`sgGenerator.ts`)
2. Find all feature files in `test/features/`
3. For each feature file:
   - Check cache validity
   - Preprocess if needed
   - Write to `_TEMP/execution/`
4. Update feature cache metadata

**Preprocessing Steps** (`featureFilePreProcess.ts`):
1. **Variable Replacement**: Replace `#{variable}` placeholders
2. **Examples Processing**: Inject data from Excel/CSV files
3. **Step Group Expansion**: Expand step group references
4. **SmartData Processing**: Process `[[SMART:...]]` directives
5. **Tag Injection**: Add scenario-level tags

### 2.2 Variable Replacement

```typescript
function replaceVariablesInString(content: string): string {
  return content.replace(/\${env\.([\w]+)}/g, (_, key) => {
    return process.env[key] || "";
  });
}
```

**Example**:
```gherkin
Feature: Login
  Scenario: User login
    Given Web: Open Browser -url: "#{config.baseUrl}" -options: ""
    When Web: Fill -field: "Username" -value: "#{var.static.testUser}" -options: ""
```

### 2.3 Data File Injection

**Syntax**:
```gherkin
Scenario Outline: Data-driven test
  Given Web: Fill -field: "Name" -value: "<name>" -options: ""
  
  Examples: {dataFile: "users.xlsx", sheetName: "Sheet1", filter: "status == 'active'"}
```

**Processing** (`processExamplesWithFilter`):
1. Parse Examples block JSON
2. Load data file (Excel/CSV)
3. Apply filter expression
4. Generate Examples table

**Supported Formats**:
- `.xlsx`: Excel files (using `@e965/xlsx`)
- `.csv`: CSV files

**Filter Syntax**:
```javascript
// JavaScript expression evaluated per row
"age > 18 && country == 'US'"
"status == 'active' || priority == 'high'"
```

---

## 3. Step Groups

### 3.1 Step Group Concept

**Purpose**: Reusable sequences of steps that can be referenced across multiple scenarios

**Benefits**:
- Reduce duplication
- Maintain consistency
- Simplify complex workflows
- Enable modular test design

### 3.2 Step Group Definition

**File**: `test/step_group/*.feature`

**Syntax**:
```gherkin
@StepGroup
Feature: Step Group Collection

@StepGroup:login_user.sg
Scenario: Login User
  * Web: Open Browser -url: "#{config.baseUrl}" -options: ""
  * Web: Fill -field: "Username" -value: "<username>" -options: ""
  * Web: Fill -field: "Password" -value: "<password>" -options: ""
  * Web: Click Button -field: "Login" -options: ""
  * Web: Wait for Header -header: "h1" -text: "Dashboard" -options: ""

@StepGroup:logout_user.sg
Scenario: Logout User
  * Web: Click Button -field: "User Menu" -options: ""
  * Web: Click Link -field: "Logout" -options: ""
```

**Naming Rules**:
- Tag format: `@StepGroup:<name>.sg`
- Name must be alphanumeric with underscores only
- Must have `@StepGroup` tag before Feature
- Only `Scenario` allowed (no `Scenario Outline`)

### 3.3 Step Group Generation

**File**: `src/exec/sgGenerator.ts`

**Process**:
1. Scan `test/step_group/*.feature` files
2. Extract step groups using regex
3. Generate step definitions in `test/steps/_step_group/stepGroup_steps.ts`
4. Create cache file `_Temp/.cache/stepGroup_cache.json`
5. Update cache metadata

**Generated Step Definition**:
```typescript
Given('Step Group: -login_user.sg- -Login User-', async function () {
  /*StepGroup:login_user.sg
  * Web: Open Browser -url: "#{config.baseUrl}" -options: ""
  * Web: Fill -field: "Username" -value: "<username>" -options: ""
  * Web: Fill -field: "Password" -value: "<password>" -options: ""
  * Web: Click Button -field: "Login" -options: ""
  */
});
```

**Cache Structure** (`stepGroup_cache.json`):
```json
{
  "login_user.sg": {
    "description": "Login User",
    "steps": [
      "* Web: Open Browser -url: \"#{config.baseUrl}\" -options: \"\"",
      "* Web: Fill -field: \"Username\" -value: \"<username>\" -options: \"\"",
      "* Web: Fill -field: \"Password\" -value: \"<password>\" -options: \"\""
    ]
  }
}
```

### 3.4 Step Group Usage

**In Feature Files**:
```gherkin
Feature: User Management

Scenario: Create new user
  * Step Group: -login_user.sg- -Login User-
  * Web: Click Button -field: "Add User" -options: ""
  * Web: Fill -field: "New Username" -value: "newuser" -options: ""
  * Step Group: -logout_user.sg- -Logout User-
```

**Expansion During Preprocessing**:
```gherkin
Feature: User Management

Scenario: Create new user
  * - Step Group - START: "login_user.sg" Desc: "Login User"
  * Web: Open Browser -url: "#{config.baseUrl}" -options: ""
  * Web: Fill -field: "Username" -value: "<username>" -options: ""
  * Web: Fill -field: "Password" -value: "<password>" -options: ""
  * Web: Click Button -field: "Login" -options: ""
  * - Step Group - END: "login_user.sg"
  * Web: Click Button -field: "Add User" -options: ""
  * Web: Fill -field: "New Username" -value: "newuser" -options: ""
  * - Step Group - START: "logout_user.sg" Desc: "Logout User"
  * Web: Click Button -field: "User Menu" -options: ""
  * Web: Click Link -field: "Logout" -options: ""
  * - Step Group - END: "logout_user.sg"
```

### 3.5 Step Group Caching

**Cache Validation**:
- Tracks file modification times
- Regenerates only when files change
- Validates cache integrity using SHA-256 hash

**Force Regeneration**:
```bash
npm run pretest -- --force
```

---

## 4. Cucumber Step Definitions

### 4.1 Step Definition Pattern

**File**: `test/steps/*.ts`

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { web, webFixture } from '@playq';

Given('Web: Open Browser -url: {string} -options: {string}', 
  async function(url: string, options: string) {
    const page = webFixture.getCurrentPage();
    await web.openBrowser(page, url, options);
  }
);

When('Web: Fill -field: {string} -value: {string} -options: {string}',
  async function(field: string, value: string, options: string) {
    const page = webFixture.getCurrentPage();
    await web.fill(page, field, value, options);
  }
);

Then('Web: Verify Page Title -title: {string}',
  async function(expectedTitle: string) {
    const page = webFixture.getCurrentPage();
    const actualTitle = await page.title();
    expect(actualTitle).toBe(expectedTitle);
  }
);
```

### 4.2 Parameter Types

**Custom Parameter Types** (`config/cucumber/parameterHook.ts`):
```typescript
import { defineParameterType } from '@cucumber/cucumber';

defineParameterType({
  name: 'param',
  regexp: /"([^"]*)"/,
  transformer: (s) => s
});
```

**Usage**:
```gherkin
Given Web: Fill -field: {param} -value: {param} -options: {param}
```

### 4.3 World Context

**Setting World**:
```typescript
Before(async function() {
  webFixture.setWorld(this);
});
```

**Using World**:
```typescript
const world = webFixture.getWorld();
await world.attach(screenshot, 'image/png');
await world.attach('Log message', 'text/plain');
```

---

## 5. Feature File Best Practices

### 5.1 Feature Structure

```gherkin
@tag1 @tag2
Feature: Feature Name
  Background description (optional)

  Background:
    Given Common setup step
    
  @scenario_tag
  Scenario: Scenario Name
    Given precondition
    When action
    Then verification
    
  @scenario_outline_tag
  Scenario Outline: Parameterized Scenario
    Given step with "<parameter>"
    When action with "<value>"
    
    Examples:
      | parameter | value |
      | test1     | val1  |
      | test2     | val2  |
```

### 5.2 Tag Strategy

**Tag Types**:
- `@smoke`: Smoke tests
- `@regression`: Regression suite
- `@wip`: Work in progress
- `@skip`: Skip execution
- `@priority:high`: Priority markers
- `@module:login`: Module grouping

**Tag Execution**:
```bash
PLAYQ_TAGS="@smoke and not @skip" npm test
PLAYQ_TAGS="@regression or @priority:high" npm test
```

