Feature: Web Actions Demonstration
  As a test automation engineer
  I want to demonstrate all available web actions
  So that I can understand the framework capabilities

  Background:
    Given Web: Open browser -url: "file://#{env.PLAYQ_PROJECT_ROOT}/playwright-tests/web-examples/test-pages/home.html" -options: ""

  # Demonstrates: Open browser action with URL
  # This is already in Background, but shows the basic navigation action
  @smoke @navigation @basic-actions
  Scenario: Open browser and verify page loads
    Then Web: Verify page title -text: "Home Page" -options: ""
    And Web: Verify text on page -text: "Welcome to Test Application" -options: "{partialMatch: true}"

  # Demonstrates: Navigate by path action
  @smoke @navigation
  Scenario: Navigate to different pages using relative paths
    When Web: Navigate by path -relativePath: "/login.html" -options: ""
    Then Web: Verify page title -text: "Login Page" -options: ""
    When Web: Navigate by path -relativePath: "/checkout.html" -options: ""
    Then Web: Verify page title -text: "Checkout Page" -options: ""

  # Demonstrates: Click button action with pattern locators
  @smoke @actions @click
  Scenario: Click buttons using pattern locators
    When Web: Click button -field: "homePage.getStartedButton" -options: ""
    Then Web: Verify text on page -text: "Get Started" -options: "{partialMatch: true}"
    When Web: Click button -field: "homePage.learnMoreButton" -options: ""
    Then Web: Verify text on page -text: "Learn More" -options: "{partialMatch: true}"

  # Demonstrates: Click link action
  @regression @actions @click
  Scenario: Click links for navigation
    When Web: Click link -field: "homePage.productsLink" -options: ""
    Then Web: Verify text on page -text: "Products" -options: "{partialMatch: true}"
    When Web: Click link -field: "homePage.aboutLink" -options: ""
    Then Web: Verify text on page -text: "About" -options: "{partialMatch: true}"

  # Demonstrates: Fill input fields
  @smoke @actions @input
  Scenario: Fill input fields with values
    When Web: Fill -field: "homePage.searchInput" -value: "laptop computers" -options: ""
    Then Web: Verify input field value -field: "homePage.searchInput" -value: "laptop computers" -options: ""
    When Web: Fill -field: "homePage.searchInput" -value: "smartphones" -options: ""
    Then Web: Verify input field value -field: "homePage.searchInput" -value: "smartphones" -options: ""

  # Demonstrates: Fill input action (alternative syntax)
  @regression @actions @input
  Scenario: Fill input using Fill input action
    When Web: Fill input -field: "homePage.searchInput" -value: "test query" -options: ""
    Then Web: Verify input field value -field: "homePage.searchInput" -value: "test query" -options: ""

  # Demonstrates: Verify header text
  @smoke @actions @verification
  Scenario: Verify header text on page
    Then Web: Verify header -text: "Welcome to Test Application" -options: ""
    And Web: Verify header -text: "Explore Our Features" -options: ""

  # Demonstrates: Verify page title
  @smoke @actions @verification
  Scenario: Verify page title
    Then Web: Verify page title -text: "Home Page - Test" -options: ""

  # Demonstrates: Verify text on page with partial match
  @smoke @actions @verification
  Scenario: Verify text appears on page
    Then Web: Verify text on page -text: "Welcome Back" -options: "{partialMatch: true}"
    And Web: Verify text on page -text: "Discover amazing products" -options: "{partialMatch: true}"
    And Web: Verify text on page -text: "Feature One" -options: "{partialMatch: true}"

  # Demonstrates: Verify text at specific location
  @regression @actions @verification
  Scenario: Verify text at specific location
    Then Web: Verify text at location -field: "homePage.heroSection" -value: "Welcome Back!" -options: ""
    And Web: Verify text at location -field: "homePage.featuresSection" -value: "Feature One" -options: "{partialMatch: true}"

  # Demonstrates: Verify input field is present
  @smoke @actions @verification
  Scenario: Verify input fields are present on page
    Then Web: Verify input field is present -field: "homePage.searchInput" -options: ""

  # Demonstrates: Verify input field value
  @regression @actions @verification
  Scenario: Verify input field contains expected value
    When Web: Fill -field: "homePage.searchInput" -value: "test value" -options: ""
    Then Web: Verify input field value -field: "homePage.searchInput" -value: "test value" -options: ""

  # Demonstrates: Click tab action
  @regression @actions @tabs
  Scenario: Click tabs to switch content
    When Web: Click tab -field: "homePage.electronicsTab" -options: ""
    Then Web: Verify text on page -text: "Electronics" -options: "{partialMatch: true}"
    When Web: Click tab -field: "homePage.clothingTab" -options: ""
    Then Web: Verify text on page -text: "Clothing" -options: "{partialMatch: true}"
    When Web: Click tab -field: "homePage.booksTab" -options: ""
    Then Web: Verify text on page -text: "Books" -options: "{partialMatch: true}"

  # Demonstrates: Verify tab field present
  @regression @actions @tabs
  Scenario: Verify tab fields are present
    Then Web: Verify Tab field Present -field: "homePage.electronicsTab" -options: ""
    And Web: Verify Tab field Present -field: "homePage.clothingTab" -options: ""
    And Web: Verify Tab field Present -field: "homePage.booksTab" -options: ""

  # Demonstrates: Wait for URL
  @regression @actions @wait
  Scenario: Wait for URL to match expected pattern
    When Web: Click link -field: "homePage.checkoutLink" -options: ""
    Then Web: Wait for URL -url: "checkout.html" -options: "{partialMatch: true}"

  # Demonstrates: Press Key action
  @regression @actions @keyboard
  Scenario: Press keyboard keys
    When Web: Fill -field: "homePage.searchInput" -value: "test" -options: ""
    And Web: Press Key -key: "Enter" -options: ""
    Then Web: Verify input field value -field: "homePage.searchInput" -value: "test" -options: ""

  # Demonstrates: Mouseover on link
  @regression @actions @mouse
  Scenario: Mouseover on links
    When Web: Mouseover on link -field: "homePage.productsLink" -options: ""
    Then Web: Verify text on page -text: "Products" -options: "{partialMatch: true}"

  # Demonstrates: Screenshot options
  @regression @actions @screenshot
  Scenario: Take screenshots during test execution
    When Web: Click button -field: "homePage.getStartedButton" -options: "{screenshot: true, screenshotText: 'After clicking Get Started button'}"
    Then Web: Verify text on page -text: "Get Started" -options: "{screenshot: true, screenshotFullPage: true, screenshotText: 'Full page after verification'}"

  # Demonstrates: Screenshot before action
  @regression @actions @screenshot
  Scenario: Take screenshot before performing action
    When Web: Click button -field: "homePage.learnMoreButton" -options: "{screenshotBefore: true, screenshotText: 'Before clicking Learn More'}"
    Then Web: Verify text on page -text: "Learn More" -options: "{partialMatch: true}"

  # Demonstrates: Different locator strategies using pattern fields
  @regression @actions @locators
  Scenario: Use different locator strategies
    # Using data-testid attribute
    When Web: Click button -field: "homePage.getStartedButton" -options: ""
    Then Web: Verify text on page -text: "Get Started" -options: "{partialMatch: true}"
    
    # Using text content
    When Web: Click link -field: "homePage.homeLink" -options: ""
    Then Web: Verify text on page -text: "Home" -options: "{partialMatch: true}"
    
    # Using aria-label
    When Web: Fill -field: "homePage.searchInput" -value: "search test" -options: ""
    Then Web: Verify input field value -field: "homePage.searchInput" -value: "search test" -options: ""

  # Demonstrates: Multiple actions in sequence
  @smoke @actions @workflow
  Scenario: Perform multiple actions in sequence
    When Web: Fill -field: "homePage.searchInput" -value: "laptops" -options: ""
    And Web: Click button -field: "homePage.getStartedButton" -options: ""
    And Web: Click tab -field: "homePage.electronicsTab" -options: ""
    Then Web: Verify text on page -text: "Electronics" -options: "{partialMatch: true}"
    And Web: Verify input field value -field: "homePage.searchInput" -value: "laptops" -options: ""

  # Demonstrates: Verification with options
  @regression @actions @verification-options
  Scenario: Verify text with different options
    # Partial match
    Then Web: Verify text on page -text: "Welcome" -options: "{partialMatch: true}"
    
    # Case insensitive (if supported)
    And Web: Verify text on page -text: "WELCOME BACK" -options: "{partialMatch: true, ignoreCase: true}"

  # Demonstrates: Wait for text at location
  @regression @actions @wait
  Scenario: Wait for text to appear at specific location
    When Web: Click button -field: "homePage.getStartedButton" -options: ""
    Then Web: Wait for Text at Location -field: "homePage.heroSection" -text: "Welcome Back!" -options: ""

  # Demonstrates: Wait for input state
  @regression @actions @wait
  Scenario: Wait for input field to be enabled
    Then Web: Wait for Input -field: "homePage.searchInput" -state: "enabled" (enabled or disabled) -options: ""
    When Web: Fill -field: "homePage.searchInput" -value: "test" -options: ""
    Then Web: Verify input field value -field: "homePage.searchInput" -value: "test" -options: ""

  # Demonstrates: Radio button selection (requires checkout page)
  @regression @actions @radio
  Scenario: Select radio buttons for payment method
    When Web: Navigate by path -relativePath: "/checkout.html" -options: ""
    Then Web: Verify text on page -text: "Secure Checkout" -options: "{partialMatch: true}"
    When Web: Click radio button -field: "checkoutPage.paypalRadio" -options: ""
    Then Web: Verify text on page -text: "PayPal" -options: "{partialMatch: true}"
    When Web: Click radio button -field: "checkoutPage.bankTransferRadio" -options: ""
    Then Web: Verify text on page -text: "Bank Transfer" -options: "{partialMatch: true}"

  # Demonstrates: Checkbox selection
  @regression @actions @checkbox
  Scenario: Check and uncheck checkboxes
    When Web: Navigate by path -relativePath: "/checkout.html" -options: ""
    When Web: Click checkbox -field: "checkoutPage.sameAsBillingCheckbox" -options: ""
    And Web: Click checkbox -field: "checkoutPage.termsCheckbox" -options: ""
    Then Web: Verify text on page -text: "Order Summary" -options: "{partialMatch: true}"

  # Demonstrates: Dropdown selection
  @regression @actions @dropdown
  Scenario: Select options from dropdown menus
    When Web: Navigate by path -relativePath: "/checkout.html" -options: ""
    When Web: Select Dropdown -field: "checkoutPage.countryDropdown" -value: "United States" -options: ""
    And Web: Select Dropdown -field: "checkoutPage.shippingMethodDropdown" -value: "Express Shipping" -options: ""
    Then Web: Verify text on page -text: "Billing Information" -options: "{partialMatch: true}"

  # Demonstrates: Complex workflow with all action types
  @regression @actions @complete-workflow
  Scenario: Complete workflow demonstrating all major actions
    # Navigation
    Then Web: Verify page title -text: "Home Page" -options: ""
    
    # Input actions
    When Web: Fill -field: "homePage.searchInput" -value: "test product" -options: ""
    
    # Click actions
    And Web: Click button -field: "homePage.getStartedButton" -options: ""
    
    # Tab navigation
    And Web: Click tab -field: "homePage.clothingTab" -options: ""
    
    # Verification actions
    Then Web: Verify text on page -text: "Clothing" -options: "{partialMatch: true}"
    And Web: Verify input field value -field: "homePage.searchInput" -value: "test product" -options: ""
    And Web: Verify Tab field Present -field: "homePage.clothingTab" -options: ""
    
    # Link navigation
    When Web: Click link -field: "homePage.checkoutLink" -options: ""
    Then Web: Wait for URL -url: "checkout.html" -options: "{partialMatch: true}"
