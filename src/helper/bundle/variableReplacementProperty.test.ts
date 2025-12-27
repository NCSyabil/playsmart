import * as fc from "fast-check";
import * as path from "path";

/**
 * Property-Based Tests for Variable Replacement
 * Feature: cucumber-integration
 * 
 * Tests the idempotence property of variable replacement - applying the
 * replacement function multiple times should produce the same result as
 * applying it once.
 */

// Set up environment variables before importing vars module
process.env.PLAYQ_CORE_ROOT = path.resolve(process.cwd(), "src");
process.env.PLAYQ_PROJECT_ROOT = process.cwd();

import { initVars, setValue, replaceVariables } from "./vars";

describe("Variable Replacement - Property-Based Tests", () => {
  beforeAll(() => {
    // Initialize vars once before all tests
    initVars();
  });

  /**
   * Property 6: Variable Replacement Idempotence
   * Feature: cucumber-integration, Property 6: Variable Replacement Idempotence
   * 
   * For any string containing variable placeholders (e.g., #{baseUrl}), applying
   * vars.replaceVariables() multiple times should produce the same result as
   * applying it once.
   * 
   * Validates: Requirements 6.1
   */
  test("Property 6: Variable Replacement Idempotence", () => {
    fc.assert(
      fc.property(
        fc.record({
          // Generate variable names and values
          variables: fc.array(
            fc.record({
              name: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_.]{0,20}$/),
              value: fc.oneof(
                fc.string({ minLength: 1, maxLength: 50 }),
                fc.webUrl(),
                fc.integer({ min: 0, max: 10000 }).map(n => n.toString()),
                fc.constant("true"),
                fc.constant("false")
              )
            }),
            { minLength: 1, maxLength: 5 }
          ),
          // Generate a template string with variable placeholders
          templateParts: fc.array(
            fc.oneof(
              fc.string({ minLength: 0, maxLength: 20 }),
              fc.constant("#{"),
              fc.constant("}")
            ),
            { minLength: 1, maxLength: 10 }
          )
        }),
        (testData) => {
          // Set up variables
          testData.variables.forEach(v => {
            setValue(v.name, v.value);
          });

          // Create a template string with some variable references
          let template = "";
          let useVariableNext = false;
          
          for (let i = 0; i < testData.templateParts.length; i++) {
            const part = testData.templateParts[i];
            
            if (part === "#{" && i + 1 < testData.templateParts.length) {
              // Insert a variable reference
              if (testData.variables.length > 0) {
                const varIndex = i % testData.variables.length;
                template += `#{${testData.variables[varIndex].name}}`;
                useVariableNext = true;
              } else {
                template += part;
              }
            } else if (part === "}" && useVariableNext) {
              // Skip closing brace if we just added a variable
              useVariableNext = false;
            } else if (part !== "#{" && part !== "}") {
              template += part;
            }
          }

          // Apply variable replacement once
          const result1 = replaceVariables(template);
          
          // Apply variable replacement twice
          const result2 = replaceVariables(result1);
          
          // Apply variable replacement three times
          const result3 = replaceVariables(result2);
          
          // All results should be identical (idempotence)
          return result1 === result2 && result2 === result3;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Variable Replacement with Simple Strings
   * 
   * For any string with a single variable placeholder, replacing variables
   * multiple times should produce the same result.
   */
  test("Property: Variable Replacement Idempotence with Simple Strings", () => {
    fc.assert(
      fc.property(
        fc.record({
          varName: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_.]{0,15}$/),
          varValue: fc.string({ minLength: 1, maxLength: 30 }),
          prefix: fc.string({ minLength: 0, maxLength: 20 }),
          suffix: fc.string({ minLength: 0, maxLength: 20 })
        }),
        (testData) => {
          // Set the variable
          setValue(testData.varName, testData.varValue);
          
          // Create template with variable
          const template = `${testData.prefix}#{${testData.varName}}${testData.suffix}`;
          
          // Apply replacement multiple times
          const result1 = replaceVariables(template);
          const result2 = replaceVariables(result1);
          const result3 = replaceVariables(result2);
          
          // Verify idempotence
          return result1 === result2 && result2 === result3;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Variable Replacement with Multiple Variables
   * 
   * For any string with multiple variable placeholders, replacing variables
   * multiple times should produce the same result.
   */
  test("Property: Variable Replacement Idempotence with Multiple Variables", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_.]{0,15}$/),
            value: fc.string({ minLength: 1, maxLength: 20 })
          }),
          { minLength: 2, maxLength: 5 }
        ),
        (variables) => {
          // Ensure unique variable names
          const uniqueVars = variables.filter(
            (v, index, self) => self.findIndex(x => x.name === v.name) === index
          );
          
          if (uniqueVars.length < 2) {
            return true; // Skip if we don't have at least 2 unique variables
          }
          
          // Set all variables
          uniqueVars.forEach(v => setValue(v.name, v.value));
          
          // Create template with all variables
          const template = uniqueVars.map(v => `#{${v.name}}`).join(" ");
          
          // Apply replacement multiple times
          const result1 = replaceVariables(template);
          const result2 = replaceVariables(result1);
          const result3 = replaceVariables(result2);
          
          // Verify idempotence
          return result1 === result2 && result2 === result3;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Variable Replacement with Nested Variables
   * 
   * For any string with nested variable names (using dot notation), replacing
   * variables multiple times should produce the same result.
   */
  test("Property: Variable Replacement Idempotence with Nested Variables", () => {
    fc.assert(
      fc.property(
        fc.record({
          namespace: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{0,10}$/),
          key: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{0,10}$/),
          value: fc.string({ minLength: 1, maxLength: 30 }),
          text: fc.string({ minLength: 0, maxLength: 20 })
        }),
        (testData) => {
          // Set nested variable
          const varName = `${testData.namespace}.${testData.key}`;
          setValue(varName, testData.value);
          
          // Create template with nested variable
          const template = `${testData.text}#{${varName}}`;
          
          // Apply replacement multiple times
          const result1 = replaceVariables(template);
          const result2 = replaceVariables(result1);
          const result3 = replaceVariables(result2);
          
          // Verify idempotence
          return result1 === result2 && result2 === result3;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Variable Replacement with Missing Variables
   * 
   * For any string with missing variable placeholders, replacing variables
   * multiple times should produce the same result (the variable name).
   */
  test("Property: Variable Replacement Idempotence with Missing Variables", () => {
    fc.assert(
      fc.property(
        fc.record({
          varName: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_.]{0,15}$/),
          text: fc.string({ minLength: 0, maxLength: 20 })
        }),
        (testData) => {
          // Don't set the variable - it will be missing
          
          // Create template with missing variable
          const template = `${testData.text}#{${testData.varName}}`;
          
          // Apply replacement multiple times
          const result1 = replaceVariables(template);
          const result2 = replaceVariables(result1);
          const result3 = replaceVariables(result2);
          
          // Verify idempotence - missing variables return the variable name
          // After first replacement, #{varName} becomes varName
          // Subsequent replacements should not change it
          return result1 === result2 && result2 === result3;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Variable Replacement with Special Characters
   * 
   * For any string with variables containing special characters in their values,
   * replacing variables multiple times should produce the same result.
   */
  test("Property: Variable Replacement Idempotence with Special Characters", () => {
    fc.assert(
      fc.property(
        fc.record({
          varName: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{0,10}$/),
          varValue: fc.oneof(
            fc.string({ minLength: 1, maxLength: 20 }),
            fc.constant("Hello@World!#$%"),
            fc.constant('{"key": "value"}'),
            fc.constant("Line1\nLine2\tTab"),
            fc.constant("C:\\Users\\Test\\file.txt"),
            fc.constant("https://example.com?id=123&name=test")
          )
        }),
        (testData) => {
          // Set variable with special characters
          setValue(testData.varName, testData.varValue);
          
          // Create template
          const template = `Value: #{${testData.varName}}`;
          
          // Apply replacement multiple times
          const result1 = replaceVariables(template);
          const result2 = replaceVariables(result1);
          const result3 = replaceVariables(result2);
          
          // Verify idempotence
          return result1 === result2 && result2 === result3;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Variable Replacement with Environment Variables
   * 
   * For any string with environment variable placeholders (env. prefix),
   * replacing variables multiple times should produce the same result.
   */
  test("Property: Variable Replacement Idempotence with Environment Variables", () => {
    fc.assert(
      fc.property(
        fc.record({
          envVarName: fc.stringMatching(/^[A-Z][A-Z0-9_]{0,15}$/),
          envVarValue: fc.string({ minLength: 1, maxLength: 30 }),
          text: fc.string({ minLength: 0, maxLength: 20 })
        }),
        (testData) => {
          // Set environment variable
          const originalValue = process.env[testData.envVarName];
          process.env[testData.envVarName] = testData.envVarValue;
          
          try {
            // Create template with env variable
            const template = `${testData.text}#{env.${testData.envVarName}}`;
            
            // Apply replacement multiple times
            const result1 = replaceVariables(template);
            const result2 = replaceVariables(result1);
            const result3 = replaceVariables(result2);
            
            // Restore original environment variable
            if (originalValue !== undefined) {
              process.env[testData.envVarName] = originalValue;
            } else {
              delete process.env[testData.envVarName];
            }
            
            // Verify idempotence
            return result1 === result2 && result2 === result3;
          } catch (error) {
            // Restore on error
            if (originalValue !== undefined) {
              process.env[testData.envVarName] = originalValue;
            } else {
              delete process.env[testData.envVarName];
            }
            return false;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Variable Replacement with Empty Strings
   * 
   * For any empty string or string with no variables, replacing variables
   * multiple times should produce the same result.
   */
  test("Property: Variable Replacement Idempotence with Empty/No Variables", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(""),
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes("#{"))
        ),
        (template) => {
          // Apply replacement multiple times
          const result1 = replaceVariables(template);
          const result2 = replaceVariables(result1);
          const result3 = replaceVariables(result2);
          
          // Verify idempotence
          return result1 === result2 && result2 === result3 && result1 === template;
        }
      ),
      { numRuns: 100 }
    );
  });
});
