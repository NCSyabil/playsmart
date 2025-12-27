# Composite Action Layer Documentation

## Overview

The Composite Action Layer is the integration point between test steps and the pattern-based locator system. Implemented primarily in the `web.java` component, this layer provides high-level test step methods that combine pattern resolution with atomic browser actions. It uses Java Reflection API to dynamically invoke pattern generation methods and orchestrates complex action sequences like Wait + Scroll + Action.

## Purpose and Role

The Composite Action Layer serves three critical functions:

1. **Test Step Integration**: Provides QAF test step annotations that map Gherkin/Cucumber steps to executable Java methods
2. **Pattern Resolution**: Uses reflection to dynamically invoke pattern methods from `patternLoc.java` based on element type
3. **Action Orchestration**: Combines atomic actions (from `BrowserGlobal.java`) with wait conditions, scrolling, and error handling

This layer enables test steps like:
```gherkin
When Web: Click-Element Element:"button" Field:"PROCEED"
Then Web: Input-Text Value:"test@example.com" Field:"Email"
And Web: Verify-Element-Present Element:"text" Field:"Success message"
```

## Component Architecture

### web.java Component

**Location**: `src/test/java/com/ahq/globals/web.java`

**Key Responsibilities**:
- Expose test step methods with QAF annotations
- Manage page context (current page name)
- Invoke pattern methods using reflection
- Orchestrate wait conditions and atomic actions
- Handle errors and provide meaningful error messages

**Dependencies**:
- `patternLoc.java`: Pattern resolution and locator generation
- `BrowserGlobal.java`: Atomic browser actions
- `QAF Framework`: Test step annotations and configuration
- `Java Reflection API`: Dynamic method invocation


## Reflection-Based Pattern Invocation Mechanism

### How It Works

The Composite Action Layer uses Java Reflection to dynamically invoke pattern methods without hardcoding method names. This enables a generic, extensible approach where new element types can be added to `patternLoc.java` without modifying the composite action methods.

### Reflection Pattern Implementation

**Core Pattern**:
```java
@QAFTestStep(description = "Web: Click-Element Element:{element_name} Field:{field_link_name}")
@And("Web: Click-Element Element:{string} Field:{string}")
public static void clickElement_Web(String element_name, String field_link_name) throws Exception {
    // 1. Get the patternLoc class
    Class<?> patternLocClass = patternLoc.class;
    
    try {
        // 2. Find the method by name (element_name) with expected signature
        Method method = patternLocClass.getMethod(element_name, String.class, String.class);
        
        // 3. Log successful method discovery
        Reporter.log("Found function " + element_name + " in patternLoc.java!");
        
        // 4. Invoke the method with page name and field name
        Object result = method.invoke(null, getPageName(), field_link_name);
        
        // 5. Use the returned locator with atomic action
        BrowserGlobal.iClickOn(waitForFieldToBePresentScrollToCenterViewAndEnabled((String) result));
        
    } catch (NoSuchMethodException e) {
        throw new Exception("No such method: " + element_name + " in patternLoc", e);
    } catch (Exception e) {
        throw new Exception("Error invoking method: " + element_name, e);
    }
}
```

### Reflection Flow Diagram

```
Test Step: "Web: Click-Element Element:button Field:PROCEED"
    │
    ▼
clickElement_Web("button", "PROCEED")
    │
    ├─> Get patternLoc.class reference
    │
    ├─> Use Reflection API to find method:
    │   patternLocClass.getMethod("button", String.class, String.class)
    │   │
    │   └─> Searches for: public static String button(String page, String fieldName)
    │
    ├─> Invoke method with parameters:
    │   method.invoke(null, "SearchPage", "PROCEED")
    │   │
    │   └─> Executes: patternLoc.button("SearchPage", "PROCEED")
    │
    ├─> Receive locator string result
    │
    ├─> Apply wait conditions and scroll
    │
    └─> Execute atomic action: BrowserGlobal.iClickOn(locator)
```


### Method Signature Requirements

For reflection to work correctly, pattern methods in `patternLoc.java` must follow this signature:

```java
public static String {elementType}(String page, String fieldName) throws Exception
```

**Examples**:
- `public static String button(String page, String fieldName)`
- `public static String input(String page, String fieldName)`
- `public static String text(String page, String fieldName)`
- `public static String dropdown(String page, String fieldName)`

**Special Cases** (with additional parameters):
- `public static String radioButton(String page, String fieldName, String fieldValue)`
- `public static String checkbox(String page, String fieldName, String fieldValue)`

### Error Handling in Reflection

**NoSuchMethodException**: Thrown when the element type doesn't have a corresponding pattern method

```java
catch (NoSuchMethodException e) {
    throw new Exception("No such method: " + element_name + " in patternLoc", e);
}
```

**Error Message Example**:
```
No such method: customElement in patternLoc
  Element Type: customElement
  Field Name: MyField
  Page: SearchPage
```

**General Reflection Errors**: Wrapped with context about the operation

```java
catch (Exception e) {
    throw new Exception("Error invoking method: " + element_name, e);
}
```

### Benefits of Reflection Approach

1. **Extensibility**: Add new element types without modifying composite actions
2. **Maintainability**: Single implementation handles all element types
3. **Type Safety**: Method signature validation at runtime
4. **Error Clarity**: Clear error messages when methods are missing
5. **Flexibility**: Supports varying parameter counts for different element types


## Common Composite Action Patterns

### Pattern 1: Wait + Action

The most common pattern combines waiting for element presence/visibility with the actual action.

**Implementation**:
```java
@QAFTestStep(description = "Web: Input-Text Value:{0} Field:{1}")
@And("Web: Input-Text Value:{string} Field:{string}")
public static void inputText_Web(String input_value, String field_input) throws Exception {
    BrowserGlobal.iFillInTo(input_value, 
        waitForFieldToBePresentScrollToCenterViewAndEnabled(
            patternLoc.input(getPageName(), field_input)
        )
    );
}
```

**Helper Method**:
```java
public static String waitForFieldToBePresentScrollToCenterViewAndEnabled(String locName) throws Exception {
    BrowserGlobal.iWaitUntilElementPresent(locName);
    BrowserGlobal.iScrollToAnElementAndAlignItInTheCenter(locName);
    BrowserGlobal.iWaitUntilElementEnabled(locName);
    return locName;
}
```

**Flow**:
```
1. Resolve locator from pattern
   └─> patternLoc.input(getPageName(), field_input)

2. Wait for element to be present
   └─> iWaitUntilElementPresent(locator)

3. Scroll element into view (centered)
   └─> iScrollToAnElementAndAlignItInTheCenter(locator)

4. Wait for element to be enabled
   └─> iWaitUntilElementEnabled(locator)

5. Execute action
   └─> iFillInTo(input_value, locator)
```

**Usage Example**:
```gherkin
When Web: Input-Text Value:"test@example.com" Field:"Email"
```


### Pattern 2: Verify + Screenshot

Verification actions combine element checks with automatic screenshot capture for reporting.

**Implementation**:
```java
@QAFTestStep(description = "Web: Verify-Element-Present Element:{element_name} Field:{field_link_name}")
@And("Web: Verify-Element-Present Element:{string} Field:{string}")
public static boolean verifyElementPresentUsingPattern_Web(String element_name, String field_link_name) throws Exception {
    Class<?> patternLocClass = patternLoc.class;
    try {
        // 1. Use reflection to get locator
        Method method = patternLocClass.getMethod(element_name, String.class, String.class);
        Reporter.log("Found function " + element_name + " in patternLoc.java!");
        Object result = method.invoke(null, getPageName(), field_link_name);
        
        // 2. Verify element presence
        boolean isPresent = BrowserGlobal.iVerifyElementPresent((String) result);
        
        // 3. Take screenshot if element is present
        if (isPresent) {
            highlightElementAndTakeScreenshot_Web(element_name, field_link_name);
        }
        
        return isPresent;
    } catch (NoSuchMethodException e) {
        throw new Exception("No such method: " + element_name + " in patternLoc", e);
    } catch (Exception e) {
        throw new Exception("Error invoking method: " + element_name, e);
    }
}
```

**Flow**:
```
1. Resolve locator using reflection
2. Check if element is present
3. If present: Highlight element and take screenshot
4. Return verification result
```

**Usage Example**:
```gherkin
Then Web: Verify-Element-Present Element:"text" Field:"Success message"
```


### Pattern 3: JavaScript Executor Fallback

When standard Selenium actions fail (element click intercepted, element not interactable), the JavaScript Executor pattern provides a fallback mechanism.

**Implementation**:
```java
@QAFTestStep(description = "Web: JavaScript-Executor-Click-Element Element:{element_name} Field:{field_link_name}")
@And("Web: JavaScript-Executor-Click-Element Element:{string} Field:{string}")
public static void javaScriptExecutorClickElement(String element_name, String field_link_name) throws Exception {
    Class<?> patternLocClass = patternLoc.class;
    try {
        // 1. Wait for page to load
        iWaitForPageToLoad();
        
        // 2. Use reflection to get locator
        Method method = patternLocClass.getMethod(element_name, String.class, String.class);
        Reporter.log("Found function " + element_name + " in patternLoc.java!");
        Object result = method.invoke(null, getPageName(), field_link_name);
        
        // 3. Find the element
        WebElement elementToClick = new WebDriverTestBase().getDriver().findElement((String) result);
        
        // 4. Get WebDriver instance
        WebDriver driver = new WebDriverTestBase().getDriver();
        
        // 5. Execute click via JavaScript
        JavascriptExecutor js = (JavascriptExecutor) driver;
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", elementToClick);
        
    } catch (NoSuchMethodException e) {
        throw new Exception("No such method: " + element_name + " in patternLoc", e);
    } catch (Exception e) {
        throw new Exception("Error invoking method: " + element_name, e);
    }
}
```

**JavaScript Clear Implementation**:
```java
@QAFTestStep(description = "Web: JavaScript-Executor-Clear-Element Element:{element_name} Field:{field_link_name}")
@And("Web: JavaScript-Executor-Clear-Element Element:{string} Field:{string}")
public static void javaScriptExecutorClearElement(String element_name, String field_link_name) throws Exception {
    Class<?> patternLocClass = patternLoc.class;
    try {
        iWaitForPageToLoad();
        Method method = patternLocClass.getMethod(element_name, String.class, String.class);
        Reporter.log("Found function " + element_name + " in patternLoc.java!");
        Object result = method.invoke(null, getPageName(), field_link_name);
        
        WebElement elementToClear = new WebDriverTestBase().getDriver().findElement((String) result);
        WebDriver driver = new WebDriverTestBase().getDriver();
        JavascriptExecutor js = (JavascriptExecutor) driver;
        
        // Clear by setting value to empty string
        ((JavascriptExecutor) driver).executeScript("arguments[0].value = '';", elementToClear);
        
    } catch (NoSuchMethodException e) {
        throw new Exception("No such method: " + element_name + " in patternLoc", e);
    } catch (Exception e) {
        throw new Exception("Error invoking method: " + element_name, e);
    }
}
```


**When to Use JavaScript Executor**:

1. **Element Click Intercepted**: Another element overlays the target element
2. **Element Not Interactable**: Element is present but Selenium can't interact with it
3. **Timing Issues**: Element state changes rapidly
4. **Framework Limitations**: Some UI frameworks don't respond to standard Selenium actions

**Flow**:
```
1. Wait for page to load
2. Resolve locator using reflection
3. Find WebElement using locator
4. Get JavascriptExecutor instance
5. Execute JavaScript command directly on element
```

**Usage Examples**:
```gherkin
When Web: JavaScript-Executor-Click-Element Element:"button" Field:"Submit"
And Web: JavaScript-Executor-Clear-Element Element:"input" Field:"Search"
```

**JavaScript Commands Used**:
- Click: `arguments[0].click();`
- Clear: `arguments[0].value = '';`
- Scroll: `arguments[0].scrollIntoView(true);`


### Pattern 4: Clear + Input

Combines clearing existing text with inputting new text, ensuring clean state before data entry.

**Implementation**:
```java
@QAFTestStep(description = "Web: Clear-Then-Input-Text Value:{0} Field:{1}")
@And("Web: Clear-Then-Input-Text Value:{string} Field:{string}")
public static void clearThenInputText_Web(String input_value, String field_input) throws Exception {
    // 1. Clear existing text
    BrowserGlobal.iClearTextFrom(
        waitForFieldToBePresentScrollToCenterViewAndEnabled(
            patternLoc.input(getPageName(), field_input)
        )
    );
    
    // 2. Input new text
    inputText_Web(input_value, field_input);
}
```

**Flow**:
```
1. Resolve locator from pattern
2. Wait for element (present, scrolled, enabled)
3. Clear existing text
4. Input new text value
```

**Usage Example**:
```gherkin
When Web: Clear-Then-Input-Text Value:"new@example.com" Field:"Email"
```

### Pattern 5: Dropdown Selection

Handles dropdown interactions with click + select pattern.

**Implementation**:
```java
@QAFTestStep(description = "Web: Select-Value-From-Dropdown DropdownLabel:{dropdown_label} DropdownValue:{dropdown_value}")
@And("Web: Select-Value-From-Dropdown DropdownLabel:{string} DropdownValue:{string}")
public static void selectValueFromDropdown_Web(String dropdown_label, String dropdown_value) throws Exception {
    try {
        // 1. Click dropdown to open
        BrowserGlobal.iClickOn(
            waitForFieldToBePresentScrollToCenterViewAndEnabled(
                patternLoc.dropdown(getPageName(), dropdown_label)
            )
        );
        
        // 2. Click dropdown value to select
        BrowserGlobal.iClickOn(
            waitForFieldToBePresentScrollToCenterViewAndEnabled(
                patternLoc.dropdown(getPageName(), dropdown_value)
            )
        );
        
    } catch (Exception e) {
        throw new Exception("Error Select-Value-From-Dropdown: " + e);
    }
}
```

**Flow**:
```
1. Resolve dropdown locator
2. Wait and click to open dropdown
3. Resolve option locator
4. Wait and click to select option
```

**Usage Example**:
```gherkin
When Web: Select-Value-From-Dropdown DropdownLabel:"Country" DropdownValue:"Singapore"
```


### Pattern 6: Double Click

Handles double-click interactions with proper wait conditions.

**Implementation**:
```java
@QAFTestStep(description = "Web: Double Click-Element Element:{element_name} Field:{field_link_name}")
@And("Web: Double Click-Element Element:{string} Field:{string}")
public static void doubleClickElement_Web(String element_name, String field_link_name) throws Exception {
    Class<?> patternLocClass = patternLoc.class;
    try {
        Method method = patternLocClass.getMethod(element_name, String.class, String.class);
        Reporter.log("Found function " + element_name + " in patternLoc.java!");
        Object result = method.invoke(null, getPageName(), field_link_name);
        
        BrowserGlobal.iDoubleClickOn(
            waitForFieldToBePresentScrollToCenterViewAndEnabled((String) result)
        );
        
    } catch (NoSuchMethodException e) {
        throw new Exception("No such method: " + element_name + " in patternLoc", e);
    } catch (Exception e) {
        throw new Exception("Error invoking method: " + element_name, e);
    }
}
```

**Usage Example**:
```gherkin
When Web: Double Click-Element Element:"text" Field:"File Name"
```

### Pattern 7: Property-Based Actions

Uses configuration properties as values instead of hardcoded strings.

**Implementation**:
```java
@QAFTestStep(description = "Web: Input-Text-Using-Property Field:{field_value} Get-Property:{get_property_name}")
@And("Web: Input-Text-Using-Property Field:{string} Get-Property:{string}")
public static void inputTextUsingProperty_Web(String field_value, String get_property_name) throws Exception {
    try {
        // 1. Get value from configuration property
        String inputValue = getBundle().getPropertyValue(get_property_name);
        
        // 2. Input the property value
        BrowserGlobal.iFillInTo(inputValue, 
            waitForFieldToBePresentScrollToCenterViewAndEnabled(
                patternLoc.input(getPageName(), field_value)
            )
        );
        
    } catch (Exception e) {
        throw new Exception("Error invoking method: " + field_value, e);
    }
}
```

**Usage Example**:
```gherkin
When Web: Input-Text-Using-Property Field:"Email" Get-Property:"user.email"
```

**Benefits**:
- Externalize test data
- Support multiple environments
- Enable data-driven testing
- Maintain test data separately from test logic


## Test Step Integration

### QAF Test Step Annotations

The Composite Action Layer uses QAF (QMetry Automation Framework) annotations to expose methods as test steps.

**Annotation Structure**:
```java
@QAFTestStep(description = "Web: Click-Element Element:{element_name} Field:{field_link_name}")
@And("Web: Click-Element Element:{string} Field:{string}")
public static void clickElement_Web(String element_name, String field_link_name) throws Exception {
    // Implementation
}
```

**Components**:
1. `@QAFTestStep`: Registers the method as a test step
2. `description`: Human-readable step description with parameter placeholders
3. `@And`: Cucumber integration annotation
4. Parameter placeholders: `{element_name}`, `{field_link_name}` map to method parameters

### Parameter Mapping

**Step Definition**:
```
Web: Click-Element Element:{element_name} Field:{field_link_name}
```

**Gherkin Usage**:
```gherkin
When Web: Click-Element Element:"button" Field:"PROCEED"
```

**Method Invocation**:
```java
clickElement_Web("button", "PROCEED")
```

**Parameter Flow**:
```
Gherkin Step → QAF Parser → Method Parameters
"button"    →   {string}  →   element_name = "button"
"PROCEED"   →   {string}  →   field_link_name = "PROCEED"
```


### Complete Test Step Examples

#### Example 1: Click Button

**Gherkin Step**:
```gherkin
When Web: Click-Element Element:"button" Field:"PROCEED"
```

**Execution Flow**:
```
1. QAF invokes: clickElement_Web("button", "PROCEED")

2. Reflection finds method: patternLoc.button(String, String)

3. Method invoked: patternLoc.button("SearchPage", "PROCEED")

4. Pattern resolved: "xpath=//button[text()='PROCEED']"

5. Wait conditions applied:
   - iWaitUntilElementPresent(locator)
   - iScrollToAnElementAndAlignItInTheCenter(locator)
   - iWaitUntilElementEnabled(locator)

6. Action executed: iClickOn(locator)
```

#### Example 2: Input Text

**Gherkin Step**:
```gherkin
When Web: Input-Text Value:"test@example.com" Field:"Email"
```

**Execution Flow**:
```
1. QAF invokes: inputText_Web("test@example.com", "Email")

2. Pattern resolved: patternLoc.input("SearchPage", "Email")

3. Locator generated: "xpath=//label[text()='Email']/following::input[1]"

4. Wait conditions applied

5. Action executed: iFillInTo("test@example.com", locator)
```

#### Example 3: Verify Element

**Gherkin Step**:
```gherkin
Then Web: Verify-Element-Present Element:"text" Field:"Success message"
```

**Execution Flow**:
```
1. QAF invokes: verifyElementPresentUsingPattern_Web("text", "Success message")

2. Reflection finds: patternLoc.text(String, String)

3. Pattern resolved: "xpath=//p[text()='Success message']"

4. Verification: iVerifyElementPresent(locator)

5. If present: highlightElementAndTakeScreenshot_Web()

6. Return: true/false
```


#### Example 4: JavaScript Executor Click

**Gherkin Step**:
```gherkin
When Web: JavaScript-Executor-Click-Element Element:"dropdown" Field:"Select exam year"
```

**Execution Flow**:
```
1. QAF invokes: javaScriptExecutorClickElement("dropdown", "Select exam year")

2. Wait for page load: iWaitForPageToLoad()

3. Reflection finds: patternLoc.dropdown(String, String)

4. Pattern resolved: "xpath=//label[text()='Select exam year']/following::p-dropdown[1]"

5. Find element: driver.findElement(locator)

6. JavaScript click: executeScript("arguments[0].click();", element)
```

**When Used**: Element is present but standard click fails due to overlay or framework behavior

#### Example 5: Dropdown Selection

**Gherkin Step**:
```gherkin
When Web: Select-Value-From-Dropdown DropdownLabel:"Country" DropdownValue:"Singapore"
```

**Execution Flow**:
```
1. QAF invokes: selectValueFromDropdown_Web("Country", "Singapore")

2. First click (open dropdown):
   - Resolve: patternLoc.dropdown("SearchPage", "Country")
   - Wait and click dropdown

3. Second click (select option):
   - Resolve: patternLoc.dropdown("SearchPage", "Singapore")
   - Wait and click option

4. Dropdown closes with selected value
```


### Real-World Test Scenario

**Feature File Example** (`01_CEM_PC.feature`):

```gherkin
@01_CEM_PC.01
Scenario Outline: Setup Paper Configuration
  # Step 1: Navigate to page
  When Web: Click-icon Field:"hamburger"
  Then Web: Click text "Examination"
  Then Web: Click text "Configuration"
  Then Web: Click text "Paper configuration"
  Then Web: Wait-Until-Element-Not-Visible Element:"spinner" Field:"loadWrapper"
  
  # Step 2: Set page context
  And Web: Set-Page-Name Value:"PaperConfiguration"
  
  # Step 3: Input search filters
  Then Web: JavaScript-Executor-Click-Element Element:"dropdown" Field:"Select exam year"
  Then Web: JavaScript-Executor-Click-Element Element:"value" Field:"<ExamYear>"
  Then Web: JavaScript-Executor-Click-Element Element:"dropdown" Field:"examLevelDesc"
  Then Web: JavaScript-Executor-Click-Element Element:"value" Field:"<ExamLevel>"
  Then Web: Input-Text Value:"<SubjectCode>" Field:"subjectCode"
  Then Web: Input-Text Value:"<PaperNo>" Field:"papernamenum"
  
  # Step 4: Verify results
  Then Web: Verify-Element-Present Element:"text" Field:"Search paper config"
  Then Web: Business verification: I verify "Record found"
```

**Execution Breakdown**:

1. **Navigation Steps**: Use generic `Click text` actions
2. **Page Context**: Set to "PaperConfiguration" for locator scoping
3. **Dropdown Interactions**: Use JavaScript Executor for framework-specific dropdowns
4. **Text Input**: Use standard Input-Text with pattern resolution
5. **Verification**: Verify element presence with screenshot

**Pattern Resolution in Context**:
```
Page: "PaperConfiguration"
Field: "subjectCode"
Element: "input"

Generated Key: "loc.iExams.paperConfiguration.input.subjectCode"
Pattern Used: "xpath=//label[text()='subjectCode']/following::input[1]"
Final Locator: "xpath=//label[text()='subjectCode']/following::input[1]"
```


## Page Context Management

### Page Name State

The Composite Action Layer manages the current page context, which is used for locator scoping.

**Storage**: Configuration bundle property `auto.page.name`

**Access Methods**:

```java
// Get current page name
@QAFTestStep(description = "Web: Get stored page name")
public static String getPageName() {
    return getBundle().getProperty("auto.page.name").toString();
}

// Set page name
@QAFTestStep(description = "Web: Set-Page-Name Value:{0}")
public static void setPageName_Web(String pageName) throws Exception {
    getBundle().setProperty("auto.page.name", pageName);
}
```

### Hierarchical Page Context

Supports nested contexts for complex page structures (e.g., sections within pages).

**Set Field Location**:
```java
@QAFTestStep(description = "Web: Set-Field-Location Value:{0}")
public static void setFieldLocation_Web(String locationName) throws Exception {
    String pageName = getBundle().getPropertyValue("auto.page.name");
    
    if (pageName.contains("::")) {
        // Replace existing location
        String[] fldNameSplit = pageName.trim().split("::");
        getBundle().setProperty("auto.page.name", 
            fldNameSplit[0].trim() + "::" + locationName.trim());
    } else {
        // Add location
        getBundle().setProperty("auto.page.name", 
            pageName + "::" + locationName.trim());
    }
}
```

**Remove Field Location**:
```java
@QAFTestStep(description = "Web: Remove-Field-Location")
public static void removeFieldLocation_Web() throws Exception {
    String pageName = getBundle().getPropertyValue("auto.page.name");
    
    if (pageName.contains("::")) {
        String[] fldNameSplit = pageName.trim().split("::");
        getBundle().setProperty("auto.page.name", fldNameSplit[0].trim());
    }
}
```


### Page Context Usage Example

**Gherkin Steps**:
```gherkin
# Set main page context
Given Web: Set-Page-Name Value:"PaperConfiguration"

# All locators now scoped to PaperConfiguration
When Web: Click-Element Element:"button" Field:"Search"
# Generates: loc.iExams.paperConfiguration.button.search

# Set nested location context
When Web: Set-Field-Location Value:"SearchSection"

# Locators now scoped to PaperConfiguration::SearchSection
When Web: Input-Text Value:"2024" Field:"Year"
# Generates: loc.iExams.paperConfiguration::searchSection.input.year

# Remove location context
When Web: Remove-Field-Location

# Back to main page context
When Web: Click-Element Element:"button" Field:"Submit"
# Generates: loc.iExams.paperConfiguration.button.submit
```

**Context Flow**:
```
Initial State: auto.page.name = "NO Page Name Set"
    │
    ├─> Set-Page-Name "PaperConfiguration"
    │   └─> auto.page.name = "PaperConfiguration"
    │
    ├─> Set-Field-Location "SearchSection"
    │   └─> auto.page.name = "PaperConfiguration::SearchSection"
    │
    └─> Remove-Field-Location
        └─> auto.page.name = "PaperConfiguration"
```

**Benefits**:
1. **Locator Scoping**: Same field name can have different locators on different pages
2. **Namespace Management**: Avoid locator key collisions
3. **Hierarchical Organization**: Support complex page structures
4. **Context Clarity**: Clear indication of which page/section is active


## Helper Methods and Utilities

### Wait Helper Methods

**waitForFieldToBePresentScrollToCenterViewAndEnabled**:
```java
public static String waitForFieldToBePresentScrollToCenterViewAndEnabled(String locName) throws Exception {
    BrowserGlobal.iWaitUntilElementPresent(locName);
    BrowserGlobal.iScrollToAnElementAndAlignItInTheCenter(locName);
    BrowserGlobal.iWaitUntilElementEnabled(locName);
    return locName;
}
```

**Purpose**: Ensures element is ready for interaction
**Returns**: The same locator string (for method chaining)
**Used By**: Most composite actions (click, input, verify)

**ScrollUpAndWaitForFieldToBePresentScrollAndEnabled**:
```java
private static String ScrollUpAndWaitForFieldToBePresentScrollAndEnabled(String locName) throws Exception {
    web.scrollToTopOfThePage_web();
    BrowserGlobal.iWaitUntilElementPresent(locName);
    BrowserGlobal.iScrollToAnElement(locName);
    BrowserGlobal.iWaitUntilElementEnabled(locName);
    return locName;
}
```

**Purpose**: Scroll to top first, then wait for element
**Used By**: Dropdown selections, textarea inputs

### Screenshot and Reporting

**takeScreenshot_Web**:
```java
@QAFTestStep(description = "Web: Take screenshot")
public static void takeScreenshot_Web() throws Exception {
    BrowserGlobal.iTakeScreenshot();
}
```

**takeScreenshotWithComment_Web**:
```java
@QAFTestStep(description = "Web: Take screenshot with {text}")
public static void takeScreenshotWithComment_Web(String text) throws Exception {
    BrowserGlobal.iTakeScreenshotWithComment(text);
}
```

**businessVerification_Web**:
```java
@QAFTestStep(description = "Web: Business verification: I verify {text}")
public static void businessVerification_Web(String text) throws Exception {
    web.waitForPageToLoad_Web();
    waitForMilliseconds_Web("500");
    BrowserGlobal.iTakeScreenshotWithComment(text);
}
```

**Purpose**: Capture evidence for test reporting and verification


## Error Handling and Debugging

### Exception Handling Strategy

**Reflection Errors**:
```java
try {
    Method method = patternLocClass.getMethod(element_name, String.class, String.class);
    Object result = method.invoke(null, getPageName(), field_link_name);
    // ... action execution
} catch (NoSuchMethodException e) {
    throw new Exception("No such method: " + element_name + " in patternLoc", e);
} catch (Exception e) {
    throw new Exception("Error invoking method: " + element_name, e);
}
```

**Error Context**: Includes element type, field name, and page name for debugging

**Action Errors**:
```java
try {
    BrowserGlobal.iClickOn(locator);
} catch (Exception e) {
    throw new Exception("Error Select-Value-From-Dropdown: " + e);
}
```

### Common Error Scenarios

#### 1. Method Not Found

**Error**:
```
No such method: customElement in patternLoc
```

**Cause**: Pattern method doesn't exist for the element type

**Resolution**: Add the pattern method to `patternLoc.java`

#### 2. Element Not Found

**Error**:
```
Element not found: PROCEED on page: SearchPage
Element Type: button
```

**Cause**: Pattern generated incorrect locator or element doesn't exist

**Resolution**: 
- Check pattern template in `locPattern.properties`
- Verify field name matches UI text
- Inspect page HTML structure

#### 3. Element Not Interactable

**Error**:
```
ElementClickInterceptedException: Element is not clickable at point (x, y)
```

**Cause**: Another element overlays the target element

**Resolution**: Use JavaScript Executor fallback
```gherkin
When Web: JavaScript-Executor-Click-Element Element:"button" Field:"Submit"
```


### Logging and Debugging

**Reporter Logging**:
```java
Reporter.log("Found function " + element_name + " in patternLoc.java!");
```

**Purpose**: Track which pattern methods are being invoked

**Console Output**:
```
Found function button in patternLoc.java!
Found function input in patternLoc.java!
Found function text in patternLoc.java!
```

**Debug Information Available**:
1. Element type being resolved
2. Field name being used
3. Current page context
4. Pattern method invocation success/failure
5. Locator generation results (if pattern logging enabled)

**Enable Pattern Logging**:
```properties
# In application.properties
loc.pattern.log=true
```

**Pattern Log Output**:
```
=====>[Auto Locator] => [loc.iExams.searchPage.button.proceed]
=====>[Pattern Used] => [xpath=//button[text()='${loc.auto.fieldName}']]
=====>[Generated Locator] => [xpath=//button[text()='PROCEED']]
```


## Complete Composite Action Catalog

### Click Actions

| Test Step | Description | Pattern |
|-----------|-------------|---------|
| `Click-Element Element:{type} Field:{name}` | Standard click with wait | Wait + Scroll + Click |
| `JavaScript-Executor-Click-Element Element:{type} Field:{name}` | JavaScript click | JS Executor |
| `Double Click-Element Element:{type} Field:{name}` | Double click | Wait + Scroll + Double Click |
| `Right-Click-Element Field:{name}` | Right click (context menu) | Wait + Scroll + Right Click |
| `Scroll-Up-And-Click-Element Element:{type} Field:{name}` | Scroll up then click | Scroll Up + Wait + Click |

### Input Actions

| Test Step | Description | Pattern |
|-----------|-------------|---------|
| `Input-Text Value:{value} Field:{name}` | Standard text input | Wait + Scroll + Input |
| `Clear-Then-Input-Text Value:{value} Field:{name}` | Clear then input | Clear + Input |
| `Input-Text-With-Placeholder Value:{value} Field:{name}` | Input using placeholder | Wait + Scroll + Input |
| `Input-Text-Using-Property Field:{name} Get-Property:{prop}` | Input from property | Property + Input |
| `JavaScript-Executor-Clear-Element Element:{type} Field:{name}` | Clear via JavaScript | JS Clear |

### Verification Actions

| Test Step | Description | Pattern |
|-----------|-------------|---------|
| `Verify-Element-Present Element:{type} Field:{name}` | Verify presence | Verify + Screenshot |
| `Verify-Element-Not-Present Element:{type} Field:{name}` | Verify absence | Wait + Verify |
| `Verify-Element-Value-Text-Is Element:{type} Field:{name} Text:{text}` | Verify text value | Verify Text |
| `Business verification: I verify {text}` | Business checkpoint | Wait + Screenshot |

### Dropdown Actions

| Test Step | Description | Pattern |
|-----------|-------------|---------|
| `Select-Value-From-Dropdown DropdownLabel:{label} DropdownValue:{value}` | Select dropdown option | Click + Click |
| `Select Dropdown with text {text} in {field}` | Select by visible text | Wait + Select |
| `Select Dropdown with value {value} in field:{field}` | Select by value | Wait + Select |

### Context Management

| Test Step | Description | Purpose |
|-----------|-------------|---------|
| `Set-Page-Name Value:{name}` | Set page context | Locator scoping |
| `Set-Field-Location Value:{location}` | Set nested context | Hierarchical scoping |
| `Remove-Field-Location` | Remove nested context | Return to parent |
| `Get stored page name` | Get current context | Debugging |


## Implementation Guidelines

### Adding New Composite Actions

**Step 1: Define the Test Step Method**
```java
@QAFTestStep(description = "Web: Custom-Action Element:{element_name} Field:{field_link_name}")
@And("Web: Custom-Action Element:{string} Field:{string}")
public static void customAction_Web(String element_name, String field_link_name) throws Exception {
    // Implementation
}
```

**Step 2: Use Reflection for Pattern Resolution**
```java
Class<?> patternLocClass = patternLoc.class;
try {
    Method method = patternLocClass.getMethod(element_name, String.class, String.class);
    Object result = method.invoke(null, getPageName(), field_link_name);
    String locator = (String) result;
    
    // Your custom logic here
    
} catch (NoSuchMethodException e) {
    throw new Exception("No such method: " + element_name + " in patternLoc", e);
} catch (Exception e) {
    throw new Exception("Error invoking method: " + element_name, e);
}
```

**Step 3: Apply Wait Conditions**
```java
String readyLocator = waitForFieldToBePresentScrollToCenterViewAndEnabled(locator);
```

**Step 4: Execute Atomic Action**
```java
BrowserGlobal.yourAtomicAction(readyLocator);
```

### Best Practices

1. **Always Use Reflection**: Don't hardcode pattern method calls
2. **Apply Wait Conditions**: Ensure elements are ready before interaction
3. **Handle Exceptions**: Provide clear error messages with context
4. **Log Actions**: Use Reporter.log() for debugging
5. **Return Values**: Return meaningful results for verification steps
6. **Screenshot on Verify**: Capture evidence for verification steps
7. **Use Helper Methods**: Reuse wait and scroll helpers
8. **Follow Naming Convention**: Use `_Web` suffix for method names


### Common Pitfalls and Solutions

#### Pitfall 1: Hardcoding Pattern Methods

**Wrong**:
```java
public static void clickButton_Web(String field_name) throws Exception {
    String locator = patternLoc.button(getPageName(), field_name);
    BrowserGlobal.iClickOn(locator);
}
```

**Right**:
```java
public static void clickElement_Web(String element_name, String field_name) throws Exception {
    Class<?> patternLocClass = patternLoc.class;
    Method method = patternLocClass.getMethod(element_name, String.class, String.class);
    Object result = method.invoke(null, getPageName(), field_name);
    BrowserGlobal.iClickOn((String) result);
}
```

**Why**: Reflection enables extensibility without code changes

#### Pitfall 2: Missing Wait Conditions

**Wrong**:
```java
String locator = patternLoc.input(getPageName(), field_name);
BrowserGlobal.iFillInTo(value, locator);
```

**Right**:
```java
String locator = patternLoc.input(getPageName(), field_name);
String readyLocator = waitForFieldToBePresentScrollToCenterViewAndEnabled(locator);
BrowserGlobal.iFillInTo(value, readyLocator);
```

**Why**: Elements may not be immediately interactable

#### Pitfall 3: Poor Error Messages

**Wrong**:
```java
catch (Exception e) {
    throw e;
}
```

**Right**:
```java
catch (NoSuchMethodException e) {
    throw new Exception("No such method: " + element_name + " in patternLoc", e);
} catch (Exception e) {
    throw new Exception("Error invoking method: " + element_name, e);
}
```

**Why**: Context helps debugging test failures


## Integration with Other Layers

### Relationship with Pattern Resolution Layer

**Composite Action Layer** → **Pattern Resolution Layer**

```
web.clickElement_Web()
    │
    ├─> Uses Reflection to invoke
    │
    └─> patternLoc.button(pageName, fieldName)
            │
            ├─> checkLoc() - Check for static locator
            │
            └─> generateLoc() - Generate from pattern
                    │
                    └─> Returns locator string
```

**Data Flow**:
1. Composite action receives element type and field name
2. Uses reflection to invoke corresponding pattern method
3. Pattern layer returns locator string
4. Composite action applies wait conditions
5. Atomic action executes with locator

### Relationship with Atomic Action Layer

**Composite Action Layer** → **Atomic Action Layer**

```
web.inputText_Web(value, field)
    │
    ├─> Resolves locator via pattern
    │
    ├─> Applies wait conditions
    │
    └─> BrowserGlobal.iFillInTo(value, locator)
            │
            └─> WebDriver.findElement(locator).sendKeys(value)
```

**Separation of Concerns**:
- **Composite Layer**: Pattern resolution, wait orchestration, test step integration
- **Atomic Layer**: Direct WebDriver interactions, basic operations

### Relationship with Test Steps

**Test Step (Gherkin)** → **Composite Action Layer**

```
Gherkin: When Web: Click-Element Element:"button" Field:"PROCEED"
    │
    ├─> QAF Parser matches annotation
    │
    └─> Invokes: web.clickElement_Web("button", "PROCEED")
            │
            └─> Executes composite action logic
```

**Benefits of Layered Architecture**:
1. **Separation of Concerns**: Each layer has clear responsibility
2. **Reusability**: Atomic actions used by multiple composite actions
3. **Maintainability**: Changes isolated to specific layers
4. **Testability**: Each layer can be tested independently
5. **Extensibility**: New patterns/actions added without affecting other layers


## Requirements Validation

This documentation addresses the following requirements from the specification:

### Requirement 3.1: Pattern Method Invocation
✅ **Documented**: Reflection-based pattern invocation mechanism
- Section: "Reflection-Based Pattern Invocation Mechanism"
- Shows how methods are invoked dynamically using element type names

### Requirement 3.2: Reflection API Usage
✅ **Documented**: Using reflection to invoke pattern methods
- Section: "Reflection Pattern Implementation"
- Complete code examples with getMethod() and invoke()

### Requirement 3.3: Parameter Handling
✅ **Documented**: Accepting page name and field name as parameters
- Section: "Method Signature Requirements"
- Shows parameter flow from test steps to pattern methods

### Requirement 3.4: Return Value Handling
✅ **Documented**: Returning locator strings/JSON objects
- Section: "Reflection Flow Diagram"
- Shows how Object result is cast to String locator

### Requirement 3.5: Error Handling
✅ **Documented**: Throwing descriptive errors for missing methods
- Section: "Error Handling in Reflection"
- NoSuchMethodException handling with context

### Requirement 4.1: Test Step Integration
✅ **Documented**: Integration with test step definitions
- Section: "Test Step Integration"
- QAF annotations and parameter mapping

### Requirement 4.2: Parameter Resolution
✅ **Documented**: Resolving Element:{type} Field:{name} parameters
- Section: "Parameter Mapping"
- Shows Gherkin → Method parameter flow

### Requirement 4.3: Atomic Action Support
✅ **Documented**: Supporting all atomic browser actions
- Section: "Common Composite Action Patterns"
- Click, input, verify, wait examples

### Requirement 4.4: Error Messages
✅ **Documented**: Clear error messages for missing patterns
- Section: "Error Handling and Debugging"
- Common error scenarios and resolutions

### Requirement 4.5: JavaScript Executor Support
✅ **Documented**: JavaScript executor actions for special handling
- Section: "Pattern 3: JavaScript Executor Fallback"
- Complete implementation and usage examples


## Summary

The Composite Action Layer is the bridge between human-readable test steps and the pattern-based locator system. Key takeaways:

### Core Concepts

1. **Reflection-Based Invocation**: Dynamically invokes pattern methods without hardcoding
2. **Action Orchestration**: Combines wait conditions, scrolling, and atomic actions
3. **Test Step Integration**: Exposes QAF-annotated methods for Gherkin steps
4. **Page Context Management**: Maintains current page state for locator scoping
5. **Error Handling**: Provides clear, contextual error messages

### Common Patterns

- **Wait + Action**: Ensure element readiness before interaction
- **Verify + Screenshot**: Capture evidence during verification
- **JavaScript Executor**: Fallback for problematic elements
- **Clear + Input**: Ensure clean state before data entry
- **Property-Based**: Externalize test data using configuration

### Benefits

- **Maintainability**: Single implementation handles all element types
- **Extensibility**: Add new element types without modifying composite actions
- **Readability**: Test steps use natural language
- **Reliability**: Built-in wait conditions and error handling
- **Debugging**: Comprehensive logging and error context

### Implementation in Other Frameworks

When implementing this pattern in frameworks like Playwright with TypeScript:

1. Replace Java Reflection with dynamic function lookup (e.g., `patternLoc[elementType]()`)
2. Use async/await for wait conditions instead of explicit waits
3. Implement similar helper functions for wait + scroll + action patterns
4. Maintain page context in a state management solution
5. Use framework-specific annotations or decorators for test step registration
6. Implement JavaScript executor fallback using `page.evaluate()`

The core concepts remain the same across frameworks, with implementation details adapted to the target language and automation library.

