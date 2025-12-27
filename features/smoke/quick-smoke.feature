Feature: Quick Smoke Tests
  As a QA engineer
  I want to run quick smoke tests
  So that I can verify basic functionality

  @smoke @quick
  Scenario: Verify home page loads
    Given Web: Open browser -url: "file://{{projectRoot}}/playwright-tests/web-examples/test-pages/home.html" -options: ""
    Then Web: Verify page title -text: "Home Page" -options: ""
    And Web: Verify text on page -text: "Welcome" -options: "{partialMatch: true}"

  @smoke @quick
  Scenario: Verify login page loads
    Given Web: Open browser -url: "file://{{projectRoot}}/playwright-tests/web-examples/test-pages/login.html" -options: ""
    Then Web: Verify page title -text: "Login Page" -options: ""
    And Web: Verify input field is present -field: "loginPage.usernameInput" -options: ""
    And Web: Verify input field is present -field: "loginPage.passwordInput" -options: ""

  @smoke @quick
  Scenario: Verify checkout page loads
    Given Web: Open browser -url: "file://{{projectRoot}}/playwright-tests/web-examples/test-pages/checkout.html" -options: ""
    Then Web: Verify page title -text: "Checkout Page" -options: ""
    And Web: Verify text on page -text: "Checkout" -options: "{partialMatch: true}"
