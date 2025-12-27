# Special Element Types Documentation

## Overview

The pattern-based locator system supports various special element types that require additional parameters or specialized handling. This document covers radio buttons with values, checkboxes with fieldsets, session-specific patterns, lookup buttons, and other complex element interactions.

## Radio Buttons with Values

### Overview

Radio buttons often require both a field name (the radio group) and a value (the specific option to select). The pattern system supports this through parameterized pattern methods.

### Pattern Method Signature

```java
public static String radioButton(String page, String fieldName, String fieldValue) throws Exception {
    String fieldType = "radioButton";
    String locator = checkLoc(page, fieldType, fieldName);
    if (locator.contains("auto.")) {
        // Set the field value for pattern substitution
        getBundle().setProperty("loc.auto.fieldValue", fieldValue);
        generateLoc(locator, fieldName, fieldType);
    }
    return locator;
}
```

**Key Difference**: Accepts three parameters instead of two (adds `fieldValue`)

### Pattern Template

```properties
loc.iExams.pattern.radioButton = \
  "xpath=//p-radiobutton[@label='${loc.auto.fieldName}']",\
  "xpath=//label[normalize-space()='${loc.auto.fieldName}']/preceding::div[contains(@class,'ui-radiobutton-box')][1]",\
  "xpath=//p-radiobutton[@value='${loc.auto.fieldValue}']//span[@class='ui-radiobutton-icon ui-clickable']",\
  "xpath=//label[text()='${loc.auto.fieldName}']/preceding-sibling::div//div[contains(@class, 'ui-radiobutton-box')]"
```

**Placeholders Used**:
- `${loc.auto.fieldName}`: The radio group name
- `${loc.auto.fieldValue}`: The specific option value

### Usage Examples

#### Example 1: Simple Radio Button

```gherkin
When Web: Click-Radio-Button Field:"Gender" Value:"Male"
```

**Execution Flow**:
```
1. Invoke: patternLoc.radioButton("UserProfile", "Gender", "Male")
2. Set: loc.auto.fieldName = "Gender"
3. Set: loc.auto.fieldValue = "Male"
4. Pattern: "xpath=//p-radiobutton[@value='Male']//span[@class='ui-radiobutton-icon']"
5. Click on radio button
```

#### Example 2: Radio Button by Label

```gherkin
When Web: Click-Radio-Button Field:"Exam Type" Value:"Written"
```

**Generated Locators**:
```
Fallback 1: xpath=//p-radiobutton[@label='Exam Type']
Fallback 2: xpath=//label[normalize-space()='Exam Type']/preceding::div[contains(@class,'ui-radiobutton-box')][1]
Fallback 3: xpath=//p-radiobutton[@value='Written']//span[@class='ui-radiobutton-icon ui-clickable']
```

### Composite Action Integration

```java
@QAFTestStep(description = "Web: Click-Radio-Button Field:{field_name} Value:{field_value}")
public static void clickRadioButton_Web(String field_name, String field_value) throws Exception {
    BrowserGlobal.iClickOn(
        waitForFieldToBePresentScrollToCenterViewAndEnabled(
            patternLoc.radioButton(getPageName(), field_name, field_value)
        )
    );
}
```



## Checkboxes with Values

### Overview

Checkboxes can be simple (just a field name) or require a value parameter for specific checkbox options within a group.

### Simple Checkbox Pattern

**Method Signature**:
```java
public static String checkbox(String page, String fieldName) throws Exception {
    String fieldType = "checkbox";
    String locator = checkLoc(page, fieldType, fieldName);
    if (locator.contains("auto.")) {
        generateLoc(locator, fieldName, fieldType);
    }
    return locator;
}
```

**Pattern Template**:
```properties
loc.iExams.pattern.checkbox = \
  "xpath=//p-checkbox[@label='${loc.auto.fieldName}']//div[@class='ui-chkbox-box ui-widget ui-corner-all ui-state-default']",\
  "xpath=//label[text()='${loc.auto.fieldName}']/preceding::div[contains(@class,'ui-chkbox-box')][1]",\
  "xpath=//span[text()='${loc.auto.fieldName}']/preceding-sibling::p-checkbox//div[contains(@class, 'ui-chkbox-box')]"
```

**Usage**:
```gherkin
When Web: Click-Checkbox Field:"Email Notifications"
```

### Checkbox with Value Pattern

**Method Signature**:
```java
public static String checkboxWithValue(String page, String fieldName, String fieldValue) throws Exception {
    String fieldType = "checkbox";
    String locator = checkLoc(page, fieldType, fieldName);
    if (locator.contains("auto.")) {
        getBundle().setProperty("loc.auto.fieldValue", fieldValue);
        generateLoc(locator, fieldName, fieldType);
    }
    return locator;
}
```

**Usage**:
```gherkin
When Web: Click-Checkbox Field:"Preferences" Value:"Daily Digest"
```

## Fieldset-Scoped Patterns

### Overview

Fieldset-scoped patterns are used when elements are contained within a `<fieldset>` element, requiring a more specific locator path.

### Checkbox with Fieldset Pattern

**Method Signature**:
```java
public static String checkboxWithFieldSet(String page, String fieldName, String fieldValue) throws Exception {
    String fieldType = "checkbox.fieldSet";  // Note the sub-type
    String locator = checkLoc(page, fieldType, fieldName);
    if (locator.contains("auto.")) {
        getBundle().setProperty("loc.auto.fieldValue", fieldNameCheck(fieldValue));
        if (fieldInstanceCheck(fieldValue).equalsIgnoreCase("1")) {
            generateLoc(locator, fieldName, fieldType);
        } else {
            generateLoc(locator, fieldName + "[" + fieldInstanceCheck(fieldValue) + "]", fieldType);
        }
    }
    return locator;
}
```

**Key Features**:
- Uses sub-type: `"checkbox.fieldSet"`
- Processes field value for instance notation
- Supports multiple instances: `"Field[2]"`

**Pattern Template**:
```properties
loc.iExams.pattern.checkbox.fieldSet = \
  "xpath=//fieldset//p-checkbox[@label='${loc.auto.fieldName}']//div[contains(@class,'ui-chkbox-box')]",\
  "xpath=//fieldset//label[text()='${loc.auto.fieldName}']/preceding::div[contains(@class,'ui-chkbox-box')][1]",\
  "xpath=//fieldset//span[text()='${loc.auto.fieldValue}']/preceding-sibling::p-checkbox//div[contains(@class, 'ui-chkbox-box')]"
```

**Usage Example**:
```gherkin
When Web: Click-Checkbox-With-Fieldset Field:"Exam Options" Value:"Allow Calculator"
```

**HTML Structure**:
```html
<fieldset>
  <legend>Exam Options</legend>
  <p-checkbox label="Allow Calculator">
    <div class="ui-chkbox-box">...</div>
  </p-checkbox>
</fieldset>
```

### Benefits of Fieldset Scoping

1. **Specificity**: Narrows search to within fieldset
2. **Disambiguation**: Handles duplicate field names in different fieldsets
3. **Structure**: Respects HTML semantic structure
4. **Reliability**: Reduces false matches



## Session-Specific Patterns (AM/PM Sessions)

### Overview

Session-specific patterns are domain-specific element types designed for exam scheduling systems where checkboxes need to be selected for specific time sessions (AM or PM) on specific days.

### AM Session Pattern

**Method Signature**:
```java
public static String amSession(String page, String fieldName) throws Exception {
    String fieldType = "amSession";
    String locator = checkLoc(page, fieldType, fieldName);
    if (locator.contains("auto.")) {
        generateLoc(locator, fieldName, fieldType);
    }
    return locator;
}
```

**Pattern Template**:
```properties
loc.iExams.pattern.amSession = \
  "xpath=//div[@id='${loc.auto.fieldName}']//div[@class='row']//div[@class='col-lg-3 col-md-3 col-sm-6 col-12']//div//p-checkbox[@value='AM']",\
  "xpath=//div[@id='${loc.auto.fieldName}']/descendant::p-checkbox[@value='AM']/descendant::span[contains(@class,'pi-check')]"
```

**Usage Example**:
```gherkin
# Select AM session for Monday
When Web: Click-AM-Session Field:"Monday"
```

**HTML Structure**:
```html
<div id="Monday">
  <div class="row">
    <div class="col-lg-3 col-md-3 col-sm-6 col-12">
      <div>
        <p-checkbox value="AM">
          <span class="pi-check"></span>
        </p-checkbox>
      </div>
    </div>
  </div>
</div>
```

### PM Session Pattern

**Method Signature**:
```java
public static String pmSession(String page, String fieldName) throws Exception {
    String fieldType = "pmSession";
    String locator = checkLoc(page, fieldType, fieldName);
    if (locator.contains("auto.")) {
        generateLoc(locator, fieldName, fieldType);
    }
    return locator;
}
```

**Pattern Template**:
```properties
loc.iExams.pattern.pmSession = \
  "xpath=//div[@id='${loc.auto.fieldName}']//div[@class='row']//div[@class='col-lg-3 col-md-3 col-sm-6 col-12']//div//p-checkbox[@value='PM']",\
  "xpath=//div[@id='${loc.auto.fieldName}']/descendant::p-checkbox[@value='PM']/descendant::span[contains(@class,'pi-check')]"
```

**Usage Example**:
```gherkin
# Select PM session for Tuesday
When Web: Click-PM-Session Field:"Tuesday"
```

### Complete Exam Schedule Example

```gherkin
Scenario: Schedule Exam Sessions
  Given Web: Set-Page-Name Value:"ExamSchedule"
  
  # Monday sessions
  When Web: Click-AM-Session Field:"Monday"
  And Web: Click-PM-Session Field:"Monday"
  
  # Tuesday sessions
  When Web: Click-AM-Session Field:"Tuesday"
  
  # Wednesday sessions
  When Web: Click-PM-Session Field:"Wednesday"
  
  # Verify selections
  Then Web: Verify-Element-Present Element:"amSession" Field:"Monday"
  And Web: Verify-Element-Present Element:"pmSession" Field:"Monday"
  And Web: Verify-Element-Present Element:"amSession" Field:"Tuesday"
  And Web: Verify-Element-Present Element:"pmSession" Field:"Wednesday"
```

### Benefits of Session-Specific Patterns

1. **Domain Clarity**: Clear intent in test steps
2. **Simplified Tests**: No need to specify "AM" or "PM" as value
3. **Type Safety**: Separate methods prevent errors
4. **Maintainability**: Easy to update session logic



## Lookup Button Patterns

### Overview

Lookup buttons are specialized UI components that open lookup dialogs or search interfaces. They typically come in pairs: a launch button and a clear button.

### Lookup Launch Button

**Method Signature**:
```java
public static String buttonLookupLaunch(String page, String fieldName) throws Exception {
    String fieldType = "buttonLookupLaunch";
    String locator = checkLoc(page, fieldType, fieldName);
    if (locator.contains("auto.")) {
        generateLoc(locator, fieldName, fieldType);
    }
    return locator;
}
```

**Pattern Template**:
```properties
loc.iExams.pattern.buttonLookupLaunch = \
  "xpath=//label[normalize-space()='${loc.auto.fieldName}']/following::button[contains(@class,'lookup-launch')][1]",\
  "xpath=//label[text()='${loc.auto.fieldName}']/following::span[contains(@class,'pi-search')][1]",\
  "xpath=//div[contains(@class,'lookup-field')]//label[text()='${loc.auto.fieldName}']/following::button[1]"
```

**Usage Example**:
```gherkin
When Web: Click-Lookup-Launch-Button Field:"Exam Center"
```

### Lookup Clear Button

**Method Signature**:
```java
public static String buttonLookupClear(String page, String fieldName) throws Exception {
    String fieldType = "buttonLookupClear";
    String locator = checkLoc(page, fieldType, fieldName);
    if (locator.contains("auto.")) {
        generateLoc(locator, fieldName, fieldType);
    }
    return locator;
}
```

**Pattern Template**:
```properties
loc.iExams.pattern.buttonLookupClear = \
  "xpath=//label[normalize-space()='${loc.auto.fieldName}']/following::button[contains(@class,'lookup-clear')][1]",\
  "xpath=//label[text()='${loc.auto.fieldName}']/following::span[contains(@class,'pi-times')][1]",\
  "xpath=//div[contains(@class,'lookup-field')]//label[text()='${loc.auto.fieldName}']/following::button[contains(@class,'clear')][1]"
```

**Usage Example**:
```gherkin
When Web: Click-Lookup-Clear-Button Field:"Exam Center"
```

### Complete Lookup Workflow

```gherkin
Scenario: Select Exam Center via Lookup
  Given Web: Set-Page-Name Value:"ExamConfiguration"
  
  # Open lookup dialog
  When Web: Click-Lookup-Launch-Button Field:"Exam Center"
  
  # Search in lookup dialog
  And Web: Set-Page-Name Value:"ExamCenterLookup"
  And Web: Input-Text Value:"Central" Field:"Search"
  And Web: Click-Element Element:"button" Field:"Search"
  
  # Select result
  And Web: Click-Element Element:"link" Field:"Central Exam Center"
  
  # Verify selection
  And Web: Set-Page-Name Value:"ExamConfiguration"
  Then Web: Verify-Element-Present Element:"text" Field:"Central Exam Center"
  
  # Clear selection if needed
  When Web: Click-Lookup-Clear-Button Field:"Exam Center"
  Then Web: Verify-Element-Not-Present Element:"text" Field:"Central Exam Center"
```

### HTML Structure

```html
<div class="lookup-field">
  <label>Exam Center</label>
  <input type="text" readonly value="Central Exam Center" />
  <button class="lookup-launch">
    <span class="pi pi-search"></span>
  </button>
  <button class="lookup-clear">
    <span class="pi pi-times"></span>
  </button>
</div>
```



## Table-Based Element Patterns

### Overview

Table-based patterns handle elements within table structures, including table inputs, checkboxes, and row/column intersections.

### Table Input Patterns

**First Column Input**:
```java
public static String tableInputFirstColumn(String page, String fieldName) throws Exception {
    String fieldType = "tableInputFirstColumn";
    String locator = checkLoc(page, fieldType, fieldName);
    if (locator.contains("auto.")) {
        generateLoc(locator, fieldName, fieldType);
    }
    return locator;
}
```

**Pattern Template**:
```properties
loc.iExams.pattern.tableInputFirstColumn = \
  "xpath=//tr[td[contains(text(), '${loc.auto.fieldName}')]]//td[1]//input",\
  "xpath=//tr[td[normalize-space()='${loc.auto.fieldName}']]//td[position()=1]//input"
```

**Usage**:
```gherkin
When Web: Input-Text-Table-First-Column Value:"100" Field:"Mathematics"
```

**Second Column Input**:
```properties
loc.iExams.pattern.tableInputSecondColumn = \
  "xpath=//tr[td[contains(text(), '${loc.auto.fieldName}')]]//td[2]//input",\
  "xpath=//tr[td[normalize-space()='${loc.auto.fieldName}']]//td[position()=2]//input"
```

### Table Checkbox Pattern

**Pattern Template**:
```properties
loc.iExams.pattern.tableCheckbox = \
  "xpath=//tr[td[contains(text(), '${loc.auto.fieldName}')]]//p-tablecheckbox//div[contains(@class, 'ui-chkbox-box')]",\
  "xpath=//tr[td[normalize-space()='${loc.auto.fieldName}']]//input[@type='checkbox']"
```

**Usage**:
```gherkin
When Web: Click-Table-Checkbox Field:"John Doe"
```

### Row-Column Intersection Pattern

**Method Signature**:
```java
public static String rowColumn(String page, String fieldName) throws Exception {
    String fieldType = "rowColumn";
    String locator = checkLoc(page, fieldType, fieldName);
    if (locator.contains("auto.")) {
        // fieldName format: "RowName::ColumnName"
        String[] parts = fieldName.split("::");
        getBundle().setProperty("loc.auto.rowName", parts[0]);
        getBundle().setProperty("loc.auto.columnName", parts[1]);
        generateLoc(locator, fieldName, fieldType);
    }
    return locator;
}
```

**Pattern Template**:
```properties
loc.iExams.pattern.rowColumn = \
  "xpath=//tr[td[contains(text(),'${loc.auto.rowName}')]]//td[count(//table//th[contains(text(),'${loc.auto.columnName}')]/preceding-sibling::th)+1]",\
  "xpath=//tr[td[normalize-space()='${loc.auto.rowName}']]//td[position()=count(//th[normalize-space()='${loc.auto.columnName}']/preceding-sibling::th)+1]"
```

**Usage**:
```gherkin
# Click cell at intersection of "John Doe" row and "Score" column
When Web: Click-Element Element:"rowColumn" Field:"John Doe::Score"
```

**HTML Structure**:
```html
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Score</th>
      <th>Grade</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td>95</td>
      <td>A</td>
    </tr>
  </tbody>
</table>
```

## Complex Element Interactions

### Multi-Step Element Patterns

Some elements require multiple steps to interact with properly.

#### Dropdown with Search

```gherkin
Scenario: Select from Searchable Dropdown
  # Open dropdown
  When Web: Click-Element Element:"dropdown" Field:"Country"
  
  # Type to search
  And Web: Input-Text Value:"Sing" Field:"Country Search"
  
  # Select from filtered results
  And Web: Click-Element Element:"dropdownOption" Field:"Singapore"
```

#### Date Picker Interaction

```gherkin
Scenario: Select Date from Date Picker
  # Open date picker
  When Web: Click-Element Element:"datePicker" Field:"Exam Date"
  
  # Navigate to month
  And Web: Click-Element Element:"button" Field:"Next Month"
  
  # Select day
  And Web: Click-Element Element:"date" Field:"15"
  
  # Confirm selection
  And Web: Click-Element Element:"button" Field:"OK"
```

#### File Upload

```gherkin
Scenario: Upload File
  # Click upload button
  When Web: Click-Element Element:"button" Field:"Upload Document"
  
  # Set file path (using file input)
  And Web: Input-Text Value:"C:/Documents/certificate.pdf" Field:"File Input"
  
  # Confirm upload
  And Web: Click-Element Element:"button" Field:"Upload"
  
  # Verify upload
  Then Web: Verify-Element-Present Element:"text" Field:"certificate.pdf"
```



## Pattern Sub-Types

### Overview

Pattern sub-types allow different patterns for the same base element type in different contexts. They use dot notation: `elementType.subType`

### Checkbox Sub-Types

**Base Checkbox**:
```properties
loc.iExams.pattern.checkbox = "xpath=//p-checkbox[@label='${loc.auto.fieldName}']"
```

**Fieldset Checkbox**:
```properties
loc.iExams.pattern.checkbox.fieldSet = "xpath=//fieldset//p-checkbox[@label='${loc.auto.fieldName}']"
```

**Table Checkbox**:
```properties
loc.iExams.pattern.checkbox.table = "xpath=//tr[td[text()='${loc.auto.fieldName}']]//p-checkbox"
```

### Dropdown Sub-Types

**Standard Dropdown**:
```properties
loc.iExams.pattern.dropdown = "xpath=//p-dropdown[@placeholder='${loc.auto.fieldName}']"
```

**Form Dropdown**:
```properties
loc.iExams.pattern.dropdown.form = "xpath=//form//p-dropdown[@placeholder='${loc.auto.fieldName}']"
```

**Action Menu Dropdown**:
```properties
loc.iExams.pattern.dropdown.actionMenu = "xpath=//div[@class='action-menu']//p-dropdown[@placeholder='${loc.auto.fieldName}']"
```

### Usage Example

```gherkin
# Uses base checkbox pattern
When Web: Click-Checkbox Field:"Email Notifications"

# Uses fieldset checkbox pattern
When Web: Click-Checkbox-With-Fieldset Field:"Exam Options" Value:"Allow Calculator"

# Uses table checkbox pattern
When Web: Click-Table-Checkbox Field:"John Doe"
```

## Creating Custom Special Element Types

### Step 1: Define Pattern Method

```java
public static String customElement(String page, String fieldName) throws Exception {
    String fieldType = "customElement";
    String locator = checkLoc(page, fieldType, fieldName);
    if (locator.contains("auto.")) {
        generateLoc(locator, fieldName, fieldType);
    }
    return locator;
}
```

### Step 2: Add Pattern Template

```properties
loc.iExams.pattern.customElement = \
  "xpath=//custom-element[@label='${loc.auto.fieldName}']",\
  "xpath=//div[@data-field='${loc.auto.fieldName}']//custom-element"
```

### Step 3: Create Composite Action

```java
@QAFTestStep(description = "Web: Click-Custom-Element Field:{field_name}")
public static void clickCustomElement_Web(String field_name) throws Exception {
    BrowserGlobal.iClickOn(
        waitForFieldToBePresentScrollToCenterViewAndEnabled(
            patternLoc.customElement(getPageName(), field_name)
        )
    );
}
```

### Step 4: Use in Tests

```gherkin
When Web: Click-Custom-Element Field:"My Custom Field"
```

## Best Practices for Special Elements

### 1. Use Descriptive Element Type Names

**Good**:
- `buttonLookupLaunch`
- `checkboxWithFieldSet`
- `tableInputFirstColumn`

**Avoid**:
- `button1`
- `checkbox2`
- `input3`

### 2. Provide Multiple Fallback Patterns

```properties
loc.iExams.pattern.radioButton = \
  "xpath=//p-radiobutton[@label='${loc.auto.fieldName}']",\
  "xpath=//label[text()='${loc.auto.fieldName}']/preceding::div[contains(@class,'ui-radiobutton-box')][1]",\
  "xpath=//p-radiobutton[@value='${loc.auto.fieldValue}']//span[@class='ui-radiobutton-icon']"
```

### 3. Document Special Parameters

```java
/**
 * Radio button pattern with value parameter
 * @param page Page context
 * @param fieldName Radio group name
 * @param fieldValue Specific option to select
 */
public static String radioButton(String page, String fieldName, String fieldValue) throws Exception
```

### 4. Use Sub-Types for Context-Specific Patterns

```properties
# Base pattern
loc.iExams.pattern.checkbox = "xpath=//p-checkbox[@label='${loc.auto.fieldName}']"

# Context-specific patterns
loc.iExams.pattern.checkbox.fieldSet = "xpath=//fieldset//p-checkbox[@label='${loc.auto.fieldName}']"
loc.iExams.pattern.checkbox.table = "xpath=//tr[td[text()='${loc.auto.fieldName}']]//p-checkbox"
```

### 5. Test All Fallback Patterns

Verify each fallback pattern works independently:

```gherkin
# Test each pattern variant
Scenario: Verify Radio Button Patterns
  # Pattern 1: By label
  When Web: Click-Radio-Button Field:"Gender" Value:"Male"
  
  # Pattern 2: By value
  When Web: Click-Radio-Button Field:"Exam Type" Value:"Written"
  
  # Pattern 3: By preceding label
  When Web: Click-Radio-Button Field:"Session" Value:"AM"
```

## Requirements Validation

This documentation addresses the following requirements:

### Requirement 8.1: Radio Button and Checkbox Patterns with Values
✅ **Documented**: Complete coverage with examples

### Requirement 8.2: Fieldset-Scoped Patterns
✅ **Documented**: Checkbox with fieldset pattern and usage

### Requirement 8.3: Session-Specific Patterns
✅ **Documented**: AM/PM session patterns for exam scheduling

### Requirement 8.4: Complex Element Interactions
✅ **Documented**: Multi-step interactions and table patterns

### Requirement 8.5: Pattern Sub-Types and Extension
✅ **Documented**: Sub-type patterns and custom element creation

## Summary

The Special Element Types documentation provides comprehensive coverage of advanced element patterns:

### Special Element Categories

1. **Radio Buttons with Values**: Three-parameter pattern methods
2. **Checkboxes with Values**: Simple and value-based patterns
3. **Fieldset-Scoped Elements**: Context-specific patterns
4. **Session-Specific Patterns**: Domain-specific AM/PM sessions
5. **Lookup Buttons**: Launch and clear button pairs
6. **Table-Based Elements**: Row/column intersection patterns
7. **Pattern Sub-Types**: Context-specific variations

### Key Features

- **Parameterized Patterns**: Support for additional parameters (fieldValue)
- **Sub-Type Patterns**: Context-specific variations using dot notation
- **Domain-Specific Patterns**: Specialized patterns for business domains
- **Complex Interactions**: Multi-step element interactions
- **Extensibility**: Guidelines for creating custom element types

### Pattern Techniques

- **Multiple Placeholders**: `${loc.auto.fieldName}`, `${loc.auto.fieldValue}`
- **Hierarchical Scoping**: Fieldset, table, form scoping
- **Instance Notation**: Support for `Field[2]` syntax
- **Row-Column Intersection**: Dynamic table cell location
- **Sub-Type Patterns**: `elementType.subType` notation

This comprehensive coverage enables handling of complex UI patterns and domain-specific requirements while maintaining the pattern-based approach.
