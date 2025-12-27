Feature: User Login
  As a user
  I want to log into the application
  So that I can access my account

  # Background section runs before each scenario
  # Demonstrates: Background keyword, pattern locator usage, variable usage
  Background:
    Given Web: Open browser -url: "file://#{env.PLAYQ_PROJECT_ROOT}/playwright-tests/web-examples/test-pages/login.html" -options: ""

  # Basic Scenario demonstrating:
  # - Scenario keyword
  # - Given/When/Then/And keywords
  # - Pattern locator usage (loginPage.usernameInput, loginPage.passwordInput, loginPage.loginButton)
  # - Tags for filtering (@smoke, @login)
  @smoke @login
  Scenario: Successful login with valid credentials
    When Web: Fill -field: "loginPage.usernameInput" -value: "testuser" -options: ""
    And Web: Fill -field: "loginPage.passwordInput" -value: "testpass" -options: ""
    And Web: Click button -field: "loginPage.loginButton" -options: ""
    Then Web: Wait for URL -url: "home.html" -options: "{partialMatch: true}"

  # Demonstrates error handling and validation
  @regression @login
  Scenario: Login with empty username shows error
    When Web: Fill -field: "loginPage.usernameInput" -value: "" -options: ""
    And Web: Fill -field: "loginPage.passwordInput" -value: "password123" -options: ""
    And Web: Click button -field: "loginPage.loginButton" -options: ""
    Then Web: Verify text on page -text: "Invalid username or password" -options: "{partialMatch: true}"

  # Demonstrates invalid credentials
  @regression @login
  Scenario: Login with invalid credentials shows error
    When Web: Fill -field: "loginPage.usernameInput" -value: "wronguser" -options: ""
    And Web: Fill -field: "loginPage.passwordInput" -value: "wrongpass" -options: ""
    And Web: Click button -field: "loginPage.loginButton" -options: ""
    Then Web: Verify text on page -text: "Invalid username or password" -options: "{partialMatch: true}"

  # Scenario Outline demonstrates:
  # - Scenario Outline keyword
  # - Examples table with multiple data rows
  # - Parameterized steps using <parameter> syntax
  # - Data-driven testing
  @regression @login @data-driven
  Scenario Outline: Login with different credentials
    When Web: Fill -field: "loginPage.usernameInput" -value: "<username>" -options: ""
    And Web: Fill -field: "loginPage.passwordInput" -value: "<password>" -options: ""
    And Web: Click button -field: "loginPage.loginButton" -options: ""
    Then Web: Verify text on page -text: "<expectedResult>" -options: "{partialMatch: true}"

    Examples:
      | username  | password    | expectedResult                |
      | testuser  | testpass    | home.html                     |
      | admin     | wrongpass   | Invalid username or password  |
      | guest     | guestpass   | Invalid username or password  |
      |           | password123 | Invalid username or password  |
      | testuser  |             | Invalid username or password  |

  # Demonstrates checkbox interaction and pattern locators
  @smoke @login
  Scenario: Remember me checkbox can be selected
    When Web: Click checkbox -field: "loginPage.rememberCheckbox" -options: ""
    And Web: Fill -field: "loginPage.usernameInput" -value: "testuser" -options: ""
    And Web: Fill -field: "loginPage.passwordInput" -value: "testpass" -options: ""
    And Web: Click button -field: "loginPage.loginButton" -options: ""
    Then Web: Wait for URL -url: "home.html" -options: "{partialMatch: true}"

  # Demonstrates link interaction
  @regression @login
  Scenario: Forgot password link is present
    Then Web: Click link -field: "loginPage.forgotPasswordLink" -options: ""

  # Demonstrates multiple button interactions
  @regression @login
  Scenario: Sign up button is present and clickable
    When Web: Click button -field: "loginPage.signUpButton" -options: ""
    # Note: This would navigate to sign up page in a real application

  # Demonstrates verification of page elements
  @smoke @login
  Scenario: Login page displays all required elements
    Then Web: Verify input field is present -field: "loginPage.usernameInput" -options: ""
    And Web: Verify input field is present -field: "loginPage.passwordInput" -options: ""
    And Web: Verify text on page -text: "Login" -options: "{partialMatch: true}"
    And Web: Verify text on page -text: "Username" -options: "{partialMatch: true}"
    And Web: Verify text on page -text: "Password" -options: "{partialMatch: true}"
