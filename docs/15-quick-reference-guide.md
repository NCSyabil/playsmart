# Quick Reference Guide

## Overview

This quick reference guide provides test engineers with a concise reference for using the pattern-based locator system. It includes all available test steps, pattern template syntax, common operations, and troubleshooting tips.

## Test Step Reference

### Page Context Management

```gherkin
# Set the current page name
Given Web: Set Page Name "HomePage"

# Set a field location (hierarchical context)
And Web: Set Field Location "::Section Name"

# Remove field location (return to base page)
And Web: Remove Field Location
```

**Examples**:
```gherkin
Given Web: Set Page Name "ExamConfigPage"
And Web: Set Field Location "::General Settings"
# Now context is: ExamConfigPage::General Settings

And Web: Remove Field Location
# Now context is: ExamConfigPage
```

### Button Actions

```gherkin
# Click a button by its text/label
When Web: Click Button "Button Text"
```

**Examples**:
```gherkin
When Web: Click Button "Submit"
And Web: Click Button "Save"
And Web: Click Button "Next"
And Web: Click Button "Search"
```

### Input Actions

```gherkin
# Input text into a field
When Web: Input "text" into "Field Name"
```

**Examples**:
```gherkin
When Web: Input "John Doe" into "Full Name"
And Web: Input "john@example.com" into "Email Address"
And Web: Input "2024-12-31" into "Date"
And Web: Input "Test data" into "Comments"
```

### Dropdown/Select Actions

```gherkin
# Select dropdown option by visible text
When Web: Select Dropdown with text "Option Text" in "Field Name"
```

**Examples**:
```gherkin
When Web: Select Dropdown with text "United States" in "Country"
And Web: Select Dropdown with text "Male" in "Gender"
And Web: Select Dropdown with text "Option 1" in "Category"
```

### Checkbox Actions

```gherkin
# Click a checkbox (toggle)
When Web: Click Checkbox "Checkbox Label"

# Click checkbox within a fieldset
When Web: Click Checkbox with fieldset "Fieldset Name" and text "Checkbox Label"
```

**Examples**:
```gherkin
When Web: Click Checkbox "Accept Terms"
And Web: Click Checkbox "Email Notifications"
And Web: Click Checkbox with fieldset "Preferences" and text "SMS Alerts"
```

### Radio Button Actions

```gherkin
# Click radio button with specific value
When Web: Click Radio Button with text "Value" in "Field Name"
```

**Examples**:
```gherkin
When Web: Click Radio Button with text "Credit Card" in "Payment Method"
And Web: Click Radio Button with text "Yes" in "Subscribe to Newsletter"
And Web: Click Radio Button with text "Male" in "Gender"
```

### Link Actions

```gherkin
# Click a link by its text
When Web: Click Link "Link Text"
```

**Examples**:
```gherkin
When Web: Click Link "Forgot Password"
And Web: Click Link "Terms and Conditions"
And Web: Click Link "View Details"
```

### Verification Actions

```gherkin
# Verify exact text
Then Web: Verify Text "Expected Text"

# Verify text contains
Then Web: Verify Text Contains "Partial Text"

# Verify element is visible
Then Web: Verify Element "Field Name" is visible

# Verify element is not visible
Then Web: Verify Element "Field Name" is not visible
```

**Examples**:
```gherkin
Then Web: Verify Text "Registration Successful"
And Web: Verify Text Contains "Welcome"
And Web: Verify Element "Success Message" is visible
And Web: Verify Element "Error Message" is not visible
```

### Wait Actions

```gherkin
# Wait for specific seconds
And Web: Wait for "2" seconds

# Wait for element to be present
And Web: Wait for Element "Field Name" to be present

# Wait for element to be visible
And Web: Wait for Element "Field Name" to be visible
```

**Examples**:
```gherkin
And Web: Wait for "3" seconds
And Web: Wait for Element "Loading Spinner" to be present
And Web: Wait for Element "Success Message" to be visible
```

## Pattern Template Syntax

### Basic Pattern Structure

```properties
loc.{patternCode}.pattern.{elementType} = "xpath=//element[@attribute='${loc.auto.fieldName}']"
```

### Available Placeholders

| Placeholder | Description | Example Value |
|------------|-------------|---------------|
| `${loc.auto.fieldName}` | Field name (processed) | "Email Address" |
| `${loc.auto.fieldInstance}` | Field instance number | "1", "2", "3" |
| `${loc.auto.fieldValue}` | Additional value parameter | "Male", "Credit Card" |
| `${loc.auto.pageName}` | Current page name | "HomePage" |

### Pattern Examples

**Button Pattern**:
```properties
loc.iExams.pattern.button = \
"xpath=//button[contains(text(),'${loc.auto.fieldName}')]",\
"xpath=//span[text()='${loc.auto.fieldName}']",\
"xpath=//button[@label='${loc.auto.fieldName}']"
```

**Input Pattern**:
```properties
loc.iExams.pattern.input = \
"xpath=//input[@placeholder='${loc.auto.fieldName}']",\
"xpath=//label[text()='${loc.auto.fieldName}']/following::input[1]",\
"xpath=//input[@id='${loc.auto.fieldName}']"
```

**Radio Button Pattern (with value)**:
```properties
loc.iExams.pattern.radioButton = \
"xpath=//label[text()='${loc.auto.fieldName}']/following::input[@value='${loc.auto.fieldValue}']",\
"xpath=//input[@name='${loc.auto.fieldName}' and @value='${loc.auto.fieldValue}']"
```

**Checkbox Pattern**:
```properties
loc.iExams.pattern.checkbox = \
"xpath=//label[text()='${loc.auto.fieldName}']/following::input[@type='checkbox']",\
"xpath=//input[@type='checkbox' and @name='${loc.auto.fieldName}']"
```

## Field Instance Notation

### Using Multiple Instances

When multiple elements have the same field name, use instance notation:

**Syntax**: `Field Name[instance_number]`

**Examples**:
```gherkin
# First instance (default)
When Web: Input "primary@example.com" into "Email"

# Second instance
And Web: Input "secondary@example.com" into "Email[2]"

# Third instance
And Web: Input "tertiary@example.com" into "Email[3]"
```

**Generated Locator Keys**:
```
loc.iExams.contactsPage.input.email      # Instance 1
loc.iExams.contactsPage.input.email2     # Instance 2
loc.iExams.contactsPage.input.email3     # Instance 3
```

## Common Operations Cheat Sheet

### Complete Form Submission

```gherkin
Feature: Form Submission

Scenario: Fill and submit form
  Given Web: Set Page Name "FormPage"
  When Web: Input "John Doe" into "Name"
  And Web: Input "john@example.com" into "Email"
  And Web: Select Dropdown with text "Option 1" in "Category"
  And Web: Click Checkbox "Accept Terms"
  And Web: Click Button "Submit"
  Then Web: Verify Text "Form Submitted Successfully"
```

### Multi-Page Navigation

```gherkin
Feature: Multi-Page Flow

Scenario: Navigate through pages
  # Page 1
  Given Web: Set Page Name "Page1"
  When Web: Input "Data 1" into "Field 1"
  And Web: Click Button "Next"
  
  # Page 2
  And Web: Set Page Name "Page2"
  When Web: Input "Data 2" into "Field 2"
  And Web: Click Button "Next"
  
  # Page 3
  And Web: Set Page Name "Page3"
  Then Web: Verify Text "Completion Message"
```

### Hierarchical Context

```gherkin
Feature: Hierarchical Sections

Scenario: Work with nested sections
  Given Web: Set Page Name "ConfigPage"
  
  # Section 1
  And Web: Set Field Location "::General"
  When Web: Input "Value 1" into "Setting 1"
  
  # Section 2
  And Web: Remove Field Location
  And Web: Set Field Location "::Advanced"
  When Web: Input "Value 2" into "Setting 2"
  
  # Back to main page
  And Web: Remove Field Location
  And Web: Click Button "Save"
```

### Dynamic Table Interaction

```gherkin
Feature: Table Operations

Scenario: Select items from table
  Given Web: Set Page Name "TablePage"
  When Web: Input "Search Term" into "Search"
  And Web: Click Button "Search"
  And Web: Wait for "2" seconds
  And Web: Click Checkbox "Item 1"
  And Web: Click Checkbox "Item 2"
  And Web: Click Button "Process Selected"
```

## Configuration Quick Reference

### application.properties

```properties
# Pattern code (required)
loc.pattern.code=loc.iExams

# Enable pattern logging (optional)
loc.pattern.log=true

# Project code (optional)
project.code=iExams
```

### locPattern.properties Structure

```properties
# Pattern naming convention
loc.{patternCode}.pattern.{elementType} = "pattern1","pattern2","pattern3"

# Example
loc.iExams.pattern.button = \
"xpath=//button[contains(text(),'${loc.auto.fieldName}')]",\
"xpath=//span[text()='${loc.auto.fieldName}']"
```

## Troubleshooting Quick Tips

### Element Not Found

**Symptom**: `NoSuchElementException` or element not found error

**Quick Fixes**:
1. Check page name is set correctly
2. Verify field name matches UI text exactly
3. Add wait before interaction
4. Check if element is in a different section (use field location)
5. Enable pattern logging to see generated XPath

**Example**:
```gherkin
# Add explicit wait
And Web: Wait for "2" seconds
And Web: Wait for Element "Button Name" to be visible

# Check page context
Given Web: Set Page Name "CorrectPageName"

# Use field location for nested elements
And Web: Set Field Location "::Section Name"
```

### Pattern Not Found

**Symptom**: `[ERROR] Locator Pattern 'loc.iExams.pattern.button' not available`

**Quick Fixes**:
1. Check pattern exists in locPattern.properties
2. Verify pattern code is configured correctly
3. Check element type spelling
4. Ensure pattern file is loaded

**Check Configuration**:
```properties
# application.properties
loc.pattern.code=loc.iExams

# locPattern.properties
loc.iExams.pattern.button = "xpath=//button[text()='${loc.auto.fieldName}']"
```

### Wrong Element Selected

**Symptom**: Action performed on wrong element

**Quick Fixes**:
1. Use field instance notation if multiple elements exist
2. Set field location for scoped elements
3. Make field name more specific
4. Add more specific pattern

**Example**:
```gherkin
# Use instance notation
When Web: Input "text" into "Field Name[2]"

# Use field location
And Web: Set Field Location "::Specific Section"
When Web: Input "text" into "Field Name"
```

### Stale Element

**Symptom**: Element becomes stale during interaction

**Quick Fixes**:
1. Add wait before action
2. Refresh page context
3. Re-locate element

**Example**:
```gherkin
And Web: Wait for "1" seconds
And Web: Wait for Element "Field Name" to be visible
When Web: Click Button "Button Name"
```

### Slow Test Execution

**Symptom**: Tests running slower than expected

**Quick Fixes**:
1. Reduce explicit waits
2. Use specific waits instead of generic delays
3. Check if caching is working (first run slower, subsequent faster)
4. Optimize pattern order (most common patterns first)

**Example**:
```gherkin
# Instead of
And Web: Wait for "5" seconds

# Use
And Web: Wait for Element "Loading Spinner" to be visible
```

## Best Practices Cheat Sheet

### ✅ DO

- Always set page name before interactions
- Use descriptive field names matching UI text
- Add waits for dynamic content
- Use field location for nested elements
- Enable logging during development
- Use instance notation for duplicate elements
- Keep pattern templates simple and maintainable

### ❌ DON'T

- Don't hardcode XPath in test steps
- Don't skip page name setup
- Don't use overly generic field names
- Don't create duplicate patterns
- Don't forget to remove field location when done
- Don't use excessive explicit waits
- Don't modify core pattern methods directly

## Pattern Template Cheat Sheet

### Common XPath Patterns

**Text-based matching**:
```xpath
//button[text()='${loc.auto.fieldName}']
//button[contains(text(),'${loc.auto.fieldName}')]
//button[normalize-space()='${loc.auto.fieldName}']
```

**Attribute-based matching**:
```xpath
//input[@placeholder='${loc.auto.fieldName}']
//input[@id='${loc.auto.fieldName}']
//input[@name='${loc.auto.fieldName}']
//button[@label='${loc.auto.fieldName}']
```

**Label-based matching**:
```xpath
//label[text()='${loc.auto.fieldName}']/following::input[1]
//label[normalize-space()='${loc.auto.fieldName}']/ancestor::div[1]/following-sibling::div//input
```

**Case-insensitive matching**:
```xpath
//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), translate('${loc.auto.fieldName}', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'))]
```

**With instance**:
```xpath
(//input[@placeholder='${loc.auto.fieldName}'])[${loc.auto.fieldInstance}]
```

**With value**:
```xpath
//input[@name='${loc.auto.fieldName}' and @value='${loc.auto.fieldValue}']
```

## Keyboard Shortcuts & Commands

### Enable Pattern Logging

```properties
# application.properties
loc.pattern.log=true
```

**Console Output**:
```
==== AUTO GENERATED: LOCATOR (Pattern) ====> auto.loc.iExams.homePage.button.search={"locator":["xpath=//button[contains(text(),'Search')]"],"desc":"Search : [button] Field "}
```

### View Cached Locators (Java)

```java
// In test code
String cachedValue = getBundle().getPropertyValue("loc.iExams.homePage.button.search");
System.out.println("Cached: " + cachedValue);
```

### Clear Cache (Java)

```java
// Clear specific locator
getBundle().clearProperty("loc.iExams.homePage.button.search");

// Clear all (custom implementation needed)
for (String key : getBundle().getKeys()) {
    if (key.startsWith("loc.")) {
        getBundle().clearProperty(key);
    }
}
```

## Quick Syntax Reference

### Gherkin Keywords

```gherkin
Feature: Feature name
  Background: Setup steps
  Scenario: Scenario name
    Given: Preconditions
    When: Actions
    And: Additional steps
    Then: Assertions
```

### Pattern Placeholder Syntax

```
${loc.auto.fieldName}      # Field name
${loc.auto.fieldInstance}  # Instance number
${loc.auto.fieldValue}     # Additional value
${loc.auto.pageName}       # Page name
```

### Locator Key Format

```
{patternCode}.{pageName}.{elementType}.{fieldName}

Example:
loc.iExams.homePage.button.search
```

### Pattern Template Format

```properties
loc.{patternCode}.pattern.{elementType} = "pattern1","pattern2"

Example:
loc.iExams.pattern.button = "xpath=//button[text()='${loc.auto.fieldName}']","xpath=//span[text()='${loc.auto.fieldName}']"
```

## Summary

This quick reference provides essential information for test engineers:

- **Test steps**: All available Gherkin steps with examples
- **Pattern syntax**: Template structure and placeholder usage
- **Common operations**: Frequently used test patterns
- **Troubleshooting**: Quick fixes for common issues
- **Best practices**: Do's and don'ts
- **Cheat sheets**: XPath patterns and syntax reference

Keep this guide handy for quick lookups during test development and troubleshooting.
