# Framework Migration Guide: Playwright with TypeScript

## Overview

This guide provides detailed instructions for implementing the pattern-based locator system in Playwright with TypeScript. It maps Java/QAF concepts to Playwright equivalents and provides code examples for all key components.

## Architecture Mapping

### Java/QAF to Playwright/TypeScript Equivalents

| Java/QAF Component | Playwright/TypeScript Equivalent | Purpose |
|-------------------|----------------------------------|---------|
| `patternLoc.java` | `PatternLocator.ts` | Pattern resolution and locator generation |
| `web.java` | `WebActions.ts` | Composite actions and test steps |
| `BrowserGlobal.java` | `BrowserActions.ts` | Atomic browser actions |
| `QAF Configuration Bundle` | `ConfigManager.ts` + In-memory Map | Configuration and cache storage |
| `locPattern.properties` | `patterns.json` or `patterns.ts` | Pattern template configuration |
| `application.properties` | `config.json` or environment variables | System configuration |
| `@QAFTestStep` annotations | Cucumber step definitions | Test step integration |
| `getBundle().setProperty()` | `ConfigManager.set()` | Store runtime values |
| `getBundle().getPropertyValue()` | `ConfigManager.get()` | Retrieve runtime values |
| Selenium WebDriver | Playwright Page/Locator | Browser automation |

## Implementation Checklist

- [ ] Create configuration management system
- [ ] Implement pattern template storage
- [ ] Build pattern resolution layer
- [ ] Create atomic action layer
- [ ] Implement composite action layer
- [ ] Add page context management
- [ ] Implement caching mechanism
- [ ] Create test step integration
- [ ] Add error handling and logging
- [ ] Write tests and documentation

## Component Implementation

### 1. Configuration Manager

**Purpose**: Replace QAF Configuration Bundle with TypeScript equivalent

**File**: `src/core/ConfigManager.ts`

```typescript
/**
 * Configuration Manager - Replaces QAF Configuration Bundle
 * Stores runtime configuration, cached locators, and placeholder values
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: Map<string, any>;
  private patternCode: string;

  private constructor() {
    this.config = new Map();
    this.patternCode = process.env.PATTERN_CODE || 'loc.playwright';
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Set a configuration value
   * Equivalent to: getBundle().setProperty(key, value)
   */
  public set(key: string, value: any): void {
    this.config.set(key, value);
  }

  /**
   * Get a configuration value
   * Equivalent to: getBundle().getPropertyValue(key)
   */
  public get(key: string): any {
    return this.config.get(key) || key;
  }

  /**
   * Check if a key exists
   */
  public has(key: string): boolean {
    return this.config.has(key);
  }

  /**
   * Clear a configuration value
   * Equivalent to: getBundle().clearProperty(key)
   */
  public clear(key: string): void {
    this.config.delete(key);
  }

  /**
   * Clear all configuration
   */
  public clearAll(): void {
    this.config.clear();
  }

  /**
   * Get pattern code
   * Equivalent to: getPatternCode()
   */
  public getPatternCode(): string {
    return this.patternCode;
  }

  /**
   * Set pattern code
   */
  public setPatternCode(code: string): void {
    this.patternCode = code;
  }

  /**
   * Get page name
   */
  public getPageName(): string {
    return this.get('loc.auto.pageName') || '';
  }

  /**
   * Set page name
   */
  public setPageName(pageName: string): void {
    this.set('loc.auto.pageName', pageName);
  }
}
```

### 2. Pattern Configuration

**Purpose**: Store pattern templates (replaces locPattern.properties)

**File**: `src/config/patterns.ts`

```typescript
/**
 * Pattern Templates Configuration
 * Replaces locPattern.properties
 */
export interface PatternConfig {
  [key: string]: string[];
}

export const patterns: PatternConfig = {
  // Button patterns
  'loc.playwright.pattern.button': [
    "xpath=//button[contains(text(),'${loc.auto.fieldName}')]",
    "xpath=//span[text()='${loc.auto.fieldName}']",
    "xpath=//button[@aria-label='${loc.auto.fieldName}']",
    "xpath=//button[@label='${loc.auto.fieldName}']"
  ],

  // Input patterns
  'loc.playwright.pattern.input': [
    "xpath=//input[@placeholder='${loc.auto.fieldName}']",
    "xpath=//label[text()='${loc.auto.fieldName}']/following::input[1]",
    "xpath=//input[@id='${loc.auto.fieldName}']",
    "xpath=//input[@name='${loc.auto.fieldName}']"
  ],

  // Select/Dropdown patterns
  'loc.playwright.pattern.select': [
    "xpath=//label[text()='${loc.auto.fieldName}']/following::select[1]",
    "xpath=//select[@id='${loc.auto.fieldName}']",
    "xpath=//select[@name='${loc.auto.fieldName}']"
  ],

  // Checkbox patterns
  'loc.playwright.pattern.checkbox': [
    "xpath=//label[text()='${loc.auto.fieldName}']/following::input[@type='checkbox']",
    "xpath=//input[@type='checkbox' and @name='${loc.auto.fieldName}']"
  ],

  // Radio button patterns
  'loc.playwright.pattern.radioButton': [
    "xpath=//label[text()='${loc.auto.fieldName}']/following::input[@value='${loc.auto.fieldValue}']",
    "xpath=//input[@name='${loc.auto.fieldName}' and @value='${loc.auto.fieldValue}']"
  ],

  // Text patterns
  'loc.playwright.pattern.text': [
    "xpath=//*[text()='${loc.auto.fieldName}']",
    "xpath=//*[contains(text(),'${loc.auto.fieldName}')]"
  ],

  // Link patterns
  'loc.playwright.pattern.link': [
    "xpath=//a[text()='${loc.auto.fieldName}']",
    "xpath=//a[contains(text(),'${loc.auto.fieldName}')]"
  ]
};

/**
 * Get pattern template by key
 */
export function getPattern(key: string): string[] | undefined {
  return patterns[key];
}
```

### 3. Pattern Locator (Core Resolution Layer)

**Purpose**: Replace patternLoc.java with TypeScript equivalent

**File**: `src/core/PatternLocator.ts`

```typescript
import { ConfigManager } from './ConfigManager';
import { getPattern } from '../config/patterns';

/**
 * Pattern Locator - Core pattern resolution layer
 * Replaces patternLoc.java
 */
export class PatternLocator {
  private config: ConfigManager;

  constructor() {
    this.config = ConfigManager.getInstance();
  }

  /**
   * Convert string to camelCase
   * Equivalent to: CaseUtils.toCamelCase()
   */
  private toCamelCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .trim()
      .split(' ')
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');
  }

  /**
   * Extract field name from instance notation
   * Equivalent to: fieldNameCheck()
   */
  private fieldNameCheck(fieldName: string): string {
    if (fieldName.includes('[') && fieldName.endsWith(']')) {
      return fieldName.split('[')[0].trim();
    }
    return fieldName.trim();
  }

  /**
   * Extract instance number from field name
   * Equivalent to: fieldInstanceCheck()
   */
  private fieldInstanceCheck(fieldName: string): string {
    if (fieldName.includes('[') && fieldName.endsWith(']')) {
      return fieldName.split('[')[1].replace(']', '');
    }
    return '1';
  }

  /**
   * Check if locator exists in cache
   * Equivalent to: checkLoc()
   */
  private checkLoc(pageName: string, fieldType: string, fieldName: string): string {
    // Clear previous placeholder values
    this.config.set('loc.auto.fieldName', '');
    this.config.set('loc.auto.fieldInstance', '');
    this.config.set('loc.auto.fieldValue', '');

    const patternCode = this.config.getPatternCode();
    
    // Generate locator key
    const locName = `${patternCode}.${this.toCamelCase(pageName)}.${this.toCamelCase(fieldType)}.${this.toCamelCase(fieldName)}`;
    
    // Check if locator exists in cache
    const locVal = this.config.get(locName);
    
    if (locVal === locName || !locVal || locVal.length < 5) {
      // Not in cache - mark for generation
      return `auto.${locName}`;
    }
    
    return locName;
  }

  /**
   * Generate locator from pattern template
   * Equivalent to: generateLoc()
   */
  private generateLoc(locatorKey: string, fieldName: string, fieldType: string): void {
    const patternCode = this.config.getPatternCode();

    // Set field name and instance
    this.config.set('loc.auto.fieldName', this.fieldNameCheck(fieldName));
    this.config.set('loc.auto.fieldInstance', this.fieldInstanceCheck(fieldName));

    // Get pattern template
    const patternKey = `${patternCode}.pattern.${fieldType}`;
    const patternTemplates = getPattern(patternKey);

    if (!patternTemplates || patternTemplates.length === 0) {
      console.error(`[ERROR] Pattern '${patternKey}' not available`);
      return;
    }

    // Substitute placeholders in patterns
    const substitutedPatterns = patternTemplates.map(pattern => 
      this.substitutePlaceholders(pattern)
    );

    // Create locator JSON
    const locatorJson = {
      locator: substitutedPatterns,
      desc: `${fieldName} : [${fieldType}] Field`
    };

    // Store in cache
    this.config.set(locatorKey, JSON.stringify(locatorJson));

    // Log if enabled
    if (process.env.PATTERN_LOG === 'true') {
      console.log(`==== AUTO GENERATED: LOCATOR (Pattern) ====> ${locatorKey}=${JSON.stringify(locatorJson)}`);
    }
  }

  /**
   * Substitute placeholders in pattern template
   */
  private substitutePlaceholders(pattern: string): string {
    let result = pattern;
    
    // Replace all placeholders
    const placeholders = {
      '${loc.auto.fieldName}': this.config.get('loc.auto.fieldName'),
      '${loc.auto.fieldInstance}': this.config.get('loc.auto.fieldInstance'),
      '${loc.auto.fieldValue}': this.config.get('loc.auto.fieldValue'),
      '${loc.auto.pageName}': this.config.get('loc.auto.pageName')
    };

    for (const [placeholder, value] of Object.entries(placeholders)) {
      result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value || '');
    }

    return result;
  }

  /**
   * Button pattern method
   * Equivalent to: patternLoc.button()
   */
  public async button(page: string, fieldName: string): Promise<string> {
    const fieldType = 'button';
    const locator = this.checkLoc(page, fieldType, fieldName);
    
    if (locator.includes('auto.')) {
      this.generateLoc(locator, fieldName, fieldType);
    }
    
    return locator;
  }

  /**
   * Input pattern method
   * Equivalent to: patternLoc.input()
   */
  public async input(page: string, fieldName: string): Promise<string> {
    const fieldType = 'input';
    const locator = this.checkLoc(page, fieldType, fieldName);
    
    if (locator.includes('auto.')) {
      this.generateLoc(locator, fieldName, fieldType);
    }
    
    return locator;
  }

  /**
   * Select pattern method
   * Equivalent to: patternLoc.select()
   */
  public async select(page: string, fieldName: string): Promise<string> {
    const fieldType = 'select';
    const locator = this.checkLoc(page, fieldType, fieldName);
    
    if (locator.includes('auto.')) {
      this.generateLoc(locator, fieldName, fieldType);
    }
    
    return locator;
  }

  /**
   * Checkbox pattern method
   * Equivalent to: patternLoc.checkbox()
   */
  public async checkbox(page: string, fieldName: string): Promise<string> {
    const fieldType = 'checkbox';
    const locator = this.checkLoc(page, fieldType, fieldName);
    
    if (locator.includes('auto.')) {
      this.generateLoc(locator, fieldName, fieldType);
    }
    
    return locator;
  }

  /**
   * Radio button pattern method (with value)
   * Equivalent to: patternLoc.radioButton()
   */
  public async radioButton(page: string, fieldName: string, fieldValue: string): Promise<string> {
    const fieldType = 'radioButton';
    const locator = this.checkLoc(page, fieldType, fieldName);
    
    if (locator.includes('auto.')) {
      this.config.set('loc.auto.fieldValue', fieldValue);
      this.generateLoc(locator, fieldName, fieldType);
    }
    
    return locator;
  }

  /**
   * Text pattern method
   * Equivalent to: patternLoc.text()
   */
  public async text(page: string, fieldName: string): Promise<string> {
    const fieldType = 'text';
    const locator = this.checkLoc(page, fieldType, fieldName);
    
    if (locator.includes('auto.')) {
      this.generateLoc(locator, fieldName, fieldType);
    }
    
    return locator;
  }

  /**
   * Link pattern method
   * Equivalent to: patternLoc.link()
   */
  public async link(page: string, fieldName: string): Promise<string> {
    const fieldType = 'link';
    const locator = this.checkLoc(page, fieldType, fieldName);
    
    if (locator.includes('auto.')) {
      this.generateLoc(locator, fieldName, fieldType);
    }
    
    return locator;
  }
}
```


### 4. Browser Actions (Atomic Action Layer)

**Purpose**: Replace BrowserGlobal.java with Playwright atomic actions

**File**: `src/core/BrowserActions.ts`

```typescript
import { Page, Locator } from '@playwright/test';
import { ConfigManager } from './ConfigManager';

/**
 * Browser Actions - Atomic action layer
 * Replaces BrowserGlobal.java
 */
export class BrowserActions {
  private page: Page;
  private config: ConfigManager;

  constructor(page: Page) {
    this.page = page;
    this.config = ConfigManager.getInstance();
  }

  /**
   * Resolve locator from cache
   * Parses JSON locator and returns Playwright locator
   */
  private async resolveLocator(locatorKey: string): Promise<Locator> {
    const locatorJson = this.config.get(locatorKey);
    
    if (locatorJson === locatorKey) {
      throw new Error(`Locator '${locatorKey}' not found in cache`);
    }

    let locatorData: { locator: string[], desc: string };
    
    try {
      locatorData = JSON.parse(locatorJson);
    } catch (e) {
      throw new Error(`Invalid locator JSON for '${locatorKey}'`);
    }

    // Try each pattern in sequence (fallback mechanism)
    for (const pattern of locatorData.locator) {
      try {
        const selector = pattern.replace('xpath=', '');
        const locator = this.page.locator(selector);
        
        // Check if element exists
        const count = await locator.count();
        if (count > 0) {
          return locator.first();
        }
      } catch (e) {
        // Try next pattern
        continue;
      }
    }

    throw new Error(`Element not found with any pattern for '${locatorKey}'`);
  }

  /**
   * Click on element
   * Equivalent to: iClickOn()
   */
  public async click(locatorKey: string): Promise<void> {
    const locator = await this.resolveLocator(locatorKey);
    await locator.click();
  }

  /**
   * Input text into element
   * Equivalent to: iInputInTo()
   */
  public async input(text: string, locatorKey: string): Promise<void> {
    const locator = await this.resolveLocator(locatorKey);
    await locator.fill(text);
  }

  /**
   * Clear and fill input
   * Equivalent to: iFillInTo()
   */
  public async fill(text: string, locatorKey: string): Promise<void> {
    const locator = await this.resolveLocator(locatorKey);
    await locator.clear();
    await locator.fill(text);
  }

  /**
   * Select dropdown by text
   * Equivalent to: iSelectDropdownWithText()
   */
  public async selectByText(locatorKey: string, text: string): Promise<void> {
    const locator = await this.resolveLocator(locatorKey);
    await locator.selectOption({ label: text });
  }

  /**
   * Wait until element is present
   * Equivalent to: iWaitUntilElementPresent()
   */
  public async waitUntilPresent(locatorKey: string, timeout: number = 30000): Promise<void> {
    const locator = await this.resolveLocator(locatorKey);
    await locator.waitFor({ state: 'attached', timeout });
  }

  /**
   * Wait until element is visible
   * Equivalent to: iWaitUntilElementVisible()
   */
  public async waitUntilVisible(locatorKey: string, timeout: number = 30000): Promise<void> {
    const locator = await this.resolveLocator(locatorKey);
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait until element is enabled
   * Equivalent to: iWaitUntilElementEnabled()
   */
  public async waitUntilEnabled(locatorKey: string, timeout: number = 30000): Promise<void> {
    const locator = await this.resolveLocator(locatorKey);
    await locator.waitFor({ state: 'visible', timeout });
    await expect(locator).toBeEnabled({ timeout });
  }

  /**
   * Scroll to element
   * Equivalent to: iScrollToAnElement()
   */
  public async scrollToElement(locatorKey: string): Promise<void> {
    const locator = await this.resolveLocator(locatorKey);
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Verify element text
   * Equivalent to: iAssertElementText()
   */
  public async verifyText(locatorKey: string, expectedText: string): Promise<void> {
    const locator = await this.resolveLocator(locatorKey);
    await expect(locator).toHaveText(expectedText);
  }

  /**
   * Verify element contains text
   * Equivalent to: iAssertElementContainsText()
   */
  public async verifyContainsText(locatorKey: string, expectedText: string): Promise<void> {
    const locator = await this.resolveLocator(locatorKey);
    await expect(locator).toContainText(expectedText);
  }

  /**
   * Check if element is visible
   * Equivalent to: iIsElementVisible()
   */
  public async isVisible(locatorKey: string): Promise<boolean> {
    try {
      const locator = await this.resolveLocator(locatorKey);
      return await locator.isVisible();
    } catch (e) {
      return false;
    }
  }

  /**
   * Get element text
   * Equivalent to: iGetTextFrom()
   */
  public async getText(locatorKey: string): Promise<string> {
    const locator = await this.resolveLocator(locatorKey);
    return await locator.textContent() || '';
  }

  /**
   * Click with JavaScript executor (fallback)
   * Equivalent to: JavaScript executor click
   */
  public async clickWithJS(locatorKey: string): Promise<void> {
    const locator = await this.resolveLocator(locatorKey);
    await locator.evaluate((element: HTMLElement) => element.click());
  }

  /**
   * Take screenshot
   * Equivalent to: iTakeScreenshot()
   */
  public async takeScreenshot(filename: string): Promise<void> {
    await this.page.screenshot({ path: filename, fullPage: true });
  }
}
```

### 5. Web Actions (Composite Action Layer)

**Purpose**: Replace web.java with Playwright composite actions

**File**: `src/actions/WebActions.ts`

```typescript
import { Page } from '@playwright/test';
import { PatternLocator } from '../core/PatternLocator';
import { BrowserActions } from '../core/BrowserActions';
import { ConfigManager } from '../core/ConfigManager';

/**
 * Web Actions - Composite action layer
 * Replaces web.java
 */
export class WebActions {
  private page: Page;
  private patternLoc: PatternLocator;
  private browser: BrowserActions;
  private config: ConfigManager;

  constructor(page: Page) {
    this.page = page;
    this.patternLoc = new PatternLocator();
    this.browser = new BrowserActions(page);
    this.config = ConfigManager.getInstance();
  }

  /**
   * Set page name for context
   * Equivalent to: web.setPageName()
   */
  public setPageName(pageName: string): void {
    this.config.setPageName(pageName);
  }

  /**
   * Get current page name
   * Equivalent to: web.getPageName()
   */
  public getPageName(): string {
    return this.config.getPageName();
  }

  /**
   * Set field location (hierarchical context)
   * Equivalent to: web.setFieldLocation()
   */
  public setFieldLocation(location: string): void {
    const currentPage = this.getPageName();
    this.config.setPageName(`${currentPage}${location}`);
  }

  /**
   * Remove field location
   * Equivalent to: web.removeFieldLocation()
   */
  public removeFieldLocation(): void {
    const currentPage = this.getPageName();
    const basePage = currentPage.split('::')[0];
    this.config.setPageName(basePage);
  }

  /**
   * Click button
   * Equivalent to: web.clickButton_Web()
   */
  public async clickButton(fieldName: string): Promise<void> {
    const locator = await this.patternLoc.button(this.getPageName(), fieldName);
    await this.browser.waitUntilPresent(locator);
    await this.browser.scrollToElement(locator);
    await this.browser.waitUntilEnabled(locator);
    await this.browser.click(locator);
  }

  /**
   * Input text into field
   * Equivalent to: web.input_Web()
   */
  public async input(text: string, fieldName: string): Promise<void> {
    const locator = await this.patternLoc.input(this.getPageName(), fieldName);
    await this.browser.waitUntilPresent(locator);
    await this.browser.scrollToElement(locator);
    await this.browser.waitUntilVisible(locator);
    await this.browser.input(text, locator);
  }

  /**
   * Select dropdown by text
   * Equivalent to: web.selectDropdownByText_Web()
   */
  public async selectDropdown(text: string, fieldName: string): Promise<void> {
    const locator = await this.patternLoc.select(this.getPageName(), fieldName);
    await this.browser.waitUntilPresent(locator);
    await this.browser.scrollToElement(locator);
    await this.browser.selectByText(locator, text);
  }

  /**
   * Click checkbox
   * Equivalent to: web.clickCheckBox_Web()
   */
  public async clickCheckbox(fieldName: string): Promise<void> {
    const locator = await this.patternLoc.checkbox(this.getPageName(), fieldName);
    await this.browser.waitUntilPresent(locator);
    await this.browser.scrollToElement(locator);
    await this.browser.waitUntilVisible(locator);
    await this.browser.click(locator);
  }

  /**
   * Click radio button with value
   * Equivalent to: web.clickRadioButton_Web()
   */
  public async clickRadioButton(value: string, fieldName: string): Promise<void> {
    const locator = await this.patternLoc.radioButton(this.getPageName(), fieldName, value);
    await this.browser.waitUntilPresent(locator);
    await this.browser.scrollToElement(locator);
    await this.browser.click(locator);
  }

  /**
   * Verify text
   * Equivalent to: web.verifyText_Web()
   */
  public async verifyText(fieldName: string, expectedText: string): Promise<void> {
    const locator = await this.patternLoc.text(this.getPageName(), fieldName);
    await this.browser.waitUntilPresent(locator);
    await this.browser.scrollToElement(locator);
    await this.browser.verifyText(locator, expectedText);
  }

  /**
   * Click link
   * Equivalent to: web.clickLink_Web()
   */
  public async clickLink(fieldName: string): Promise<void> {
    const locator = await this.patternLoc.link(this.getPageName(), fieldName);
    await this.browser.waitUntilPresent(locator);
    await this.browser.scrollToElement(locator);
    await this.browser.click(locator);
  }
}
```

### 6. Cucumber Step Definitions

**Purpose**: Integrate with Cucumber/Playwright test steps

**File**: `src/steps/webSteps.ts`

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { WebActions } from '../actions/WebActions';

// Assuming page is available in world context
let webActions: WebActions;

Given('Web: Set Page Name {string}', function(pageName: string) {
  webActions = new WebActions(this.page);
  webActions.setPageName(pageName);
});

Given('Web: Set Field Location {string}', function(location: string) {
  webActions.setFieldLocation(location);
});

Given('Web: Remove Field Location', function() {
  webActions.removeFieldLocation();
});

When('Web: Click Button {string}', async function(fieldName: string) {
  await webActions.clickButton(fieldName);
});

When('Web: Input {string} into {string}', async function(text: string, fieldName: string) {
  await webActions.input(text, fieldName);
});

When('Web: Select Dropdown with text {string} in {string}', async function(text: string, fieldName: string) {
  await webActions.selectDropdown(text, fieldName);
});

When('Web: Click Checkbox {string}', async function(fieldName: string) {
  await webActions.clickCheckbox(fieldName);
});

When('Web: Click Radio Button with text {string} in {string}', async function(value: string, fieldName: string) {
  await webActions.clickRadioButton(value, fieldName);
});

When('Web: Click Link {string}', async function(fieldName: string) {
  await webActions.clickLink(fieldName);
});

Then('Web: Verify Text {string}', async function(expectedText: string) {
  await webActions.verifyText(expectedText, expectedText);
});
```

## Key Differences and Adaptations

### 1. Configuration Storage

**Java/QAF**:
```java
getBundle().setProperty("loc.auto.fieldName", "Search");
String value = getBundle().getPropertyValue("loc.auto.fieldName");
```

**Playwright/TypeScript**:
```typescript
this.config.set('loc.auto.fieldName', 'Search');
const value = this.config.get('loc.auto.fieldName');
```

### 2. Pattern Template Storage

**Java/QAF** (locPattern.properties):
```properties
loc.iExams.pattern.button = "xpath=//button[contains(text(),'${loc.auto.fieldName}')]"
```

**Playwright/TypeScript** (patterns.ts):
```typescript
export const patterns: PatternConfig = {
  'loc.playwright.pattern.button': [
    "xpath=//button[contains(text(),'${loc.auto.fieldName}')]"
  ]
};
```

### 3. Locator Resolution

**Java/QAF**:
```java
// QAF automatically resolves JSON locator and tries fallbacks
BrowserGlobal.iClickOn("auto.loc.iExams.homePage.button.search");
```

**Playwright/TypeScript**:
```typescript
// Manual resolution with fallback logic
private async resolveLocator(locatorKey: string): Promise<Locator> {
  const locatorData = JSON.parse(this.config.get(locatorKey));
  
  for (const pattern of locatorData.locator) {
    try {
      const locator = this.page.locator(pattern.replace('xpath=', ''));
      if (await locator.count() > 0) {
        return locator.first();
      }
    } catch (e) {
      continue;
    }
  }
  
  throw new Error(`Element not found`);
}
```

### 4. Wait Conditions

**Java/QAF**:
```java
BrowserGlobal.iWaitUntilElementPresent(locator);
BrowserGlobal.iWaitUntilElementVisible(locator);
BrowserGlobal.iWaitUntilElementEnabled(locator);
```

**Playwright/TypeScript**:
```typescript
await locator.waitFor({ state: 'attached', timeout: 30000 });
await locator.waitFor({ state: 'visible', timeout: 30000 });
await expect(locator).toBeEnabled({ timeout: 30000 });
```

### 5. JavaScript Executor Fallback

**Java/QAF**:
```java
JavascriptExecutor js = (JavascriptExecutor) getDriver();
js.executeScript("arguments[0].click()", element);
```

**Playwright/TypeScript**:
```typescript
await locator.evaluate((element: HTMLElement) => element.click());
```

## Project Structure

```
playwright-pattern-locator/
├── src/
│   ├── core/
│   │   ├── ConfigManager.ts          # Configuration and cache management
│   │   ├── PatternLocator.ts         # Pattern resolution layer
│   │   └── BrowserActions.ts         # Atomic action layer
│   ├── actions/
│   │   └── WebActions.ts             # Composite action layer
│   ├── config/
│   │   └── patterns.ts               # Pattern templates
│   ├── steps/
│   │   └── webSteps.ts               # Cucumber step definitions
│   └── tests/
│       └── example.spec.ts           # Test files
├── features/
│   └── example.feature               # Gherkin feature files
├── playwright.config.ts              # Playwright configuration
├── package.json
└── tsconfig.json
```

## Configuration Files

### package.json

```json
{
  "name": "playwright-pattern-locator",
  "version": "1.0.0",
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@cucumber/cucumber": "^10.0.0",
    "typescript": "^5.0.0"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### playwright.config.ts

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests',
  timeout: 30000,
  retries: 1,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
```

## Usage Example

### Feature File

```gherkin
Feature: User Registration

Scenario: Complete registration form
  Given Web: Set Page Name "RegistrationPage"
  When Web: Input "John" into "First Name"
  And Web: Input "Doe" into "Last Name"
  And Web: Input "john.doe@example.com" into "Email"
  And Web: Select Dropdown with text "United States" in "Country"
  And Web: Click Checkbox "Accept Terms"
  And Web: Click Button "Submit"
  Then Web: Verify Text "Registration Successful"
```

### Test File (Playwright Test)

```typescript
import { test } from '@playwright/test';
import { WebActions } from '../actions/WebActions';

test('Complete registration form', async ({ page }) => {
  const web = new WebActions(page);
  
  await page.goto('https://example.com/register');
  
  web.setPageName('RegistrationPage');
  await web.input('John', 'First Name');
  await web.input('Doe', 'Last Name');
  await web.input('john.doe@example.com', 'Email');
  await web.selectDropdown('United States', 'Country');
  await web.clickCheckbox('Accept Terms');
  await web.clickButton('Submit');
  await web.verifyText('Registration Successful', 'Registration Successful');
});
```

## Migration Checklist

### Phase 1: Setup
- [ ] Install Playwright and TypeScript
- [ ] Create project structure
- [ ] Set up configuration files
- [ ] Install dependencies

### Phase 2: Core Implementation
- [ ] Implement ConfigManager
- [ ] Create pattern configuration (patterns.ts)
- [ ] Implement PatternLocator
- [ ] Implement BrowserActions
- [ ] Implement WebActions

### Phase 3: Integration
- [ ] Create Cucumber step definitions
- [ ] Migrate test scenarios
- [ ] Update pattern templates
- [ ] Configure logging

### Phase 4: Testing
- [ ] Test pattern resolution
- [ ] Test caching mechanism
- [ ] Test fallback patterns
- [ ] Test error handling
- [ ] Performance testing

### Phase 5: Documentation
- [ ] Document API
- [ ] Create usage examples
- [ ] Write migration guide
- [ ] Document troubleshooting

## Requirements Validation

This migration guide addresses all requirements by providing:

**All Requirements**: ✅ Complete implementation mapping from Java/QAF to Playwright/TypeScript
- Mapped all core components with code examples
- Provided equivalent implementations for all layers
- Documented key differences and adaptations
- Included complete project structure and configuration
- Provided usage examples and migration checklist

## Summary

This framework migration guide provides a complete roadmap for implementing the pattern-based locator system in Playwright with TypeScript. Key components include:

- **ConfigManager**: Replaces QAF Configuration Bundle with TypeScript Map-based storage
- **PatternLocator**: Core pattern resolution with camelCase conversion and placeholder substitution
- **BrowserActions**: Atomic actions using Playwright's native API with fallback support
- **WebActions**: Composite actions combining pattern resolution with browser actions
- **Step Definitions**: Cucumber integration for Gherkin test steps

The implementation maintains the same architecture and principles as the Java/QAF system while leveraging Playwright's modern async/await API and TypeScript's type safety.
