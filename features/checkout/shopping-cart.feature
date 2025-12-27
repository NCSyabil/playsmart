Feature: Shopping Cart Checkout
  As a customer
  I want to complete the checkout process
  So that I can purchase products

  Background:
    Given Web: Open browser -url: "file://#{env.PLAYQ_PROJECT_ROOT}/playwright-tests/web-examples/test-pages/checkout.html" -options: ""

  # Demonstrates data tables for filling multiple form fields
  # Data tables allow passing structured data to step definitions
  @smoke @checkout @data-table
  Scenario: Complete checkout with billing information using data table
    When I fill the billing information with the following details:
      | field     | value              |
      | firstname | John               |
      | lastname  | Doe                |
      | email     | john.doe@email.com |
      | address   | 123 Main Street    |
      | city      | New York           |
    And Web: Select Dropdown -field: "checkoutPage.countryDropdown" -value: "United States" -options: ""
    And Web: Click checkbox -field: "checkoutPage.sameAsBillingCheckbox" -options: ""
    And Web: Select Dropdown -field: "checkoutPage.shippingMethodDropdown" -value: "Express Shipping" -options: ""
    And Web: Click button -field: "checkoutPage.completeOrderButton" -options: ""
    Then Web: Verify text on page -text: "Order completed successfully" -options: "{partialMatch: true}"

  # Demonstrates data tables for multiple product selections
  @regression @checkout @data-table
  Scenario: Add multiple products to cart using data table
    When I add the following products to cart:
      | product  | quantity | price  |
      | Laptop   | 1        | $999   |
      | Mouse    | 2        | $25    |
      | Keyboard | 1        | $75    |
    Then Web: Verify text on page -text: "Subtotal" -options: "{partialMatch: true}"
    And Web: Verify text on page -text: "$99.99" -options: "{partialMatch: true}"

  # Demonstrates dropdown selection for shipping methods
  @smoke @checkout
  Scenario: Select different shipping methods
    When Web: Select Dropdown -field: "checkoutPage.shippingMethodDropdown" -value: "Standard Shipping" -options: ""
    Then Web: Verify text on page -text: "Shipping" -options: "{partialMatch: true}"
    When Web: Select Dropdown -field: "checkoutPage.shippingMethodDropdown" -value: "Express Shipping" -options: ""
    Then Web: Verify text on page -text: "Shipping" -options: "{partialMatch: true}"
    When Web: Select Dropdown -field: "checkoutPage.shippingMethodDropdown" -value: "Overnight Shipping" -options: ""
    Then Web: Verify text on page -text: "Shipping" -options: "{partialMatch: true}"

  # Demonstrates dropdown selection for country
  @regression @checkout
  Scenario Outline: Select different countries from dropdown
    When Web: Fill -field: "checkoutPage.firstNameInput" -value: "John" -options: ""
    And Web: Fill -field: "checkoutPage.lastNameInput" -value: "Doe" -options: ""
    And Web: Select Dropdown -field: "checkoutPage.countryDropdown" -value: "<country>" -options: ""
    Then Web: Verify text on page -text: "Billing Information" -options: "{partialMatch: true}"

    Examples:
      | country        |
      | United States  |
      | United Kingdom |
      | Canada         |

  # Demonstrates form filling with verification
  @smoke @checkout
  Scenario: Fill billing information and verify
    When Web: Fill -field: "checkoutPage.firstNameInput" -value: "Jane" -options: ""
    And Web: Fill -field: "checkoutPage.lastNameInput" -value: "Smith" -options: ""
    And Web: Fill -field: "checkoutPage.emailInput" -value: "jane.smith@email.com" -options: ""
    And Web: Fill -field: "checkoutPage.addressInput" -value: "456 Oak Avenue" -options: ""
    And Web: Fill -field: "checkoutPage.cityInput" -value: "Los Angeles" -options: ""
    Then Web: Verify input field value -field: "checkoutPage.firstNameInput" -value: "Jane" -options: ""
    And Web: Verify input field value -field: "checkoutPage.emailInput" -value: "jane.smith@email.com" -options: ""

  # Demonstrates checkbox interaction
  @regression @checkout
  Scenario: Use same address for billing and shipping
    When Web: Fill -field: "checkoutPage.addressInput" -value: "789 Pine Road" -options: ""
    And Web: Click checkbox -field: "checkoutPage.sameAsBillingCheckbox" -options: ""
    Then Web: Verify text on page -text: "Shipping Information" -options: "{partialMatch: true}"

  # Demonstrates radio button selection for payment methods
  @smoke @checkout
  Scenario: Select payment method using radio buttons
    When Web: Click radio button -field: "checkoutPage.creditCardRadio" -options: ""
    Then Web: Verify text on page -text: "Card Number" -options: "{partialMatch: true}"
    When Web: Fill -field: "checkoutPage.cardNumberInput" -value: "4111111111111111" -options: ""
    And Web: Fill -field: "checkoutPage.cvvInput" -value: "123" -options: ""
    Then Web: Verify input field value -field: "checkoutPage.cardNumberInput" -value: "4111111111111111" -options: ""

  # Demonstrates complete checkout flow with all form elements
  @regression @checkout @complete-flow
  Scenario: Complete full checkout process with all details
    # Billing Information
    When Web: Fill -field: "checkoutPage.firstNameInput" -value: "Michael" -options: ""
    And Web: Fill -field: "checkoutPage.lastNameInput" -value: "Johnson" -options: ""
    And Web: Fill -field: "checkoutPage.emailInput" -value: "michael.j@email.com" -options: ""
    And Web: Fill -field: "checkoutPage.addressInput" -value: "321 Elm Street" -options: ""
    And Web: Fill -field: "checkoutPage.cityInput" -value: "Chicago" -options: ""
    And Web: Select Dropdown -field: "checkoutPage.countryDropdown" -value: "United States" -options: ""
    
    # Shipping Information
    And Web: Click checkbox -field: "checkoutPage.sameAsBillingCheckbox" -options: ""
    And Web: Select Dropdown -field: "checkoutPage.shippingMethodDropdown" -value: "Express Shipping" -options: ""
    
    # Payment Details
    And Web: Click radio button -field: "checkoutPage.creditCardRadio" -options: ""
    And Web: Fill -field: "checkoutPage.cardNumberInput" -value: "4111111111111111" -options: ""
    And Web: Fill -field: "checkoutPage.cvvInput" -value: "456" -options: ""
    
    # Terms and Conditions
    And Web: Click checkbox -field: "checkoutPage.termsCheckbox" -options: ""
    
    # Complete Order
    And Web: Click button -field: "checkoutPage.completeOrderButton" -options: ""
    Then Web: Verify text on page -text: "Order completed successfully" -options: "{partialMatch: true}"

  # Demonstrates promo code application
  @regression @checkout
  Scenario: Apply promo code
    When Web: Fill -field: "checkoutPage.promoCodeInput" -value: "SAVE10" -options: ""
    And Web: Click button -field: "checkoutPage.applyPromoButton" -options: ""
    Then Web: Verify text on page -text: "Promo Code" -options: "{partialMatch: true}"

  # Demonstrates order summary verification
  @smoke @checkout
  Scenario: Verify order summary displays correctly
    Then Web: Verify text on page -text: "Order Summary" -options: "{partialMatch: true}"
    And Web: Verify text on page -text: "Subtotal" -options: "{partialMatch: true}"
    And Web: Verify text on page -text: "Shipping" -options: "{partialMatch: true}"
    And Web: Verify text on page -text: "Tax" -options: "{partialMatch: true}"
    And Web: Verify text on page -text: "Total" -options: "{partialMatch: true}"
    And Web: Verify text on page -text: "$118.49" -options: "{partialMatch: true}"
