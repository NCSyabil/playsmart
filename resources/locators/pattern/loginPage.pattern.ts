/**
 * Login Page Pattern Configuration
 * 
 * This file contains locator patterns specific to the login page.
 * Patterns use runtime variable substitution for dynamic locator generation.
 * 
 * AVAILABLE RUNTIME VARIABLES:
 * 
 * #{loc.auto.fieldName}
 *   - The field name exactly as provided in the test
 *   - Example: If test uses "Username", this becomes "Username"
 * 
 * #{loc.auto.fieldName.toLowerCase}
 *   - Lowercase version of the field name
 *   - Example: If test uses "Username", this becomes "username"
 *   - Useful for matching HTML attributes that are typically lowercase
 * 
 * #{loc.auto.forId}
 *   - Extracted "for" attribute from associated label element
 *   - Used for label-based resolution (input, select, textarea)
 *   - Example: <label for="user-email">Email</label> → "user-email"
 * 
 * #{loc.auto.fieldInstance}
 *   - Element instance number (default: "1")
 *   - Example: "Submit[2]" → fieldInstance = "2"
 * 
 * #{loc.auto.location.name}
 *   - Location name from field string
 *   - Example: "{{Main Content}} Username" → "Main Content"
 * 
 * #{loc.auto.location.value}
 *   - Location value from field string (if specified)
 *   - Example: "{{top_menu:: Home}} Button" → "Home"
 * 
 * #{loc.auto.section.name}
 *   - Section name from field string
 *   - Example: "{Login Form} Username" → "Login Form"
 * 
 * #{loc.auto.section.value}
 *   - Section value from field string (if specified)
 *   - Example: "{form:: login} Username" → "login"
 * 
 * PATTERN SYNTAX:
 * - Use semicolons (;) to separate multiple fallback patterns
 * - Patterns are tried in order until a visible element is found
 * - Mix XPath and CSS selectors for better compatibility
 * - Order patterns from most specific to least specific
 * 
 * EXAMPLE USAGE IN TESTS:
 * - await fill(page, 'Username', 'john.doe');
 * - await fill(page, '{Login Form} Password', 'secret');
 * - await clickButton(page, 'Login');
 */

export const loginPage = {
  // Direct field mappings for login page elements
  usernameInput: "//input[@id='username'];//input[@name='username'];//input[@placeholder='Username'];input#username;input[name='username']",
  
  passwordInput: "//input[@id='password'];//input[@name='password'];//input[@placeholder='Password'];input#password;input[name='password']",
  
  loginButton: "//button[@type='submit'][contains(text(), 'Login')];//button[contains(text(), 'Login')];button[type='submit']:has-text('Login');button:has-text('Login')",
  
  signUpButton: "//button[contains(text(), 'Sign Up')];//button[@type='button'][contains(text(), 'Sign Up')];button:has-text('Sign Up')",
  
  rememberCheckbox: "//input[@type='checkbox'][@id='remember'];//input[@type='checkbox'][@name='remember'];input[type='checkbox']#remember;input[type='checkbox'][name='remember']",
  
  forgotPasswordLink: "//a[contains(text(), 'Forgot Password')];//a[@title='Forgot Password'];a:has-text('Forgot Password');a[title='Forgot Password']",
  
  errorMessage: "//div[@class='error'];//div[@role='alert'];div.error;div[role='alert']",
  
  fields: {
    // Button patterns for login page
    button: "//button[contains(text(), '#{loc.auto.fieldName}')];//button[@type='submit'][contains(text(), '#{loc.auto.fieldName}')];.btn:has-text('#{loc.auto.fieldName}');button:has-text('#{loc.auto.fieldName}')",
    
    // Input field patterns for login page
    input: "//input[@placeholder='#{loc.auto.fieldName}'];//input[@name='#{loc.auto.fieldName.toLowerCase}'];//input[@id='#{loc.auto.forId}'];input[placeholder='#{loc.auto.fieldName}'];input[name='#{loc.auto.fieldName.toLowerCase}']",
    
    // Link patterns for login page
    link: "//a[contains(text(), '#{loc.auto.fieldName}')];//a[@title='#{loc.auto.fieldName}'];a:has-text('#{loc.auto.fieldName}');a[title='#{loc.auto.fieldName}']",
    
    // Text patterns for login page
    text: "//*[contains(text(), '#{loc.auto.fieldName}')];//p[contains(text(), '#{loc.auto.fieldName}')];//span[contains(text(), '#{loc.auto.fieldName}')]",
    
    // Label patterns for login page (used for label-based resolution)
    label: "//label[text()='#{loc.auto.fieldName}'];//label[contains(text(), '#{loc.auto.fieldName}')];label:has-text('#{loc.auto.fieldName}')",
    
    // Checkbox patterns for login page
    checkbox: "//input[@type='checkbox'][@name='#{loc.auto.fieldName.toLowerCase}'];//input[@type='checkbox']/following-sibling::label[contains(text(), '#{loc.auto.fieldName}')];input[type='checkbox'][name='#{loc.auto.fieldName.toLowerCase}']"
  },
  
  // Sections specific to login page
  sections: {
    "Login Form": "//form[@id='login'];//form[@class='login-form'];form#login;form.login-form",
    "Error Message": "//div[@class='error'];//div[@role='alert'];div.error;div[role='alert']",
    "Remember Me": "//div[@class='remember-me'];div.remember-me",
    "Forgot Password": "//div[@class='forgot-password'];div.forgot-password"
  },
  
  // Locations specific to login page
  locations: {
    "Main Content": "//main;//div[@id='content'];main;div#content",
    "Header": "//header;//div[@class='header'];header;div.header",
    "Footer": "//footer;//div[@class='footer'];footer;div.footer"
  },
  
  // Scroll patterns for lazy-loaded content on login page
  scroll: "//div[@class='scrollable'];div.scrollable;//main;main"
};
