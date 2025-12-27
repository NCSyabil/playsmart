# Pattern Resolution Layer Documentation

## Overview

The Pattern Resolution Layer is the core engine of the pattern-based locator system. It dynamically generates element locators at runtime by combining page context, element types, and field names with pattern templates. This layer is implemented in the `patternLoc.java` component and serves as the bridge between test steps and actual XPath/CSS selectors.

## Purpose

The Pattern Resolution Layer:
- Generates unique locator keys based on page name, element type, and field name
- Checks for static locators first, then falls back to pattern-based generation
- Processes field names to extract instance numbers and normalize values
- Substitutes placeholder variables in pattern templates with runtime values
- Caches generated locators in the configuration bundle for reuse
- Provides type-safe methods for each supported element type

## Component Architecture

### File Location
```
src/test/java/com/ahq/addons/patternLoc.java
```

### Core Dependencies
- `com.ahq.globals.BrowserGlobal` - Atomic browser actions
- `org.apache.commons.text.CaseUtils` - String case conversion utilities
- `com.qmetry.qaf.automation.core.ConfigurationManager` - Configuration bundle access

### Class Structure
```java
public class patternLoc {
    // Element type methods (input, button, text, etc.)
    // Core resolution methods (checkLoc, generateLoc)
    // Utility methods (fieldNameCheck, fieldInstanceCheck, getPatternCode)
}
```

## Locator Key Generation Algorithm

### The checkLoc() Function

The `checkLoc()` function is the entry point for all locator resolution. It generates a unique locator key and determines whether to use a static or auto-generated locator.

#### Function Signature
```java
public static String checkLoc(String argPageName, String argFieldType, String argFieldName)
```

#### Algorithm Steps

1. **Clear Previous State**
   ```java
   getBundle().setProperty("loc.auto.fieldName","");
   getBundle().setProperty("loc.auto.fieldInstance","");
   getBundle().setProperty("loc.auto.forValue","");
   getBundle().setProperty("loc.auto.fieldValue","");
   ```
   - Resets all placeholder variables to prevent contamination from previous calls

2. **Get Pattern Code**
   ```java
   String patternCode = getPatternCode();
   ```
   - Retrieves the project-specific pattern code (e.g., "loc.iExams")
   - Pattern code is configured in `application.properties` as `loc.pattern.code`

3. **Generate Locator Key**
   ```java
   String locName = patternCode +"."+ 
       CaseUtils.toCamelCase(argPageName.replaceAll("[^a-zA-Z0-9]", " "), false, ' ') + "." + 
       CaseUtils.toCamelCase(argFieldType.replaceAll("d365_", "").replaceAll("[^a-zA-Z0-9]", " "), false, ' ').trim() + "." + 
       CaseUtils.toCamelCase(argFieldName.replaceAll("[^a-zA-Z0-9]", " "), false, ' ').trim();
   ```
   
   **Key Generation Process:**
   - Start with pattern code: `loc.iExams`
   - Convert page name to camelCase: `Search Paper Config` → `searchPaperConfig`
   - Convert element type to camelCase: `button` → `button`
   - Convert field name to camelCase: `PROCEED` → `proceed`
   - Result: `loc.iExams.searchPaperConfig.button.proceed`

4. **Check for Static Locator**
   ```java
   String locVal = getBundle().getPropertyValue(locName);
   if (locVal.equals(locName) || locVal.length() < 5) {
       locName = "auto." + locName;
   }
   ```
   - Attempts to retrieve a static locator from configuration
   - If not found (value equals key or is too short), prepends "auto." to signal pattern generation
   - Result: `auto.loc.iExams.searchPaperConfig.button.proceed`

5. **Return Locator Key**
   - Returns either the static locator key or the auto-generated key
   - The calling method checks if the key contains "auto." to determine next steps

### Example Locator Key Generation

**Input:**
- Page: "Search Paper Config"
- Element Type: "button"
- Field Name: "PROCEED"

**Output:**
- Static check: `loc.iExams.searchPaperConfig.button.proceed`
- Auto-generated: `auto.loc.iExams.searchPaperConfig.button.proceed`

## The generateLoc() Function

The `generateLoc()` function creates the actual locator by substituting placeholder variables in pattern templates.

### Function Signature
```java
public static void generateLoc(String argLocator, String argFieldName, String argFieldType)
```

### Parameters
- `argLocator`: The locator key (e.g., "auto.loc.iExams.searchPaperConfig.button.proceed")
- `argFieldName`: The original field name (e.g., "PROCEED")
- `argFieldType`: The element type (e.g., "button")

### Algorithm Steps

1. **Get Pattern Code**
   ```java
   String patternCodeVal = getPatternCode();
   ```

2. **Process Field Name**
   ```java
   getBundle().setProperty("loc.auto.fieldName", fieldNameCheck(argFieldName));
   getBundle().setProperty("loc.auto.fieldInstance", fieldInstanceCheck(argFieldName));
   ```
   - Extracts field name and instance number
   - Example: "Field Name[2]" → fieldName="Field Name", instance="2"

3. **Build Pattern Key**
   ```java
   String locPattern = patternCodeVal + ".pattern." + argFieldType;
   ```
   - Example: `loc.iExams.pattern.button`

4. **Retrieve Pattern Template**
   ```java
   String locPatternVal = getBundle().getPropertyValue(locPattern);
   ```
   - Retrieves the pattern template from `locPattern.properties`
   - Example: `"xpath=//button[@label='${loc.auto.fieldName}']"`

5. **Validate Pattern Exists**
   ```java
   if (locPatternVal.equals(locPattern) || locPatternVal.length() < 5) {
       System.out.println("=====>[ERROR] => [Locator Pattern '"+ locPattern + "' not available]");
   }
   ```
   - Checks if pattern was found
   - Logs error if pattern is missing

6. **Generate Locator JSON**
   ```java
   getBundle().setProperty(argLocator, 
       "{\"locator\":[" + locPatternVal + "],\"desc\":\"" + argFieldName + " : [" + argFieldType + "] Field \"}");
   ```
   - Creates a JSON object with locator array and description
   - Stores it in the configuration bundle using the locator key
   - The pattern template contains placeholders that will be resolved by the QAF framework

### Example Locator Generation

**Input:**
- Locator Key: `auto.loc.iExams.searchPaperConfig.button.proceed`
- Field Name: `PROCEED`
- Element Type: `button`

**Pattern Template (from locPattern.properties):**
```properties
loc.iExams.pattern.button = "xpath=//button[@label='${loc.auto.fieldName}']"
```

**Generated Locator:**
```json
{
  "locator": ["xpath=//button[@label='${loc.auto.fieldName}']"],
  "desc": "PROCEED : [button] Field "
}
```

**After Placeholder Substitution (by QAF):**
```
xpath=//button[@label='PROCEED']
```

## Field Name Processing

### The fieldNameCheck() Function

Extracts the base field name from instance notation.

```java
public static String fieldNameCheck(String argFieldName) {
    if (argFieldName.contains("[") && argFieldName.endsWith("]")) {
        String[] fName = argFieldName.split("\\[");
        return fName[0].trim();
    } else {
        return argFieldName.trim();
    }
}
```

**Examples:**
- Input: `"First Name[2]"` → Output: `"First Name"`
- Input: `"Email"` → Output: `"Email"`

### The fieldInstanceCheck() Function

Extracts the instance number from instance notation.

```java
public static String fieldInstanceCheck(String argFieldName) {
    if (argFieldName.contains("[") && argFieldName.endsWith("]")) {
        String[] fName = argFieldName.split("\\[");
        return fName[1].replace("]","");
    } else {
        return "1";
    }
}
```

**Examples:**
- Input: `"First Name[2]"` → Output: `"2"`
- Input: `"Email"` → Output: `"1"` (default)

### Instance Notation Use Cases

Instance notation allows handling multiple instances of the same field on a page:

```gherkin
Then Web: Click-Element Element:"button" Field:"Save[1]"
Then Web: Click-Element Element:"button" Field:"Save[2]"
```

The instance number is stored in `${loc.auto.fieldInstance}` and can be used in patterns:
```properties
loc.iExams.pattern.button = "xpath=(//button[@label='${loc.auto.fieldName}'])[${loc.auto.fieldInstance}]"
```

## Pattern Method Signature Pattern

### Standard Method Pattern

Every element type has a corresponding method following this pattern:

```java
public static String <elementType>(String page, String fieldName) throws Exception {
    String fieldType = "<elementType>";
    String locator = checkLoc(page, fieldType, fieldName);
    if (locator.contains("auto.")) {
        generateLoc(locator, fieldName, fieldType);
    }
    return locator;
}
```

### Method Flow

1. **Define Field Type**: Set the element type identifier
2. **Check for Locator**: Call `checkLoc()` to generate locator key
3. **Conditional Generation**: If key contains "auto.", generate the locator
4. **Return Key**: Return the locator key for use by calling code

### Example Methods

#### Simple Element (Button)
```java
public static String button(String page, String fieldName) throws Exception {
    String fieldType = "button";
    String locator = checkLoc(page, fieldType, fieldName);
    if (locator.contains("auto.")) {
        generateLoc(locator, fieldName, fieldType);
    }
    return locator;
}
```

#### Element with Value Parameter (Radio Button)
```java
public static String radioButton(String page, String fieldName, String fieldValue) throws Exception {
    String fieldType = "radioButton";
    String locator = checkLoc(page, fieldType, fieldName);
    if (locator.contains("auto.")) {
        getBundle().setProperty("loc.auto.fieldValue", fieldValue);
        generateLoc(locator, fieldName, fieldType);
    }
    return locator;
}
```

**Key Difference**: Sets `loc.auto.fieldValue` before generation to support patterns like:
```properties
loc.iExams.pattern.radioButton = "xpath=//p-radiobutton[@value='${loc.auto.fieldValue}']"
```

#### Element with Fieldset (Checkbox with Fieldset)
```java
public static String checkboxWithFieldSet(String page, String fieldName, String fieldValue) throws Exception {
    String fieldType = "checkbox.fieldSet";
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
- Uses sub-type pattern: `checkbox.fieldSet`
- Processes fieldValue for instance notation
- Conditionally appends instance to field name

## Supported Element Types

The Pattern Resolution Layer provides methods for 60+ element types:

### Form Elements
- `input()` - Text input fields
- `textarea()` - Multi-line text areas
- `select()` - Dropdown select elements
- `checkbox()` - Checkbox elements
- `radioButton()` - Radio button elements
- `button()` - Button elements
- `dropdown()` - Custom dropdown components

### Text Elements
- `text()` - Generic text elements
- `header()` - Header text
- `subHeader()` - Sub-header text
- `listHeader()` - List header text
- `errorText()` - Error message text
- `label()` - Label elements
- `dataLabel()` - Data label elements

### Interactive Elements
- `link()` - Hyperlink elements
- `icon()` - Icon elements
- `tab()` - Tab elements
- `menu()` - Menu elements
- `submenu()` - Submenu elements
- `actionMenu()` - Action menu elements
- `actionMenuDropdown()` - Action menu dropdown

### Table Elements
- `table()` - Table elements
- `tableHeader()` - Table header cells
- `tableData()` - Table data cells
- `row()` - Table rows
- `cell()` - Table cells
- `totalRow()` - Total row elements
- `rowColumn()` - Specific row/column intersection

### Special Elements
- `datePicker()` - Date picker components
- `date()` - Date elements
- `dateRange()` - Date range elements
- `amSession()` - AM session checkboxes
- `pmSession()` - PM session checkboxes
- `spinner()` - Loading spinner elements
- `overlay()` - Overlay elements
- `toast()` - Toast notification elements

### Lookup Elements
- `buttonLookupLaunch()` - Lookup launch button
- `buttonLookupClear()` - Lookup clear button

### Complex Elements
- `checkboxWithFieldSet()` - Checkbox within fieldset
- `selectedCheckbox()` - Selected checkbox state
- `selectedCheckboxGroup()` - Selected checkbox group
- `selectedItem()` - Selected item in list
- `multipleInputs()` - Multiple input fields
- `tableInputFirstColumn()` - Table input in first column
- `tableInputSecondColumn()` - Table input in second column

### Navigation Elements
- `navbar()` - Navigation bar
- `breadcrumb()` - Breadcrumb navigation
- `paginator()` - Pagination controls

### Content Elements
- `card()` - Card components
- `accordion()` - Accordion components
- `sheet()` - Sheet elements
- `video()` - Video elements
- `div()` - Generic div elements
- `item()` - Generic item elements

### Form Variants
- `dropdownForm()` - Form-specific dropdown
- `radioButtonForm()` - Form-specific radio button
- `inputForm()` - Form-specific input
- `datePickerForm()` - Form-specific date picker

### Graph/Chart Elements
- `graphlink()` - Graph link elements
- `graphTab()` - Graph tab elements

### Tree Elements
- `dataTree()` - Tree structure elements

### Context Menu
- `contextMenuOption()` - Context menu option

### Order of Merit (Custom)
- `orderOfMeritLeft()` - Left side order of merit
- `orderOfMeritRight()` - Right side order of merit
- `orderOfMeritPlusIcon()` - Plus icon for order of merit

### Timeline Elements
- `timelineBox()` - Timeline box elements
- `timetableData()` - Timetable data elements

### Item Management
- `addItem()` - Add item button
- `deleteItem()` - Delete item button
- `editItem()` - Edit item button

### Verification Elements
- `verifyLabel()` - Label for verification
- `verifyStartDate()` - Start date for verification
- `verifyEndDate()` - End date for verification

### Other Elements
- `value()` - Value elements
- `error()` - Error elements
- `kpi()` - KPI elements
- `list()` - List elements
- `img()` - Image elements
- `tabContent()` - Tab content areas
- `loadingModal()` - Loading modal elements
- `groupTabFields()` - Group tab fields
- `individualTabFields()` - Individual tab fields
- `dropdownOption()` - Dropdown option elements
- `assignVendor()` - Assign vendor button

### Generic Method
- `getLocatorOfElement()` - Generic method accepting element type as parameter

## Pattern Code Configuration

### The getPatternCode() Function

Retrieves the project-specific pattern code from configuration.

```java
public static String getPatternCode() {
    String patternCodeVal = getBundle().getPropertyValue("loc.pattern.code");
    if (patternCodeVal.equals("loc.pattern.code")) {
        System.out.println("=====>[ERROR] => [Locator Pattern Code missing in project config or not assigned during execution]");
    }
    return patternCodeVal;
}
```

### Configuration Location

The pattern code is configured in `resources/application.properties`:
```properties
loc.pattern.code=loc.iExams
```

### Purpose

The pattern code allows multiple projects to share the same framework while maintaining separate pattern configurations:
- Project A: `loc.projectA.pattern.button`
- Project B: `loc.projectB.pattern.button`

## Placeholder Variables

The Pattern Resolution Layer supports several placeholder variables that are substituted at runtime:

### Core Placeholders

| Placeholder | Description | Set By | Example Value |
|------------|-------------|--------|---------------|
| `${loc.auto.fieldName}` | The processed field name | `generateLoc()` | "First Name" |
| `${loc.auto.fieldInstance}` | The field instance number | `generateLoc()` | "2" |
| `${loc.auto.fieldValue}` | The field value (for radio/checkbox) | Element method | "Male" |
| `${loc.auto.forValue}` | The "for" attribute value from label | `forValue()` | "input_123" |

### Placeholder Usage in Patterns

```properties
# Using fieldName
loc.iExams.pattern.input = "xpath=//input[@placeholder='${loc.auto.fieldName}']"

# Using fieldInstance
loc.iExams.pattern.button = "xpath=(//button[@label='${loc.auto.fieldName}'])[${loc.auto.fieldInstance}]"

# Using fieldValue
loc.iExams.pattern.radioButton = "xpath=//p-radiobutton[@value='${loc.auto.fieldValue}']"

# Using forValue
loc.iExams.pattern.input = "xpath=//input[@id='${loc.auto.forValue}']"
```

## The forValue() Function

The `forValue()` function is a special utility that finds a label element and extracts its "for" attribute to locate the associated input.

### Function Signature
```java
public static void forValue(String argFieldName, String argFieldType)
```

### Algorithm

1. **Set Field Name and Instance**
   ```java
   getBundle().setProperty("loc.auto.fieldName", fieldNameCheck(argFieldName));
   getBundle().setProperty("loc.auto.fieldInstance", fieldInstanceCheck(argFieldName));
   ```

2. **Build Label Pattern Key**
   ```java
   String locLabelPatternName = getPatternCode() + ".pattern.label";
   String locLabelPatternVal = getBundle().getPropertyValue(locLabelPatternName);
   ```

3. **Generate Label Locator**
   ```java
   String locLabelValue = "{\"locator\":[" + locLabelPatternVal + "],\"desc\":\"" + 
       fieldNameCheck(argFieldName) + " : [LABEL] Field \"}";
   getBundle().setProperty("loc.auto.label", locLabelValue);
   ```

4. **Wait for Label and Extract "for" Attribute**
   ```java
   BrowserGlobal.iWaitUntilElementPresent("loc.auto.label");
   forValue = BrowserGlobal.iGetAttributeValueFrom("for", "loc.auto.label");
   getBundle().setProperty("loc.auto.forValue", forValue);
   ```

5. **Log if Enabled**
   ```java
   if (getBundle().getPropertyValue("loc.pattern.log").trim().equalsIgnoreCase("true")) {
       System.out.println("==== AUTO GENERATED: LOCATOR (Pattern) ====> " + 
           "loc.auto.label" + "=" + getBundle().getPropertyValue("loc.auto.label"));
   }
   ```

### Use Case

This function is useful when the input field doesn't have a direct identifier but is associated with a label:

```html
<label for="input_firstName">First Name</label>
<input id="input_firstName" type="text" />
```

The pattern can use the label to find the input:
```properties
loc.iExams.pattern.label = "xpath=//label[text()='${loc.auto.fieldName}']"
loc.iExams.pattern.input = "xpath=//input[@id='${loc.auto.forValue}']"
```

## Locator Caching

### How Caching Works

1. **First Call**: When a locator is generated, it's stored in the configuration bundle
   ```java
   getBundle().setProperty(argLocator, locatorJSON);
   ```

2. **Subsequent Calls**: The `checkLoc()` function checks if a locator already exists
   ```java
   String locVal = getBundle().getPropertyValue(locName);
   ```

3. **Cache Scope**: Locators are cached for the duration of the test session

4. **Cache Key**: The cache key is the full locator name (e.g., `auto.loc.iExams.searchPaperConfig.button.proceed`)

### Benefits

- **Performance**: Avoids regenerating the same locator multiple times
- **Consistency**: Ensures the same locator is used throughout a test
- **Debugging**: Cached locators can be logged for troubleshooting

## Error Handling

### Missing Pattern Code

```java
if (patternCodeVal.equals("loc.pattern.code")) {
    System.out.println("=====>[ERROR] => [Locator Pattern Code missing in project config or not assigned during execution]");
}
```

**Error Message:**
```
=====>[ERROR] => [Locator Pattern Code missing in project config or not assigned during execution]
```

### Missing Pattern Template

```java
if (locPatternVal.equals(locPattern) || locPatternVal.length() < 5) {
    System.out.println("=====>[ERROR] => [Locator Pattern '"+ locPattern + "' not available]");
}
```

**Error Message:**
```
=====>[ERROR] => [Locator Pattern 'loc.iExams.pattern.button' not available]
```

### Method Not Found

When reflection is used to invoke a pattern method (from web.java), if the method doesn't exist:

```java
catch (NoSuchMethodException e) {
    throw new Exception("No such method: " + element_name + " in patternLoc", e);
}
```

## Logging and Debugging

### Pattern Logging Configuration

Enable pattern logging in `application.properties`:
```properties
loc.pattern.log=true
```

### Log Output

When enabled, generated locators are logged:
```
==== AUTO GENERATED: LOCATOR (Pattern) ====> auto.loc.iExams.searchPaperConfig.button.proceed={"locator":["xpath=//button[@label='PROCEED']"],"desc":"PROCEED : [button] Field "}
```

### Debug Information

The `rowColumn()` method includes debug logging:
```java
System.out.println("Initial locator: " + locator);
System.out.println("Locator after replacement: " + locator);
```

## Complete Flow Example

### Scenario
Test step: `Then Web: Click-Element Element:"button" Field:"PROCEED"`

### Step-by-Step Flow

1. **Test Step Invocation** (in web.java)
   ```java
   Method method = patternLocClass.getMethod("button", String.class, String.class);
   Object result = method.invoke(null, getPageName(), "PROCEED");
   ```

2. **Pattern Method Called** (in patternLoc.java)
   ```java
   public static String button(String page, String fieldName) throws Exception {
       String fieldType = "button";
       String locator = checkLoc(page, fieldType, fieldName);
       if (locator.contains("auto.")) {
           generateLoc(locator, fieldName, fieldType);
       }
       return locator;
   }
   ```

3. **checkLoc() Execution**
   - Input: page="Search Paper Config", fieldType="button", fieldName="PROCEED"
   - Clear placeholder variables
   - Get pattern code: "loc.iExams"
   - Generate key: "loc.iExams.searchPaperConfig.button.proceed"
   - Check for static locator: Not found
   - Return: "auto.loc.iExams.searchPaperConfig.button.proceed"

4. **generateLoc() Execution**
   - Input: locator="auto.loc.iExams.searchPaperConfig.button.proceed", fieldName="PROCEED", fieldType="button"
   - Set fieldName: "PROCEED"
   - Set fieldInstance: "1"
   - Build pattern key: "loc.iExams.pattern.button"
   - Get pattern: `"xpath=//button[@label='${loc.auto.fieldName}']"`
   - Generate JSON: `{"locator":["xpath=//button[@label='${loc.auto.fieldName}']"],"desc":"PROCEED : [button] Field "}`
   - Store in bundle: `auto.loc.iExams.searchPaperConfig.button.proceed` → JSON

5. **Return to web.java**
   - Locator key returned: "auto.loc.iExams.searchPaperConfig.button.proceed"
   - web.java passes this to BrowserGlobal for action execution

6. **BrowserGlobal Execution**
   - Retrieves locator JSON from bundle
   - Substitutes placeholders: `${loc.auto.fieldName}` → "PROCEED"
   - Final XPath: `xpath=//button[@label='PROCEED']`
   - Executes click action

## Best Practices

### 1. Consistent Naming
- Use descriptive field names that match UI labels
- Follow consistent casing in test steps (the system normalizes it)

### 2. Pattern Organization
- Group related patterns in locPattern.properties
- Use comments to document pattern purposes
- Order patterns from most specific to most generic

### 3. Instance Notation
- Use instance notation when multiple elements share the same field name
- Start with [1] for the first instance (it's the default)

### 4. Error Handling
- Always check logs for pattern resolution errors
- Verify pattern code is configured correctly
- Ensure pattern templates exist for all element types used

### 5. Performance
- Leverage locator caching by using consistent field names
- Avoid regenerating locators unnecessarily

### 6. Debugging
- Enable pattern logging during development
- Use descriptive field names for easier log analysis
- Test patterns in isolation before integration

## Integration with Other Layers

### With Pattern Configuration Layer
- Reads pattern templates from locPattern.properties
- Uses pattern code to scope patterns by project

### With Composite Action Layer (web.java)
- Provides locator keys to composite actions
- Invoked via reflection based on element type

### With Atomic Action Layer (BrowserGlobal.java)
- Returns locator keys that BrowserGlobal resolves
- BrowserGlobal handles placeholder substitution and action execution

### With Page Context Management
- Uses current page name from configuration bundle
- Scopes locators by page context

## Summary

The Pattern Resolution Layer is the intelligent core of the pattern-based locator system. It:

1. **Generates unique locator keys** using page name, element type, and field name
2. **Checks for static locators first**, falling back to pattern-based generation
3. **Processes field names** to extract instance numbers and normalize values
4. **Substitutes placeholders** in pattern templates with runtime values
5. **Caches generated locators** for performance and consistency
6. **Provides type-safe methods** for 60+ element types
7. **Handles errors gracefully** with descriptive error messages
8. **Supports debugging** through configurable logging

This layer enables test engineers to write maintainable, readable tests without hardcoding XPath selectors, while maintaining the flexibility to handle complex UI patterns and multiple element instances.
