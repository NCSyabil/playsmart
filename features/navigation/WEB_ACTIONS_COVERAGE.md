# Web Actions Coverage in web-actions.feature

This document lists all web actions demonstrated in the `features/navigation/web-actions.feature` file.

## Actions Covered

### Navigation Actions
- ✅ **Open browser** - Opens browser with URL (Background)
- ✅ **Navigate by path** - Navigate using relative paths

### Click Actions
- ✅ **Click button** - Click buttons using pattern locators
- ✅ **Click link** - Click links for navigation
- ✅ **Click tab** - Click tabs to switch content
- ✅ **Click radio button** - Select radio buttons (checkout page)
- ✅ **Click checkbox** - Check/uncheck checkboxes (checkout page)

### Input Actions
- ✅ **Fill** - Fill input fields with values
- ✅ **Fill input** - Alternative syntax for filling inputs

### Dropdown Actions
- ✅ **Select Dropdown** - Select options from dropdown menus (checkout page)

### Verification Actions
- ✅ **Verify header** - Verify header text on page
- ✅ **Verify page title** - Verify page title
- ✅ **Verify text on page** - Verify text appears on page (with partial match)
- ✅ **Verify text at location** - Verify text at specific location
- ✅ **Verify input field is present** - Verify input fields are present
- ✅ **Verify input field value** - Verify input field contains expected value
- ✅ **Verify Tab field Present** - Verify tab fields are present

### Wait Actions
- ✅ **Wait for URL** - Wait for URL to match expected pattern
- ✅ **Wait for Text at Location** - Wait for text to appear at specific location
- ✅ **Wait for Input** - Wait for input field to be enabled/disabled

### Mouse Actions
- ✅ **Mouseover on link** - Mouseover on links

### Keyboard Actions
- ✅ **Press Key** - Press keyboard keys

### Screenshot Options
- ✅ **screenshot** - Take screenshots during test execution
- ✅ **screenshotText** - Add text description to screenshots
- ✅ **screenshotFullPage** - Take full page screenshots
- ✅ **screenshotBefore** - Take screenshot before performing action

### Locator Strategies Demonstrated
- ✅ **data-testid attributes** - Using data-testid for element identification
- ✅ **text content** - Using text content for element identification
- ✅ **aria-label** - Using aria-label for accessibility-based identification
- ✅ **Pattern locators** - Using pattern locator system (homePage.field, checkoutPage.field)

### Advanced Features
- ✅ **Partial match** - Text verification with partial matching
- ✅ **Case insensitive** - Text verification ignoring case
- ✅ **Multiple actions in sequence** - Chaining multiple actions together
- ✅ **Complete workflow** - End-to-end workflow demonstration

## Actions NOT Covered

The following step definitions exist but are not demonstrated in this feature file:

- ❌ **Verify toast text contains** - Not demonstrated (test pages don't have toast notifications)

## Test Organization

### Tags Used
- `@smoke` - Smoke test scenarios (quick validation)
- `@regression` - Regression test scenarios (comprehensive testing)
- `@navigation` - Navigation-related tests
- `@actions` - Action-specific tests
- `@click` - Click action tests
- `@input` - Input action tests
- `@verification` - Verification action tests
- `@tabs` - Tab-related tests
- `@wait` - Wait action tests
- `@keyboard` - Keyboard action tests
- `@mouse` - Mouse action tests
- `@screenshot` - Screenshot-related tests
- `@locators` - Locator strategy tests
- `@workflow` - Workflow tests
- `@radio` - Radio button tests
- `@checkbox` - Checkbox tests
- `@dropdown` - Dropdown tests
- `@complete-workflow` - Complete end-to-end workflow

### Scenarios Count
- Total scenarios: 27
- Smoke scenarios: 10
- Regression scenarios: 17

## Requirements Validation

This feature file validates the following requirements:

- **Requirement 2.1**: Step definitions map to web actions ✅
- **Requirement 2.2**: Parameter extraction and transformation ✅
- **Requirement 2.3**: Parameterized steps with Cucumber expressions ✅

All major web actions are demonstrated with clear examples showing:
1. Basic usage
2. Options and parameters
3. Different locator strategies
4. Screenshot capabilities
5. Verification methods
