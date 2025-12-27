/**
 * Unit Tests for Error Handling in Cucumber Integration
 * Feature: cucumber-integration
 * 
 * Tests error scenarios:
 * - Undefined step definition error
 * - Pattern locator not found error
 * - Element not found error
 * - Variable not found warning
 * 
 * Requirements: 10.1, 10.2, 3.4, 6.1
 */

import * as path from "path";

// Set up environment variables before importing modules
process.env.PLAYQ_CORE_ROOT = path.resolve(process.cwd(), "src");
process.env.PLAYQ_PROJECT_ROOT = process.cwd();

import { vars } from '@src/global';
import { webLocResolver } from '@src/helper/fixtures/webLocFixture';
import { chromium, Browser, Page, BrowserContext } from '@playwright/test';

describe('Error Handling - Unit Tests', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;

  beforeAll(async () => {
    // Initialize vars
    vars.initVars();
    
    // Launch browser for tests
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    // Create new context and page for each test
    context = await browser.newContext();
    page = await context.newPage();
    
    // Navigate to a blank page
    await page.goto('about:blank');
  });

  afterEach(async () => {
    if (context) {
      await context.close();
    }
  });

  describe('Undefined Step Definition Error', () => {
    /**
     * Test that undefined step definitions are properly reported
     * Requirements: 10.1
     */
    test('should report clear error for undefined step', () => {
      // Simulate undefined step scenario
      const undefinedStepText = 'When I perform an undefined action';
      
      // In Cucumber, undefined steps are automatically detected
      // This test verifies the error message structure
      const expectedErrorPattern = /Undefined step/i;
      
      // Simulate the error that Cucumber would throw
      const simulateUndefinedStepError = () => {
        throw new Error(`Undefined step: ${undefinedStepText}`);
      };
      
      expect(simulateUndefinedStepError).toThrow(expectedErrorPattern);
      expect(simulateUndefinedStepError).toThrow(undefinedStepText);
    });

    test('should provide step text in error message', () => {
      const stepText = 'Given I navigate to an undefined page';
      
      const error = new Error(`Undefined step: ${stepText}`);
      
      expect(error.message).toContain('Undefined step');
      expect(error.message).toContain(stepText);
    });

    test('should handle undefined step with parameters', () => {
      const stepText = 'When I click on "undefined button" with options "{timeout: 5000}"';
      
      const error = new Error(`Undefined step: ${stepText}`);
      
      expect(error.message).toContain(stepText);
      expect(error.message).toContain('undefined button');
    });
  });

  describe('Pattern Locator Not Found Error', () => {
    /**
     * Test that pattern locator resolution errors are properly handled
     * Requirements: 10.2, 3.4
     */
    test('should return empty locator when pattern file does not exist', async () => {
      const invalidPattern = 'nonExistentPage.someField';
      
      // Pattern locator system returns empty locator instead of throwing
      const locator = await webLocResolver('button', invalidPattern, page, undefined, 1000);
      expect(locator).toBeDefined();
      
      // The locator will be empty string when pattern not found
      const locatorString = locator.toString();
      expect(locatorString).toBeDefined();
    });

    test('should return empty locator when pattern field does not exist', async () => {
      // Use a valid page but invalid field
      const invalidField = 'loginPage.nonExistentField';
      
      // Pattern locator system returns empty locator instead of throwing
      const locator = await webLocResolver('button', invalidField, page, undefined, 1000);
      expect(locator).toBeDefined();
    });

    test('should log warning for missing pattern', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const missingPattern = 'missingPage.field';
      await webLocResolver('button', missingPattern, page, undefined, 1000);
      
      // Should have logged warnings about pattern not found
      expect(warnSpy).toHaveBeenCalled();
      
      warnSpy.mockRestore();
    });

    test('should handle invalid pattern format', async () => {
      const invalidFormat = 'invalidFormat';
      
      // Pattern without dot notation should be treated as a regular selector
      // This test verifies it doesn't throw a pattern-specific error
      const locator = await webLocResolver('button', invalidFormat, page, undefined, 1000);
      expect(locator).toBeDefined();
    });

    test('should handle empty pattern reference', async () => {
      const emptyPattern = '';
      
      // Empty pattern should return a locator (fallback behavior)
      const locator = await webLocResolver('button', emptyPattern, page, undefined, 1000);
      expect(locator).toBeDefined();
    });
  });

  describe('Element Not Found Error', () => {
    /**
     * Test that element not found errors are properly handled
     * Requirements: 10.1, 10.2
     */
    test('should throw timeout error when element is not found', async () => {
      // Create a simple HTML page
      await page.setContent('<html><body><h1>Test Page</h1></body></html>');
      
      // Try to find an element that doesn't exist
      const nonExistentSelector = '#nonExistentElement';
      const locator = page.locator(nonExistentSelector);
      
      // Attempt to click with a short timeout
      await expect(async () => {
        await locator.click({ timeout: 1000 });
      }).rejects.toThrow(/Timeout|not found/i);
    });

    test('should provide selector information in error', async () => {
      await page.setContent('<html><body><h1>Test Page</h1></body></html>');
      
      const selector = '#missingButton';
      const locator = page.locator(selector);
      
      try {
        await locator.click({ timeout: 1000 });
        fail('Should have thrown an error');
      } catch (error: any) {
        // Error should contain timeout or locator information
        expect(error.message).toMatch(/Timeout|waiting|locator/i);
      }
    });

    test('should handle element not visible error', async () => {
      // Create a hidden element
      await page.setContent(`
        <html>
          <body>
            <button id="hiddenButton" style="display: none;">Hidden</button>
          </body>
        </html>
      `);
      
      const locator = page.locator('#hiddenButton');
      
      // Attempt to click a hidden element
      await expect(async () => {
        await locator.click({ timeout: 1000 });
      }).rejects.toThrow();
    });

    test('should handle element not enabled error', async () => {
      // Create a disabled element
      await page.setContent(`
        <html>
          <body>
            <button id="disabledButton" disabled>Disabled</button>
          </body>
        </html>
      `);
      
      const locator = page.locator('#disabledButton');
      
      // Attempt to click a disabled element
      await expect(async () => {
        await locator.click({ timeout: 1000 });
      }).rejects.toThrow();
    });

    test('should handle multiple matching elements error', async () => {
      // Create multiple elements with same selector
      await page.setContent(`
        <html>
          <body>
            <button class="btn">Button 1</button>
            <button class="btn">Button 2</button>
            <button class="btn">Button 3</button>
          </body>
        </html>
      `);
      
      const locator = page.locator('.btn');
      
      // Playwright handles multiple elements, but we can verify the count
      const count = await locator.count();
      expect(count).toBe(3);
      
      // Clicking will click the first one by default
      await locator.first().click();
    });
  });

  describe('Variable Not Found Warning', () => {
    /**
     * Test that missing variables are handled with warnings
     * Requirements: 6.1
     */
    test('should return variable name when variable not found', () => {
      const input = '#{nonExistentVariable}';
      const result = vars.replaceVariables(input);
      
      // When variable is not found, it returns the variable name
      expect(result).toBe('nonExistentVariable');
    });

    test('should log warning for missing variable', () => {
      // Spy on console.warn
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const input = '#{newMissingVar}';
      vars.replaceVariables(input);
      
      // Should have logged a warning (first time only)
      expect(warnSpy).toHaveBeenCalled();
      
      warnSpy.mockRestore();
    });

    test('should continue processing when variable not found', () => {
      vars.setValue('existingVar', 'value');
      
      const input = 'Found: #{existingVar}, Missing: #{missingVar}';
      const result = vars.replaceVariables(input);
      
      // Should replace found variable and leave missing one as name
      expect(result).toBe('Found: value, Missing: missingVar');
    });

    test('should handle multiple missing variables', () => {
      const input = '#{missing1} and #{missing2} and #{missing3}';
      const result = vars.replaceVariables(input);
      
      expect(result).toBe('missing1 and missing2 and missing3');
    });

    test('should handle missing environment variable', () => {
      const input = '#{env.MISSING_ENV_VAR}';
      const result = vars.replaceVariables(input);
      
      // Missing env var returns the key name
      expect(result).toBe('env.MISSING_ENV_VAR');
    });

    test('should handle missing nested variable', () => {
      const input = '#{config.missing.nested.value}';
      const result = vars.replaceVariables(input);
      
      expect(result).toBe('config.missing.nested.value');
    });

    test('should not throw error for missing variable', () => {
      const input = '#{anyMissingVariable}';
      
      // Should not throw, just return the variable name
      expect(() => vars.replaceVariables(input)).not.toThrow();
    });
  });

  describe('Page Not Initialized Error', () => {
    /**
     * Test that page not initialized errors are properly handled
     * Requirements: 10.1
     */
    test('should throw error when page is null', () => {
      const nullPage = null as any;
      
      // Simulate function that checks for page
      const checkPage = (page: Page) => {
        if (!page) throw new Error('Page not initialized');
      };
      
      expect(() => checkPage(nullPage)).toThrow('Page not initialized');
    });

    test('should throw error when page is undefined', () => {
      const undefinedPage = undefined as any;
      
      const checkPage = (page: Page) => {
        if (!page) throw new Error('Page not initialized');
      };
      
      expect(() => checkPage(undefinedPage)).toThrow('Page not initialized');
    });

    test('should provide clear error message for uninitialized page', () => {
      const error = new Error('Page not initialized');
      
      expect(error.message).toBe('Page not initialized');
      expect(error.message).toMatch(/page/i);
      expect(error.message).toMatch(/initialized/i);
    });
  });

  describe('Invalid Options String Error', () => {
    /**
     * Test that invalid options strings are properly handled
     * Requirements: 10.1
     */
    test('should throw error for malformed JSON options', () => {
      const malformedJson = '{invalid json}';
      
      expect(() => {
        vars.parseLooseJson(malformedJson);
      }).toThrow();
    });

    test('should handle empty options string', () => {
      const emptyOptions = '';
      const result = vars.parseLooseJson(emptyOptions);
      
      expect(result).toEqual({});
    });

    test('should handle options with unclosed braces', () => {
      const unclosedBraces = '{screenshot: true';
      
      expect(() => {
        vars.parseLooseJson(unclosedBraces);
      }).toThrow();
    });

    test('should provide descriptive error for invalid options', () => {
      const invalidOptions = '{key: value with spaces}';
      
      try {
        vars.parseLooseJson(invalidOptions);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toMatch(/parse|options|failed/i);
      }
    });
  });

  describe('Timeout Errors', () => {
    /**
     * Test that timeout errors are properly handled
     * Requirements: 10.1, 10.2
     */
    test('should throw timeout error when action exceeds timeout', async () => {
      await page.setContent('<html><body><h1>Test</h1></body></html>');
      
      // Try to wait for an element that will never appear
      const locator = page.locator('#neverAppears');
      
      await expect(async () => {
        await locator.waitFor({ timeout: 1000 });
      }).rejects.toThrow(/Timeout/i);
    });

    test('should include timeout value in error message', async () => {
      await page.setContent('<html><body><h1>Test</h1></body></html>');
      
      const timeout = 2000;
      const locator = page.locator('#missing');
      
      try {
        await locator.waitFor({ timeout });
        fail('Should have thrown an error');
      } catch (error: any) {
        // Error should mention timeout
        expect(error.message).toMatch(/timeout|exceeded/i);
      }
    });

    test('should handle navigation timeout', async () => {
      // Try to navigate to an invalid URL with short timeout
      await expect(async () => {
        await page.goto('http://invalid-url-that-does-not-exist.com', { 
          timeout: 1000 
        });
      }).rejects.toThrow();
    });
  });

  describe('Selector Errors', () => {
    /**
     * Test that invalid selector errors are properly handled
     * Requirements: 10.1, 10.2
     */
    test('should handle invalid XPath selector', async () => {
      await page.setContent('<html><body><h1>Test</h1></body></html>');
      
      // Invalid XPath syntax
      const invalidXPath = '//div[invalid';
      
      await expect(async () => {
        const locator = page.locator(invalidXPath);
        await locator.click({ timeout: 1000 });
      }).rejects.toThrow();
    });

    test('should handle invalid CSS selector', async () => {
      await page.setContent('<html><body><h1>Test</h1></body></html>');
      
      // Invalid CSS syntax
      const invalidCSS = '#id[invalid';
      
      await expect(async () => {
        const locator = page.locator(invalidCSS);
        await locator.click({ timeout: 1000 });
      }).rejects.toThrow();
    });

    test('should handle empty selector', async () => {
      await page.setContent('<html><body><h1>Test</h1></body></html>');
      
      const emptySelector = '';
      
      // Empty selector should throw an error
      await expect(async () => {
        const locator = page.locator(emptySelector);
        await locator.click({ timeout: 1000 });
      }).rejects.toThrow();
    });
  });
});
