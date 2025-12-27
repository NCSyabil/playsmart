# Atomic Action Layer Documentation

## Overview

The Atomic Action Layer is the foundation of browser interactions in the pattern-based locator system. Implemented in the `BrowserGlobal.java` component, this layer provides direct WebDriver operations that form the building blocks for all test automation actions. These atomic actions are simple, focused operations that accept locator strings and execute single browser interactions.

## Purpose and Role

The Atomic Action Layer serves as the direct interface to Selenium WebDriver, providing:

1. **Basic Browser Operations**: Click, input, verify, wait, navigate
2. **Locator String Consumption**: Accepts locator strings from the Pattern Resolution Layer
3. **WebDriver Abstraction**: Wraps Selenium WebDriver calls with error handling
4. **Reusable Building Blocks**: Used by Composite Actions to build complex test steps

This layer enables the Composite Action Layer to orchestrate complex interactions without dealing with WebDriver details directly.

## Component Architecture

### BrowserGlobal.java Component

**Location**: `src/test/java/com/ahq/globals/BrowserGlobal.java`

**Key Responsibilities**:
- Execute atomic browser actions using WebDriver
- Handle locator string resolution and element finding
- Provide wait conditions for element states
- Manage browser navigation and window operations
- Capture screenshots for reporting
- Handle dropdown/select interactions

**Dependencies**:
- `Selenium WebDriver`: Core browser automation
- `QAF Framework`: Test step annotations and utilities
- `WebDriverTestBase`: WebDriver instance management
- `Reporter`: Screenshot and logging utilities

## Atomic Action Categories

### 1. Navigation Actions

Actions that control browser navigation and window management.

#### iOpenWebBrowser(url)
**Purpose**: Open a web browser and navigate to the specified URL

**Signature**:
```java
@QAFTestStep(description = "I open the web browser with {url}")
public static void iOpenWebBrowser(String url)
```

**Parameters**:
- `url`: The URL to navigate to

**Implementation**:
```java
iSwitchToWebBrowser();
new WebDriverTestBase().getDriver().manage().timeouts()
    .pageLoadTimeout(Duration.ofMillis(Long.parseLong(getBundle().getPropertyValue("custom.page.timeout"))));
get(url);
```

**Usage Example**:
```gherkin
When I open the web browser with "https://example.com"
```


#### iOpenWebBrowserAndMaximize(url)
**Purpose**: Open browser, maximize window, and navigate to URL

**Signature**:
```java
@QAFTestStep(description = "I open web browser with {url} and maximise window")
public static void iOpenWebBrowserAndMaximize(String url)
```

**Usage Example**:
```gherkin
When I open web browser with "https://example.com" and maximise window
```

#### iGoPageBackInBrowser()
**Purpose**: Navigate back in browser history

**Signature**:
```java
@QAFTestStep(description = "I go page back in the web browser history")
public static void iGoPageBackInBrowser()
```

**Implementation**:
```java
new WebDriverTestBase().getDriver().navigate().back();
```

**Usage Example**:
```gherkin
When I go page back in the web browser history
```

#### iGoPageForwardInBrowser()
**Purpose**: Navigate forward in browser history

**Signature**:
```java
@QAFTestStep(description = "I go page forward in the web browser history")
public static void iGoPageForwardInBrowser()
```

**Implementation**:
```java
new WebDriverTestBase().getDriver().navigate().forward();
```

**Usage Example**:
```gherkin
When I go page forward in the web browser history
```

#### iSwitchBrowserTabByIndex(index)
**Purpose**: Switch to a different browser tab by index

**Signature**:
```java
@QAFTestStep(description = "I switch browser tab by {index}")
public static void iSwitchBrowserTabByIndex(String index)
```

**Parameters**:
- `index`: Tab index (1-based)

**Implementation**:
```java
WebDriver driver = new WebDriverTestBase().getDriver();
ArrayList<String> newTb = new ArrayList<>(driver.getWindowHandles());
driver.switchTo().window(newTb.get(Integer.parseInt(index) - 1));
```

**Usage Example**:
```gherkin
When I switch browser tab by "2"
```



### 2. Click Actions

Actions that perform various types of click operations on elements.

#### iClickOn(locator)
**Purpose**: Click on an element with automatic JavaScript fallback

**Signature**:
```java
@QAFTestStep(description = "I click on {locator}")
public static void iClickOn(String locator) throws Exception
```

**Parameters**:
- `locator`: Element locator string (XPath or CSS)

**Implementation**:
```java
try {
    click(locator);
} catch (Exception e) {
    if(e.getClass().toString().contains("ElementClickInterceptedException") ||
       e.getClass().toString().contains("ElementNotInteractableException")) {
        WebElement elementLocator = new WebDriverTestBase().getDriver().findElement(locator);
        WebDriver driver = new WebDriverTestBase().getDriver();
        JavascriptExecutor js = (JavascriptExecutor)driver;
        js.executeScript("arguments[0].click();", elementLocator);
    }
}
```

**Key Features**:
- Automatic fallback to JavaScript click if standard click fails
- Handles ElementClickInterceptedException
- Handles ElementNotInteractableException

**Usage Example**:
```gherkin
When I click on "xpath=//button[@id='submit']"
```

#### iDoubleClickOn(locator)
**Purpose**: Perform a double-click on an element

**Signature**:
```java
@QAFTestStep(description = "I double click on {locator}")
public static void iDoubleClickOn(String locator)
```

**Implementation**:
```java
WebElement elementLocator = new WebDriverTestBase().getDriver().findElement(locator);
Actions actions = new Actions(new WebDriverTestBase().getDriver());
actions.doubleClick(elementLocator).perform();
```

**Usage Example**:
```gherkin
When I double click on "xpath=//div[@class='file-name']"
```

#### iRightClickOn(locator)
**Purpose**: Perform a right-click (context menu) on an element

**Signature**:
```java
@QAFTestStep(description = "I right click on {locator}")
public static void iRightClickOn(String locator)
```

**Implementation**:
```java
WebElement elementLocator = new WebDriverTestBase().getDriver().findElement(locator);
Actions actions = new Actions(new WebDriverTestBase().getDriver());
actions.contextClick(elementLocator).perform();
```

**Usage Example**:
```gherkin
When I right click on "xpath=//div[@class='context-menu-trigger']"
```

#### iClickOnLocIfPresent(locator)
**Purpose**: Click on an element only if it is present on the page

**Signature**:
```java
@QAFTestStep(description = "I click on {locator} if present")
public static void iClickOnLocIfPresent(String locator)
```

**Implementation**:
```java
if (!new WebDriverTestBase().getDriver().findElements(locator).isEmpty()) {
    click(locator);
}
```

**Usage Example**:
```gherkin
When I click on "xpath=//button[@id='optional-button']" if present
```

#### iClickOnLocOnceEnabled(locator)
**Purpose**: Wait for element to be enabled, then click

**Signature**:
```java
@QAFTestStep(description = "I click on {locator} once enabled")
public static void iClickOnLocOnceEnabled(String locator)
```

**Implementation**:
```java
waitForEnabled(locator);
click(locator);
```

**Usage Example**:
```gherkin
When I click on "xpath=//button[@id='submit']" once enabled
```



### 3. Input Actions

Actions that input text or values into form fields.

#### iFillInTo(value, locator)
**Purpose**: Fill text/value into a field

**Signature**:
```java
@QAFTestStep(description = "I fill {value} into {locator}")
public static void iFillInTo(String value, String locator)
```

**Parameters**:
- `value`: Text to input
- `locator`: Element locator string

**Implementation**:
```java
sendKeys(UtilPassword.check(value), locator);
```

**Key Features**:
- Supports password encryption/decryption via UtilPassword
- Uses QAF sendKeys for reliable input

**Usage Example**:
```gherkin
When I fill "test@example.com" into "xpath=//input[@id='email']"
```

#### iInputInTo(value, locator)
**Purpose**: Input text/value into a field (alias for iFillInTo)

**Signature**:
```java
@QAFTestStep(description = "I input {value} into {locator}")
public static void iInputInTo(String value, String locator)
```

**Usage Example**:
```gherkin
When I input "John Doe" into "xpath=//input[@name='fullName']"
```

#### iClearAndFillInTo(value, locator)
**Purpose**: Clear existing text and fill new value

**Signature**:
```java
@QAFTestStep(description = "I clear and fill {value} into {locator}")
public static void iClearAndFillInTo(String value, String locator) throws Exception
```

**Implementation**:
```java
clear(locator);
sendKeys(value, locator);
```

**Usage Example**:
```gherkin
When I clear and fill "new@example.com" into "xpath=//input[@id='email']"
```

#### iClearTextFrom(locator)
**Purpose**: Clear text from a field

**Signature**:
```java
@QAFTestStep(description = "I clear text from {locator}")
public static void iClearTextFrom(String locator) throws Exception
```

**Implementation**:
```java
clear(locator);
```

**Usage Example**:
```gherkin
When I clear text from "xpath=//input[@id='search']"
```

#### iClickAndFillInTo(value, locator)
**Purpose**: Click on field then fill value

**Signature**:
```java
@QAFTestStep(description = "I click and fill {value} into {locator}")
public static void iClickAndFillInTo(String value, String locator)
```

**Implementation**:
```java
click(locator);
sendKeys(value, locator);
```

**Usage Example**:
```gherkin
When I click and fill "search term" into "xpath=//input[@placeholder='Search']"
```



### 4. Verification Actions

Actions that verify element states and retrieve element information.

#### iVerifyElementPresent(locator)
**Purpose**: Verify that an element is present on the page

**Signature**:
```java
@QAFTestStep(description = "I verify element {locator} is present")
public static boolean iVerifyElementPresent(String locator)
```

**Parameters**:
- `locator`: Element locator string

**Returns**: `true` if element is present, `false` otherwise

**Implementation**:
```java
return verifyPresent(locator);
```

**Usage Example**:
```gherkin
Then I verify element "xpath=//div[@id='success-message']" is present
```

#### iGetText(locator)
**Purpose**: Get the text content from an element

**Signature**:
```java
@QAFTestStep(description = "I get text from {locator}")
public static String iGetText(String locator) throws Exception
```

**Parameters**:
- `locator`: Element locator string

**Returns**: The inner HTML text of the element

**Implementation**:
```java
WebElement element = new WebDriverTestBase().getDriver().findElement(locator);
return (String) new WebDriverTestBase().getDriver()
    .executeScript("return arguments[0].innerHTML", element);
```

**Usage Example**:
```gherkin
When I get text from "xpath=//span[@id='username']"
```

#### iGetAttributeValueFrom(attribute, locator)
**Purpose**: Get an attribute value from an element

**Signature**:
```java
@QAFTestStep(description = "I get attribute {attribute_name} value from {locator}")
public static String iGetAttributeValueFrom(String attribute, String locator) throws Exception
```

**Parameters**:
- `attribute`: Attribute name (e.g., "value", "href", "class")
- `locator`: Element locator string

**Returns**: The attribute value

**Implementation**:
```java
WebElement element = new WebDriverTestBase().getDriver().findElement(locator);
return element.getAttribute(attribute);
```

**Usage Example**:
```gherkin
When I get attribute "value" value from "xpath=//input[@id='email']"
```

#### iAssertTextPresentInPage(text)
**Purpose**: Assert that specific text is present on the page

**Signature**:
```java
@QAFTestStep(description = "I assert text {text} is present in page")
public static void iAssertTextPresentInPage(String text)
```

**Parameters**:
- `text`: Text to search for

**Usage Example**:
```gherkin
Then I assert text "Welcome back" is present in page
```



### 5. Wait Actions

Actions that wait for specific element states or conditions.

#### iWaitUntilElementPresent(locator)
**Purpose**: Wait until an element is present in the DOM

**Signature**:
```java
@QAFTestStep(description = "I wait until element {locator} is present")
public static void iWaitUntilElementPresent(String locator)
```

**Parameters**:
- `locator`: Element locator string

**Implementation**:
```java
waitForPresent(locator);
```

**Usage Example**:
```gherkin
When I wait until element "xpath=//div[@id='loading']" is present
```

#### iWaitUntilElementVisible(locator)
**Purpose**: Wait until an element is visible on the page

**Signature**:
```java
@QAFTestStep(description = "I wait until element {locator} is visible")
public static void iWaitUntilElementVisible(String locator)
```

**Parameters**:
- `locator`: Element locator string

**Implementation**:
```java
waitForVisible(locator);
```

**Usage Example**:
```gherkin
When I wait until element "xpath=//button[@id='submit']" is visible
```

#### iWaitUntilElementEnabled(locator)
**Purpose**: Wait until an element is enabled and interactable

**Signature**:
```java
@QAFTestStep(description = "I wait until element {locator} is enabled")
public static void iWaitUntilElementEnabled(String locator)
```

**Parameters**:
- `locator`: Element locator string

**Implementation**:
```java
waitForEnabled(locator);
```

**Usage Example**:
```gherkin
When I wait until element "xpath=//input[@id='email']" is enabled
```

#### iWaitUntilElementNotVisible(locator)
**Purpose**: Wait until an element is no longer visible

**Signature**:
```java
@QAFTestStep(description = "I wait until element {locator} is not visible")
public static void iWaitUntilElementNotVisible(String locator)
```

**Parameters**:
- `locator`: Element locator string

**Implementation**:
```java
waitForNotVisible(locator);
```

**Usage Example**:
```gherkin
When I wait until element "xpath=//div[@class='loading-spinner']" is not visible
```

#### iWaitForPageToLoad()
**Purpose**: Wait for the page to finish loading

**Signature**:
```java
@QAFTestStep(description = "I wait for page to load")
public static void iWaitForPageToLoad()
```

**Implementation**:
```java
waitForPageToLoad();
```

**Usage Example**:
```gherkin
When I wait for page to load
```

#### iWaitForMilliseconds(milliseconds)
**Purpose**: Wait for a specific duration

**Signature**:
```java
@QAFTestStep(description = "I wait for {milliseconds} milliseconds")
public static void iWaitForMilliseconds(String milliseconds)
```

**Parameters**:
- `milliseconds`: Duration to wait in milliseconds

**Implementation**:
```java
Thread.sleep(Long.parseLong(milliseconds));
```

**Usage Example**:
```gherkin
When I wait for "2000" milliseconds
```



### 6. Dropdown Actions

Actions for interacting with dropdown/select elements.

#### iSelectDropdownWithValue(locator, value)
**Purpose**: Select a dropdown option by its value attribute

**Signature**:
```java
@QAFTestStep(description = "I select dropdown {locator} with value {value}")
public static void iSelectDropdownWithValue(String locator, String value) throws Exception
```

**Parameters**:
- `locator`: Dropdown element locator
- `value`: Value attribute of the option to select

**Implementation**:
```java
QAFWebElement element = new QAFExtendedWebElement(locator);
Select s = new Select(element);
s.selectByValue(value);
```

**Usage Example**:
```gherkin
When I select dropdown "xpath=//select[@id='country']" with value "SG"
```

#### iSelectDropdownWithIndex(locator, index)
**Purpose**: Select a dropdown option by its index

**Signature**:
```java
@QAFTestStep(description = "I select dropdown {locator} with index {index}")
public static void iSelectDropdownWithIndex(String locator, String index) throws Exception
```

**Parameters**:
- `locator`: Dropdown element locator
- `index`: Index of the option (0-based)

**Implementation**:
```java
QAFWebElement element = new QAFExtendedWebElement(locator);
Select s = new Select(element);
s.selectByIndex(Integer.parseInt(index));
```

**Usage Example**:
```gherkin
When I select dropdown "xpath=//select[@id='year']" with index "2"
```

#### iSelectDropdownWithText(locator, text)
**Purpose**: Select a dropdown option by its visible text

**Signature**:
```java
@QAFTestStep(description = "I select dropdown {locator} with text {text}")
public static void iSelectDropdownWithText(String locator, String text) throws Exception
```

**Parameters**:
- `locator`: Dropdown element locator
- `text`: Visible text of the option to select

**Implementation**:
```java
QAFWebElement element = new QAFExtendedWebElement(locator);
Select s = new Select(element);
s.selectByVisibleText(text);
```

**Usage Example**:
```gherkin
When I select dropdown "xpath=//select[@id='country']" with text "Singapore"
```



### 7. Screenshot Actions

Actions for capturing screenshots for reporting and debugging.

#### iTakeScreenshot()
**Purpose**: Take a screenshot of the current page

**Signature**:
```java
@QAFTestStep(description = "I take screenshot")
public static void iTakeScreenshot()
```

**Implementation**:
```java
Reporter.logWithScreenShot("");
```

**Usage Example**:
```gherkin
When I take screenshot
```

#### iTakeScreenshotWithComment(comment)
**Purpose**: Take a screenshot with a descriptive comment

**Signature**:
```java
@QAFTestStep(description = "I take screenshot with comment {comment}")
public static void iTakeScreenshotWithComment(String comment)
```

**Parameters**:
- `comment`: Description for the screenshot

**Implementation**:
```java
Reporter.logWithScreenShot(comment);
```

**Usage Example**:
```gherkin
When I take screenshot with comment "After login"
```

### 8. Keyboard Actions

Actions for keyboard interactions and key presses.

#### iPressReturnOrEnterKey()
**Purpose**: Press the RETURN/ENTER key

**Signature**:
```java
@QAFTestStep(description = "I press RETURN or ENTER key")
public static void iPressReturnOrEnterKey()
```

**Implementation**:
```java
Actions builder = new Actions(new WebDriverTestBase().getDriver());
builder.sendKeys(Keys.RETURN);
builder.build().perform();
```

**Usage Example**:
```gherkin
When I press RETURN or ENTER key
```

#### iPressKey(key)
**Purpose**: Press a specific key

**Signature**:
```java
@QAFTestStep(description = "I press key {key}")
public static void iPressKey(String key)
```

**Parameters**:
- `key`: Key to press (e.g., "TAB", "ESCAPE", "ARROW_DOWN")

**Implementation**:
```java
Actions builder = new Actions(new WebDriverTestBase().getDriver());
builder.sendKeys(key).perform();
```

**Usage Example**:
```gherkin
When I press key "TAB"
```

#### iHoldKeyAndPressAKey(holdKey, pressKey)
**Purpose**: Hold down one key while pressing another

**Signature**:
```java
@QAFTestStep(description = "I hold down a key {holdKey} and press a key {pressKey}")
public static void iHoldKeyAndPressAKey(String holdKey, String pressKey)
```

**Parameters**:
- `holdKey`: Key to hold (e.g., "SHIFT", "CONTROL", "COMMAND")
- `pressKey`: Key to press while holding

**Implementation**:
```java
Actions builder = new Actions(new WebDriverTestBase().getDriver());
builder.keyDown(Keys.valueOf(holdKey.toUpperCase()));
builder.sendKeys(pressKey);
builder.keyUp(Keys.valueOf(holdKey.toUpperCase()));
builder.build().perform();
```

**Usage Example**:
```gherkin
When I hold down a key "SHIFT" and press a key "TAB"
```



### 9. Mouse Actions

Actions for advanced mouse interactions.

#### iMouseoverOn(locator)
**Purpose**: Move mouse over an element (hover)

**Signature**:
```java
@QAFTestStep(description = "I mouseover on {locator}")
public static void iMouseoverOn(String locator)
```

**Parameters**:
- `locator`: Element locator string

**Implementation**:
```java
WebElement element = new WebDriverTestBase().getDriver().findElement(locator);
Actions builder = new Actions(new WebDriverTestBase().getDriver());
Action mouseOverHome = builder.moveToElement(element).build();
mouseOverHome.perform();
```

**Usage Example**:
```gherkin
When I mouseover on "xpath=//div[@class='menu-item']"
```

#### iDragAndDropOn(source, target)
**Purpose**: Drag an element and drop it on another element

**Signature**:
```java
@QAFTestStep(description = "I drag source {source_locator} and drop on target {target_locator}")
public static void iDragAndDropOn(String source, String target)
```

**Parameters**:
- `source`: Source element locator
- `target`: Target element locator

**Implementation**:
```java
dragAndDrop(source, target);
```

**Usage Example**:
```gherkin
When I drag source "xpath=//div[@id='draggable']" and drop on target "xpath=//div[@id='droppable']"
```

### 10. Scroll Actions

Actions for scrolling elements into view.

#### iScrollToAnElement(locator)
**Purpose**: Scroll to bring an element into view

**Signature**:
```java
@QAFTestStep(description = "I scroll to an element {locator}")
public static void iScrollToAnElement(String locator)
```

**Parameters**:
- `locator`: Element locator string

**Implementation**:
```java
WebElement element = new WebDriverTestBase().getDriver().findElement(locator);
((JavascriptExecutor) new WebDriverTestBase().getDriver())
    .executeScript("arguments[0].scrollIntoView(true);", element);
```

**Usage Example**:
```gherkin
When I scroll to an element "xpath=//div[@id='footer']"
```

#### iScrollToAnElementAndAlignItInTheCenter(locator)
**Purpose**: Scroll to an element and align it in the center of the viewport

**Signature**:
```java
@QAFTestStep(description = "I scroll to an element {locator} and align it in the center")
public static void iScrollToAnElementAndAlignItInTheCenter(String locator)
```

**Parameters**:
- `locator`: Element locator string

**Implementation**:
```java
WebElement element = new WebDriverTestBase().getDriver().findElement(locator);
((JavascriptExecutor) new WebDriverTestBase().getDriver())
    .executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
```

**Usage Example**:
```gherkin
When I scroll to an element "xpath=//button[@id='submit']" and align it in the center
```



## How Atomic Actions Consume Locator Strings

### Locator String Format

Atomic actions accept locator strings in two formats:

1. **XPath Format**: `"xpath=//button[@id='submit']"`
2. **CSS Selector Format**: `"css=#submit"`
3. **JSON Locator Format** (with fallbacks):
```json
{
  "locator": [
    "xpath=//button[@id='submit']",
    "xpath=//span[text()='Submit']"
  ],
  "desc": "Submit button"
}
```

### Element Finding Process

When an atomic action receives a locator string:

1. **Parse Locator**: QAF framework parses the locator string
2. **Find Element**: WebDriver attempts to find the element
3. **Fallback Handling**: If JSON format with multiple locators, tries each in sequence
4. **Return Element**: Returns WebElement for interaction

**Example Flow**:
```
Locator String: "xpath=//button[@id='submit']"
    │
    ├─> QAF parses: type="xpath", value="//button[@id='submit']"
    │
    ├─> WebDriver.findElement(By.xpath("//button[@id='submit']"))
    │
    └─> Returns: WebElement instance
```

### Integration with Pattern Resolution Layer

Atomic actions receive locator strings from the Pattern Resolution Layer:

```
Pattern Resolution Layer:
  patternLoc.button("SearchPage", "PROCEED")
    │
    └─> Returns: "auto.loc.iExams.searchPage.button.proceed"

Composite Action Layer:
  BrowserGlobal.iClickOn(locator)
    │
    ├─> Retrieves from bundle: {"locator":["xpath=//button[text()='PROCEED']"]}
    │
    └─> Passes to WebDriver

Atomic Action Layer:
  click(locator)
    │
    └─> WebDriver.findElement(locator).click()
```

## Wait Conditions and Error Handling

### Built-in Wait Conditions

Atomic actions use QAF's built-in wait mechanisms:

1. **Implicit Waits**: Configured globally for element finding
2. **Explicit Waits**: Used in wait actions (waitForPresent, waitForVisible)
3. **Smart Waits**: QAF automatically waits for elements to be ready

**Configuration**:
```properties
# In application.properties
selenium.wait.timeout=30000
custom.page.timeout=60000
```

### Error Handling Strategies

#### 1. Automatic JavaScript Fallback

The `iClickOn()` method automatically falls back to JavaScript click:

```java
try {
    click(locator);
} catch (Exception e) {
    if(e.getClass().toString().contains("ElementClickInterceptedException") ||
       e.getClass().toString().contains("ElementNotInteractableException")) {
        // Fallback to JavaScript click
        JavascriptExecutor js = (JavascriptExecutor)driver;
        js.executeScript("arguments[0].click();", element);
    }
}
```

**When Used**:
- Element is overlaid by another element
- Element is not interactable via standard Selenium
- Framework-specific UI components

#### 2. Conditional Actions

Actions like `iClickOnLocIfPresent()` handle missing elements gracefully:

```java
if (!driver.findElements(locator).isEmpty()) {
    click(locator);
}
```

**Benefits**:
- No exception thrown if element doesn't exist
- Useful for optional UI elements
- Enables flexible test flows

#### 3. Wait-Based Error Prevention

Wait actions prevent timing-related errors:

```java
iWaitUntilElementPresent(locator);  // Wait for element in DOM
iWaitUntilElementVisible(locator);  // Wait for element to be visible
iWaitUntilElementEnabled(locator);  // Wait for element to be enabled
iClickOn(locator);                  // Now safe to click
```

### Common Error Scenarios

#### Scenario 1: Element Not Found

**Error**: `NoSuchElementException`

**Cause**: Element doesn't exist or locator is incorrect

**Solution**:
- Verify locator is correct
- Add wait condition before action
- Check if element is in iframe

#### Scenario 2: Element Not Interactable

**Error**: `ElementNotInteractableException`

**Cause**: Element is hidden, disabled, or overlaid

**Solution**:
- Use `iWaitUntilElementVisible()`
- Use `iWaitUntilElementEnabled()`
- Use JavaScript executor fallback

#### Scenario 3: Stale Element Reference

**Error**: `StaleElementReferenceException`

**Cause**: Element was found but DOM changed before interaction

**Solution**:
- Re-find element before interaction
- Add wait after page changes
- Use fresh locator lookup



## Complete Action Reference Table

| Category | Action | Purpose | Parameters |
|----------|--------|---------|------------|
| **Navigation** | `iOpenWebBrowser` | Open browser and navigate | url |
| | `iGoPageBackInBrowser` | Navigate back | - |
| | `iGoPageForwardInBrowser` | Navigate forward | - |
| | `iSwitchBrowserTabByIndex` | Switch browser tab | index |
| **Click** | `iClickOn` | Click element | locator |
| | `iDoubleClickOn` | Double-click element | locator |
| | `iRightClickOn` | Right-click element | locator |
| | `iClickOnLocIfPresent` | Click if present | locator |
| | `iClickOnLocOnceEnabled` | Click when enabled | locator |
| **Input** | `iFillInTo` | Fill text into field | value, locator |
| | `iInputInTo` | Input text into field | value, locator |
| | `iClearAndFillInTo` | Clear then fill | value, locator |
| | `iClearTextFrom` | Clear field | locator |
| | `iClickAndFillInTo` | Click then fill | value, locator |
| **Verification** | `iVerifyElementPresent` | Verify element exists | locator |
| | `iGetText` | Get element text | locator |
| | `iGetAttributeValueFrom` | Get attribute value | attribute, locator |
| | `iAssertTextPresentInPage` | Assert text on page | text |
| **Wait** | `iWaitUntilElementPresent` | Wait for presence | locator |
| | `iWaitUntilElementVisible` | Wait for visibility | locator |
| | `iWaitUntilElementEnabled` | Wait for enabled state | locator |
| | `iWaitUntilElementNotVisible` | Wait for invisibility | locator |
| | `iWaitForPageToLoad` | Wait for page load | - |
| | `iWaitForMilliseconds` | Wait duration | milliseconds |
| **Dropdown** | `iSelectDropdownWithValue` | Select by value | locator, value |
| | `iSelectDropdownWithIndex` | Select by index | locator, index |
| | `iSelectDropdownWithText` | Select by text | locator, text |
| **Screenshot** | `iTakeScreenshot` | Capture screenshot | - |
| | `iTakeScreenshotWithComment` | Screenshot with comment | comment |
| **Keyboard** | `iPressReturnOrEnterKey` | Press ENTER | - |
| | `iPressKey` | Press specific key | key |
| | `iHoldKeyAndPressAKey` | Hold + press keys | holdKey, pressKey |
| **Mouse** | `iMouseoverOn` | Hover over element | locator |
| | `iDragAndDropOn` | Drag and drop | source, target |
| **Scroll** | `iScrollToAnElement` | Scroll to element | locator |
| | `iScrollToAnElementAndAlignItInTheCenter` | Scroll and center | locator |

## Best Practices

### 1. Use Appropriate Wait Conditions

**Good**:
```java
iWaitUntilElementPresent(locator);
iWaitUntilElementVisible(locator);
iClickOn(locator);
```

**Why**: Ensures element is ready before interaction

### 2. Leverage Automatic Fallbacks

**Good**:
```java
iClickOn(locator);  // Automatically falls back to JavaScript if needed
```

**Why**: Built-in error handling reduces test flakiness

### 3. Use Descriptive Screenshot Comments

**Good**:
```java
iTakeScreenshotWithComment("After successful login");
```

**Why**: Makes test reports more understandable

### 4. Clear Before Filling

**Good**:
```java
iClearAndFillInTo(value, locator);
```

**Why**: Ensures clean state, prevents concatenation

### 5. Use Conditional Actions for Optional Elements

**Good**:
```java
iClickOnLocIfPresent(locator);
```

**Why**: Handles optional UI elements gracefully

## Integration with Other Layers

### Relationship with Composite Action Layer

**Composite Actions** use **Atomic Actions** as building blocks:

```
Composite Action (web.java):
  clickElement_Web(elementType, fieldName)
    │
    ├─> Resolve locator via pattern
    ├─> Apply wait conditions
    │   ├─> iWaitUntilElementPresent(locator)
    │   ├─> iScrollToAnElementAndAlignItInTheCenter(locator)
    │   └─> iWaitUntilElementEnabled(locator)
    │
    └─> Execute atomic action
        └─> iClickOn(locator)
```

### Relationship with WebDriver

**Atomic Actions** wrap **WebDriver** calls:

```
Atomic Action:
  iClickOn(locator)
    │
    └─> QAF click(locator)
            │
            └─> WebDriver.findElement(locator).click()
```

**Benefits of Wrapping**:
- Consistent error handling
- Automatic waits
- Screenshot integration
- Logging and reporting

## Requirements Validation

This documentation addresses the following requirements:

### Requirement 9.1: Atomic Action Library
✅ **Documented**: Complete catalog of atomic actions across all categories

### Requirement 9.2: Locator String Parameters
✅ **Documented**: All actions accept locator strings as parameters

### Requirement 9.3: Wait Conditions
✅ **Documented**: Wait actions for present, visible, enabled, clickable states

### Requirement 9.4: JavaScript Executor Actions
✅ **Documented**: Automatic JavaScript fallback in iClickOn()

### Requirement 9.5: Screenshot Capabilities
✅ **Documented**: Screenshot actions for verification and debugging

## Summary

The Atomic Action Layer provides the foundation for all browser interactions in the pattern-based locator system:

### Key Characteristics

1. **Simple, Focused Operations**: Each action performs one specific task
2. **Locator String Consumption**: Accepts locator strings from Pattern Resolution Layer
3. **WebDriver Abstraction**: Wraps Selenium WebDriver with error handling
4. **Automatic Fallbacks**: Built-in JavaScript executor fallback for problematic elements
5. **Wait Integration**: Supports explicit wait conditions for element states
6. **Screenshot Support**: Integrated screenshot capture for reporting

### Action Categories

- **10 Categories**: Navigation, Click, Input, Verification, Wait, Dropdown, Screenshot, Keyboard, Mouse, Scroll
- **40+ Actions**: Comprehensive coverage of browser interactions
- **Consistent Patterns**: Similar signatures and behaviors across actions

### Integration Points

- **Used By**: Composite Action Layer for building complex test steps
- **Uses**: Selenium WebDriver for actual browser automation
- **Receives**: Locator strings from Pattern Resolution Layer
- **Provides**: Reliable, reusable building blocks for test automation

This layer enables test engineers to build complex, maintainable test automation by composing simple, reliable atomic operations.
