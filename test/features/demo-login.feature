@demo
Feature: Login Demo - Cucumber Style
  As a user
  I want to log in to the application
  So that I can access my account

  Background:
    Given I navigate to "https://practicetestautomation.com/practice-test-login/"

  Scenario: Successful login with valid credentials
    When I fill in "username" with "student"
    And I fill in "password" with "Password123"
    And I click the "submit" button
    Then I should see the page title contains "Logged In Successfully"
    And I should see "Logged In Successfully" on the page

  Scenario: Verify login page has required elements
    Then I should see the "username" field
    And I should see the "password" field
    And I should see the "submit" button
