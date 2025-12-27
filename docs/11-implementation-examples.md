# Implementation Examples Documentation

## Overview

This document provides complete end-to-end examples demonstrating how the pattern-based locator system works in practice. These examples show real-world usage patterns from test steps through to browser actions, illustrating how all components work together.

## End-to-End Example 1: Simple Button Click

### Test Step (Gherkin)
```gherkin
Given Web: Set Page Name "HomePage"
When Web: Click Button "Search"
```

### Composite Action Layer (web.java)
```java
@QAFTestStep(description = "Web: Click Button {0}")
@And("Web: Click Button {string}")
public static void clickButton_Web(String field) throws Exception {
    // Wait for element to be present
    BrowserGlobal.iWaitUntilElementPresent(patternLoc.button(getPageName(), field));
    
    // Scroll to element
    BrowserGlobal.iScrollToAnElement(patternLoc.button(getPageName(), field));
    
    // Wait for element to be enabled
    BrowserGlobal.iWaitUntilElementEnabled(patternLoc.button(getPageName(), field));
    
    // Click the element
    BrowserGlobal.iClickOn(patternLoc.button(getPageName(), field));
}
```

### Pattern Resolution Layer (patternLoc.java)
```java
public static String button(String page, String fieldName) throws Exception {
    String fieldType = "button";
    
    // Check if locator exists (static or cached)
    String locator = checkLoc(page, fieldType, fieldName);
    
    // If not found, generate it
    if (locator.contains("auto.")) {
        generateLoc(locator, fieldName, fieldType);
    }
    
    return locator;
}
```


### Locator Key Generation (checkLoc)
```java
// Input: page="HomePage", fieldType="button", fieldName="Search"

// Generate locator key
String locName = "loc.iExams." + 
    CaseUtils.toCamelCase("HomePage", false, ' ') + "." + 
    CaseUtils.toCamelCase("button", false, ' ') + "." + 
    CaseUtils.toCamelCase("Search", false, ' ');
// Result: "loc.iExams.homePage.button.search"

// Check if exists in bundle
String locVal = getBundle().getPropertyValue("loc.iExams.homePage.button.search");
// First time: returns "loc.iExams.homePage.button.search" (not found)

// Mark for auto-generation
locName = "auto.loc.iExams.homePage.button.search";
return locName;
```

### Locator Generation (generateLoc)
```java
// Input: argLocator="auto.loc.iExams.homePage.button.search"
//        argFieldName="Search"
//        argFieldType="button"

// Set field name in bundle
getBundle().setProperty("loc.auto.fieldName", "Search");
getBundle().setProperty("loc.auto.fieldInstance", "1");

// Get pattern template
String locPattern = "loc.iExams.pattern.button";
String locPatternVal = getBundle().getPropertyValue(locPattern);
// Returns: "xpath=//button[contains(text(),'${loc.auto.fieldName}')]","xpath=//span[text()='${loc.auto.fieldName}']"

// Substitute placeholders (done by QAF at runtime)
// Result: "xpath=//button[contains(text(),'Search')]","xpath=//span[text()='Search']"

// Store in cache
getBundle().setProperty("auto.loc.iExams.homePage.button.search",
    "{\"locator\":[\"xpath=//button[contains(text(),'${loc.auto.fieldName}')]\",\"xpath=//span[text()='${loc.auto.fieldName}']\"],\"desc\":\"Search : [button] Field \"}");
```

### Atomic Action Layer (BrowserGlobal.java)
```java
// iClickOn receives: "auto.loc.iExams.homePage.button.search"

// QAF resolves the locator from bundle
// Gets: {"locator":["xpath=//button[contains(text(),'Search')]","xpath=//span[text()='Search']"],"desc":"Search : [button] Field "}

// QAF tries each locator in sequence
// 1. Try: xpath=//button[contains(text(),'Search')]
// 2. If fails, try: xpath=//span[text()='Search']

// Selenium executes the click
driver.findElement(By.xpath("//button[contains(text(),'Search')]")).click();
```

### Complete Flow Summary
```
Test Step: "Click Button 'Search'"
    ↓
Composite Action: clickButton_Web("Search")
    ↓
Pattern Method: patternLoc.button("HomePage", "Search")
    ↓
Check Locator: checkLoc("HomePage", "button", "Search")
    → Returns: "auto.loc.iExams.homePage.button.search"
    ↓
Generate Locator: generateLoc(...)
    → Retrieves pattern: "xpath=//button[contains(text(),'${loc.auto.fieldName}')]"
    → Stores in cache with substituted value
    ↓
Atomic Action: iClickOn("auto.loc.iExams.homePage.button.search")
    → QAF resolves from bundle
    → Selenium executes click
```

## End-to-End Example 2: Input Field with Text

### Test Step (Gherkin)
```gherkin
Given Web: Set Page Name "RegistrationPage"
When Web: Input "john.doe@example.com" into "Email Address"
```

### Composite Action Layer
```java
@QAFTestStep(description = "Web: Input {0} into {1}")
@And("Web: Input {string} into {string}")
public static void input_Web(String text, String field) throws Exception {
    BrowserGlobal.iWaitUntilElementPresent(patternLoc.input(getPageName(), field));
    BrowserGlobal.iScrollToAnElement(patternLoc.input(getPageName(), field));
    BrowserGlobal.iWaitUntilElementVisible(patternLoc.input(getPageName(), field));
    BrowserGlobal.iInputInTo(text, patternLoc.input(getPageName(), field));
}
```

### Pattern Resolution
```java
// patternLoc.input("RegistrationPage", "Email Address")

// checkLoc generates key
String locName = "loc.iExams.registrationPage.input.emailAddress";

// First execution: not in cache
// Returns: "auto.loc.iExams.registrationPage.input.emailAddress"

// generateLoc creates locator
// Pattern: loc.iExams.pattern.input
// Value: "xpath=//input[@placeholder='${loc.auto.fieldName}']","xpath=//label[text()='${loc.auto.fieldName}']/following::input[1]"

// Stores in cache:
// Key: auto.loc.iExams.registrationPage.input.emailAddress
// Value: {"locator":["xpath=//input[@placeholder='Email Address']","xpath=//label[text()='Email Address']/following::input[1]"],"desc":"Email Address : [input] Field "}
```

### Atomic Action Execution
```java
// iInputInTo("john.doe@example.com", "auto.loc.iExams.registrationPage.input.emailAddress")

// QAF resolves locator and tries patterns in order:
// 1. xpath=//input[@placeholder='Email Address']
// 2. If fails: xpath=//label[text()='Email Address']/following::input[1]

// Selenium executes:
WebElement element = driver.findElement(By.xpath("//input[@placeholder='Email Address']"));
element.clear();
element.sendKeys("john.doe@example.com");
```

## End-to-End Example 3: Radio Button with Value

### Test Step (Gherkin)
```gherkin
Given Web: Set Page Name "PaymentPage"
When Web: Click Radio Button with text "Credit Card" in "Payment Method"
```

### Composite Action Layer
```java
@QAFTestStep(description = "Web: Click Radio Button with text {0} in {1}")
@And("Web: Click Radio Button with text {string} in {string}")
public static void clickRadioButton_Web(String radio_Text, String field) throws Exception {
    BrowserGlobal.iWaitUntilElementPresent(patternLoc.radioButton(getPageName(), field, radio_Text));
    BrowserGlobal.iScrollToAnElement(patternLoc.radioButton(getPageName(), field, radio_Text));
    BrowserGlobal.iClickOn(patternLoc.radioButton(getPageName(), field, radio_Text));
}
```

### Pattern Resolution with Value Parameter
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

// Execution:
// checkLoc("PaymentPage", "radioButton", "Payment Method")
// Returns: "auto.loc.iExams.paymentPage.radioButton.paymentMethod"

// generateLoc with fieldValue="Credit Card"
// Sets: loc.auto.fieldName = "Payment Method"
//       loc.auto.fieldValue = "Credit Card"

// Pattern: loc.iExams.pattern.radioButton
// Value: "xpath=//label[text()='${loc.auto.fieldName}']/following::input[@value='${loc.auto.fieldValue}']"

// Result: "xpath=//label[text()='Payment Method']/following::input[@value='Credit Card']"
```

## End-to-End Example 4: Dropdown Selection

### Test Step (Gherkin)
```gherkin
Given Web: Set Page Name "ProfilePage"
When Web: Select Dropdown with text "United States" in "Country"
```

### Composite Action Layer
```java
@QAFTestStep(description = "Web: Select Dropdown with text {0} in {1}")
@And("Web: Select Dropdown with text {string} in {string}")
public static void selectDropdownByText_Web(String dropdown_Text, String field) throws Exception {
    BrowserGlobal.iWaitUntilElementPresent(patternLoc.select(getPageName(), field));
    BrowserGlobal.iScrollToAnElement(patternLoc.select(getPageName(), field));
    BrowserGlobal.iSelectDropdownWithText(patternLoc.select(getPageName(), field), dropdown_Text);
}
```

### Pattern Resolution
```java
// patternLoc.select("ProfilePage", "Country")

// Generates key: "loc.iExams.profilePage.select.country"
// Pattern: "xpath=//label[text()='${loc.auto.fieldName}']/following::select[1]"
// Result: "xpath=//label[text()='Country']/following::select[1]"
```

### Atomic Action with Selenium Select
```java
// iSelectDropdownWithText("auto.loc.iExams.profilePage.select.country", "United States")

// QAF resolves locator
WebElement element = driver.findElement(By.xpath("//label[text()='Country']/following::select[1]"));

// Selenium Select wrapper
Select dropdown = new Select(element);
dropdown.selectByVisibleText("United States");
```

## Pattern Template Examples

### Example 1: Simple Text-Based Button Pattern
```properties
# Pattern Configuration
loc.iExams.pattern.button = "xpath=//button[contains(text(),'${loc.auto.fieldName}')]"

# Usage in Test
Web: Click Button "Submit"

# Generated Locator
xpath=//button[contains(text(),'Submit')]
```

### Example 2: Multiple Fallback Patterns for Input
```properties
# Pattern Configuration with Fallbacks
loc.iExams.pattern.input = \
"xpath=//input[@placeholder='${loc.auto.fieldName}']",\
"xpath=//label[text()='${loc.auto.fieldName}']/following::input[1]",\
"xpath=//input[@id='${loc.auto.fieldName}']",\
"xpath=//input[@name='${loc.auto.fieldName}']"

# Usage in Test
Web: Input "test@example.com" into "Email"

# Generated Locators (tried in order)
1. xpath=//input[@placeholder='Email']
2. xpath=//label[text()='Email']/following::input[1]
3. xpath=//input[@id='Email']
4. xpath=//input[@name='Email']
```

### Example 3: Radio Button with Value Placeholder
```properties
# Pattern Configuration
loc.iExams.pattern.radioButton = \
"xpath=//label[text()='${loc.auto.fieldName}']/following::input[@value='${loc.auto.fieldValue}']",\
"xpath=//input[@name='${loc.auto.fieldName}' and @value='${loc.auto.fieldValue}']"

# Usage in Test
Web: Click Radio Button with text "Male" in "Gender"

# Generated Locators
1. xpath=//label[text()='Gender']/following::input[@value='Male']
2. xpath=//input[@name='Gender' and @value='Male']
```

### Example 4: Checkbox with Fieldset Scope
```properties
# Pattern Configuration
loc.iExams.pattern.checkbox.fieldSet = \
"xpath=//fieldset[.//legend[text()='${loc.auto.fieldValue}']]/descendant::label[text()='${loc.auto.fieldName}']/following::input[@type='checkbox'][1]"

# Usage in Test
Web: Click Checkbox with fieldset "Preferences" and text "Email Notifications"

# Generated Locator
xpath=//fieldset[.//legend[text()='Preferences']]/descendant::label[text()='Email Notifications']/following::input[@type='checkbox'][1]
```

### Example 5: Complex Dropdown Pattern
```properties
# Pattern Configuration
loc.iExams.pattern.select = \
"xpath=//p-dropdown[contains(@placeholder, '${loc.auto.fieldName}')]//input",\
"xpath=//label[normalize-space()='${loc.auto.fieldName}']/ancestor::div[1]/following-sibling::div//select",\
"xpath=//select[@id='${loc.auto.fieldName}']"

# Usage in Test
Web: Select Dropdown with text "Option 1" in "Category"

# Generated Locators
1. xpath=//p-dropdown[contains(@placeholder, 'Category')]//input
2. xpath=//label[normalize-space()='Category']/ancestor::div[1]/following-sibling::div//select
3. xpath=//select[@id='Category']
```


## Migration Examples: Static to Pattern-Based

### Before: Static Locator Approach
```properties
# locators.properties
loc.homePage.searchButton = {"locator":["xpath=//button[@id='search-btn']"],"desc":"Search Button"}
loc.homePage.emailInput = {"locator":["xpath=//input[@id='email']"],"desc":"Email Input"}
loc.homePage.submitButton = {"locator":["xpath=//button[@id='submit-btn']"],"desc":"Submit Button"}
loc.profilePage.nameInput = {"locator":["xpath=//input[@id='name']"],"desc":"Name Input"}
loc.profilePage.saveButton = {"locator":["xpath=//button[@id='save-btn']"],"desc":"Save Button"}
```

```java
// Test step implementation
@QAFTestStep(description = "Click search button")
public static void clickSearchButton() {
    BrowserGlobal.iClickOn("loc.homePage.searchButton");
}

@QAFTestStep(description = "Enter email")
public static void enterEmail(String email) {
    BrowserGlobal.iInputInTo(email, "loc.homePage.emailInput");
}
```

**Problems**:
- 5 static locators for 5 elements
- Hardcoded locator keys in test steps
- No reusability across pages
- Maintenance overhead for each element

### After: Pattern-Based Approach
```properties
# locPattern.properties
loc.iExams.pattern.button = "xpath=//button[contains(text(),'${loc.auto.fieldName}')]"
loc.iExams.pattern.input = "xpath=//input[@placeholder='${loc.auto.fieldName}']"
```

```java
// Generic test step implementation
@QAFTestStep(description = "Web: Click Button {0}")
public static void clickButton_Web(String field) throws Exception {
    BrowserGlobal.iClickOn(patternLoc.button(getPageName(), field));
}

@QAFTestStep(description = "Web: Input {0} into {1}")
public static void input_Web(String text, String field) throws Exception {
    BrowserGlobal.iInputInTo(text, patternLoc.input(getPageName(), field));
}
```

```gherkin
# Test usage
Given Web: Set Page Name "HomePage"
When Web: Click Button "Search"
And Web: Input "test@example.com" into "Email"
And Web: Click Button "Submit"

Given Web: Set Page Name "ProfilePage"
When Web: Input "John Doe" into "Name"
And Web: Click Button "Save"
```

**Benefits**:
- 2 pattern templates handle unlimited elements
- Generic, reusable test steps
- No hardcoded locator keys
- Automatic locator generation
- Easy to add new elements (no code changes)

### Migration Strategy

**Step 1: Identify Common Element Types**
```
Analyze existing static locators:
- 50 button locators → 1 button pattern
- 30 input locators → 1 input pattern
- 20 dropdown locators → 1 select pattern
- 15 checkbox locators → 1 checkbox pattern
```

**Step 2: Create Pattern Templates**
```properties
# Extract common XPath structures
# Before: xpath=//button[@id='search-btn']
#         xpath=//button[@id='submit-btn']
#         xpath=//button[@id='save-btn']

# After: Identify pattern
loc.iExams.pattern.button = "xpath=//button[contains(text(),'${loc.auto.fieldName}')]"
```

**Step 3: Update Test Steps**
```java
// Before: Specific method for each action
@QAFTestStep(description = "Click search button")
public static void clickSearchButton() {
    BrowserGlobal.iClickOn("loc.homePage.searchButton");
}

// After: Generic method with parameters
@QAFTestStep(description = "Web: Click Button {0}")
public static void clickButton_Web(String field) throws Exception {
    BrowserGlobal.iClickOn(patternLoc.button(getPageName(), field));
}
```

**Step 4: Update Feature Files**
```gherkin
# Before
When Click search button
And Enter email "test@example.com"
And Click submit button

# After
Given Web: Set Page Name "HomePage"
When Web: Click Button "Search"
And Web: Input "test@example.com" into "Email"
And Web: Click Button "Submit"
```

## Real-World Scenario Examples

### Scenario 1: Multi-Page Form Submission

**Test Scenario**: User fills out a registration form across multiple pages

```gherkin
Feature: User Registration

Scenario: Complete registration process
  # Page 1: Personal Information
  Given Web: Open url "https://example.com/register"
  And Web: Set Page Name "PersonalInfoPage"
  When Web: Input "John" into "First Name"
  And Web: Input "Doe" into "Last Name"
  And Web: Input "john.doe@example.com" into "Email"
  And Web: Click Button "Next"
  
  # Page 2: Account Details
  And Web: Set Page Name "AccountDetailsPage"
  When Web: Input "johndoe123" into "Username"
  And Web: Input "SecurePass123!" into "Password"
  And Web: Input "SecurePass123!" into "Confirm Password"
  And Web: Click Button "Next"
  
  # Page 3: Preferences
  And Web: Set Page Name "PreferencesPage"
  When Web: Click Checkbox "Email Notifications"
  And Web: Click Checkbox "SMS Notifications"
  And Web: Select Dropdown with text "United States" in "Country"
  And Web: Click Button "Submit"
  
  # Verification
  And Web: Set Page Name "ConfirmationPage"
  Then Web: Verify Text "Registration Successful"
```

**Pattern Resolution Flow**:
```
Page 1: PersonalInfoPage
  - loc.iExams.personalInfoPage.input.firstName
  - loc.iExams.personalInfoPage.input.lastName
  - loc.iExams.personalInfoPage.input.email
  - loc.iExams.personalInfoPage.button.next

Page 2: AccountDetailsPage
  - loc.iExams.accountDetailsPage.input.username
  - loc.iExams.accountDetailsPage.input.password
  - loc.iExams.accountDetailsPage.input.confirmPassword
  - loc.iExams.accountDetailsPage.button.next

Page 3: PreferencesPage
  - loc.iExams.preferencesPage.checkbox.emailNotifications
  - loc.iExams.preferencesPage.checkbox.smsNotifications
  - loc.iExams.preferencesPage.select.country
  - loc.iExams.preferencesPage.button.submit

Page 4: ConfirmationPage
  - loc.iExams.confirmationPage.text.registrationSuccessful
```

### Scenario 2: Dynamic Table Interaction

**Test Scenario**: Search and select items from a data table

```gherkin
Feature: Search and Select Items

Scenario: Find and select specific items
  Given Web: Open url "https://example.com/items"
  And Web: Set Page Name "ItemsPage"
  
  # Search for items
  When Web: Input "Laptop" into "Search"
  And Web: Click Button "Search"
  And Web: Wait for "2" seconds
  
  # Select items from results
  And Web: Click Checkbox "Dell XPS 15"
  And Web: Click Checkbox "MacBook Pro"
  And Web: Click Checkbox "ThinkPad X1"
  
  # Apply filters
  And Web: Select Dropdown with text "Price: Low to High" in "Sort By"
  And Web: Click Button "Apply Filters"
  
  # Verify selection
  Then Web: Verify Text "3 items selected"
  And Web: Click Button "Add to Cart"
```

**Pattern Usage**:
```
Search: loc.iExams.itemsPage.input.search
Button: loc.iExams.itemsPage.button.search
Checkboxes: 
  - loc.iExams.itemsPage.checkbox.dellXps15
  - loc.iExams.itemsPage.checkbox.macbookPro
  - loc.iExams.itemsPage.checkbox.thinkpadX1
Dropdown: loc.iExams.itemsPage.select.sortBy
Buttons:
  - loc.iExams.itemsPage.button.applyFilters
  - loc.iExams.itemsPage.button.addToCart
Text: loc.iExams.itemsPage.text.3ItemsSelected
```

### Scenario 3: Hierarchical Page Context

**Test Scenario**: Navigate through nested sections with field location

```gherkin
Feature: Exam Configuration

Scenario: Configure exam settings
  Given Web: Open url "https://example.com/exam-config"
  And Web: Set Page Name "ExamConfigPage"
  
  # General Settings Section
  And Web: Set Field Location "General Settings"
  When Web: Input "Final Exam 2024" into "Exam Name"
  And Web: Select Dropdown with text "Multiple Choice" in "Exam Type"
  And Web: Input "120" into "Duration (minutes)"
  
  # Grading Section
  And Web: Remove Field Location
  And Web: Set Field Location "Grading"
  When Web: Input "100" into "Total Points"
  And Web: Input "60" into "Passing Score"
  And Web: Click Checkbox "Curved Grading"
  
  # Scheduling Section
  And Web: Remove Field Location
  And Web: Set Field Location "Scheduling"
  When Web: Input "2024-06-15" into "Start Date"
  And Web: Input "2024-06-20" into "End Date"
  And Web: Click Checkbox "Allow Late Submission"
  
  # Save Configuration
  And Web: Remove Field Location
  And Web: Click Button "Save Configuration"
```

**Hierarchical Locator Keys**:
```
General Settings Section:
  - loc.iExams.examConfigPageGeneralSettings.input.examName
  - loc.iExams.examConfigPageGeneralSettings.select.examType
  - loc.iExams.examConfigPageGeneralSettings.input.durationMinutes

Grading Section:
  - loc.iExams.examConfigPageGrading.input.totalPoints
  - loc.iExams.examConfigPageGrading.input.passingScore
  - loc.iExams.examConfigPageGrading.checkbox.curvedGrading

Scheduling Section:
  - loc.iExams.examConfigPageScheduling.input.startDate
  - loc.iExams.examConfigPageScheduling.input.endDate
  - loc.iExams.examConfigPageScheduling.checkbox.allowLateSubmission

Main Page:
  - loc.iExams.examConfigPage.button.saveConfiguration
```

### Scenario 4: Field Instance Handling

**Test Scenario**: Handle multiple instances of the same field

```gherkin
Feature: Multiple Email Addresses

Scenario: Add multiple contact emails
  Given Web: Open url "https://example.com/contacts"
  And Web: Set Page Name "ContactsPage"
  
  # First email (default instance)
  When Web: Input "primary@example.com" into "Email"
  And Web: Click Button "Add Another Email"
  
  # Second email (instance 2)
  And Web: Input "secondary@example.com" into "Email[2]"
  And Web: Click Button "Add Another Email"
  
  # Third email (instance 3)
  And Web: Input "tertiary@example.com" into "Email[3]"
  
  # Verify all emails
  Then Web: Verify Input "Email" contains "primary@example.com"
  And Web: Verify Input "Email[2]" contains "secondary@example.com"
  And Web: Verify Input "Email[3]" contains "tertiary@example.com"
```

**Instance-Based Locator Keys**:
```
First instance:
  - loc.iExams.contactsPage.input.email
  - fieldInstance = "1"

Second instance:
  - loc.iExams.contactsPage.input.email2
  - fieldInstance = "2"

Third instance:
  - loc.iExams.contactsPage.input.email3
  - fieldInstance = "3"
```

**Pattern with Instance Placeholder**:
```properties
loc.iExams.pattern.input = \
"xpath=(//input[@placeholder='${loc.auto.fieldName}'])[${loc.auto.fieldInstance}]",\
"xpath=(//label[text()='${loc.auto.fieldName}']/following::input)[${loc.auto.fieldInstance}]"
```

## Requirements Validation

This documentation addresses all requirements by providing comprehensive examples:

**All Requirements**: ✅ Demonstrated through complete end-to-end examples
- Showed pattern configuration, resolution, and execution
- Provided real-world scenarios covering all element types
- Demonstrated migration from static to pattern-based approach
- Illustrated complex scenarios (multi-page, hierarchical context, field instances)

## Summary

This documentation provides practical, real-world examples of the pattern-based locator system in action. Key takeaways:

- **End-to-end flows** show how test steps translate to browser actions through all system layers
- **Pattern templates** demonstrate configuration for various element types with fallback options
- **Migration examples** provide a clear path from static to pattern-based locators
- **Real-world scenarios** illustrate complex use cases including multi-page forms, dynamic tables, hierarchical contexts, and field instances
- **Complete traceability** from Gherkin test steps through pattern resolution to Selenium execution

These examples serve as a reference for implementing similar pattern-based systems in other frameworks and for training test engineers on effective usage of the system.
