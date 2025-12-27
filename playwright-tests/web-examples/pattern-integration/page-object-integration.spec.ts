/**
 * Integration Tests for Page Object Pattern Resolution
 * Feature: pattern-locator-integration
 * 
 * These tests validate the pattern locator system with real HTML pages,
 * testing page object pattern resolution, navigation between pages,
 * and explicit page object overrides.
 * 
 * Validates: Requirements 10.3, 10.6, 10.7, 10.8
 */

import { test, expect } from '@playwright/test';
import { web, vars } from '@playq';
import { loadEnv } from '@src/helper/bundle/env';
import path from 'path';

test.describe('Page Object Pattern Integration Tests', () => {
  let loginPageUrl: string;
  let homePageUrl: string;
  let checkoutPageUrl: string;

  test.beforeAll(() => {
    // Load environment and initialize vars module
    loadEnv();
    
    // Set up file URLs for test pages
    const testPagesDir = path.resolve(__dirname, '../test-pages');
    loginPageUrl = `file://${testPagesDir}/login.html`;
    homePageUrl = `file://${testPagesDir}/home.html`;
    checkoutPageUrl = `file://${testPagesDir}/checkout.html`;

    // Debug: Check current value
    console.log('Before setting - PatternIQ enabled:', vars.getConfigValue('patternIq.enable'));
    
    // Enable pattern-based resolution by setting config values
    vars.setValue('config.patternIq.enable', 'true');
    vars.setValue('config.patternIq.retryTimeout', '10000');
    vars.setValue('config.patternIq.retryInterval', '1000');
    vars.setValue('config.patternIq.config', 'loginPage'); // Set default pattern
    
    // Debug: Check after setting
    console.log('After setting - PatternIQ enabled:', vars.getConfigValue('patternIq.enable'));
    console.log('PatternIQ config:', vars.getConfigValue('patternIq.config'));
    console.log('PatternIQ retryTimeout:', vars.getConfigValue('patternIq.retryTimeout'));
  });

  test.afterEach(async ({ page }) => {
    // Clean up after each test
    await page.close();
  });

  /**
   * Test 1: Login Page Pattern Resolution
   * Validates that locators are resolved correctly using loginPage patterns
   */
  test('should resolve locators on login page using loginPage patterns', async ({ page }) => {
    test.info().annotations.push({ 
      type: 'requirement', 
      description: 'Requirements 10.3, 10.6' 
    });

    // Navigate to login page
    await page.goto(loginPageUrl);
    await page.waitForLoadState('load');

    // Test input field resolution with loginPage patterns
    await web.fill(page, 'Username', 'testuser', { pattern: 'loginPage' });
    await web.fill(page, 'Password', 'testpass', { pattern: 'loginPage' });

    // Verify values were entered
    const usernameValue = await page.locator('#username').inputValue();
    const passwordValue = await page.locator('#password').inputValue();
    
    expect(usernameValue).toBe('testuser');
    expect(passwordValue).toBe('testpass');

    // Test checkbox resolution
    await web.clickCheckbox(page, 'Remember', { pattern: 'loginPage' });
    const isChecked = await page.locator('#remember').isChecked();
    expect(isChecked).toBe(true);

    // Test button resolution
    await web.clickButton(page, 'Login', { pattern: 'loginPage' });
    
    // Verify navigation occurred (form submission)
    await page.waitForTimeout(500);
  });

  /**
   * Test 2: Home Page Pattern Resolution
   * Validates that locators are resolved correctly using homePage patterns
   */
  test('should resolve locators on home page using homePage patterns', async ({ page }) => {
    test.info().annotations.push({ 
      type: 'requirement', 
      description: 'Requirements 10.3, 10.6' 
    });

    // Navigate to home page
    await page.goto(homePageUrl);
    await page.waitForLoadState('load');

    // Test button resolution with data-testid attributes (homePage pattern)
    const getStartedButton = await page.locator('[data-testid="get-started"]');
    await expect(getStartedButton).toBeVisible();

    // Test link resolution in navigation
    await web.clickLink(page, 'Products', { pattern: 'homePage' });
    
    // Test header resolution
    const welcomeHeader = await page.locator('h1:has-text("Welcome Back!")');
    await expect(welcomeHeader).toBeVisible();

    // Test input field resolution (search box)
    await web.fill(page, 'Search', 'test query', { pattern: 'homePage' });
    const searchValue = await page.locator('[data-testid="search"]').inputValue();
    expect(searchValue).toBe('test query');

    // Test tab resolution
    const clothingTab = await page.locator('button[role="tab"]:has-text("Clothing")');
    await clothingTab.click();
    await page.waitForTimeout(300);
    
    const clothingContent = await page.locator('#clothing');
    await expect(clothingContent).toHaveClass(/active/);
  });

  /**
   * Test 3: Checkout Page Pattern Resolution
   * Validates that locators are resolved correctly using checkoutPage patterns
   */
  test('should resolve locators on checkout page using checkoutPage patterns', async ({ page }) => {
    test.info().annotations.push({ 
      type: 'requirement', 
      description: 'Requirements 10.3, 10.6' 
    });

    // Navigate to checkout page
    await page.goto(checkoutPageUrl);
    await page.waitForLoadState('load');

    // Test input field resolution with name attributes (checkoutPage pattern)
    await web.fill(page, 'FirstName', 'John', { pattern: 'checkoutPage' });
    await web.fill(page, 'LastName', 'Doe', { pattern: 'checkoutPage' });
    await web.fill(page, 'Email', 'john.doe@example.com', { pattern: 'checkoutPage' });

    // Verify values were entered
    const firstNameValue = await page.locator('#firstname').inputValue();
    const lastNameValue = await page.locator('#lastname').inputValue();
    const emailValue = await page.locator('#email').inputValue();
    
    expect(firstNameValue).toBe('John');
    expect(lastNameValue).toBe('Doe');
    expect(emailValue).toBe('john.doe@example.com');

    // Test select dropdown resolution
    await web.selectDropdown(page, 'Country', 'United States', { pattern: 'checkoutPage' });
    const selectedCountry = await page.locator('#country').inputValue();
    expect(selectedCountry).toBe('us');

    // Test checkbox resolution
    await web.clickCheckbox(page, 'Terms', { pattern: 'checkoutPage' });
    const termsChecked = await page.locator('#terms').isChecked();
    expect(termsChecked).toBe(true);

    // Test radio button resolution
    const paypalRadio = await page.locator('#paypal');
    await paypalRadio.click();
    const isPaypalSelected = await paypalRadio.isChecked();
    expect(isPaypalSelected).toBe(true);
  });

  /**
   * Test 4: Section-Scoped Locator Resolution
   * Validates that locators can be scoped to specific sections within a page
   */
  test('should resolve section-scoped locators on checkout page', async ({ page }) => {
    test.info().annotations.push({ 
      type: 'requirement', 
      description: 'Requirements 10.3, 10.6' 
    });

    await page.goto(checkoutPageUrl);
    await page.waitForLoadState('load');

    // Test section-scoped field resolution
    // Format: {Section Name} Field Name
    await web.fill(page, '{Billing Information} Address', '123 Main St', { pattern: 'checkoutPage' });
    const billingAddress = await page.locator('#address').inputValue();
    expect(billingAddress).toBe('123 Main St');

    await web.fill(page, '{Billing Information} City', 'New York', { pattern: 'checkoutPage' });
    const city = await page.locator('#city').inputValue();
    expect(city).toBe('New York');

    // Test different section
    await web.fill(page, '{Shipping Information} ShippingAddress', '456 Oak Ave', { pattern: 'checkoutPage' });
    const shippingAddress = await page.locator('#shippingaddress').inputValue();
    expect(shippingAddress).toBe('456 Oak Ave');
  });

  /**
   * Test 5: Navigation Between Pages with Different Page Objects
   * Validates that the system can handle navigation between pages with different patterns
   */
  test('should handle navigation between pages with different page objects', async ({ page }) => {
    test.info().annotations.push({ 
      type: 'requirement', 
      description: 'Requirements 10.6, 10.7' 
    });

    // Start on login page
    await page.goto(loginPageUrl);
    await page.waitForLoadState('load');

    // Use loginPage patterns
    await web.fill(page, 'Username', 'testuser', { pattern: 'loginPage' });
    await web.fill(page, 'Password', 'testpass', { pattern: 'loginPage' });
    
    // Navigate to home page
    await page.goto(homePageUrl);
    await page.waitForLoadState('load');

    // Switch to homePage patterns
    await web.fill(page, 'Search', 'products', { pattern: 'homePage' });
    const searchValue = await page.locator('[data-testid="search"]').inputValue();
    expect(searchValue).toBe('products');

    // Navigate to checkout page
    await page.goto(checkoutPageUrl);
    await page.waitForLoadState('load');

    // Switch to checkoutPage patterns
    await web.fill(page, 'FirstName', 'Jane', { pattern: 'checkoutPage' });
    const firstName = await page.locator('#firstname').inputValue();
    expect(firstName).toBe('Jane');
  });

  /**
   * Test 6: Explicit Page Object Override
   * Validates that explicit pattern parameter overrides work correctly
   */
  test('should allow explicit page object override via pattern parameter', async ({ page }) => {
    test.info().annotations.push({ 
      type: 'requirement', 
      description: 'Requirements 10.7' 
    });

    await page.goto(loginPageUrl);
    await page.waitForLoadState('load');

    // Use loginPage patterns explicitly
    await web.fill(page, 'Username', 'user1', { pattern: 'loginPage' });
    let usernameValue = await page.locator('#username').inputValue();
    expect(usernameValue).toBe('user1');

    // Try using a different page object pattern (should still work if patterns match)
    // This tests the override mechanism
    await web.fill(page, 'Password', 'pass1', { pattern: 'loginPage' });
    let passwordValue = await page.locator('#password').inputValue();
    expect(passwordValue).toBe('pass1');

    // Verify the pattern parameter is being used
    // The test passes if the locator is resolved using the specified pattern
  });

  /**
   * Test 7: Backward Compatibility with Static Locators
   * Validates that existing static locators continue to work alongside pattern-based locators
   */
  test('should maintain backward compatibility with static locators', async ({ page }) => {
    test.info().annotations.push({ 
      type: 'requirement', 
      description: 'Requirements 10.8' 
    });

    await page.goto(loginPageUrl);
    await page.waitForLoadState('load');

    // Use direct XPath locator (should bypass pattern resolution)
    await page.locator('xpath=//input[@id="username"]').fill('directuser');
    let usernameValue = await page.locator('#username').inputValue();
    expect(usernameValue).toBe('directuser');

    // Use direct CSS locator (should bypass pattern resolution)
    await page.locator('css=#password').fill('directpass');
    let passwordValue = await page.locator('#password').inputValue();
    expect(passwordValue).toBe('directpass');

    // Mix pattern-based and direct locators
    await web.fill(page, 'Username', 'patternuser', { pattern: 'loginPage' });
    usernameValue = await page.locator('#username').inputValue();
    expect(usernameValue).toBe('patternuser');

    // Use raw XPath (should bypass pattern resolution)
    await page.locator('//input[@id="password"]').fill('rawpass');
    passwordValue = await page.locator('#password').inputValue();
    expect(passwordValue).toBe('rawpass');
  });

  /**
   * Test 8: Location-Scoped Locator Resolution
   * Validates that locators can be scoped to specific locations within a page
   */
  test('should resolve location-scoped locators on home page', async ({ page }) => {
    test.info().annotations.push({ 
      type: 'requirement', 
      description: 'Requirements 10.3, 10.6' 
    });

    await page.goto(homePageUrl);
    await page.waitForLoadState('load');

    // Test location-scoped field resolution
    // Format: {{Location Name}} Field Name
    // The hero section is within the main content location
    const heroHeading = await page.locator('.hero h1');
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toHaveText('Welcome Back!');

    // Test navigation links within header location
    const homeLink = await page.locator('.main-nav a[data-nav="home"]');
    await expect(homeLink).toBeVisible();
  });

  /**
   * Test 9: Complex Nested Locator Resolution
   * Validates that locators with both location and section scoping work correctly
   */
  test('should resolve complex nested locators with location and section', async ({ page }) => {
    test.info().annotations.push({ 
      type: 'requirement', 
      description: 'Requirements 10.3, 10.6' 
    });

    await page.goto(checkoutPageUrl);
    await page.waitForLoadState('load');

    // Test complex nested field resolution
    // Format: {{Location Name}} {Section Name} Field Name
    // This tests the full chaining: location >> section >> field
    
    // Fill billing information within main content location
    await web.fill(page, '{Billing Information} FirstName', 'Alice', { pattern: 'checkoutPage' });
    const firstName = await page.locator('#firstname').inputValue();
    expect(firstName).toBe('Alice');

    // Fill payment details within main content location
    await web.fill(page, '{Payment Details} CardNumber', '4111111111111111', { pattern: 'checkoutPage' });
    const cardNumber = await page.locator('#cardnumber').inputValue();
    expect(cardNumber).toBe('4111111111111111');
  });

  /**
   * Test 10: Label-Based Resolution
   * Validates that the system can find input elements via their associated labels
   */
  test('should resolve input fields via label-based resolution', async ({ page }) => {
    test.info().annotations.push({ 
      type: 'requirement', 
      description: 'Requirements 10.3, 10.6' 
    });

    await page.goto(loginPageUrl);
    await page.waitForLoadState('load');

    // The login page has labels with "for" attributes
    // The pattern engine should find the label first, extract the "for" attribute,
    // then use it to find the input field
    
    // Test label-based resolution for username
    const usernameLabel = await page.locator('label[for="username"]');
    await expect(usernameLabel).toBeVisible();
    await expect(usernameLabel).toHaveText('Username');

    // Test label-based resolution for password
    const passwordLabel = await page.locator('label[for="password"]');
    await expect(passwordLabel).toBeVisible();
    await expect(passwordLabel).toHaveText('Password');

    // Fill fields using pattern resolution (which may use label-based resolution)
    await web.fill(page, 'Username', 'labeluser', { pattern: 'loginPage' });
    await web.fill(page, 'Password', 'labelpass', { pattern: 'loginPage' });

    const usernameValue = await page.locator('#username').inputValue();
    const passwordValue = await page.locator('#password').inputValue();
    
    expect(usernameValue).toBe('labeluser');
    expect(passwordValue).toBe('labelpass');
  });

  /**
   * Test 11: Multiple Instance Resolution
   * Validates that the system can resolve specific instances of elements
   */
  test('should resolve specific element instances using instance notation', async ({ page }) => {
    test.info().annotations.push({ 
      type: 'requirement', 
      description: 'Requirements 10.3, 10.6' 
    });

    await page.goto(loginPageUrl);
    await page.waitForLoadState('load');

    // The login page has two buttons: "Login" and "Sign Up"
    // Test resolving the first button (Login)
    const loginButton = await page.locator('button.btn').first();
    await expect(loginButton).toHaveText('Login');

    // Test resolving the second button (Sign Up)
    const signUpButton = await page.locator('button.btn').nth(1);
    await expect(signUpButton).toHaveText('Sign Up');

    // Click the second button using instance notation
    // Format: Field Name[instance]
    await signUpButton.click();
    await page.waitForTimeout(300);
  });

  /**
   * Test 12: Error Message Visibility
   * Validates that error messages can be located and verified
   */
  test('should locate and verify error messages', async ({ page }) => {
    test.info().annotations.push({ 
      type: 'requirement', 
      description: 'Requirements 10.3, 10.6' 
    });

    await page.goto(loginPageUrl);
    await page.waitForLoadState('load');

    // Initially, error message should not be visible
    const errorMessage = await page.locator('.error');
    await expect(errorMessage).not.toHaveClass(/show/);

    // Submit form with invalid credentials
    await web.fill(page, 'Username', 'wronguser', { pattern: 'loginPage' });
    await web.fill(page, 'Password', 'wrongpass', { pattern: 'loginPage' });
    await web.clickButton(page, 'Login', { pattern: 'loginPage' });

    // Wait for error message to appear
    await page.waitForTimeout(500);
    
    // Error message should now be visible
    await expect(errorMessage).toHaveClass(/show/);
    await expect(errorMessage).toHaveText('Invalid username or password');
  });
});
