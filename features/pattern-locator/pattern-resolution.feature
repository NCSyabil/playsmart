Feature: Pattern Locator Resolution in Cucumber
  As a test automation engineer
  I want to use pattern locators in Cucumber feature files
  So that I can leverage the framework's pattern-based element identification

  # This feature tests the integration between Cucumber step definitions
  # and the Pattern Locator system to ensure elements are correctly
  # resolved and interacted with using pattern-based locators.

  Background:
    Given Web: Open browser -url: "file://#{env.PLAYQ_PROJECT_ROOT}/playwright-tests/web-examples/test-pages/login.html" -options: ""

  @integration @pattern-locator
  Scenario: Pattern locator resolves using field names
    # Test that pattern engine can resolve elements using simple field names
    # The pattern engine should use the loginPage pattern file automatically
    When Web: Fill -field: "Username" -value: "testuser" -options: "{pattern: 'loginPage'}"
    And Web: Fill -field: "Password" -value: "testpass" -options: "{pattern: 'loginPage'}"
    Then Web: Verify text on page -text: "testuser" -options: "{partialMatch: true}"

  @integration @pattern-locator
  Scenario: Pattern locator resolves button elements
    # Test that button pattern locators work correctly
    When Web: Click button -field: "Login" -options: "{pattern: 'loginPage'}"
    Then Web: Wait for URL -url: "home.html" -options: "{partialMatch: true, timeout: 2000}"

  @integration @pattern-locator
  Scenario: Pattern locator resolves checkbox elements
    # Test that checkbox pattern locators work correctly
    When Web: Click checkbox -field: "remember" -options: "{pattern: 'loginPage'}"
    Then Web: Verify text on page -text: "Remember Me" -options: "{partialMatch: true}"

  @integration @pattern-locator
  Scenario: Pattern locator resolves link elements
    # Test that link pattern locators work correctly
    When Web: Click link -field: "Forgot Password" -options: "{pattern: 'loginPage'}"
    # Link click should work without error

  @integration @pattern-locator
  Scenario: Pattern locator handles complete login flow
    # Test a complete user flow using pattern locators
    When Web: Fill -field: "Username" -value: "testuser" -options: "{pattern: 'loginPage'}"
    And Web: Fill -field: "Password" -value: "testpass" -options: "{pattern: 'loginPage'}"
    And Web: Click button -field: "Login" -options: "{pattern: 'loginPage'}"
    Then Web: Wait for URL -url: "home.html" -options: "{partialMatch: true}"

  @integration @pattern-locator
  Scenario: Pattern locator works with XPath selectors
    # Test that XPath selectors still work alongside pattern locators
    When Web: Fill -field: "xpath=//input[@id='username']" -value: "testuser" -options: ""
    And Web: Fill -field: "xpath=//input[@id='password']" -value: "testpass" -options: ""
    And Web: Click button -field: "xpath=//button[@type='submit']" -options: ""
    Then Web: Wait for URL -url: "home.html" -options: "{partialMatch: true}"

  @integration @pattern-locator
  Scenario: Pattern locator works with CSS selectors
    # Test that CSS selectors still work alongside pattern locators
    When Web: Fill -field: "css=#username" -value: "testuser" -options: ""
    And Web: Fill -field: "css=#password" -value: "testpass" -options: ""
    And Web: Click button -field: "css=button[type='submit']" -options: ""
    Then Web: Wait for URL -url: "home.html" -options: "{partialMatch: true}"
