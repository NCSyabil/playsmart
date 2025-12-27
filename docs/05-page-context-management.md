# Page Context Management Documentation

## Overview

Page Context Management is a critical feature of the pattern-based locator system that enables locator scoping by page and location. By maintaining the current page context, the system ensures that the same field name can have different locators on different pages, preventing naming collisions and enabling more maintainable test automation.

## Purpose and Role

Page Context Management serves several key purposes:

1. **Locator Scoping**: Ensures locators are unique per page
2. **Namespace Management**: Prevents field name collisions across pages
3. **Hierarchical Organization**: Supports nested contexts (page::location)
4. **Context Clarity**: Makes it clear which page/section is currently active
5. **Dynamic Resolution**: Enables runtime locator generation based on context

## How Page Context Works

### Context Storage

The current page context is stored in the QAF configuration bundle as a property:

**Property Name**: `auto.page.name`

**Storage Mechanism**:
```java
getBundle().setProperty("auto.page.name", pageName);
```

**Retrieval Mechanism**:
```java
String currentPage = getBundle().getProperty("auto.page.name").toString();
```

### Context Lifecycle

```
Test Start
    │
    ├─> Initial State: "NO Page Name Set"
    │
    ├─> Set Page Name: "PaperConfiguration"
    │   └─> auto.page.name = "PaperConfiguration"
    │
    ├─> Set Field Location: "SearchSection"
    │   └─> auto.page.name = "PaperConfiguration::SearchSection"
    │
    ├─> Remove Field Location
    │   └─> auto.page.name = "PaperConfiguration"
    │
    └─> Test End
```

### Impact on Locator Generation

The page context directly affects locator key generation:

**Without Page Context**:
```
Field: "Submit"
Element: "button"
Result: Cannot generate unique key
```

**With Page Context**:
```
Page: "PaperConfiguration"
Field: "Submit"
Element: "button"
Result: "loc.iExams.paperConfiguration.button.submit"
```

**With Hierarchical Context**:
```
Page: "PaperConfiguration::SearchSection"
Field: "Submit"
Element: "button"
Result: "loc.iExams.paperConfiguration::searchSection.button.submit"
```



## Page Name Scoping

### Setting the Page Name

**Method**: `setPageName_Web(pageName)`

**Location**: `web.java`

**Signature**:
```java
@QAFTestStep(description = "Web: Set-Page-Name Value:{0}")
public static void setPageName_Web(String pageName) throws Exception {
    getBundle().setProperty("auto.page.name", pageName);
}
```

**Purpose**: Set the current page context for all subsequent locator resolutions

**Parameters**:
- `pageName`: The name of the current page (e.g., "PaperConfiguration", "UserProfile")

**Usage Example**:
```gherkin
Given Web: Set-Page-Name Value:"PaperConfiguration"
```

**Effect on Locator Generation**:
```
Before: auto.page.name = "NO Page Name Set"
After:  auto.page.name = "PaperConfiguration"

Locator Key Generated:
  loc.iExams.paperConfiguration.button.search
```

### Getting the Page Name

**Method**: `getPageName()`

**Location**: `web.java`

**Signature**:
```java
@QAFTestStep(description = "Web: Get stored page name")
public static String getPageName() {
    return getBundle().getProperty("auto.page.name").toString();
}
```

**Purpose**: Retrieve the current page context

**Returns**: Current page name string

**Usage**: Called internally by pattern methods

**Example**:
```java
String currentPage = getPageName();  // Returns: "PaperConfiguration"
```

### Page Name Naming Conventions

**Best Practices**:

1. **Use PascalCase**: `"PaperConfiguration"`, `"UserProfile"`, `"ExamSchedule"`
2. **Be Descriptive**: Name should clearly identify the page
3. **Avoid Special Characters**: Stick to alphanumeric characters
4. **Be Consistent**: Use the same naming pattern across all pages

**Good Examples**:
- `"PaperConfiguration"`
- `"ExamSchedule"`
- `"UserManagement"`
- `"ReportGeneration"`

**Avoid**:
- `"page1"` (not descriptive)
- `"Paper-Config"` (contains hyphen)
- `"paper_configuration"` (use PascalCase)
- `"PC"` (too abbreviated)



## Hierarchical Page Contexts

### The Page::Location Pattern

Hierarchical contexts allow you to scope locators to specific sections within a page using the `::` separator.

**Format**: `{PageName}::{LocationName}`

**Examples**:
- `"PaperConfiguration::SearchSection"`
- `"UserProfile::PersonalInfo"`
- `"ExamSchedule::TimeSlots"`

### Setting Field Location

**Method**: `setFieldLocation_Web(locationName)`

**Location**: `web.java`

**Signature**:
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

**Purpose**: Add or replace a location qualifier to the current page context

**Parameters**:
- `locationName`: The section/location name within the page

**Behavior**:
- If no location exists: Appends `::locationName` to page name
- If location exists: Replaces existing location with new one

**Usage Example**:
```gherkin
Given Web: Set-Page-Name Value:"PaperConfiguration"
When Web: Set-Field-Location Value:"SearchSection"
# Context is now: "PaperConfiguration::SearchSection"
```

**Effect on Locator Generation**:
```
Page Context: "PaperConfiguration::SearchSection"
Field: "Year"
Element: "input"

Generated Key: "loc.iExams.paperConfiguration::searchSection.input.year"
```

### Removing Field Location

**Method**: `removeFieldLocation_Web()`

**Location**: `web.java`

**Signature**:
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

**Purpose**: Remove the location qualifier, returning to page-level context

**Usage Example**:
```gherkin
Given Web: Set-Page-Name Value:"PaperConfiguration"
When Web: Set-Field-Location Value:"SearchSection"
# Context: "PaperConfiguration::SearchSection"

Then Web: Remove-Field-Location
# Context: "PaperConfiguration"
```

**Effect**:
```
Before: auto.page.name = "PaperConfiguration::SearchSection"
After:  auto.page.name = "PaperConfiguration"
```



## Complete Usage Examples

### Example 1: Simple Page Context

**Scenario**: Testing a login page

```gherkin
Scenario: User Login
  # Set page context
  Given Web: Set-Page-Name Value:"LoginPage"
  
  # All locators now scoped to LoginPage
  When Web: Input-Text Value:"user@example.com" Field:"Email"
  # Generates: loc.iExams.loginPage.input.email
  
  And Web: Input-Text Value:"password123" Field:"Password"
  # Generates: loc.iExams.loginPage.input.password
  
  And Web: Click-Element Element:"button" Field:"Login"
  # Generates: loc.iExams.loginPage.button.login
  
  Then Web: Verify-Element-Present Element:"text" Field:"Welcome"
  # Generates: loc.iExams.loginPage.text.welcome
```

### Example 2: Hierarchical Context

**Scenario**: Testing a complex form with multiple sections

```gherkin
Scenario: Complete User Profile
  # Set main page context
  Given Web: Set-Page-Name Value:"UserProfile"
  
  # Work in Personal Info section
  When Web: Set-Field-Location Value:"PersonalInfo"
  # Context: "UserProfile::PersonalInfo"
  
  And Web: Input-Text Value:"John" Field:"First Name"
  # Generates: loc.iExams.userProfile::personalInfo.input.firstName
  
  And Web: Input-Text Value:"Doe" Field:"Last Name"
  # Generates: loc.iExams.userProfile::personalInfo.input.lastName
  
  # Switch to Contact Info section
  When Web: Set-Field-Location Value:"ContactInfo"
  # Context: "UserProfile::ContactInfo"
  
  And Web: Input-Text Value:"john@example.com" Field:"Email"
  # Generates: loc.iExams.userProfile::contactInfo.input.email
  
  And Web: Input-Text Value:"+65 1234 5678" Field:"Phone"
  # Generates: loc.iExams.userProfile::contactInfo.input.phone
  
  # Return to page level
  When Web: Remove-Field-Location
  # Context: "UserProfile"
  
  And Web: Click-Element Element:"button" Field:"Save"
  # Generates: loc.iExams.userProfile.button.save
```

### Example 3: Multiple Pages in One Test

**Scenario**: End-to-end workflow across multiple pages

```gherkin
Scenario: Create and Verify Paper Configuration
  # Page 1: Navigation
  Given Web: Set-Page-Name Value:"HomePage"
  When Web: Click-Element Element:"link" Field:"Configuration"
  
  # Page 2: Configuration List
  And Web: Set-Page-Name Value:"ConfigurationList"
  And Web: Click-Element Element:"button" Field:"Create New"
  
  # Page 3: Paper Configuration Form
  And Web: Set-Page-Name Value:"PaperConfiguration"
  
  # Search section
  When Web: Set-Field-Location Value:"SearchSection"
  And Web: Input-Text Value:"2024" Field:"Exam Year"
  And Web: Click-Element Element:"button" Field:"Search"
  
  # Results section
  When Web: Set-Field-Location Value:"ResultsSection"
  Then Web: Verify-Element-Present Element:"text" Field:"Results found"
  
  # Back to page level
  When Web: Remove-Field-Location
  And Web: Click-Element Element:"button" Field:"Submit"
  
  # Page 4: Confirmation
  And Web: Set-Page-Name Value:"ConfirmationPage"
  Then Web: Verify-Element-Present Element:"text" Field:"Success"
```

### Example 4: Reusing Field Names Across Pages

**Scenario**: Same field name on different pages

```gherkin
Scenario: Search on Multiple Pages
  # Search on Home Page
  Given Web: Set-Page-Name Value:"HomePage"
  When Web: Input-Text Value:"test query" Field:"Search"
  # Generates: loc.iExams.homePage.input.search
  And Web: Click-Element Element:"button" Field:"Search"
  # Generates: loc.iExams.homePage.button.search
  
  # Search on Results Page (different locators!)
  And Web: Set-Page-Name Value:"ResultsPage"
  When Web: Input-Text Value:"refined query" Field:"Search"
  # Generates: loc.iExams.resultsPage.input.search
  And Web: Click-Element Element:"button" Field:"Search"
  # Generates: loc.iExams.resultsPage.button.search
```

**Key Point**: The same field name "Search" generates different locator keys on different pages, preventing collisions.



## Best Practices

### 1. Set Page Context Early

**Good**:
```gherkin
Scenario: Test Workflow
  Given Web: Set-Page-Name Value:"PaperConfiguration"
  When Web: Click-Element Element:"button" Field:"Search"
```

**Why**: Ensures all locators are properly scoped from the start

### 2. Use Hierarchical Context for Complex Pages

**Good**:
```gherkin
Given Web: Set-Page-Name Value:"UserProfile"
When Web: Set-Field-Location Value:"PersonalInfo"
And Web: Input-Text Value:"John" Field:"First Name"
When Web: Set-Field-Location Value:"ContactInfo"
And Web: Input-Text Value:"john@example.com" Field:"Email"
```

**Why**: Prevents field name collisions within the same page

### 3. Remove Location When Done

**Good**:
```gherkin
When Web: Set-Field-Location Value:"SearchSection"
# ... work in search section ...
When Web: Remove-Field-Location
And Web: Click-Element Element:"button" Field:"Submit"
```

**Why**: Keeps context clean and prevents unintended scoping

### 4. Use Descriptive Page Names

**Good**:
- `"PaperConfiguration"`
- `"ExamScheduleManagement"`
- `"UserProfileSettings"`

**Avoid**:
- `"Page1"`
- `"Form"`
- `"Screen"`

**Why**: Makes test steps and locator keys self-documenting

### 5. Be Consistent with Naming

**Good**:
```gherkin
Given Web: Set-Page-Name Value:"PaperConfiguration"
# Later in another test...
Given Web: Set-Page-Name Value:"PaperConfiguration"
```

**Avoid**:
```gherkin
Given Web: Set-Page-Name Value:"PaperConfiguration"
# Later in another test...
Given Web: Set-Page-Name Value:"Paper Configuration"  # Inconsistent!
```

**Why**: Ensures locator keys are consistent across tests

### 6. Document Page Names

Create a reference document listing all page names used in the project:

```markdown
# Page Context Reference

| Page Name | Description | URL Pattern |
|-----------|-------------|-------------|
| HomePage | Application home page | /home |
| PaperConfiguration | Paper config form | /config/paper |
| ExamSchedule | Exam scheduling | /schedule/exam |
| UserProfile | User profile settings | /user/profile |
```

**Why**: Helps team maintain consistency



## How Page Context Affects Locator Key Generation

### The checkLoc() Function

The `checkLoc()` function in `patternLoc.java` uses the page context to generate unique locator keys:

```java
public static String checkLoc(String argPageName, String argFieldType, String argFieldName) {
    String patternCode = getPatternCode();  // e.g., "loc.iExams"
    
    String locName = patternCode + "." + 
        CaseUtils.toCamelCase(argPageName.replaceAll("[^a-zA-Z0-9]", " "), false, ' ') + "." + 
        CaseUtils.toCamelCase(argFieldType.replaceAll("[^a-zA-Z0-9]", " "), false, ' ') + "." + 
        CaseUtils.toCamelCase(argFieldName.replaceAll("[^a-zA-Z0-9]", " "), false, ' ');
    
    return locName;
}
```

### Locator Key Generation Examples

#### Example 1: Simple Page Context

**Input**:
- Page: `"PaperConfiguration"`
- Element: `"button"`
- Field: `"Search"`

**Process**:
```
1. Pattern Code: "loc.iExams"
2. Page (camelCase): "paperConfiguration"
3. Element (camelCase): "button"
4. Field (camelCase): "search"
5. Result: "loc.iExams.paperConfiguration.button.search"
```

#### Example 2: Hierarchical Context

**Input**:
- Page: `"PaperConfiguration::SearchSection"`
- Element: `"input"`
- Field: `"Exam Year"`

**Process**:
```
1. Pattern Code: "loc.iExams"
2. Page (camelCase): "paperConfiguration::searchSection"
3. Element (camelCase): "input"
4. Field (camelCase): "examYear"
5. Result: "loc.iExams.paperConfiguration::searchSection.input.examYear"
```

#### Example 3: Special Characters in Page Name

**Input**:
- Page: `"User Profile Settings"`
- Element: `"checkbox"`
- Field: `"Email Notifications"`

**Process**:
```
1. Pattern Code: "loc.iExams"
2. Page (camelCase): "userProfileSettings"
3. Element (camelCase): "checkbox"
4. Field (camelCase): "emailNotifications"
5. Result: "loc.iExams.userProfileSettings.checkbox.emailNotifications"
```

### Context Isolation

Each page context creates an isolated namespace for locators:

```
Page: "HomePage"
  ├─> loc.iExams.homePage.button.search
  ├─> loc.iExams.homePage.input.search
  └─> loc.iExams.homePage.text.results

Page: "ResultsPage"
  ├─> loc.iExams.resultsPage.button.search
  ├─> loc.iExams.resultsPage.input.search
  └─> loc.iExams.resultsPage.text.results

Page: "PaperConfiguration"
  ├─> loc.iExams.paperConfiguration.button.search
  ├─> loc.iExams.paperConfiguration.input.search
  └─> loc.iExams.paperConfiguration.text.results
```

**Key Point**: Same field names on different pages generate different locator keys, preventing collisions.



## Common Patterns and Anti-Patterns

### Pattern 1: Page-Level Context for Simple Pages

**Use When**: Page has no complex sections

```gherkin
Given Web: Set-Page-Name Value:"LoginPage"
When Web: Input-Text Value:"user@example.com" Field:"Email"
And Web: Input-Text Value:"password" Field:"Password"
And Web: Click-Element Element:"button" Field:"Login"
```

### Pattern 2: Hierarchical Context for Complex Forms

**Use When**: Page has multiple distinct sections

```gherkin
Given Web: Set-Page-Name Value:"RegistrationForm"

When Web: Set-Field-Location Value:"PersonalDetails"
And Web: Input-Text Value:"John" Field:"First Name"
And Web: Input-Text Value:"Doe" Field:"Last Name"

When Web: Set-Field-Location Value:"AccountDetails"
And Web: Input-Text Value:"john@example.com" Field:"Email"
And Web: Input-Text Value:"password123" Field:"Password"

When Web: Remove-Field-Location
And Web: Click-Element Element:"button" Field:"Submit"
```

### Pattern 3: Context Switching for Multi-Page Workflows

**Use When**: Test spans multiple pages

```gherkin
Given Web: Set-Page-Name Value:"HomePage"
When Web: Click-Element Element:"link" Field:"Products"

And Web: Set-Page-Name Value:"ProductsPage"
When Web: Click-Element Element:"button" Field:"Add to Cart"

And Web: Set-Page-Name Value:"CartPage"
When Web: Click-Element Element:"button" Field:"Checkout"

And Web: Set-Page-Name Value:"CheckoutPage"
Then Web: Verify-Element-Present Element:"text" Field:"Order Summary"
```

### Anti-Pattern 1: Not Setting Page Context

**Avoid**:
```gherkin
# No page context set!
When Web: Click-Element Element:"button" Field:"Search"
# Generates: loc.iExams.noPageNameSet.button.search
```

**Problem**: Uses default "NO Page Name Set", not meaningful

**Solution**: Always set page context first

### Anti-Pattern 2: Forgetting to Remove Location

**Avoid**:
```gherkin
Given Web: Set-Page-Name Value:"UserProfile"
When Web: Set-Field-Location Value:"PersonalInfo"
And Web: Input-Text Value:"John" Field:"First Name"

# Forgot to remove location!
And Web: Click-Element Element:"button" Field:"Save"
# Generates: loc.iExams.userProfile::personalInfo.button.save
# But Save button is at page level, not in PersonalInfo section!
```

**Problem**: Button locator incorrectly scoped to section

**Solution**: Remove location before page-level actions

### Anti-Pattern 3: Inconsistent Page Names

**Avoid**:
```gherkin
# Test 1
Given Web: Set-Page-Name Value:"PaperConfiguration"

# Test 2
Given Web: Set-Page-Name Value:"Paper Configuration"  # Space instead of camelCase

# Test 3
Given Web: Set-Page-Name Value:"paperConfiguration"  # lowercase
```

**Problem**: Same page generates different locator keys

**Solution**: Use consistent naming convention (PascalCase recommended)

### Anti-Pattern 4: Overly Nested Contexts

**Avoid**:
```gherkin
Given Web: Set-Page-Name Value:"UserProfile"
When Web: Set-Field-Location Value:"PersonalInfo"
# Can't nest further - only one level of location supported
```

**Problem**: System only supports one level of location (page::location)

**Solution**: Use flat structure or rethink page organization



## Integration with Pattern Resolution

### Complete Flow Example

```
Test Step: "Web: Click-Element Element:button Field:Search"

1. Get Page Context:
   getPageName() → "PaperConfiguration"

2. Invoke Pattern Method:
   patternLoc.button("PaperConfiguration", "Search")

3. Generate Locator Key:
   checkLoc("PaperConfiguration", "button", "Search")
   │
   ├─> Pattern Code: "loc.iExams"
   ├─> Page (camelCase): "paperConfiguration"
   ├─> Element: "button"
   ├─> Field: "search"
   └─> Result: "loc.iExams.paperConfiguration.button.search"

4. Check for Static Locator:
   getBundle().getPropertyValue("loc.iExams.paperConfiguration.button.search")
   └─> Not found

5. Generate from Pattern:
   generateLoc("auto.loc.iExams.paperConfiguration.button.search", "Search", "button")
   │
   ├─> Get pattern: "loc.iExams.pattern.button"
   ├─> Substitute: "xpath=//button[text()='Search']"
   └─> Store in bundle

6. Execute Action:
   BrowserGlobal.iClickOn("auto.loc.iExams.paperConfiguration.button.search")
```

### Context Impact on Caching

Locators are cached with their full context:

```
Cache Key: "auto.loc.iExams.paperConfiguration.button.search"
Cache Value: {"locator":["xpath=//button[text()='Search']"]}

Cache Key: "auto.loc.iExams.resultsPage.button.search"
Cache Value: {"locator":["xpath=//button[@id='search-btn']"]}
```

**Key Point**: Same field name on different pages creates separate cache entries.

## Requirements Validation

This documentation addresses the following requirements:

### Requirement 5.1: Page Name Maintenance
✅ **Documented**: Configuration bundle storage of current page name

### Requirement 5.2: Page Name Scoping
✅ **Documented**: How page name is used for locator resolution

### Requirement 5.3: Hierarchical Contexts
✅ **Documented**: Page::Location pattern with examples

### Requirement 5.4: Context Management Methods
✅ **Documented**: setPageName, setFieldLocation, removeFieldLocation

### Requirement 5.5: Context Usage Examples
✅ **Documented**: Complete examples and best practices

## Summary

Page Context Management is a fundamental feature that enables:

### Key Capabilities

1. **Locator Scoping**: Unique locators per page
2. **Namespace Isolation**: Prevents field name collisions
3. **Hierarchical Organization**: Supports page::location pattern
4. **Dynamic Resolution**: Runtime locator generation based on context
5. **Cache Isolation**: Separate cache entries per context

### Context Levels

- **Page Level**: `"PaperConfiguration"`
- **Location Level**: `"PaperConfiguration::SearchSection"`
- **Default**: `"NO Page Name Set"` (should be avoided)

### Management Methods

- **setPageName_Web()**: Set the current page
- **getPageName()**: Get the current page
- **setFieldLocation_Web()**: Add/replace location
- **removeFieldLocation_Web()**: Remove location

### Best Practices

1. Always set page context at the start of a scenario
2. Use hierarchical context for complex pages with sections
3. Remove location context when returning to page level
4. Use consistent, descriptive page names
5. Document all page names used in the project

### Integration Points

- **Used By**: Pattern Resolution Layer for locator key generation
- **Stored In**: QAF Configuration Bundle
- **Affects**: Locator caching, key generation, namespace isolation

This system enables maintainable, scalable test automation by ensuring locators are properly scoped and organized by page context.
