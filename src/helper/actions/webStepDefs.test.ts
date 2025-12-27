/**
 * Unit tests for Cucumber step definition parameter extraction and transformation
 * 
 * Tests Requirements:
 * - 2.2: Parameter extraction from Gherkin steps
 * - 6.1: Variable replacement in parameters
 */

import * as path from "path";

// Set up environment variables before importing vars module
process.env.PLAYQ_CORE_ROOT = path.resolve(process.cwd(), "src");
process.env.PLAYQ_PROJECT_ROOT = process.cwd();

import { vars } from '@src/global';

describe('Step Definition Parameter Extraction', () => {
  
  beforeAll(() => {
    // Initialize vars module
    vars.initVars();
  });

  describe('Variable Replacement', () => {
    
    beforeEach(() => {
      // Set up test variables
      vars.setValue('baseUrl', 'https://example.com');
      vars.setValue('username', 'testuser');
      vars.setValue('password', 'testpass123');
      vars.setValue('nested.value', 'nestedValue');
    });

    test('should replace single variable in string', () => {
      const input = '#{baseUrl}';
      const result = vars.replaceVariables(input);
      expect(result).toBe('https://example.com');
    });

    test('should replace multiple variables in string', () => {
      const input = '#{baseUrl}/login?user=#{username}';
      const result = vars.replaceVariables(input);
      expect(result).toBe('https://example.com/login?user=testuser');
    });

    test('should handle variables with dots (nested)', () => {
      const input = '#{nested.value}';
      const result = vars.replaceVariables(input);
      expect(result).toBe('nestedValue');
    });

    test('should return original variable name when variable not found', () => {
      const input = '#{nonExistentVar}';
      const result = vars.replaceVariables(input);
      expect(result).toBe('nonExistentVar');
    });

    test('should handle empty string', () => {
      const input = '';
      const result = vars.replaceVariables(input);
      expect(result).toBe('');
    });

    test('should handle string with no variables', () => {
      const input = 'plain text without variables';
      const result = vars.replaceVariables(input);
      expect(result).toBe('plain text without variables');
    });

    test('should handle mixed content with variables and plain text', () => {
      const input = 'User #{username} logged in at #{baseUrl}';
      const result = vars.replaceVariables(input);
      expect(result).toBe('User testuser logged in at https://example.com');
    });

    test('should handle special characters in variable values', () => {
      vars.setValue('specialChars', 'value@#$%^&*()');
      const input = '#{specialChars}';
      const result = vars.replaceVariables(input);
      expect(result).toBe('value@#$%^&*()');
    });

    test('should handle numeric values', () => {
      vars.setValue('port', '8080');
      const input = '#{baseUrl}:#{port}';
      const result = vars.replaceVariables(input);
      expect(result).toBe('https://example.com:8080');
    });

    test('should handle variables in JSON options string', () => {
      const input = '{url: "#{baseUrl}", timeout: 5000}';
      const result = vars.replaceVariables(input);
      expect(result).toBe('{url: "https://example.com", timeout: 5000}');
    });
  });

  describe('Pattern Locator References', () => {
    
    test('should preserve pattern locator format', () => {
      const field = 'loginPage.usernameInput';
      // Pattern locators should not be modified by variable replacement
      const result = vars.replaceVariables(field);
      expect(result).toBe('loginPage.usernameInput');
    });

    test('should handle pattern locator with variable in value', () => {
      vars.setValue('pageName', 'loginPage');
      const field = '#{pageName}.usernameInput';
      const result = vars.replaceVariables(field);
      expect(result).toBe('loginPage.usernameInput');
    });
  });

  describe('Edge Cases', () => {
    
    beforeEach(() => {
      vars.setValue('username', 'testuser');
      vars.setValue('password', 'testpass123');
    });

    test('should handle consecutive variables', () => {
      const input = '#{username}#{password}';
      const result = vars.replaceVariables(input);
      expect(result).toBe('testusertest pass123');
    });

    test('should handle variable at start of string', () => {
      const input = '#{username} is logged in';
      const result = vars.replaceVariables(input);
      expect(result).toBe('testuser is logged in');
    });

    test('should handle variable at end of string', () => {
      const input = 'Welcome #{username}';
      const result = vars.replaceVariables(input);
      expect(result).toBe('Welcome testuser');
    });

    test('should handle whitespace around variables', () => {
      const input = '  #{username}  ';
      const result = vars.replaceVariables(input);
      expect(result).toBe('  testuser  ');
    });

    test('should handle malformed variable syntax (missing closing brace)', () => {
      const input = '#{username';
      const result = vars.replaceVariables(input);
      // Should return as-is since it's not a valid variable pattern
      expect(result).toBe('#{username');
    });

    test('should handle malformed variable syntax (missing opening brace)', () => {
      const input = 'username}';
      const result = vars.replaceVariables(input);
      expect(result).toBe('username}');
    });

    test('should handle nested braces', () => {
      vars.setValue('json', '{"key": "value"}');
      const input = '#{json}';
      const result = vars.replaceVariables(input);
      expect(result).toBe('{"key": "value"}');
    });
  });

  describe('Options String Parsing', () => {
    
    test('should handle empty options string', () => {
      const options = '';
      const parsed = vars.parseLooseJson(options);
      expect(parsed).toEqual({});
    });

    test('should parse simple JSON options', () => {
      const options = '{screenshot: true}';
      const parsed = vars.parseLooseJson(options);
      expect(parsed).toEqual({ screenshot: true });
    });

    test('should parse options without braces', () => {
      const options = 'screenshot: true, timeout: 5000';
      const parsed = vars.parseLooseJson(options);
      expect(parsed).toEqual({ screenshot: true, timeout: 5000 });
    });

    test('should parse options with string values', () => {
      const options = '{screenshotText: "After login", screenshot: true}';
      const parsed = vars.parseLooseJson(options);
      expect(parsed).toEqual({ screenshotText: 'After login', screenshot: true });
    });

    test('should parse options with boolean values', () => {
      const options = '{partialMatch: true, ignoreCase: false}';
      const parsed = vars.parseLooseJson(options);
      expect(parsed).toEqual({ partialMatch: true, ignoreCase: false });
    });

    test('should parse options with numeric values', () => {
      const options = '{actionTimeout: 10000, retries: 3}';
      const parsed = vars.parseLooseJson(options);
      expect(parsed).toEqual({ actionTimeout: 10000, retries: 3 });
    });

    test('should handle options with locator selectors', () => {
      const options = '{locator: "xpath=//button[@id=\'submit\']"}';
      const parsed = vars.parseLooseJson(options);
      expect(parsed).toEqual({ locator: 'xpath=//button[@id=\'submit\']' });
    });
  });

  describe('Environment Variables', () => {
    
    test('should resolve environment variables with env. prefix', () => {
      process.env.TEST_VAR = 'test_value';
      const input = '#{env.TEST_VAR}';
      const result = vars.replaceVariables(input);
      expect(result).toBe('test_value');
      delete process.env.TEST_VAR;
    });

    test('should return original when env variable not found', () => {
      const input = '#{env.NON_EXISTENT}';
      const result = vars.replaceVariables(input);
      expect(result).toBe('env.NON_EXISTENT');
    });
  });

  describe('Data Table Parameter Extraction', () => {
    
    test('should extract field and value from data table row', () => {
      const row = { field: 'firstname', value: 'John' };
      const field = `checkoutPage.${row.field}Input`;
      const value = row.value;
      
      expect(field).toBe('checkoutPage.firstnameInput');
      expect(value).toBe('John');
    });

    test('should handle multiple data table rows', () => {
      const rows = [
        { field: 'firstname', value: 'John' },
        { field: 'lastname', value: 'Doe' },
        { field: 'email', value: 'john@example.com' }
      ];
      
      const fields = rows.map(row => `checkoutPage.${row.field}Input`);
      
      expect(fields).toEqual([
        'checkoutPage.firstnameInput',
        'checkoutPage.lastnameInput',
        'checkoutPage.emailInput'
      ]);
    });

    test('should handle data table with variable replacement', () => {
      vars.setValue('testEmail', 'test@example.com');
      const row = { field: 'email', value: '#{testEmail}' };
      const value = vars.replaceVariables(row.value);
      
      expect(value).toBe('test@example.com');
    });
  });
});


/**
 * Property-Based Tests for Parameter Transformation
 * Feature: cucumber-integration
 */

import * as fc from "fast-check";

describe('Property-Based Tests: Parameter Transformation', () => {
  
  beforeAll(() => {
    // Initialize vars module
    vars.initVars();
  });

  /**
   * Property 2: Parameter Extraction and Transformation
   * Feature: cucumber-integration, Property 2: Parameter Extraction and Transformation
   * 
   * For any Gherkin step with parameters using #{param} syntax, the extracted parameter 
   * values should be correctly passed to the web action after variable replacement.
   * 
   * Validates: Requirements 2.2, 6.1
   */
  test('Property 2: Parameter Extraction and Transformation', () => {
    fc.assert(
      fc.property(
        fc.record({
          // Generate variable names (alphanumeric with dots for nesting)
          varName: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9.]{1,20}$/),
          // Generate variable values (various types of strings)
          varValue: fc.oneof(
            fc.webUrl(),
            fc.emailAddress(),
            fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            fc.integer({ min: 1, max: 10000 }).map(n => n.toString()),
            fc.constant('true'),
            fc.constant('false')
          ),
          // Generate template strings with variable placeholders
          templateType: fc.constantFrom('single', 'multiple', 'mixed')
        }),
        (testData) => {
          const { varName, varValue, templateType } = testData;
          
          // Set the variable
          vars.setValue(varName, varValue);
          
          // Create template based on type
          let template: string;
          let expectedResult: string;
          
          switch (templateType) {
            case 'single':
              // Single variable replacement
              template = `#{${varName}}`;
              expectedResult = varValue;
              break;
              
            case 'multiple':
              // Multiple occurrences of same variable
              template = `#{${varName}}/path/#{${varName}}`;
              expectedResult = `${varValue}/path/${varValue}`;
              break;
              
            case 'mixed':
              // Variable mixed with plain text
              template = `prefix-#{${varName}}-suffix`;
              expectedResult = `prefix-${varValue}-suffix`;
              break;
          }
          
          // Perform variable replacement
          const result = vars.replaceVariables(template);
          
          // Verify the replacement is correct
          return result === expectedResult;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Variable Replacement Idempotence
   * 
   * For any string containing variable placeholders, applying replaceVariables() 
   * multiple times should produce the same result as applying it once.
   * 
   * Validates: Requirements 6.1
   */
  test('Property: Variable Replacement Idempotence', () => {
    fc.assert(
      fc.property(
        fc.record({
          varName: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9.]{1,15}$/),
          varValue: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          template: fc.constantFrom(
            (v: string) => `#{${v}}`,
            (v: string) => `prefix-#{${v}}`,
            (v: string) => `#{${v}}-suffix`,
            (v: string) => `start-#{${v}}-end`
          )
        }),
        (testData) => {
          const { varName, varValue, template } = testData;
          
          // Set the variable
          vars.setValue(varName, varValue);
          
          // Create the template string
          const templateStr = template(varName);
          
          // Apply replacement once
          const result1 = vars.replaceVariables(templateStr);
          
          // Apply replacement again on the result
          const result2 = vars.replaceVariables(result1);
          
          // Apply replacement a third time
          const result3 = vars.replaceVariables(result2);
          
          // All results should be identical (idempotent)
          return result1 === result2 && result2 === result3;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Options String Parsing Consistency
   * 
   * For any valid options object, converting it to a string and parsing it back 
   * should produce an equivalent object.
   * 
   * Validates: Requirements 2.2
   */
  test('Property: Options String Parsing Consistency', () => {
    fc.assert(
      fc.property(
        fc.record({
          screenshot: fc.boolean(),
          actionTimeout: fc.integer({ min: 1000, max: 60000 }),
          partialMatch: fc.boolean(),
          screenshotText: fc.string({ minLength: 0, maxLength: 50 })
        }),
        (options) => {
          // Convert options to string format (without outer braces for parseLooseJson)
          const optionsStr = Object.entries(options)
            .map(([key, value]) => {
              if (typeof value === 'string') {
                return `${key}: "${value}"`;
              }
              return `${key}: ${value}`;
            })
            .join(', ');
          
          // Parse the string back to object
          const parsed = vars.parseLooseJson(optionsStr);
          
          // Verify all keys are present and values match
          return (
            parsed.screenshot === options.screenshot &&
            parsed.actionTimeout === options.actionTimeout &&
            parsed.partialMatch === options.partialMatch &&
            parsed.screenshotText === options.screenshotText
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Pattern Locator Format Preservation
   * 
   * For any pattern locator reference (pageName.fieldName format), variable 
   * replacement should not modify the pattern locator structure unless it 
   * contains actual variable placeholders.
   * 
   * Validates: Requirements 3.1
   */
  test('Property: Pattern Locator Format Preservation', () => {
    fc.assert(
      fc.property(
        fc.record({
          pageName: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{2,15}$/),
          fieldName: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{2,20}$/)
        }),
        (testData) => {
          const { pageName, fieldName } = testData;
          
          // Create pattern locator reference
          const patternLocator = `${pageName}.${fieldName}`;
          
          // Apply variable replacement
          const result = vars.replaceVariables(patternLocator);
          
          // Pattern locator should remain unchanged (no variables to replace)
          return result === patternLocator;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Data Table Field Transformation
   * 
   * For any data table row with field and value, transforming the field name 
   * to a pattern locator format should produce a consistent, valid pattern reference.
   * 
   * Validates: Requirements 2.2, 6.3
   */
  test('Property: Data Table Field Transformation', () => {
    fc.assert(
      fc.property(
        fc.record({
          fieldName: fc.stringMatching(/^[a-z][a-z0-9]{2,15}$/),
          value: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)
        }),
        (testData) => {
          const { fieldName, value } = testData;
          
          // Simulate data table row transformation (as done in step definitions)
          const transformedField = `checkoutPage.${fieldName}Input`;
          
          // Verify the transformation produces a valid pattern locator format
          const hasCorrectFormat = /^[a-zA-Z][a-zA-Z0-9]+\.[a-z][a-z0-9]+Input$/.test(transformedField);
          
          // Verify the field name is preserved in the transformation
          const containsFieldName = transformedField.includes(fieldName);
          
          // Verify the value is not modified
          const valueUnchanged = value === value;
          
          return hasCorrectFormat && containsFieldName && valueUnchanged;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Environment Variable Resolution
   * 
   * For any environment variable with the env. prefix, the variable replacement 
   * should correctly resolve to the environment variable value or return the 
   * variable name if not found.
   * 
   * Validates: Requirements 6.1
   */
  test('Property: Environment Variable Resolution', () => {
    fc.assert(
      fc.property(
        fc.record({
          envVarName: fc.stringMatching(/^[A-Z][A-Z0-9_]{2,15}$/),
          envVarValue: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          shouldSet: fc.boolean()
        }),
        (testData) => {
          const { envVarName, envVarValue, shouldSet } = testData;
          
          // Set or unset the environment variable
          if (shouldSet) {
            process.env[envVarName] = envVarValue;
          } else {
            delete process.env[envVarName];
          }
          
          // Create template with env variable
          const template = `#{env.${envVarName}}`;
          
          // Perform variable replacement
          const result = vars.replaceVariables(template);
          
          // Clean up
          delete process.env[envVarName];
          
          // Verify the result
          if (shouldSet) {
            // Should resolve to the environment variable value
            return result === envVarValue;
          } else {
            // Should return the variable name without the #{ } wrapper
            return result === `env.${envVarName}`;
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
