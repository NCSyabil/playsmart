Feature: Simple Pattern Locator Integration Test
  Test that Cucumber can execute tests against the login page

  Background:
    Given Web: Open browser -url: "file://#{env.PLAYQ_PROJECT_ROOT}/playwright-tests/web-examples/test-pages/login.html" -options: ""

  @integration @simple
  Scenario: XPath selectors work in Cucumber
    When Web: Fill -field: "xpath=//input[@id='username']" -value: "testuser" -options: ""
    And Web: Fill -field: "xpath=//input[@id='password']" -value: "testpass" -options: ""
    And Web: Click button -field: "xpath=//button[@type='submit']" -options: ""
    Then Web: Wait for URL -url: "home.html" -options: "{partialMatch: true}"

  @integration @simple
  Scenario: CSS selectors work in Cucumber
    When Web: Fill -field: "css=#username" -value: "testuser" -options: ""
    And Web: Fill -field: "css=#password" -value: "testpass" -options: ""
    And Web: Click button -field: "css=button[type='submit']" -options: ""
    Then Web: Wait for URL -url: "home.html" -options: "{partialMatch: true}"
