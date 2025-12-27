# Pattern Configuration Layer Documentation

## Overview

The Pattern Configuration Layer is the foundation of the pattern-based locator system. It stores reusable XPath and CSS selector templates in a properties file, enabling centralized locator management and reducing duplication across test automation projects.

## Purpose

The Pattern Configuration Layer serves three primary purposes:

1. **Centralized Locator Management**: All XPath/CSS patterns are stored in one location (`locPattern.properties`)
2. **Template Reusability**: Patterns use placeholders that are substituted at runtime with actual field names
3. **Fallback Support**: Multiple patterns can be defined for each element type, providing automatic fallback when the first pattern fails

## File Location and Structure

**File**: `resources/locators/locPattern.properties`

**Format**: Java Properties file with multi-line support using backslash continuation

**Structure**:
```
{patternCode}.pattern.{elementType} = {pattern1}, {pattern2}, {pattern3}, ...
```

## Pattern Template Syntax

### Basic Pattern Format

```properties
# Single pattern
loc.iExams.pattern.button = "xpath=//button[text()='${loc.auto.fieldName}']"

# Multiple fallback patterns
loc.iExams.pattern.button = \
  "xpath=//button[text()='${loc.auto.fieldName}']",\
  "xpath=//span[text()='${loc.auto.fieldName}']",\
  "xpath=//button[@label='${loc.auto.fieldName}']"
```

### Pattern Components

1. **Pattern Key**: `{patternCode}.pattern.{elementType}`
   - `patternCode`: Project identifier (e.g., "loc.iExams")
   - `pattern`: Literal string "pattern"
   - `elementType`: Element type identifier (e.g., "button", "input", "text")

2. **Pattern Value**: Comma-separated list of XPath/CSS selectors
   - Each selector is enclosed in double quotes
   - Selectors are separated by commas
   - Multi-line patterns use backslash continuation

3. **Placeholders**: Variables replaced at runtime
   - Format: `${placeholder.name}`
   - Common placeholders: `${loc.auto.fieldName}`, `${loc.auto.fieldValue}`

## Supported Placeholder Variables

### 1. `${loc.auto.fieldName}`

**Purpose**: Replaced with the field name provided in the test step

**Example**:
```properties
loc.iExams.pattern.button = "xpath=//button[text()='${loc.auto.fieldName}']"
```

**Runtime Substitution**:
- Test Step: `Web: Click-Element Element:"button" Field:"PROCEED"`
- Field Name: "PROCEED"
- Result: `xpath=//button[text()='PROCEED']`

### 2. `${loc.auto.fieldValue}`

**Purpose**: Replaced with an additional value parameter (used for radio buttons, checkboxes with specific values)

**Example**:
```properties
loc.iExams.pattern.radioButton = "xpath=//p-radiobutton[@value='${loc.auto.fieldValue}']"
```

**Runtime Substitution**:
- Test Step: `Web: Click-Radio-Button Field:"Gender" Value:"Male"`
- Field Value: "Male"
- Result: `xpath=//p-radiobutton[@value='Male']`

### 3. `${loc.auto.fieldInstance}`

**Purpose**: Replaced with the instance number when multiple elements have the same name

**Example**:
```properties
loc.iExams.pattern.input = "xpath=(//input[@placeholder='${loc.auto.fieldName}'])[${loc.auto.fieldInstance}]"
```

**Runtime Substitution**:
- Test Step: `Web: Input-Text Value:"test@email.com" Field:"Email[2]"`
- Field Name: "Email"
- Field Instance: "2"
- Result: `xpath=(//input[@placeholder='Email'])[2]`

### 4. `${loc.auto.forValue}`

**Purpose**: Replaced with the "for" attribute value from an associated label element

**Example**:
```properties
loc.iExams.pattern.input = "xpath=//input[@id='${loc.auto.forValue}']"
```

**Runtime Substitution**:
- System finds label with text matching field name
- Extracts the "for" attribute value
- Substitutes into pattern

## Pattern Types

### 1. Simple Patterns

Single XPath or CSS selector with one placeholder.

**Example**:
```properties
loc.iExams.pattern.text = "xpath=//span[text()='${loc.auto.fieldName}']"
```

**Use Case**: When element structure is consistent and a single pattern is sufficient.

### 2. Fallback Patterns

Multiple patterns that are tried in sequence until one succeeds.

**Example**:
```properties
loc.iExams.pattern.button = \
  "xpath=//button[text()='${loc.auto.fieldName}']",\
  "xpath=//span[text()='${loc.auto.fieldName}']",\
  "xpath=//button[@label='${loc.auto.fieldName}']",\
  "xpath=//button[contains(text(),'${loc.auto.fieldName}')]"
```

**Use Case**: When element structure varies across pages or application versions.

**Execution Order**: Patterns are attempted in the order they appear in the configuration.

### 3. Parameterized Patterns

Patterns with multiple placeholders for complex element identification.

**Example**:
```properties
loc.iExams.pattern.radioButton = \
  "xpath=//label[text()='${loc.auto.fieldName}']/preceding::div[contains(@class,'ui-radiobutton-box')][1]",\
  "xpath=//p-radiobutton[@label='${loc.auto.fieldValue}']"
```

**Use Case**: When elements require multiple pieces of information for identification.

### 4. Hierarchical Patterns (Sub-types)

Patterns with sub-type qualifiers for specialized element variations.

**Example**:
```properties
# Base checkbox pattern
loc.iExams.pattern.checkbox = "xpath=//p-checkbox[@label='${loc.auto.fieldName}']"

# Fieldset-scoped checkbox pattern
loc.iExams.pattern.checkbox.fieldSet = "xpath=//fieldset//p-checkbox[@label='${loc.auto.fieldName}']"
```

**Use Case**: When the same element type has different structures in different contexts.

## Pattern Naming Conventions

### Element Type Naming

**Convention**: Use camelCase for element types

**Examples**:
- `button` - Standard button elements
- `input` - Input fields
- `dropdown` - Dropdown/select elements
- `radioButton` - Radio button elements
- `checkBox` - Checkbox elements
- `amSession` - AM session checkbox (domain-specific)
- `pmSession` - PM session checkbox (domain-specific)

### Pattern Code Naming

**Convention**: Use dot notation with project identifier

**Format**: `loc.{projectName}.pattern.{elementType}`

**Examples**:
- `loc.iExams.pattern.button`
- `loc.iExams.pattern.input`
- `loc.myProject.pattern.dropdown`

### Sub-type Naming

**Convention**: Use dot notation to indicate hierarchy

**Format**: `loc.{projectName}.pattern.{elementType}.{subType}`

**Examples**:
- `loc.iExams.pattern.checkbox.fieldSet`
- `loc.iExams.pattern.actionMenu.dropdown`
- `loc.iExams.pattern.link.section`

## Pattern Organization

### Grouping by Element Type

Organize patterns by element type for easy maintenance.

**Example Structure**:
```properties
# ============================================
# INPUT PATTERNS
# ============================================
loc.iExams.pattern.input = \
  "xpath=//input[@placeholder='${loc.auto.fieldName}']",\
  "xpath=//label[text()='${loc.auto.fieldName}']/following::input[1]"

loc.iExams.pattern.textarea = \
  "xpath=//textarea[@placeholder='${loc.auto.fieldName}']",\
  "xpath=//textarea[@id='${loc.auto.fieldName}']"

# ============================================
# BUTTON PATTERNS
# ============================================
loc.iExams.pattern.button = \
  "xpath=//button[text()='${loc.auto.fieldName}']",\
  "xpath=//span[text()='${loc.auto.fieldName}']"

# ============================================
# DROPDOWN PATTERNS
# ============================================
loc.iExams.pattern.dropdown = \
  "xpath=//p-dropdown[@placeholder='${loc.auto.fieldName}']",\
  "xpath=//select[@id='${loc.auto.fieldName}']"
```

### Comments and Documentation

Use comments to document pattern purpose and usage.

**Example**:
```properties
# Button patterns - supports standard buttons, spans acting as buttons, and PrimeNG buttons
# Fallback order: text match -> label attribute -> contains text
loc.iExams.pattern.button = \
  "xpath=//button[text()='${loc.auto.fieldName}']",\
  "xpath=//span[text()='${loc.auto.fieldName}']",\
  "xpath=//button[@label='${loc.auto.fieldName}']",\
  "xpath=//button[contains(text(),'${loc.auto.fieldName}')]"
```

## Real-World Pattern Examples

### Example 1: Input Field Patterns

```properties
loc.iExams.pattern.input = \
  "xpath=//p-dropdown[contains(translate(@placeholder, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), translate('${loc.auto.fieldName}', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'))]//input",\
  "xpath=//label[normalize-space()='${loc.auto.fieldName}']/ancestor::div[1]/following-sibling::div/input",\
  "xpath=//input[@placeholder='${loc.auto.fieldName}']",\
  "xpath=//input[@id='${loc.auto.fieldName}']",\
  "xpath=//textarea[@placeholder='${loc.auto.fieldName}']"
```

**Features**:
- Case-insensitive placeholder matching
- Label-based input location
- Direct placeholder match
- ID-based match
- Textarea fallback

### Example 2: Button Patterns

```properties
loc.iExams.pattern.button = \
  "xpath=//button[@type='button'][normalize-space()='${loc.auto.fieldName}']",\
  "xpath=//button[.//span[contains(text(), '${loc.auto.fieldName}')]]",\
  "xpath=//span[text()='${loc.auto.fieldName}']",\
  "xpath=//button[@label='${loc.auto.fieldName}']",\
  "xpath=//div[contains(text(),'${loc.auto.fieldName}')]"
```

**Features**:
- Standard button with type attribute
- Button containing span with text
- Span acting as button
- PrimeNG button with label
- Div acting as button

### Example 3: Dropdown Patterns

```properties
loc.iExams.pattern.dropdown = \
  "xpath=//p-dropdown[@placeholder='${loc.auto.fieldName}']//div[contains(@class, 'ui-widget ui-state-default')]",\
  "xpath=//label[normalize-space()='${loc.auto.fieldName}']/following::div[contains(@class,'ui-dropdown')][1]",\
  "xpath=//select[@id='${loc.auto.fieldName}']",\
  "xpath=//label[contains(text(), '${loc.auto.fieldName}')]/ancestor::div[2]//select"
```

**Features**:
- PrimeNG dropdown by placeholder
- Label-based dropdown location
- Standard HTML select by ID
- Select within labeled container

### Example 4: Radio Button Patterns

```properties
loc.iExams.pattern.radioButton = \
  "xpath=//p-radiobutton[@label='${loc.auto.fieldName}']",\
  "xpath=//label[normalize-space()='${loc.auto.fieldName}']/preceding::div[contains(@class,'ui-radiobutton-box')][1]",\
  "xpath=//p-radiobutton[@value='${loc.auto.fieldValue}']//span[@class='ui-radiobutton-icon ui-clickable']",\
  "xpath=//label[text()='${loc.auto.fieldName}']/preceding-sibling::div//div[contains(@class, 'ui-radiobutton-box')]"
```

**Features**:
- PrimeNG radio button by label
- Radio button before label
- Radio button by value
- Radio button as sibling of label

### Example 5: Checkbox Patterns

```properties
loc.iExams.pattern.checkbox = \
  "xpath=//p-checkbox[@label='${loc.auto.fieldName}']//div[@class='ui-chkbox-box ui-widget ui-corner-all ui-state-default']",\
  "xpath=//label[text()='${loc.auto.fieldName}']/preceding::div[contains(@class,'ui-chkbox-box')][1]",\
  "xpath=//span[text()='${loc.auto.fieldName}']/preceding-sibling::p-checkbox//div[contains(@class, 'ui-chkbox-box')]",\
  "xpath=//tr[td[contains(text(), '${loc.auto.fieldName}')]]//p-tablecheckbox//div[contains(@class, 'ui-chkbox-box')]"
```

**Features**:
- PrimeNG checkbox by label
- Checkbox before label
- Checkbox as sibling of span
- Table row checkbox

### Example 6: Text Element Patterns

```properties
loc.iExams.pattern.text = \
  "xpath=//span[normalize-space()='${loc.auto.fieldName}']",\
  "xpath=//div[contains(text(),'${loc.auto.fieldName}')]",\
  "xpath=//p[contains(text(),'${loc.auto.fieldName}')]",\
  "xpath=//label[contains(text(),'${loc.auto.fieldName}')]",\
  "xpath=//td[contains(text(),'${loc.auto.fieldName}')]",\
  "xpath=//h1[contains(text(),'${loc.auto.fieldName}')]"
```

**Features**:
- Span with exact text
- Div containing text
- Paragraph containing text
- Label containing text
- Table cell containing text
- Heading containing text

### Example 7: Icon Patterns

```properties
loc.iExams.pattern.icon = \
  "xpath=//span[@class='pi pi-${loc.auto.fieldName}']",\
  "xpath=//i[text()='${loc.auto.fieldName}']",\
  "xpath=//i[@class='fa fa-${loc.auto.fieldName} iconColor']",\
  "xpath=//span[@class='ui-button-icon-left ui-clickable pi pi-${loc.auto.fieldName}']"
```

**Features**:
- PrimeNG icon by class
- Material icon by text
- Font Awesome icon
- Button icon

### Example 8: Session-Specific Patterns

```properties
# AM Session checkbox pattern
loc.iExams.pattern.amSession = \
  "xpath=//div[@id='${loc.auto.fieldName}']//div[@class='row']//div[@class='col-lg-3 col-md-3 col-sm-6 col-12']//div//p-checkbox[@value='AM']",\
  "xpath=//div[@id='${loc.auto.fieldName}']/descendant::p-checkbox[@value='AM']/descendant::span[contains(@class,'pi-check')]"

# PM Session checkbox pattern
loc.iExams.pattern.pmSession = \
  "xpath=//div[@id='${loc.auto.fieldName}']//div[@class='row']//div[@class='col-lg-3 col-md-3 col-sm-6 col-12']//div//p-checkbox[@value='PM']",\
  "xpath=//div[@id='${loc.auto.fieldName}']/descendant::p-checkbox[@value='PM']/descendant::span[contains(@class,'pi-check')]"
```

**Features**:
- Domain-specific patterns for exam scheduling
- Day-based session selection
- Hierarchical element location

## Pattern Best Practices

### 1. Order Patterns by Specificity

Place more specific patterns first, followed by more general patterns.

**Good**:
```properties
loc.iExams.pattern.button = \
  "xpath=//button[@type='button'][normalize-space()='${loc.auto.fieldName}']",\
  "xpath=//button[text()='${loc.auto.fieldName}']",\
  "xpath=//button[contains(text(),'${loc.auto.fieldName}')]"
```

**Why**: Specific patterns are faster and more reliable; general patterns serve as fallbacks.

### 2. Use Case-Insensitive Matching When Appropriate

For text matching, consider case variations.

**Example**:
```properties
loc.iExams.pattern.input = \
  "xpath=//input[contains(translate(@placeholder, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), translate('${loc.auto.fieldName}', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'))]"
```

### 3. Include Normalize-Space for Text Matching

Handle extra whitespace in element text.

**Example**:
```properties
loc.iExams.pattern.text = "xpath=//span[normalize-space()='${loc.auto.fieldName}']"
```

### 4. Provide Multiple Fallback Options

Include 3-5 fallback patterns for critical element types.

**Example**:
```properties
loc.iExams.pattern.button = \
  "xpath=//button[text()='${loc.auto.fieldName}']",\
  "xpath=//span[text()='${loc.auto.fieldName}']",\
  "xpath=//button[@label='${loc.auto.fieldName}']",\
  "xpath=//button[contains(text(),'${loc.auto.fieldName}')]",\
  "xpath=//div[contains(text(),'${loc.auto.fieldName}')]"
```

### 5. Document Complex Patterns

Add comments explaining complex XPath expressions.

**Example**:
```properties
# Case-insensitive placeholder matching for PrimeNG dropdowns
# Translates both placeholder and field name to lowercase for comparison
loc.iExams.pattern.dropdown = \
  "xpath=//p-dropdown[contains(translate(@placeholder, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), translate('${loc.auto.fieldName}', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'))]"
```

### 6. Group Related Patterns

Keep patterns for related element types together.

**Example**:
```properties
# ============================================
# FORM INPUT PATTERNS
# ============================================
loc.iExams.pattern.input = ...
loc.iExams.pattern.textarea = ...
loc.iExams.pattern.dropdown = ...
loc.iExams.pattern.checkbox = ...
loc.iExams.pattern.radioButton = ...
```

### 7. Use Consistent Naming

Follow consistent naming conventions across all patterns.

**Good**:
- `radioButton` (camelCase)
- `amSession` (camelCase)
- `buttonLookupLaunch` (camelCase)

**Avoid**:
- `radio_button` (snake_case)
- `AMSession` (PascalCase)
- `button-lookup-launch` (kebab-case)

## Configuration Management

### Pattern Code Configuration

The pattern code must be configured in the project configuration file.

**Configuration Property**:
```properties
loc.pattern.code=loc.iExams
```

**Purpose**: Identifies which set of patterns to use (supports multi-project scenarios).

### Pattern Logging Configuration

Enable pattern logging for debugging.

**Configuration Property**:
```properties
loc.pattern.log=true
```

**Output Example**:
```
==== AUTO GENERATED: LOCATOR (Pattern) ====> auto.loc.iExams.searchPage.button.proceed
= {"locator":["xpath=//button[text()='PROCEED']"],"desc":"PROCEED : [button] Field "}
```

## Multi-Project Support

The pattern system supports multiple projects with different pattern sets.

### Project-Specific Patterns

**Project 1 (iExams)**:
```properties
loc.iExams.pattern.button = "xpath=//button[text()='${loc.auto.fieldName}']"
```

**Project 2 (MyApp)**:
```properties
loc.myApp.pattern.button = "xpath=//a[@role='button'][text()='${loc.auto.fieldName}']"
```

### Switching Between Projects

Configure the active pattern code at runtime:

```java
getBundle().setProperty("loc.pattern.code", "loc.myApp");
```

## Summary

The Pattern Configuration Layer provides:

✅ **Centralized Management**: All patterns in one file  
✅ **Reusability**: Patterns work across multiple pages and tests  
✅ **Flexibility**: Multiple fallback patterns increase reliability  
✅ **Maintainability**: Update patterns in one place  
✅ **Scalability**: Easy to add new element types and patterns  
✅ **Multi-Project Support**: Different pattern sets for different projects  

This layer is the foundation that enables the entire pattern-based locator system to function effectively.
