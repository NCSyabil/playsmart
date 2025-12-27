# Extension Points Documentation

## Overview

This document provides guidance on extending the pattern-based locator system to support new element types, custom placeholder variables, pattern inheritance, and multi-project configurations. These extension points allow the system to adapt to new requirements without modifying core functionality.

## Adding New Element Types

### Step-by-Step Guide

#### Step 1: Identify Element Type Requirements

**Questions to Answer**:
- What is the element type name? (e.g., "slider", "datepicker", "fileUpload")
- Does it require additional parameters? (e.g., value, index, section)
- What are common XPath/CSS patterns for this element?
- Does it need special handling in atomic actions?

**Example**: Adding a "slider" element type
```
Element Type: slider
Parameters: page, fieldName, value (optional)
Common Patterns:
  - xpath=//label[text()='${loc.auto.fieldName}']/following::input[@type='range']
  - xpath=//div[@aria-label='${loc.auto.fieldName}']//input[@type='range']
```

#### Step 2: Add Pattern Method to patternLoc.java

**Basic Pattern Method (No Additional Parameters)**:
```java
/**
 * @param page [Page of the locator]
 * @param fieldName [Field Name: e.g., Volume, Brightness]
 */
public static String slider(String page, String fieldName) throws Exception {
    String fieldType = "slider";
    String locator = checkLoc(page, fieldType, fieldName);
    if (locator.contains("auto.")) {
        generateLoc(locator, fieldName, fieldType);
    }
    return locator;
}
```

**Pattern Method with Additional Parameters**:
```java
/**
 * @param page [Page of the locator]
 * @param fieldName [Field Name: e.g., Volume]
 * @param value [Value to set: e.g., 50, 75]
 */
public static String slider(String page, String fieldName, String value) throws Exception {
    String fieldType = "slider";
    String locator = checkLoc(page, fieldType, fieldName);
    if (locator.contains("auto.")) {
        // Set additional parameter for pattern substitution
        getBundle().setProperty("loc.auto.fieldValue", value);
        generateLoc(locator, fieldName, fieldType);
    }
    return locator;
}
```

#### Step 3: Add Pattern Template to locPattern.properties

**Simple Pattern**:
```properties
loc.iExams.pattern.slider = \
"xpath=//label[text()='${loc.auto.fieldName}']/following::input[@type='range']",\
"xpath=//div[@aria-label='${loc.auto.fieldName}']//input[@type='range']",\
"xpath=//input[@type='range' and @name='${loc.auto.fieldName}']"
```

**Pattern with Additional Placeholder**:
```properties
loc.iExams.pattern.slider = \
"xpath=//label[text()='${loc.auto.fieldName}']/following::input[@type='range' and @value='${loc.auto.fieldValue}']",\
"xpath=//div[@aria-label='${loc.auto.fieldName}']//input[@type='range' and @value='${loc.auto.fieldValue}']"
```

#### Step 4: Create Composite Action in web.java

**Basic Composite Action**:
```java
/**
 * @param value [Value to set on slider]
 * @param field [Field name]
 */
@QAFTestStep(description = "Web: Set Slider {1} to {0}")
@And("Web: Set Slider {string} to {string}")
public static void setSlider_Web(String field, String value) throws Exception {
    BrowserGlobal.iWaitUntilElementPresent(patternLoc.slider(getPageName(), field));
    BrowserGlobal.iScrollToAnElement(patternLoc.slider(getPageName(), field));
    BrowserGlobal.iWaitUntilElementVisible(patternLoc.slider(getPageName(), field));
    BrowserGlobal.iSetSliderValue(patternLoc.slider(getPageName(), field), value);
}
```

#### Step 5: Add Atomic Action to BrowserGlobal.java (if needed)

**Custom Atomic Action**:
```java
/**
 * Set slider value using JavaScript
 * @param locator [Locator key]
 * @param value [Value to set]
 */
public static void iSetSliderValue(String locator, String value) throws Exception {
    QAFExtendedWebElement element = $(locator);
    JavascriptExecutor js = (JavascriptExecutor) getDriver();
    js.executeScript("arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input'));", 
        element, value);
}
```

#### Step 6: Test the New Element Type

**Test Feature**:
```gherkin
Given Web: Set Page Name "SettingsPage"
When Web: Set Slider "Volume" to "75"
Then Web: Verify Slider "Volume" has value "75"
```

### Complete Example: Adding "Toggle Switch" Element Type

**1. Pattern Method (patternLoc.java)**:
```java
/**
 * @param page [Page of the locator]
 * @param fieldName [Field Name: e.g., Dark Mode, Notifications]
 */
public static String toggleSwitch(String page, String fieldName) throws Exception {
    String fieldType = "toggleSwitch";
    String locator = checkLoc(page, fieldType, fieldName);
    if (locator.contains("auto.")) {
        generateLoc(locator, fieldName, fieldType);
    }
    return locator;
}
```

**2. Pattern Template (locPattern.properties)**:
```properties
loc.iExams.pattern.toggleSwitch = \
"xpath=//label[text()='${loc.auto.fieldName}']/following::div[@role='switch']",\
"xpath=//div[@aria-label='${loc.auto.fieldName}' and @role='switch']",\
"xpath=//p-inputswitch[@formcontrolname='${loc.auto.fieldName}']/descendant::div[@role='checkbox']"
```

**3. Composite Action (web.java)**:
```java
@QAFTestStep(description = "Web: Toggle Switch {0}")
@And("Web: Toggle Switch {string}")
public static void toggleSwitch_Web(String field) throws Exception {
    BrowserGlobal.iWaitUntilElementPresent(patternLoc.toggleSwitch(getPageName(), field));
    BrowserGlobal.iScrollToAnElement(patternLoc.toggleSwitch(getPageName(), field));
    BrowserGlobal.iClickOn(patternLoc.toggleSwitch(getPageName(), field));
}
```

**4. Test Usage**:
```gherkin
Given Web: Set Page Name "PreferencesPage"
When Web: Toggle Switch "Dark Mode"
And Web: Toggle Switch "Email Notifications"
Then Web: Verify Toggle Switch "Dark Mode" is enabled
```


## Adding Custom Placeholder Variables

### Built-in Placeholders

The system provides these built-in placeholders:
- `${loc.auto.fieldName}` - The field name (processed)
- `${loc.auto.fieldInstance}` - The field instance number (default: "1")
- `${loc.auto.fieldValue}` - Additional value parameter (for radio buttons, etc.)
- `${loc.auto.forValue}` - The "for" attribute value from label elements
- `${loc.auto.pageName}` - The current page name

### Creating Custom Placeholders

#### Step 1: Identify the Need

**Use Cases for Custom Placeholders**:
- Dynamic section identifiers
- Row/column indices for tables
- Custom attribute values
- Computed values based on test data

**Example**: Adding row and column placeholders for table cells

#### Step 2: Set Placeholder Value in Pattern Method

**Example: Table Cell with Row/Column**:
```java
/**
 * @param page [Page of the locator]
 * @param row [Row number]
 * @param column [Column number]
 */
public static String tableCell(String page, String row, String column) throws Exception {
    String fieldType = "tableCell";
    String locator = checkLoc(page, fieldType, "");
    
    if (locator.contains("auto.")) {
        // Set custom placeholders
        getBundle().setProperty("loc.auto.rowNumber", row);
        getBundle().setProperty("loc.auto.colNumber", column);
        generateLoc(locator, "", fieldType);
    }
    
    return locator;
}
```

#### Step 3: Use Placeholder in Pattern Template

**Pattern Template**:
```properties
loc.iExams.pattern.tableCell = \
"xpath=//table//tr[${loc.auto.rowNumber}]/td[${loc.auto.colNumber}]",\
"xpath=//table//tbody/tr[${loc.auto.rowNumber}]/td[${loc.auto.colNumber}]"
```

#### Step 4: Create Composite Action

**Composite Action**:
```java
@QAFTestStep(description = "Web: Click Table Cell at row {0} column {1}")
@And("Web: Click Table Cell at row {string} column {string}")
public static void clickTableCell_Web(String row, String column) throws Exception {
    BrowserGlobal.iWaitUntilElementPresent(patternLoc.tableCell(getPageName(), row, column));
    BrowserGlobal.iClickOn(patternLoc.tableCell(getPageName(), row, column));
}
```

#### Step 5: Test Usage

**Test Feature**:
```gherkin
Given Web: Set Page Name "DataTablePage"
When Web: Click Table Cell at row "3" column "5"
Then Web: Verify Table Cell at row "3" column "5" contains "Expected Value"
```

### Advanced Custom Placeholder Example: Dynamic Section

**Scenario**: Elements within collapsible sections that have dynamic IDs

**Pattern Method**:
```java
/**
 * @param page [Page of the locator]
 * @param section [Section name]
 * @param fieldName [Field name within section]
 */
public static String sectionInput(String page, String section, String fieldName) throws Exception {
    String fieldType = "sectionInput";
    String locator = checkLoc(page, fieldType, fieldName);
    
    if (locator.contains("auto.")) {
        // Set section as custom placeholder
        getBundle().setProperty("loc.auto.sectionName", section);
        generateLoc(locator, fieldName, fieldType);
    }
    
    return locator;
}
```

**Pattern Template**:
```properties
loc.iExams.pattern.sectionInput = \
"xpath=//div[contains(@class,'section') and .//h3[text()='${loc.auto.sectionName}']]//input[@placeholder='${loc.auto.fieldName}']",\
"xpath=//section[@aria-label='${loc.auto.sectionName}']//input[@placeholder='${loc.auto.fieldName}']"
```

**Composite Action**:
```java
@QAFTestStep(description = "Web: Input {0} into {1} in section {2}")
@And("Web: Input {string} into {string} in section {string}")
public static void inputInSection_Web(String text, String field, String section) throws Exception {
    BrowserGlobal.iInputInTo(text, patternLoc.sectionInput(getPageName(), section, field));
}
```

**Test Usage**:
```gherkin
Given Web: Set Page Name "FormPage"
When Web: Input "John Doe" into "Name" in section "Personal Information"
And Web: Input "john@example.com" into "Email" in section "Contact Details"
```

## Pattern Inheritance and Sub-Types

### Understanding Pattern Sub-Types

Pattern sub-types allow specialization of element types for specific contexts without creating entirely new element types.

**Naming Convention**: `{elementType}.{subType}`

**Examples**:
- `checkbox.fieldSet` - Checkbox within a fieldset
- `link.section` - Link within a specific section
- `button.modal` - Button within a modal dialog
- `input.table` - Input field within a table

### Creating Pattern Sub-Types

#### Step 1: Define Sub-Type Pattern Method

**Example: Modal Button Sub-Type**:
```java
/**
 * @param page [Page of the locator]
 * @param fieldName [Button name within modal]
 */
public static String buttonModal(String page, String fieldName) throws Exception {
    String fieldType = "button.modal";  // Sub-type notation
    String locator = checkLoc(page, fieldType, fieldName);
    if (locator.contains("auto.")) {
        generateLoc(locator, fieldName, fieldType);
    }
    return locator;
}
```

#### Step 2: Define Sub-Type Pattern Template

**Pattern Template**:
```properties
# Base button pattern
loc.iExams.pattern.button = \
"xpath=//button[contains(text(),'${loc.auto.fieldName}')]",\
"xpath=//span[text()='${loc.auto.fieldName}']"

# Modal button sub-type (more specific)
loc.iExams.pattern.button.modal = \
"xpath=//div[@role='dialog']//button[contains(text(),'${loc.auto.fieldName}')]",\
"xpath=//p-dialog//button[@label='${loc.auto.fieldName}']",\
"xpath=//div[contains(@class,'modal')]//button[contains(text(),'${loc.auto.fieldName}')]"
```

#### Step 3: Create Composite Action

**Composite Action**:
```java
@QAFTestStep(description = "Web: Click Modal Button {0}")
@And("Web: Click Modal Button {string}")
public static void clickModalButton_Web(String field) throws Exception {
    BrowserGlobal.iWaitUntilElementPresent(patternLoc.buttonModal(getPageName(), field));
    BrowserGlobal.iClickOn(patternLoc.buttonModal(getPageName(), field));
}
```

#### Step 4: Test Usage

**Test Feature**:
```gherkin
Given Web: Set Page Name "HomePage"
When Web: Click Button "Open Settings"
And Web: Wait for "1" seconds
And Web: Click Modal Button "Save"
And Web: Click Modal Button "Close"
```

### Pattern Inheritance Example: Checkbox Variants

**Base Checkbox Pattern**:
```properties
loc.iExams.pattern.checkbox = \
"xpath=//label[text()='${loc.auto.fieldName}']/following::input[@type='checkbox']",\
"xpath=//input[@type='checkbox' and @name='${loc.auto.fieldName}']"
```

**Fieldset Checkbox Sub-Type**:
```properties
loc.iExams.pattern.checkbox.fieldSet = \
"xpath=//fieldset[.//legend[text()='${loc.auto.fieldValue}']]/descendant::label[text()='${loc.auto.fieldName}']/following::input[@type='checkbox'][1]"
```

**Table Checkbox Sub-Type**:
```properties
loc.iExams.pattern.checkbox.table = \
"xpath=//table//tr[contains(., '${loc.auto.fieldName}')]//input[@type='checkbox']",\
"xpath=//td[text()='${loc.auto.fieldName}']/ancestor::tr//input[@type='checkbox']"
```

**Usage**:
```java
// Base checkbox
patternLoc.checkbox("FormPage", "Accept Terms");

// Fieldset checkbox
patternLoc.checkboxWithFieldSet("FormPage", "Email Notifications", "Preferences");

// Table checkbox
patternLoc.checkboxTable("DataPage", "Row Item Name");
```

## Multi-Project Support

### Understanding Multi-Project Configuration

The pattern system supports multiple projects through the pattern code configuration, allowing different projects to have different pattern templates while sharing the same codebase.

**Pattern Code**: A unique identifier for each project's pattern configuration

**Example Pattern Codes**:
- `loc.iExams` - iExams project
- `loc.portal` - Portal project
- `loc.admin` - Admin project

### Setting Up Multi-Project Support

#### Step 1: Configure Pattern Code per Project

**application.properties (Project 1: iExams)**:
```properties
loc.pattern.code=loc.iExams
loc.pattern.log=true
```

**application.properties (Project 2: Portal)**:
```properties
loc.pattern.code=loc.portal
loc.pattern.log=true
```

#### Step 2: Create Project-Specific Pattern Files

**locPattern.properties (Shared File)**:
```properties
# iExams Project Patterns
loc.iExams.pattern.button = \
"xpath=//button[contains(text(),'${loc.auto.fieldName}')]",\
"xpath=//span[text()='${loc.auto.fieldName}']"

loc.iExams.pattern.input = \
"xpath=//input[@placeholder='${loc.auto.fieldName}']",\
"xpath=//label[text()='${loc.auto.fieldName}']/following::input[1]"

# Portal Project Patterns
loc.portal.pattern.button = \
"xpath=//button[@aria-label='${loc.auto.fieldName}']",\
"xpath=//a[@role='button' and contains(text(),'${loc.auto.fieldName}')]"

loc.portal.pattern.input = \
"xpath=//div[@data-field='${loc.auto.fieldName}']//input",\
"xpath=//input[@name='${loc.auto.fieldName}']"
```

**Alternative: Separate Pattern Files**:

**locPattern_iExams.properties**:
```properties
loc.iExams.pattern.button = "xpath=//button[contains(text(),'${loc.auto.fieldName}')]"
loc.iExams.pattern.input = "xpath=//input[@placeholder='${loc.auto.fieldName}']"
```

**locPattern_portal.properties**:
```properties
loc.portal.pattern.button = "xpath=//button[@aria-label='${loc.auto.fieldName}']"
loc.portal.pattern.input = "xpath=//div[@data-field='${loc.auto.fieldName}']//input"
```

#### Step 3: Dynamic Pattern Code Resolution

**Enhanced getPatternCode() Method**:
```java
public static String getPatternCode() {
    String patternCodeVal = getBundle().getPropertyValue("loc.pattern.code");
    
    if (patternCodeVal.equals("loc.pattern.code")) {
        // Fallback to default if not configured
        System.out.println("=====>[WARNING] => [Locator Pattern Code missing, using default: loc.iExams]");
        patternCodeVal = "loc.iExams";
    }
    
    return patternCodeVal;
}
```

#### Step 4: Project-Specific Test Execution

**TestNG XML (iExams Project)**:
```xml
<suite name="iExams Test Suite">
    <parameter name="loc.pattern.code" value="loc.iExams"/>
    <test name="iExams Tests">
        <classes>
            <class name="com.ahq.tests.iExamsTests"/>
        </classes>
    </test>
</suite>
```

**TestNG XML (Portal Project)**:
```xml
<suite name="Portal Test Suite">
    <parameter name="loc.pattern.code" value="loc.portal"/>
    <test name="Portal Tests">
        <classes>
            <class name="com.ahq.tests.PortalTests"/>
        </classes>
    </test>
</suite>
```

### Multi-Project Best Practices

**1. Shared Core, Project-Specific Patterns**:
```
src/test/java/com/ahq/addons/
  └─ patternLoc.java (shared)

src/test/java/com/ahq/globals/
  └─ web.java (shared)
  └─ BrowserGlobal.java (shared)

resources/locators/
  └─ locPattern.properties (all projects)
  OR
  └─ locPattern_iExams.properties
  └─ locPattern_portal.properties
  └─ locPattern_admin.properties
```

**2. Environment-Specific Configuration**:
```
resources/
  └─ application.properties (default)
  └─ application-iexams.properties
  └─ application-portal.properties
```

**3. Pattern Code Inheritance**:
```properties
# Base patterns (shared across projects)
loc.base.pattern.button = "xpath=//button[contains(text(),'${loc.auto.fieldName}')]"

# Project-specific patterns (override base)
loc.iExams.pattern.button = "xpath=//button[@class='exam-btn' and contains(text(),'${loc.auto.fieldName}')]"
loc.portal.pattern.button = "xpath=//button[@class='portal-btn' and contains(text(),'${loc.auto.fieldName}')]"
```

## Extension Checklist

### Adding New Element Type
- [ ] Identify element type name and requirements
- [ ] Add pattern method to patternLoc.java
- [ ] Add pattern template to locPattern.properties
- [ ] Create composite action in web.java
- [ ] Add atomic action to BrowserGlobal.java (if needed)
- [ ] Write test scenarios
- [ ] Document usage examples

### Adding Custom Placeholder
- [ ] Identify placeholder name and purpose
- [ ] Set placeholder value in pattern method using getBundle().setProperty()
- [ ] Use placeholder in pattern template with ${loc.auto.placeholderName}
- [ ] Update composite action to pass required parameters
- [ ] Test placeholder substitution
- [ ] Document placeholder usage

### Creating Pattern Sub-Type
- [ ] Identify base element type
- [ ] Define sub-type naming (elementType.subType)
- [ ] Create sub-type pattern method
- [ ] Add sub-type pattern template
- [ ] Create specialized composite action
- [ ] Test sub-type resolution
- [ ] Document sub-type purpose and usage

### Setting Up Multi-Project Support
- [ ] Define pattern codes for each project
- [ ] Configure loc.pattern.code in application.properties
- [ ] Create project-specific pattern templates
- [ ] Test pattern resolution for each project
- [ ] Document project-specific patterns
- [ ] Create project-specific test suites

## Requirements Validation

This documentation addresses the following requirements:

**Requirement 1.1, 1.2, 1.3**: ✅ Documented how to add new pattern templates and element types
- Step-by-step guide for adding new element types
- Examples of pattern template creation
- Guidance on pattern method implementation

**Requirement 2.1, 2.2**: ✅ Documented how to extend locator key generation
- Custom placeholder variable creation
- Dynamic locator key generation for new element types

**Requirement 8.5**: ✅ Documented pattern sub-types and inheritance
- Pattern sub-type naming conventions
- Sub-type pattern template examples
- Inheritance patterns for element variants

**Multi-Project Support**: ✅ Documented multi-project configuration
- Pattern code configuration
- Project-specific pattern templates
- Environment-specific setup

## Summary

This documentation provides comprehensive guidance on extending the pattern-based locator system:

- **Adding new element types**: Step-by-step process from pattern method to test usage
- **Custom placeholder variables**: How to create and use custom placeholders for dynamic patterns
- **Pattern inheritance and sub-types**: Specializing element types for specific contexts
- **Multi-project support**: Configuring the system for multiple projects with different pattern templates

These extension points enable the system to adapt to new requirements, support different applications, and scale across multiple projects while maintaining a consistent architecture and approach.
