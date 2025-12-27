/**
 * Checkout Page Pattern Configuration
 * 
 * This file contains locator patterns specific to the checkout page.
 * Patterns use runtime variable substitution for dynamic locator generation.
 * 
 * AVAILABLE RUNTIME VARIABLES:
 * 
 * #{loc.auto.fieldName}
 *   - The field name exactly as provided in the test
 *   - Example: If test uses "Card Number", this becomes "Card Number"
 * 
 * #{loc.auto.fieldName.toLowerCase}
 *   - Lowercase version of the field name
 *   - Example: If test uses "Card Number", this becomes "card number"
 *   - Useful for matching name/id attributes that are typically lowercase
 * 
 * #{loc.auto.forId}
 *   - Extracted "for" attribute from associated label element
 *   - Used for label-based resolution (input, select, textarea)
 *   - Example: <label for="billing-name">Full Name</label> → "billing-name"
 * 
 * #{loc.auto.fieldInstance}
 *   - Element instance number (default: "1")
 *   - Example: "Address Line[2]" → fieldInstance = "2"
 * 
 * #{loc.auto.location.name}
 *   - Location name from field string
 *   - Example: "{{Main Content}} Card Number" → "Main Content"
 * 
 * #{loc.auto.location.value}
 *   - Location value from field string (if specified)
 *   - Example: "{{area:: checkout}} Button" → "checkout"
 * 
 * #{loc.auto.section.name}
 *   - Section name from field string
 *   - Example: "{Billing Information} Full Name" → "Billing Information"
 * 
 * #{loc.auto.section.value}
 *   - Section value from field string (if specified)
 *   - Example: "{section:: billing} Name" → "billing"
 * 
 * PATTERN SYNTAX:
 * - Use semicolons (;) to separate multiple fallback patterns
 * - Patterns are tried in order until a visible element is found
 * - Mix XPath and CSS selectors for better compatibility
 * - Order patterns from most specific to least specific
 * 
 * EXAMPLE USAGE IN TESTS:
 * - await fill(page, '{Billing Information} Full Name', 'John Doe');
 * - await fill(page, '{Payment Details} Card Number', '4111111111111111');
 * - await selectDropdown(page, '{Shipping Information} Country', 'United States');
 * - await clickButton(page, 'Place Order');
 */

export const checkoutPage = {
  // Direct field mappings for checkout page elements
  firstNameInput: "//input[@id='firstname'];//input[@name='firstname'];input#firstname;input[name='firstname']",
  
  lastNameInput: "//input[@id='lastname'];//input[@name='lastname'];input#lastname;input[name='lastname']",
  
  emailInput: "//input[@id='email'];//input[@name='email'];input#email;input[name='email']",
  
  addressInput: "//input[@id='address'];//input[@name='address'];input#address;input[name='address']",
  
  cityInput: "//input[@id='city'];//input[@name='city'];input#city;input[name='city']",
  
  countryDropdown: "//select[@id='country'];//select[@name='country'];select#country;select[name='country']",
  
  sameAsBillingCheckbox: "//input[@type='checkbox'][@id='sameasbilling'];//input[@type='checkbox'][@name='sameasbilling'];input[type='checkbox']#sameasbilling",
  
  shippingAddressInput: "//input[@id='shippingaddress'];//input[@name='shippingaddress'];input#shippingaddress;input[name='shippingaddress']",
  
  shippingMethodDropdown: "//select[@id='shippingmethod'];//select[@name='shippingmethod'];select#shippingmethod;select[name='shippingmethod']",
  
  creditCardRadio: "//input[@type='radio'][@id='credit-card'];//input[@type='radio'][@value='credit'];input[type='radio']#credit-card",
  
  paypalRadio: "//input[@type='radio'][@id='paypal'];//input[@type='radio'][@value='paypal'];input[type='radio']#paypal",
  
  bankTransferRadio: "//input[@type='radio'][@id='bank-transfer'];//input[@type='radio'][@value='bank'];input[type='radio']#bank-transfer",
  
  cardNumberInput: "//input[@id='cardnumber'];//input[@name='cardnumber'];input#cardnumber;input[name='cardnumber']",
  
  cvvInput: "//input[@id='cvv'];//input[@name='cvv'];input#cvv;input[name='cvv']",
  
  termsCheckbox: "//input[@type='checkbox'][@id='terms'];//input[@type='checkbox'][@name='terms'];input[type='checkbox']#terms",
  
  completeOrderButton: "//button[@data-action='complete-order'];//button[@type='submit'][contains(text(), 'Complete Order')];button.checkout-btn[data-action='complete-order']",
  
  promoCodeInput: "//input[@id='promocode'];//input[@name='promocode'];input#promocode;input[name='promocode']",
  
  applyPromoButton: "//div[@id='promo']//button;//div[@class='promo-code']//button;div#promo button.checkout-btn",
  
  fields: {
    // Input patterns for checkout forms
    input: "//input[@name='#{loc.auto.fieldName.toLowerCase}'];//input[@id='#{loc.auto.fieldName.toLowerCase}'];//input[@id='#{loc.auto.forId}'];//input[@placeholder='#{loc.auto.fieldName}'];input[name='#{loc.auto.fieldName.toLowerCase}'];input[id='#{loc.auto.fieldName.toLowerCase}']",
    
    // Select dropdown patterns for checkout page
    select: "//select[@id='#{loc.auto.fieldName.toLowerCase}'];//select[@name='#{loc.auto.fieldName.toLowerCase}'];select##{loc.auto.fieldName.toLowerCase};select[name='#{loc.auto.fieldName.toLowerCase}']",
    
    // Button patterns for checkout page
    button: "//button[@type='submit'][contains(text(), '#{loc.auto.fieldName}')];//button[contains(@class, 'checkout-btn')][contains(text(), '#{loc.auto.fieldName}')];//button[@data-action='#{loc.auto.fieldName.toLowerCase}'];button[type='submit']:has-text('#{loc.auto.fieldName}');button.checkout-btn:has-text('#{loc.auto.fieldName}')",
    
    // Checkbox patterns for checkout page (e.g., terms and conditions)
    checkbox: "//input[@type='checkbox'][@name='#{loc.auto.fieldName.toLowerCase}'];//input[@type='checkbox'][@id='#{loc.auto.fieldName.toLowerCase}'];input[type='checkbox'][name='#{loc.auto.fieldName.toLowerCase}'];input[type='checkbox'][id='#{loc.auto.fieldName.toLowerCase}']",
    
    // Radio button patterns for checkout page (e.g., payment methods)
    radio: "//input[@type='radio'][@value='#{loc.auto.fieldName.toLowerCase}'];//input[@type='radio'][@name='payment-method'][@value='#{loc.auto.fieldName.toLowerCase}'];//label[contains(text(), '#{loc.auto.fieldName}')]/input[@type='radio'];input[type='radio'][value='#{loc.auto.fieldName.toLowerCase}']",
    
    // Label patterns for checkout page (used for label-based resolution)
    label: "//label[contains(text(), '#{loc.auto.fieldName}')];//label[@for='#{loc.auto.fieldName.toLowerCase}'];//label[normalize-space(text())='#{loc.auto.fieldName}'];label:has-text('#{loc.auto.fieldName}')",
    
    // Text patterns for checkout page (e.g., order summary, prices)
    text: "//span[contains(text(), '#{loc.auto.fieldName}')];//div[contains(@class, 'price')][contains(text(), '#{loc.auto.fieldName}')];//p[contains(text(), '#{loc.auto.fieldName}')];span:has-text('#{loc.auto.fieldName}')",
    
    // Link patterns for checkout page
    link: "//a[contains(text(), '#{loc.auto.fieldName}')];//a[@class='checkout-link'][contains(text(), '#{loc.auto.fieldName}')];a:has-text('#{loc.auto.fieldName}')"
  },
  
  // Sections specific to checkout page
  sections: {
    "Billing Information": "//div[@id='billing'];//section[@class='billing-section'];//fieldset[legend[contains(text(), 'Billing')]];div#billing;section.billing-section",
    "Shipping Information": "//div[@id='shipping'];//section[@class='shipping-section'];//fieldset[legend[contains(text(), 'Shipping')]];div#shipping;section.shipping-section",
    "Payment Details": "//div[@id='payment'];//section[@class='payment-section'];//fieldset[legend[contains(text(), 'Payment')]];div#payment;section.payment-section",
    "Order Summary": "//div[@id='summary'];//aside[@class='order-summary'];//section[@class='summary-section'];div#summary;aside.order-summary",
    "Promo Code": "//div[@class='promo-code'];//div[@id='promo'];div.promo-code;div#promo"
  },
  
  // Locations specific to checkout page
  locations: {
    "Main Content": "//main[@class='checkout-main'];//div[@id='checkout-content'];main.checkout-main;div#checkout-content",
    "Sidebar": "//aside[@class='checkout-sidebar'];//div[@id='checkout-sidebar'];aside.checkout-sidebar;div#checkout-sidebar",
    "Header": "//header[@class='checkout-header'];//div[@id='checkout-header'];header.checkout-header;div#checkout-header"
  },
  
  // Scroll patterns for lazy-loaded content on checkout page
  scroll: "//div[@class='checkout-container'];div.checkout-container;//main[@class='checkout-main'];main.checkout-main"
};
