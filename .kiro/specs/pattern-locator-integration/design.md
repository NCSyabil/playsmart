# Design Document: Pattern-Based Locator System Integration (Page Object Model)

## Overview

This design document describes the integration of a sophisticated pattern-based locator system into the existing Playwright TypeScript automation framework using the **Page Object Model (POM) pattern**. The pattern system is already partially implemented in `engines/patternIq/patternIqEngine.ts` and provides centralized locator management through template-based patterns that dynamically generate element locators at runtime.

The key architectural change is shifting from a single centralized pattern configuration file to **page-specific pattern files**, where each page object has its own `.pattern.ts` file containing locator strategies specific to that page. This approach improves organization, maintainability, and scalability as the test suite grows.

The integration enhances the existing `webLocResolver` function to seamlessly support page object pattern-based locators alongside static locators, while maintaining full backward compatibility. The system uses a fallback mechanism that attempts multiple locator strategies, automatically scrolls to reveal lazy-loaded content, and provides intelligent label-based resolution for form elements.

### Key Benefits

- **Page-Specific Organization**: Each page has its own pattern file, making locator strategies easy to find and maintain
- **Reduced Brittleness**: Multiple fallback patterns automatically handle application changes
- **Logical Naming**: Tests use human-readable field names (e.g., "Username") instead of complex XPath expressions
- **Dynamic Resolution**: Locators are generated at runtime based on page context and field name
- **Scalability**: Adding new pages doesn't clutter a central configuration file
- **Backward Compatible**: Existing static locators and tests continue to work without modification
- **Clear Ownership**: Each page object owns its locator strategies, following POM principles

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Test Layer                                │
│  (Cucumber Steps / Playwright Tests using WebActions)           │
│  • Specifies page object context (e.g., "loginPage")           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WebActions Layer                              │
│  (fill, clickButton, clickLink, select, verify, etc.)           │
│  • Passes page object context to Locator Resolver              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Locator Resolver Layer                          │
│              (webLocResolver function)                           │
│                                                                   │
│  Decision Logic:                                                 │
│  1. Check for Playwright-prefixed locators (xpath=, css=)       │
│  2. Check for static locators (loc.ts., loc.json.)              │
│  3. Check for raw XPath/CSS selectors                           │
│  4. Check if SmartAI is enabled                                 │
│  5. Check if PatternIQ is enabled → delegate to Pattern Engine  │
│     with page object context                                     │
│  6. Fallback to direct Playwright locator                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Pattern Engine Layer                          │
│              (patternIqEngine.ts)                                │
│                                                                   │
│  Core Functions:                                                 │
│  • patternIq() - Main entry point (accepts page object code)    │
│  • getLocatorEntries() - Parse field name and load patterns     │
│    from specific page object                                     │
│  • validateLocatorLoop() - Retry with fallback patterns         │
│  • evaluateChainedLocator() - Resolve chained locators          │
│  • scrollPage() - Reveal lazy-loaded content                    │
│  • resetValues() - Clean up global state                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              Configuration & Pattern Storage                     │
│                    (vars module)                                 │
│                                                                   │
│  • Page object pattern files (e.g., loginPage.pattern.ts)      │
│  • Each page object has independent pattern configuration       │
│  • Configuration values (enable flags, timeouts, etc.)          │
│  • Runtime variables (loc.auto.fieldName, etc.)                 │
│  • Variable substitution engine                                 │
│  • Page object mapping (URL → Pattern Code)                     │
└─────────────────────────────────────────────────────────────────┘
```

### Pattern Resolution Flow

```
Field Name Input: "{{Main Content}} {Login Form} Username[1]"
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: Parse Field Name                                       │
│  • Location: "Main Content"                                     │
│  • Section: "Login Form"                                        │
│  • Field: "Username"                                            │
│  • Instance: 1                                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: Load Pattern Templates                                 │
│  • Location pattern: pattern.{config}.locations.Main Content    │
│  • Section pattern: pattern.{config}.sections.Login Form        │
│  • Field patterns: pattern.{config}.fields.input (semicolon-separated) │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 3: Set Runtime Variables                                  │
│  • loc.auto.fieldName = "Username"                              │
│  • loc.auto.fieldInstance = "1"                                 │
│  • loc.auto.location.name = "Main Content"                      │
│  • loc.auto.section.name = "Login Form"                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 4: Substitute Variables in Patterns                       │
│  • Replace #{loc.auto.fieldName} with "Username"                │
│  • Replace #{loc.auto.fieldInstance} with "1"                   │
│  • Generate concrete XPath/CSS selectors                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 5: Attempt Label Resolution (if eligible)                 │
│  • Try label patterns first for input/select/textarea          │
│  • Extract "for" attribute from label                           │
│  • Update loc.auto.forId variable                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 6: Try Field Patterns with Fallback                       │
│  • Attempt each pattern in sequence                             │
│  • Build chained locator: location >> section >> field          │
│  • Check if element exists and is visible                       │
│  • If not found, scroll page and retry                          │
│  • Continue until timeout or success                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 7: Return Playwright Locator                              │
│  • Success: Return page.locator(resolvedChain)                  │
│  • Failure: Return page.locator("") and log warning             │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Pattern Engine (patternIqEngine.ts)

**Purpose**: Core engine that resolves field names to concrete Playwright locators using pattern templates.

**Key Functions**:

```typescript
/**
 * Main entry point for pattern-based locator resolution
 * @param page - Playwright Page instance
 * @param argType - Element type (button, input, link, etc.)
 * @param argField - Field name with optional location/section/instance
 * @param argOverridePattern - Optional pattern code override
 * @param argTimeout - Optional timeout override
 * @returns Playwright Locator object
 */
export async function patternIq(
  page: Page,
  argType: string,
  argField: string,
  argOverridePattern?: string,
  argTimeout?: number
): Promise<Locator>

/**
 * Parses field name and loads pattern templates
 * @param argType - Element type
 * @returns Array of pattern template strings
 */
async function getLocatorEntries(argType: string): Promise<string[]>

/**
 * Validates locator patterns with retry and fallback logic
 * @param page - Playwright Page instance
 * @param timeout - Maximum time to retry
 * @param interval - Time between retries
 * @returns LocatorResult or null
 */
async function validateLocatorLoop(
  page: Page,
  timeout: number,
  interval: number
): Promise<LocatorResult | null>

/**
 * Evaluates chained locator on the page
 * @param page - Playwright Page instance
 * @param locationLocator - Location pattern (or null)
 * @param sectionLocator - Section pattern (or null)
 * @param fieldLocator - Field pattern
 * @param isLabelCheck - Whether this is a label resolution attempt
 * @returns LocatorResult with exists/visible/enabled status
 */
async function evaluateChainedLocator(
  page: Page,
  locationLocator: string | null,
  sectionLocator: string | null,
  fieldLocator: string,
  isLabelCheck: boolean
): Promise<LocatorResult>

/**
 * Scrolls page to reveal lazy-loaded content
 * @param page - Playwright Page instance
 */
async function scrollPage(page: Page): Promise<void>

/**
 * Resets all global locator variables
 */
async function resetValues(): Promise<void>
```

**Global State Variables**:
- `locType`: Element type (button, input, link, etc.)
- `locField`: Original field name string
- `locFieldName`: Parsed field name
- `locFieldInstance`: Element instance number (default: "1")
- `locFieldForId`: Extracted "for" attribute from label
- `locSection`: Resolved section locator
- `locSectionName`: Section name from field string
- `locSectionValue`: Section value from field string
- `locLocation`: Resolved location locator
- `locLocationName`: Location name from field string
- `locLocationValue`: Location value from field string
- `patternVarNameField`: Pattern variable prefix for fields
- `patternVarNameLocation`: Pattern variable prefix for locations
- `patternVarNameSection`: Pattern variable prefix for sections
- `patternVarNameScroll`: Pattern variable name for scroll configuration

### 2. Locator Resolver (webLocFixture.ts)

**Purpose**: Central decision point that determines which locator strategy to use.

**Key Function**:

```typescript
/**
 * Resolves a selector to a Playwright Locator using appropriate strategy
 * @param type - Element type (button, input, link, etc.)
 * @param selector - Selector string or field name
 * @param pageArg - Playwright Page instance
 * @param overridePattern - Optional pattern code override
 * @param timeout - Optional timeout override
 * @param smartAiRefresh - SmartAI refresh mode ('before', 'after', '')
 * @returns Playwright Locator object
 */
export async function webLocResolver(
  type: string,
  selector: string,
  pageArg: Page,
  overridePattern?: string,
  timeout?: number,
  smartAiRefresh: 'before' | 'after' | '' = ''
): Promise<Locator>
```

**Decision Logic**:
1. Check for Playwright-prefixed locators (`xpath=`, `css=`, `chain=`) → return direct locator
2. Check for raw XPath (`//`) or CSS selectors → return direct locator
3. Check for resource locators (`loc.ts.`, `loc.json.`) → use static locator resolution
4. Check for `-no-check-` override → return undefined
5. Check if SmartAI is enabled → delegate to SmartAI engine
6. Check if PatternIQ is enabled → delegate to Pattern engine
7. Fallback → return direct Playwright locator

### 3. Configuration Manager (vars module)

**Purpose**: Manages pattern templates, configuration values, and runtime variables.

**Key Functions**:

```typescript
/**
 * Gets a configuration value
 * @param key - Configuration key (e.g., "patternIq.enable")
 * @param ifEmpty - Return empty string if not found
 * @returns Configuration value
 */
function getConfigValue(key: string, ifEmpty?: boolean): string

/**
 * Sets a runtime variable
 * @param key - Variable key
 * @param value - Variable value
 */
function setValue(key: string, value: string): void

/**
 * Gets a runtime variable
 * @param key - Variable key
 * @param ifEmpty - Return empty string if not found
 * @returns Variable value
 */
function getValue(key: string, ifEmpty?: boolean): string

/**
 * Replaces variable placeholders in a string
 * @param input - String with placeholders (e.g., "#{loc.auto.fieldName}")
 * @returns String with variables replaced
 */
function replaceVariables(input: any): string

/**
 * Loads pattern entries from .pattern.ts files
 */
function loadPatternEntries(): void

/**
 * Flattens nested configuration object to dot-notation
 * @param obj - Configuration object
 * @param prefix - Key prefix
 * @returns Flattened key-value pairs
 */
function flattenConfig(obj: any, prefix: string): Record<string, string>
```

**Configuration Keys**:
- `patternIq.enable`: Enable/disable pattern-based resolution (boolean)
- `patternIq.config`: Default pattern code to use (string)
- `patternIq.retryTimeout`: Maximum retry timeout in ms (number, default: 30000)
- `patternIq.retryInterval`: Interval between retries in ms (number, default: 2000)

**Runtime Variables**:
- `loc.auto.fieldName`: Current field name being resolved
- `loc.auto.fieldName.toLowerCase`: Lowercase version of field name
- `loc.auto.fieldInstance`: Element instance number
- `loc.auto.forId`: Extracted "for" attribute from label
- `loc.auto.location.value`: Location value from field string
- `loc.auto.location.name`: Location name from field string
- `loc.auto.section.value`: Section value from field string
- `loc.auto.section.name`: Section name from field string

### 4. WebActions Integration

**Purpose**: Existing action layer that provides high-level interaction methods.

**Integration Points**:

All WebActions methods that accept a `field` parameter will support pattern-based locators:
- `fill(page, field, value, options)`
- `clickButton(page, field, options)`
- `clickLink(page, field, options)`
- `clickTab(page, field, options)`
- `clickRadioButton(page, field, options)`
- `clickCheckbox(page, field, options)`
- `selectDropdown(page, field, value, options)`
- `mouseoverOnLink(page, field, options)`
- `verifyInputFieldPresent(page, field, options)`
- `verifyInputFieldValue(page, field, expectedValue, options)`
- `verifyTabField(page, field, options)`
- `waitForInputState(page, field, state, options)`
- `waitForTextAtLocation(page, field, expectedText, options)`
- `waitForHeader(page, header, headerText, options)`
- `verifyTextAtLocation(page, field, expectedText, options)`

**Pattern Parameter**:

Each method supports an optional `pattern` parameter in the options object:

```typescript
await fill(page, "Username", "john.doe", {
  pattern: "uportalOb",  // Override default pattern code
  screenshot: true
});
```

## Data Models

### LocatorResult Interface

```typescript
interface LocatorResult {
  locator: string;      // Resolved locator string (chained if applicable)
  exists: boolean;      // Whether element exists in DOM
  visible: boolean;     // Whether element is visible
  enabled: boolean;     // Whether element is enabled (always true in current implementation)
}
```

### Pattern Configuration Structure

Pattern files follow the **Page Object Model** where each page has its own `.pattern.ts` file (e.g., `loginPage.pattern.ts`, `homePage.pattern.ts`, `checkoutPage.pattern.ts`). Each file exports a configuration object specific to that page:

**Example: loginPage.pattern.ts**
```typescript
export const loginPage = {
  fields: {
    button: "//button[contains(text(), '#{loc.auto.fieldName}')];.btn:has-text('#{loc.auto.fieldName}')",
    input: "//input[@placeholder='#{loc.auto.fieldName}'];input[placeholder='#{loc.auto.fieldName}']",
    link: "//a[contains(text(), '#{loc.auto.fieldName}')];a:has-text('#{loc.auto.fieldName}')",
    text: "//*[contains(text(), '#{loc.auto.fieldName}')]"
  },
  sections: {
    "Login Form": "//form[@id='login'];form#login",
    "Error Message": "//div[@class='error'];div.error"
  },
  locations: {
    "Main Content": "//main;main",
    "Header": "//header;header"
  },
  scroll: "//div[@class='scrollable'];div.scrollable"
};
```

**Example: homePage.pattern.ts**
```typescript
export const homePage = {
  fields: {
    button: "//button[@data-testid='#{loc.auto.fieldName.toLowerCase}'];button[data-testid='#{loc.auto.fieldName.toLowerCase}']",
    link: "//nav//a[text()='#{loc.auto.fieldName}'];nav a:text('#{loc.auto.fieldName}')",
    text: "//h1[contains(text(), '#{loc.auto.fieldName}')];h1:has-text('#{loc.auto.fieldName}')"
  },
  sections: {
    "Navigation": "//nav[@class='main-nav'];nav.main-nav",
    "Hero Section": "//section[@class='hero'];section.hero",
    "Footer": "//footer;footer"
  },
  locations: {
    "Main Content": "//div[@id='content'];div#content"
  }
};
```

**Example: checkoutPage.pattern.ts**
```typescript
export const checkoutPage = {
  fields: {
    input: "//input[@name='#{loc.auto.fieldName.toLowerCase}'];input[name='#{loc.auto.fieldName.toLowerCase}']",
    select: "//select[@id='#{loc.auto.fieldName.toLowerCase}'];select##{loc.auto.fieldName.toLowerCase}",
    button: "//button[@type='submit' and contains(text(), '#{loc.auto.fieldName}')];button[type='submit']:has-text('#{loc.auto.fieldName}')",
    checkbox: "//input[@type='checkbox' and @name='#{loc.auto.fieldName.toLowerCase}']",
    label: "//label[contains(text(), '#{loc.auto.fieldName}')];label:has-text('#{loc.auto.fieldName}')"
  },
  sections: {
    "Billing Information": "//div[@id='billing'];div#billing",
    "Shipping Information": "//div[@id='shipping'];div#shipping",
    "Payment Details": "//div[@id='payment'];div#payment",
    "Order Summary": "//div[@id='summary'];div#summary"
  },
  scroll: "//div[@class='checkout-container'];div.checkout-container"
};
```

After loading, each page object configuration is flattened to:
```
pattern.loginPage.fields.button = "//button[contains(text(), '#{loc.auto.fieldName}')];.btn:has-text('#{loc.auto.fieldName}')"
pattern.loginPage.fields.input = "//input[@placeholder='#{loc.auto.fieldName}'];input[placeholder='#{loc.auto.fieldName}']"
pattern.loginPage.sections.Login Form = "//form[@id='login'];form#login"
pattern.loginPage.locations.Main Content = "//main;main"
pattern.loginPage.scroll = "//div[@class='scrollable'];div.scrollable"

pattern.homePage.fields.button = "//button[@data-testid='#{loc.auto.fieldName.toLowerCase}'];button[data-testid='#{loc.auto.fieldName.toLowerCase}']"
pattern.homePage.sections.Navigation = "//nav[@class='main-nav'];nav.main-nav"
...

pattern.checkoutPage.fields.input = "//input[@name='#{loc.auto.fieldName.toLowerCase}'];input[name='#{loc.auto.fieldName.toLowerCase}']"
pattern.checkoutPage.sections.Billing Information = "//div[@id='billing'];div#billing"
...
```

### Page Object Selection

Tests can specify which page object to use in several ways:

**1. Explicit Pattern Override:**
```typescript
await fill(page, "Username", "john.doe", {
  pattern: "loginPage"  // Explicitly use loginPage patterns
});
```

**2. Default Configuration:**
```typescript
// In resources/config.ts
patternIq: {
  enable: true,
  config: "loginPage",  // Default page object
  retryTimeout: 30000,
  retryInterval: 2000
}
```

**3. Page Object Mapping (Future Enhancement):**
```typescript
// Map URLs to page objects
patternIq: {
  pageMapping: {
    "/login": "loginPage",
    "/home": "homePage",
    "/checkout": "checkoutPage"
  }
}
```

### Field Name Parsing

Field names follow this format:
```
{{location_name:: location_value}} {section_name:: section_value} field_name[instance]
```

Examples:
- `"Username"` → Simple field name
- `"Username[2]"` → Second instance of Username field
- `"{Login Form} Username"` → Username field within Login Form section
- `"{{Main Content}} {Login Form} Username"` → Username field within Login Form section within Main Content location
- `"{{top_menu:: Home}} {submenu:: Products} View All"` → Complex nested structure

Parsing regex:
```typescript
const pattern = /^(?:{{([^:}]+)(?:::(.+?))?}}\s*)?(?:{([^:}]+)(?:::(.+?))?}\s*)?(.+?)(?:\[(\d+)\])?$/;
```

Captured groups:
1. Location name
2. Location value (optional)
3. Section name
4. Section value (optional)
5. Field name
6. Instance number (optional, default: 1)


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Pattern File Discovery and Loading (Page Object Model)

*For any* valid TypeScript file with the ".pattern.ts" suffix placed in the "resources/locators/pattern" directory, the Config_Manager should automatically discover and load it as a page object during initialization, making its patterns accessible via the vars module with the page object's Pattern_Code as the namespace.

**Validates: Requirements 1.1, 1.2, 1.5, 1.9**

### Property 2: Multiple Page Object Configuration Support

*For any* set of pattern files representing different page objects with unique Pattern_Code values, the Config_Manager should load all page object configurations independently and make them accessible, allowing tests to switch between different page object pattern strategies.

**Validates: Requirements 1.3, 1.10**

### Property 3: Configuration Flattening (Page Object Scoped)

*For any* nested page object pattern configuration object, the Config_Manager should flatten it to dot-notation keys (e.g., "pattern.{pageObjectCode}.fields.{type}") such that all nested values are accessible as flat key-value pairs scoped to that page object.

**Validates: Requirements 1.4**

### Property 4: Variable Substitution in Patterns

*For any* pattern template containing variable placeholders (e.g., "#{loc.auto.fieldName}"), when runtime variables are set, the Config_Manager should replace all placeholders with their corresponding values, producing a concrete locator string.

**Validates: Requirements 1.6, 2.7**

### Property 5: Configuration Override Behavior

*For any* configuration key, when both a default value and an environment variable override exist, the Config_Manager should use the environment variable value, and when multiple pattern files define the same Pattern_Code, the last loaded configuration should be used.

**Validates: Requirements 1.7, 1.8**

### Property 6: Fallback Pattern Support (Page Object Scoped)

*For any* field type pattern definition within a page object containing multiple locator strategies separated by semicolons, the Pattern_Engine should parse them into separate patterns and attempt each in sequence until a visible element is found, using only patterns defined in the active page object.

**Validates: Requirements 2.2, 2.9, 3.6, 4.1**

### Property 7: Selector Syntax Support

*For any* pattern template, the Pattern_Engine should correctly resolve both XPath selectors (starting with "//" or "(") and CSS selectors, applying the appropriate DOM query method for each type.

**Validates: Requirements 2.6**

### Property 8: Label-Based Resolution for Eligible Elements

*For any* input, select, or textarea element, when label patterns are defined, the Pattern_Engine should first attempt to locate the associated label element, extract its "for" attribute, and use it to find the target element.

**Validates: Requirements 2.8, 3.8**

### Property 9: Field Name Parsing and Resolution (Page Object Context)

*For any* field name string (with optional location, section, and instance components) and a specified page object Pattern_Code, the Pattern_Engine should correctly parse all components, resolve the corresponding pattern templates from that page object's configuration, set runtime variables, and generate a chained locator that combines location >> section >> field selectors specific to that page.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.7, 3.9, 3.10**

### Property 10: Chained Locator Traversal

*For any* chained locator string containing the ">>" separator, the Pattern_Engine should traverse the DOM hierarchy by applying each selector in sequence, using the result of each step as the context for the next step.

**Validates: Requirements 3.5**

### Property 11: Scroll and Retry Mechanism

*For any* locator resolution attempt that fails to find a visible element, the Pattern_Engine should scroll the page (using configured scroll patterns if available, otherwise default scrolling), wait for the configured retry interval, and attempt resolution again until either a visible element is found or the timeout is reached.

**Validates: Requirements 4.2, 4.3, 4.4, 4.5**

### Property 12: Early Termination on Success

*For any* locator resolution attempt, as soon as a visible element is found, the Pattern_Engine should immediately return the resolved locator without attempting remaining patterns or retries.

**Validates: Requirements 4.6, 9.6**

### Property 13: Page Load State Waiting

*For any* locator resolution attempt, the Pattern_Engine should wait for the page load state to be "load" exactly once at the start of resolution before attempting any pattern evaluation.

**Validates: Requirements 4.8, 9.1**

### Property 14: Locator Strategy Selection

*For any* locator string, the Locator_Resolver should correctly identify its type (Playwright-prefixed, static resource, raw XPath/CSS, or field name) and apply the appropriate resolution strategy, bypassing pattern resolution for explicit locator formats.

**Validates: Requirements 5.3, 5.4, 5.5**

### Property 15: Pattern Resolution Enablement (Page Object Support)

*For any* locator resolution request, when the "patternIq.enable" configuration flag is set to true and a field name is provided with a page object context, the Locator_Resolver should delegate to the Pattern_Engine with the specified page object Pattern_Code; when set to false, it should use direct Playwright locator resolution.

**Validates: Requirements 5.1, 5.2, 5.9**

### Property 16: Pattern Code Override (Page Object Selection)

*For any* locator resolution request with an override pattern parameter specifying a page object Pattern_Code, the Pattern_Engine should use the specified page object's patterns instead of the default configuration, allowing per-action page object selection.

**Validates: Requirements 5.6, 5.10**

### Property 17: Configuration Default Values (Page Object Model)

*For any* configuration key (patternIq.retryTimeout, patternIq.retryInterval, patternIq.config for default page object, etc.), when no value is explicitly set, the Config_Manager should provide a sensible default value that allows the system to function correctly.

**Validates: Requirements 6.5, 6.9**

### Property 18: Environment Variable Override

*For any* configuration value, when an environment variable with the corresponding key is set, the Config_Manager should use the environment variable value instead of the value from the configuration file.

**Validates: Requirements 6.7**

### Property 19: WebActions Integration (Page Object Context)

*For any* WebActions method that accepts a field parameter, when a field name string is provided with an optional page object Pattern_Code override, the method should pass it to the Locator_Resolver along with the correct element type, page object context, optional pattern override, and timeout, and when a Playwright Locator object is provided, it should use it directly without resolution.

**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.6, 7.7, 7.8, 7.9, 7.10**

### Property 20: Comprehensive Logging (Page Object Context)

*For any* locator resolution attempt within a page object context, the Pattern_Engine should log all significant events including the active page object Pattern_Code, pattern attempts, scroll operations, label resolution with extracted "for" attributes, successful resolutions with the final locator string, and failures with attempted patterns and reasons.

**Validates: Requirements 8.4, 8.5, 8.6, 8.7**

### Property 21: Efficient Resolution

*For any* locator resolution attempt, the Pattern_Engine should minimize performance overhead by evaluating chained locators in a single page.evaluate() call, caching pattern template lookups within the resolution attempt, using efficient DOM query methods, and resetting global variables after completion to prevent state leakage.

**Validates: Requirements 9.2, 9.3, 9.4, 9.5**

### Property 22: Scroll Iteration Limit

*For any* scroll operation during locator resolution, the Pattern_Engine should limit scroll attempts to a maximum of 10 iterations per retry cycle to prevent infinite scrolling.

**Validates: Requirements 9.7**

### Property 23: Configurable Retry Intervals

*For any* locator resolution attempt, the Pattern_Engine should use the configured retry interval (patternIq.retryInterval) between retry attempts, allowing customization of the balance between responsiveness and performance.

**Validates: Requirements 9.8**

## Error Handling

### Error Scenarios and Handling Strategies

1. **Pattern Configuration Not Found**
   - **Scenario**: Pattern code specified but not loaded in configuration
   - **Handling**: Throw descriptive error with the missing pattern code name
   - **Example**: `Error: No valid locators found for type "button". Pattern configuration "invalidCode" not found.`

2. **Pattern File Loading Failure**
   - **Scenario**: Pattern file exists but contains syntax errors or invalid exports
   - **Handling**: Log warning and continue with other pattern files
   - **Example**: `Warning: Could not load pattern file uportalOb.pattern.ts: SyntaxError`

3. **Locator Resolution Timeout**
   - **Scenario**: No visible element found within configured timeout
   - **Handling**: Return empty locator and log warning with attempted patterns
   - **Example**: `Warning: Timeout reached! No valid locator found for type "button" with field name "Submit". Attempted patterns: [pattern1, pattern2, pattern3]`

4. **Page Closed During Resolution**
   - **Scenario**: Page is closed while locator resolution is in progress
   - **Handling**: Detect closed state, log warning, return empty locator result
   - **Example**: `Warning: Cannot evaluate locator: Page is already closed.`

5. **Invalid Field Name Format**
   - **Scenario**: Field name doesn't match expected parsing regex
   - **Handling**: Treat entire string as field name, use default instance (1)
   - **Example**: Field name `"Invalid{{Format"` → parsed as field name "Invalid{{Format"

6. **Missing Runtime Variables**
   - **Scenario**: Pattern template references variable that isn't set
   - **Handling**: Variable placeholder remains unreplaced, may cause locator failure
   - **Example**: Pattern `"//input[@id='#{loc.auto.forId}']"` with unset forId → `"//input[@id='']"`

7. **Chained Locator Evaluation Failure**
   - **Scenario**: One step in chained locator fails to find element
   - **Handling**: Return empty chain, continue to next pattern in fallback sequence
   - **Example**: Chain `"//main >> //form >> //input"` fails at `//form` → try next pattern

8. **Configuration Value Type Mismatch**
   - **Scenario**: Configuration value is wrong type (e.g., string instead of number for timeout)
   - **Handling**: Attempt type conversion, fall back to default if conversion fails
   - **Example**: `patternIq.retryTimeout = "invalid"` → use default 30000ms

### Error Recovery Strategies

1. **Fallback Pattern Sequence**: When primary pattern fails, automatically try alternative patterns
2. **Scroll and Retry**: When element not found, scroll page and retry to handle lazy-loaded content
3. **Graceful Degradation**: When pattern resolution fails, return empty locator rather than crashing
4. **Configuration Defaults**: When configuration missing, use sensible defaults to keep system functional
5. **Comprehensive Logging**: Log all failures with context to aid debugging

## Testing Strategy

### Dual Testing Approach

The pattern locator system will be validated using both unit tests and property-based tests:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs using randomized test data

Both testing approaches are complementary and necessary for comprehensive coverage. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Unit Testing Focus Areas

1. **Specific Examples**
   - Pattern file loading with known configuration
   - Field name parsing with specific formats
   - Locator resolution with predefined patterns
   - Error handling with specific error conditions

2. **Edge Cases**
   - Empty field names
   - Field names with special characters
   - Missing pattern configurations
   - Closed page during resolution
   - Timeout scenarios

3. **Integration Points**
   - WebActions methods calling Locator_Resolver
   - Locator_Resolver delegating to Pattern_Engine
   - Pattern_Engine using Config_Manager
   - Configuration loading during framework initialization

### Property-Based Testing Focus Areas

1. **Configuration Management** (Properties 1-5)
   - Generate random pattern files and verify loading
   - Generate random nested configurations and verify flattening
   - Generate random variable placeholders and verify substitution
   - Generate random configuration overrides and verify precedence

2. **Pattern Resolution** (Properties 6-13)
   - Generate random field names with various formats and verify parsing
   - Generate random pattern templates and verify resolution
   - Generate random fallback sequences and verify retry behavior
   - Generate random chained locators and verify traversal

3. **Locator Strategy Selection** (Properties 14-16)
   - Generate random locator strings of different types and verify correct strategy selection
   - Generate random pattern codes and verify override behavior

4. **Integration and Performance** (Properties 17-23)
   - Generate random configuration values and verify defaults
   - Generate random WebActions calls and verify delegation
   - Verify logging occurs for all resolution attempts
   - Verify performance optimizations are applied

### Property Test Configuration

- **Minimum Iterations**: 100 per property test (due to randomization)
- **Test Tagging**: Each property test must reference its design document property
- **Tag Format**: `Feature: pattern-locator-integration, Property {number}: {property_text}`

### Test Data Generation Strategies

1. **Pattern Configuration Generation**
   - Generate random pattern codes (alphanumeric strings)
   - Generate random field types (button, input, link, etc.)
   - Generate random XPath and CSS selectors
   - Generate random nested configuration objects

2. **Field Name Generation**
   - Generate random field names with/without locations
   - Generate random field names with/without sections
   - Generate random instance numbers (1-10)
   - Generate random special characters and edge cases

3. **Locator String Generation**
   - Generate random XPath expressions
   - Generate random CSS selectors
   - Generate random chained locators with ">>"
   - Generate random Playwright-prefixed locators

4. **Configuration Value Generation**
   - Generate random boolean flags (true/false)
   - Generate random timeout values (1000-60000ms)
   - Generate random interval values (100-5000ms)
   - Generate random pattern codes

### Testing Tools and Libraries

- **Unit Testing**: Jest or Mocha (existing framework test runner)
- **Property-Based Testing**: fast-check (TypeScript property-based testing library)
- **Test Pages**: Create test HTML pages with various element structures for integration tests
- **Mocking**: Mock Playwright Page objects for unit tests, use real pages for integration tests

### Test Coverage Goals

- **Line Coverage**: Minimum 80% for all pattern system code
- **Branch Coverage**: Minimum 75% for all conditional logic
- **Property Coverage**: 100% of correctness properties implemented as property tests
- **Integration Coverage**: All WebActions methods tested with pattern-based locators

### Continuous Integration

- Run unit tests on every commit
- Run property tests on every pull request
- Run integration tests on nightly builds
- Monitor test execution time and fail if tests take longer than 5 minutes

