# Configuration and Setup Documentation

## Overview

This document provides comprehensive guidance on configuring and setting up the pattern-based locator system. It covers all required configuration properties, pattern code setup, logging options, and best practices for project initialization.

## Required Configuration Properties

### 1. Pattern Code Configuration

**Property**: `loc.pattern.code`

**Purpose**: Identifies which set of patterns to use for the project

**Location**: `resources/application.properties`

**Format**:
```properties
loc.pattern.code=loc.iExams
```

**Values**:
- Format: `loc.{projectName}`
- Example: `loc.iExams`, `loc.myProject`, `loc.testApp`

**Impact**:
- Used as prefix for all pattern keys
- Enables multi-project support
- Required for pattern resolution to work

**Validation**:
```java
String patternCodeVal = getBundle().getPropertyValue("loc.pattern.code");
if (patternCodeVal.equals("loc.pattern.code")) {
    System.out.println("=====>[ERROR] => [Locator Pattern Code missing in project config]");
}
```

**Error if Missing**:
```
=====>[ERROR] => [Locator Pattern Code missing in project config or not assigned during execution]
```

### 2. Pattern Logging Configuration

**Property**: `loc.pattern.log`

**Purpose**: Enable/disable logging of auto-generated locators

**Location**: `resources/application.properties`

**Format**:
```properties
loc.pattern.log=true
```

**Values**:
- `true`: Enable pattern logging
- `false`: Disable pattern logging

**Log Output When Enabled**:
```
==== AUTO GENERATED: LOCATOR (Pattern) ====> auto.loc.iExams.searchPage.button.proceed
= {"locator":["xpath=//button[text()='PROCEED']"],"desc":"PROCEED : [button] Field "}
```

**Use Cases**:
- **Development**: Enable to see generated locators
- **Debugging**: Enable to troubleshoot pattern issues
- **Production**: Disable to reduce log noise

### 3. Page Load Timeout

**Property**: `custom.page.timeout`

**Purpose**: Maximum time to wait for page load

**Location**: `resources/application.properties`

**Format**:
```properties
custom.page.timeout=60000
```

**Values**:
- Time in milliseconds
- Default: 60000 (60 seconds)
- Recommended: 30000-90000

**Usage**:
```java
driver.manage().timeouts().pageLoadTimeout(
    Duration.ofMillis(Long.parseLong(getBundle().getPropertyValue("custom.page.timeout")))
);
```

### 4. Selenium Wait Timeout

**Property**: `selenium.wait.timeout`

**Purpose**: Default timeout for element waits

**Location**: `resources/application.properties`

**Format**:
```properties
selenium.wait.timeout=30000
```

**Values**:
- Time in milliseconds
- Default: 30000 (30 seconds)
- Recommended: 15000-45000

**Usage**: Used by QAF framework for implicit and explicit waits

### 5. Initial Page Name

**Property**: `auto.page.name`

**Purpose**: Default page context at test start

**Location**: Set programmatically or in properties

**Format**:
```properties
auto.page.name=NO Page Name Set
```

**Values**:
- Default: "NO Page Name Set"
- Should be set in test steps

**Best Practice**: Always set page name explicitly in tests



## Complete Configuration File Example

### application.properties

```properties
# ============================================
# Pattern-Based Locator System Configuration
# ============================================

# Pattern Code - REQUIRED
# Identifies which pattern set to use
loc.pattern.code=loc.iExams

# Pattern Logging - OPTIONAL
# Enable to see generated locators in console
loc.pattern.log=true

# Page Load Timeout - REQUIRED
# Maximum time to wait for page load (milliseconds)
custom.page.timeout=60000

# Selenium Wait Timeout - OPTIONAL
# Default timeout for element waits (milliseconds)
selenium.wait.timeout=30000

# Initial Page Context - OPTIONAL
# Default page name (should be set in tests)
auto.page.name=NO Page Name Set

# ============================================
# WebDriver Configuration
# ============================================

# Driver Type
driver.name=chrome

# Driver Path (if not in PATH)
# webdriver.chrome.driver=drivers/chromedriver.exe

# Browser Options
chrome.additional.capabilities={chromeOptions:{args:[--start-maximized,--disable-notifications]}}

# Implicit Wait
selenium.implicit.wait.timeout=10000

# ============================================
# Test Execution Configuration
# ============================================

# Test Data Location
test.data.dir=resources/data

# Screenshot on Failure
screenshot.on.failure=true

# Report Directory
report.dir=test-results

# ============================================
# Environment Configuration
# ============================================

# Application URL
env.baseurl=https://example.com

# Environment Name
env.name=QAE

# ============================================
# Logging Configuration
# ============================================

# Log Level
log4j.rootLogger=INFO

# Pattern Log Level (if using log4j)
log4j.logger.com.ahq.addons.patternLoc=DEBUG
```

## Pattern File Configuration

### locPattern.properties

**Location**: `resources/locators/locPattern.properties`

**Structure**:
```properties
# ============================================
# Pattern Code: loc.iExams
# Project: iExams Test Automation
# ============================================

# ============================================
# BUTTON PATTERNS
# ============================================
loc.iExams.pattern.button = \
  "xpath=//button[@type='button'][normalize-space()='${loc.auto.fieldName}']",\
  "xpath=//button[.//span[contains(text(), '${loc.auto.fieldName}')]]",\
  "xpath=//span[text()='${loc.auto.fieldName}']",\
  "xpath=//button[@label='${loc.auto.fieldName}']",\
  "xpath=//div[contains(text(),'${loc.auto.fieldName}')]"

# ============================================
# INPUT PATTERNS
# ============================================
loc.iExams.pattern.input = \
  "xpath=//p-dropdown[contains(translate(@placeholder, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), translate('${loc.auto.fieldName}', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'))]//input",\
  "xpath=//label[normalize-space()='${loc.auto.fieldName}']/ancestor::div[1]/following-sibling::div/input",\
  "xpath=//input[@placeholder='${loc.auto.fieldName}']",\
  "xpath=//input[@id='${loc.auto.fieldName}']"

# ============================================
# DROPDOWN PATTERNS
# ============================================
loc.iExams.pattern.dropdown = \
  "xpath=//p-dropdown[@placeholder='${loc.auto.fieldName}']//div[contains(@class, 'ui-widget ui-state-default')]",\
  "xpath=//label[normalize-space()='${loc.auto.fieldName}']/following::div[contains(@class,'ui-dropdown')][1]",\
  "xpath=//select[@id='${loc.auto.fieldName}']"

# ============================================
# CHECKBOX PATTERNS
# ============================================
loc.iExams.pattern.checkbox = \
  "xpath=//p-checkbox[@label='${loc.auto.fieldName}']//div[@class='ui-chkbox-box ui-widget ui-corner-all ui-state-default']",\
  "xpath=//label[text()='${loc.auto.fieldName}']/preceding::div[contains(@class,'ui-chkbox-box')][1]",\
  "xpath=//span[text()='${loc.auto.fieldName}']/preceding-sibling::p-checkbox//div[contains(@class, 'ui-chkbox-box')]"

# Checkbox with Fieldset
loc.iExams.pattern.checkbox.fieldSet = \
  "xpath=//fieldset//p-checkbox[@label='${loc.auto.fieldName}']//div[contains(@class,'ui-chkbox-box')]",\
  "xpath=//fieldset//label[text()='${loc.auto.fieldName}']/preceding::div[contains(@class,'ui-chkbox-box')][1]"

# ============================================
# RADIO BUTTON PATTERNS
# ============================================
loc.iExams.pattern.radioButton = \
  "xpath=//p-radiobutton[@label='${loc.auto.fieldName}']",\
  "xpath=//label[normalize-space()='${loc.auto.fieldName}']/preceding::div[contains(@class,'ui-radiobutton-box')][1]",\
  "xpath=//p-radiobutton[@value='${loc.auto.fieldValue}']//span[@class='ui-radiobutton-icon ui-clickable']"

# ============================================
# TEXT PATTERNS
# ============================================
loc.iExams.pattern.text = \
  "xpath=//span[normalize-space()='${loc.auto.fieldName}']",\
  "xpath=//div[contains(text(),'${loc.auto.fieldName}')]",\
  "xpath=//p[contains(text(),'${loc.auto.fieldName}')]",\
  "xpath=//label[contains(text(),'${loc.auto.fieldName}')]"

# ============================================
# LINK PATTERNS
# ============================================
loc.iExams.pattern.link = \
  "xpath=//a[text()='${loc.auto.fieldName}']",\
  "xpath=//a[contains(text(),'${loc.auto.fieldName}')]",\
  "xpath=//a[@title='${loc.auto.fieldName}']"

# ============================================
# ICON PATTERNS
# ============================================
loc.iExams.pattern.icon = \
  "xpath=//span[@class='pi pi-${loc.auto.fieldName}']",\
  "xpath=//i[text()='${loc.auto.fieldName}']",\
  "xpath=//i[@class='fa fa-${loc.auto.fieldName}']"

# ============================================
# SESSION-SPECIFIC PATTERNS
# ============================================
loc.iExams.pattern.amSession = \
  "xpath=//div[@id='${loc.auto.fieldName}']//p-checkbox[@value='AM']",\
  "xpath=//div[@id='${loc.auto.fieldName}']/descendant::p-checkbox[@value='AM']/descendant::span[contains(@class,'pi-check')]"

loc.iExams.pattern.pmSession = \
  "xpath=//div[@id='${loc.auto.fieldName}']//p-checkbox[@value='PM']",\
  "xpath=//div[@id='${loc.auto.fieldName}']/descendant::p-checkbox[@value='PM']/descendant::span[contains(@class,'pi-check')]"

# ============================================
# LOOKUP BUTTON PATTERNS
# ============================================
loc.iExams.pattern.buttonLookupLaunch = \
  "xpath=//label[normalize-space()='${loc.auto.fieldName}']/following::button[contains(@class,'lookup-launch')][1]",\
  "xpath=//label[text()='${loc.auto.fieldName}']/following::span[contains(@class,'pi-search')][1]"

loc.iExams.pattern.buttonLookupClear = \
  "xpath=//label[normalize-space()='${loc.auto.fieldName}']/following::button[contains(@class,'lookup-clear')][1]",\
  "xpath=//label[text()='${loc.auto.fieldName}']/following::span[contains(@class,'pi-times')][1]"

# ============================================
# TABLE PATTERNS
# ============================================
loc.iExams.pattern.tableInputFirstColumn = \
  "xpath=//tr[td[contains(text(), '${loc.auto.fieldName}')]]//td[1]//input",\
  "xpath=//tr[td[normalize-space()='${loc.auto.fieldName}']]//td[position()=1]//input"

loc.iExams.pattern.tableInputSecondColumn = \
  "xpath=//tr[td[contains(text(), '${loc.auto.fieldName}')]]//td[2]//input",\
  "xpath=//tr[td[normalize-space()='${loc.auto.fieldName}']]//td[position()=2]//input"

# ============================================
# SPINNER/LOADING PATTERNS
# ============================================
loc.iExams.pattern.spinner = \
  "xpath=//div[@id='${loc.auto.fieldName}']",\
  "xpath=//div[contains(@class,'loading')]",\
  "xpath=//div[contains(@class,'spinner')]"
```



## Project Setup Instructions

### Step 1: Create Project Structure

```
project-root/
├── src/
│   └── test/
│       └── java/
│           └── com/
│               └── yourcompany/
│                   ├── addons/
│                   │   └── patternLoc.java
│                   ├── globals/
│                   │   ├── web.java
│                   │   └── BrowserGlobal.java
│                   └── pages/
├── resources/
│   ├── application.properties
│   ├── locators/
│   │   ├── locPattern.properties
│   │   └── staticLocators.loc
│   └── data/
├── tests/
│   └── features/
│       └── yourFeature.feature
└── pom.xml
```

### Step 2: Configure application.properties

```properties
# Minimum required configuration
loc.pattern.code=loc.yourProject
loc.pattern.log=true
custom.page.timeout=60000
selenium.wait.timeout=30000
```

### Step 3: Create locPattern.properties

```properties
# Start with basic patterns
loc.yourProject.pattern.button = "xpath=//button[text()='${loc.auto.fieldName}']"
loc.yourProject.pattern.input = "xpath=//input[@placeholder='${loc.auto.fieldName}']"
loc.yourProject.pattern.text = "xpath=//span[text()='${loc.auto.fieldName}']"
```

### Step 4: Implement patternLoc.java

```java
package com.yourcompany.addons;

import static com.qmetry.qaf.automation.core.ConfigurationManager.getBundle;
import org.apache.commons.text.CaseUtils;

public class patternLoc {
    
    // Core methods
    public static String checkLoc(String argPageName, String argFieldType, String argFieldName) {
        // Implementation from documentation
    }
    
    public static void generateLoc(String argLocator, String argFieldName, String argFieldType) {
        // Implementation from documentation
    }
    
    public static String getPatternCode() {
        // Implementation from documentation
    }
    
    // Element type methods
    public static String button(String page, String fieldName) throws Exception {
        String fieldType = "button";
        String locator = checkLoc(page, fieldType, fieldName);
        if (locator.contains("auto.")) {
            generateLoc(locator, fieldName, fieldType);
        }
        return locator;
    }
    
    public static String input(String page, String fieldName) throws Exception {
        String fieldType = "input";
        String locator = checkLoc(page, fieldType, fieldName);
        if (locator.contains("auto.")) {
            generateLoc(locator, fieldName, fieldType);
        }
        return locator;
    }
    
    // Add more element types as needed
}
```

### Step 5: Implement web.java

```java
package com.yourcompany.globals;

import com.qmetry.qaf.automation.step.QAFTestStep;
import io.cucumber.java.en.And;
import java.lang.reflect.Method;

public class web {
    
    // Page context management
    @QAFTestStep(description = "Web: Set-Page-Name Value:{0}")
    public static void setPageName_Web(String pageName) throws Exception {
        getBundle().setProperty("auto.page.name", pageName);
    }
    
    public static String getPageName() {
        return getBundle().getProperty("auto.page.name").toString();
    }
    
    // Composite actions
    @QAFTestStep(description = "Web: Click-Element Element:{element_name} Field:{field_link_name}")
    @And("Web: Click-Element Element:{string} Field:{string}")
    public static void clickElement_Web(String element_name, String field_link_name) throws Exception {
        Class<?> patternLocClass = patternLoc.class;
        try {
            Method method = patternLocClass.getMethod(element_name, String.class, String.class);
            Object result = method.invoke(null, getPageName(), field_link_name);
            BrowserGlobal.iClickOn((String) result);
        } catch (NoSuchMethodException e) {
            throw new Exception("No such method: " + element_name + " in patternLoc", e);
        }
    }
    
    // Add more composite actions as needed
}
```

### Step 6: Verify Setup

Create a simple test to verify configuration:

```gherkin
Feature: Verify Pattern System Setup

  Scenario: Test Pattern Resolution
    Given Web: Set-Page-Name Value:"TestPage"
    When Web: Click-Element Element:"button" Field:"Test Button"
    Then I take screenshot
```

Run the test and check logs for:
```
==== AUTO GENERATED: LOCATOR (Pattern) ====> auto.loc.yourProject.testPage.button.testButton
```

## Logging and Debugging Options

### Enable Pattern Logging

**Configuration**:
```properties
loc.pattern.log=true
```

**Output**:
```
==== AUTO GENERATED: LOCATOR (Pattern) ====> auto.loc.iExams.searchPage.button.proceed
= {"locator":["xpath=//button[text()='PROCEED']"],"desc":"PROCEED : [button] Field "}
```

### Enable QAF Debug Logging

**Configuration**:
```properties
# In log4testng.properties
log4j.rootLogger=DEBUG, stdout
log4j.logger.com.qmetry.qaf=DEBUG
log4j.logger.com.yourcompany.addons.patternLoc=DEBUG
```

### Enable WebDriver Logging

**Configuration**:
```properties
# In application.properties
webdriver.log.level=ALL
```

### Custom Debug Logging

Add debug statements in patternLoc.java:

```java
public static void generateLoc(String argLocator, String argFieldName, String argFieldType) {
    System.out.println("[DEBUG] Generating locator:");
    System.out.println("  Key: " + argLocator);
    System.out.println("  Field: " + argFieldName);
    System.out.println("  Type: " + argFieldType);
    
    String locPattern = patternCodeVal + ".pattern." + argFieldType;
    System.out.println("  Pattern Key: " + locPattern);
    
    String locPatternVal = getBundle().getPropertyValue(locPattern);
    System.out.println("  Pattern Value: " + locPatternVal);
    
    // ... rest of implementation
}
```



## Multi-Project Configuration

### Overview

The pattern system supports multiple projects with different pattern sets using the pattern code configuration.

### Project 1: iExams

**application.properties**:
```properties
loc.pattern.code=loc.iExams
```

**locPattern.properties**:
```properties
loc.iExams.pattern.button = "xpath=//button[text()='${loc.auto.fieldName}']"
loc.iExams.pattern.input = "xpath=//input[@placeholder='${loc.auto.fieldName}']"
```

### Project 2: MyApp

**application.properties**:
```properties
loc.pattern.code=loc.myApp
```

**locPattern.properties**:
```properties
loc.myApp.pattern.button = "xpath=//a[@role='button'][text()='${loc.auto.fieldName}']"
loc.myApp.pattern.input = "xpath=//div[@data-field='${loc.auto.fieldName}']//input"
```

### Switching Projects at Runtime

```java
// Switch to Project 1
getBundle().setProperty("loc.pattern.code", "loc.iExams");

// Switch to Project 2
getBundle().setProperty("loc.pattern.code", "loc.myApp");
```

### Shared Pattern File

You can maintain all projects in one file:

```properties
# Project 1: iExams
loc.iExams.pattern.button = "xpath=//button[text()='${loc.auto.fieldName}']"
loc.iExams.pattern.input = "xpath=//input[@placeholder='${loc.auto.fieldName}']"

# Project 2: MyApp
loc.myApp.pattern.button = "xpath=//a[@role='button'][text()='${loc.auto.fieldName}']"
loc.myApp.pattern.input = "xpath=//div[@data-field='${loc.auto.fieldName}']//input"

# Project 3: TestApp
loc.testApp.pattern.button = "xpath=//button[@data-testid='${loc.auto.fieldName}']"
loc.testApp.pattern.input = "xpath=//input[@name='${loc.auto.fieldName}']"
```

## Environment-Specific Configuration

### Development Environment

**application-dev.properties**:
```properties
loc.pattern.code=loc.iExams
loc.pattern.log=true
custom.page.timeout=90000
selenium.wait.timeout=45000
env.baseurl=https://dev.example.com
```

### QA Environment

**application-qa.properties**:
```properties
loc.pattern.code=loc.iExams
loc.pattern.log=true
custom.page.timeout=60000
selenium.wait.timeout=30000
env.baseurl=https://qa.example.com
```

### Production Environment

**application-prod.properties**:
```properties
loc.pattern.code=loc.iExams
loc.pattern.log=false
custom.page.timeout=60000
selenium.wait.timeout=30000
env.baseurl=https://example.com
```

### Loading Environment-Specific Config

```java
// In test setup
String env = System.getProperty("env", "qa");
String configFile = "application-" + env + ".properties";
// Load configuration
```

## Best Practices

### 1. Version Control Configuration

**Commit to Repository**:
- `application.properties` (with defaults)
- `locPattern.properties`
- Pattern method implementations

**Exclude from Repository**:
- Environment-specific overrides
- Local developer settings
- Sensitive credentials

**Example .gitignore**:
```
# Local configuration
application-local.properties
local.properties

# Test results
test-results/
screenshots/
reports/

# IDE files
.idea/
*.iml
.vscode/
```

### 2. Configuration Validation

Add validation at framework initialization:

```java
public class ConfigValidator {
    public static void validateConfiguration() {
        // Check pattern code
        String patternCode = getBundle().getPropertyValue("loc.pattern.code");
        if (patternCode.equals("loc.pattern.code")) {
            throw new RuntimeException("Pattern code not configured!");
        }
        
        // Check timeouts
        String pageTimeout = getBundle().getPropertyValue("custom.page.timeout");
        if (pageTimeout == null || pageTimeout.isEmpty()) {
            throw new RuntimeException("Page timeout not configured!");
        }
        
        // Check pattern file exists
        String patternFile = "resources/locators/locPattern.properties";
        if (!new File(patternFile).exists()) {
            throw new RuntimeException("Pattern file not found: " + patternFile);
        }
        
        System.out.println("✓ Configuration validated successfully");
    }
}
```

### 3. Pattern File Organization

**Organize by Element Type**:
```properties
# ============================================
# FORM ELEMENTS
# ============================================
loc.iExams.pattern.input = ...
loc.iExams.pattern.textarea = ...
loc.iExams.pattern.dropdown = ...

# ============================================
# BUTTONS AND LINKS
# ============================================
loc.iExams.pattern.button = ...
loc.iExams.pattern.link = ...

# ============================================
# VERIFICATION ELEMENTS
# ============================================
loc.iExams.pattern.text = ...
loc.iExams.pattern.label = ...
```

### 4. Documentation in Configuration

Add comments explaining patterns:

```properties
# Button Pattern
# Supports: Standard buttons, spans acting as buttons, PrimeNG buttons
# Fallback order: exact text -> label attribute -> contains text
loc.iExams.pattern.button = \
  "xpath=//button[text()='${loc.auto.fieldName}']",\
  "xpath=//button[@label='${loc.auto.fieldName}']",\
  "xpath=//button[contains(text(),'${loc.auto.fieldName}')]"
```

### 5. Configuration Testing

Create tests to verify configuration:

```gherkin
Feature: Configuration Validation

  Scenario: Verify Pattern Code Configuration
    Then I verify pattern code is configured
    And I verify pattern file exists
    And I verify all required patterns are defined

  Scenario: Verify Timeout Configuration
    Then I verify page timeout is configured
    And I verify selenium timeout is configured
    And I verify timeouts are reasonable
```

## Troubleshooting Configuration Issues

### Problem: Pattern code not found

**Symptoms**:
```
[ERROR] => [Locator Pattern Code missing in project config]
```

**Solution**:
```properties
# Add to application.properties
loc.pattern.code=loc.iExams
```

### Problem: Pattern file not loaded

**Symptoms**:
```
[ERROR] => [Locator Pattern 'loc.iExams.pattern.button' not available]
```

**Solutions**:
1. Verify file location: `resources/locators/locPattern.properties`
2. Check file is in classpath
3. Verify pattern code matches file patterns
4. Check for syntax errors in properties file

### Problem: Patterns not being logged

**Symptoms**: No log output for generated locators

**Solution**:
```properties
# Enable pattern logging
loc.pattern.log=true
```

### Problem: Timeouts too short

**Symptoms**: Tests fail with timeout exceptions

**Solution**:
```properties
# Increase timeouts
custom.page.timeout=90000
selenium.wait.timeout=45000
```

## Requirements Validation

This documentation addresses the following requirements:

### Requirement 11.1-11.5: Pattern Configuration Validation
✅ **Documented**: Complete configuration validation and error handling

### Requirement 15.1-15.5: Pattern Debugging
✅ **Documented**: Logging options and debugging strategies

## Summary

The Configuration and Setup documentation provides comprehensive guidance for setting up the pattern-based locator system:

### Key Configuration Properties

1. **loc.pattern.code**: Project identifier (REQUIRED)
2. **loc.pattern.log**: Enable pattern logging (OPTIONAL)
3. **custom.page.timeout**: Page load timeout (REQUIRED)
4. **selenium.wait.timeout**: Element wait timeout (OPTIONAL)
5. **auto.page.name**: Initial page context (OPTIONAL)

### Setup Steps

1. Create project structure
2. Configure application.properties
3. Create locPattern.properties
4. Implement patternLoc.java
5. Implement web.java
6. Verify setup with test

### Best Practices

- Version control configuration files
- Validate configuration at startup
- Organize patterns by element type
- Document patterns with comments
- Use environment-specific configurations
- Test configuration completeness

### Multi-Project Support

- Use different pattern codes per project
- Maintain separate pattern sets
- Switch projects at runtime
- Share pattern file or use separate files

This comprehensive configuration guide ensures successful setup and maintenance of the pattern-based locator system.
