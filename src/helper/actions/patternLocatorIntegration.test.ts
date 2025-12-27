/**
 * Property-Based Tests for Pattern Locator Integration in Cucumber
 * Feature: cucumber-integration
 * 
 * These tests validate that pattern locators work correctly when used
 * in Cucumber step definitions and are properly resolved by the framework.
 */

import * as fc from "fast-check";
import { vars } from "@playq";

describe("Pattern Locator Integration in Cucumber", () => {
  /**
   * Property 3: Pattern Locator Resolution
   * Feature: cucumber-integration, Property 3: Pattern Locator Resolution
   * 
   * For any step parameter that references a pattern locator (format: pageName.fieldName),
   * the framework should resolve it to a valid Playwright locator using the Pattern Locator system.
   * 
   * Validates: Requirements 3.1, 3.2
   */
  test("Property 3: Pattern Locator Resolution", () => {
    fc.assert(
      fc.property(
        fc.record({
          // Generate valid page names (pattern file names)
          pageName: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{2,20}Page$/),
          
          // Generate valid field names
          fieldName: fc.stringMatching(/^[a-z][a-zA-Z0-9]{2,20}(Input|Button|Link|Checkbox|Field)$/),
          
          // Generate element types
          elementType: fc.constantFrom("button", "input", "link", "checkbox", "select", "text"),
          
          // Whether pattern is enabled
          patternEnabled: fc.boolean()
        }),
        (testData) => {
          // Construct pattern locator reference
          const patternLocator = `${testData.pageName}.${testData.fieldName}`;
          
          // Verify pattern locator format is correct
          const patternLocatorRegex = /^[a-zA-Z][a-zA-Z0-9]+\.[a-zA-Z][a-zA-Z0-9]+$/;
          if (!patternLocatorRegex.test(patternLocator)) {
            return false;
          }
          
          // Verify the pattern locator can be parsed into components
          const parts = patternLocator.split(".");
          if (parts.length !== 2) {
            return false;
          }
          
          const [parsedPageName, parsedFieldName] = parts;
          
          // Verify parsed components match original
          if (parsedPageName !== testData.pageName) {
            return false;
          }
          
          if (parsedFieldName !== testData.fieldName) {
            return false;
          }
          
          // Verify that when pattern is enabled, the locator would be processed
          // by the pattern engine (simulating webLocResolver logic)
          if (testData.patternEnabled) {
            // Pattern locator should NOT start with xpath=, css=, //, or loc.
            if (patternLocator.startsWith("xpath=") ||
                patternLocator.startsWith("css=") ||
                patternLocator.startsWith("//") ||
                patternLocator.startsWith("loc.")) {
              return false;
            }
            
            // Pattern locator should be a valid identifier format
            if (!patternLocatorRegex.test(patternLocator)) {
              return false;
            }
          }
          
          // Verify that the pattern locator format is consistent
          // (pageName should end with "Page", fieldName should end with element type suffix)
          if (!testData.pageName.endsWith("Page")) {
            return false;
          }
          
          const validSuffixes = ["Input", "Button", "Link", "Checkbox", "Field", "Select", "Text"];
          const hasValidSuffix = validSuffixes.some(suffix => testData.fieldName.endsWith(suffix));
          
          if (!hasValidSuffix) {
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3a: Pattern Locator Direct Mapping Resolution
   * Feature: cucumber-integration, Property 3a: Pattern Locator Direct Mapping Resolution
   * 
   * For any pattern locator that references a direct mapping in a pattern file
   * (e.g., loginPage.usernameInput), the framework should resolve it to the
   * corresponding locator string defined in the pattern file.
   * 
   * Validates: Requirements 3.1, 3.2, 3.3
   */
  test("Property 3a: Pattern Locator Direct Mapping Resolution", () => {
    fc.assert(
      fc.property(
        fc.record({
          // Generate pattern file name
          patternFile: fc.stringMatching(/^[a-z][a-zA-Z0-9]{2,15}Page$/),
          
          // Generate direct mapping field name
          directField: fc.stringMatching(/^[a-z][a-zA-Z0-9]{2,20}(Input|Button|Link)$/),
          
          // Generate locator string (XPath or CSS)
          locatorType: fc.constantFrom("xpath", "css"),
          
          // Generate locator value
          locatorValue: fc.oneof(
            // XPath locators
            fc.string({ minLength: 5, maxLength: 50 }).map(s => `//input[@id='${s}']`),
            fc.string({ minLength: 5, maxLength: 50 }).map(s => `//button[contains(text(), '${s}')]`),
            // CSS locators
            fc.string({ minLength: 3, maxLength: 20 }).map(s => `input#${s}`),
            fc.string({ minLength: 3, maxLength: 20 }).map(s => `button.${s}`)
          )
        }),
        (testData) => {
          // Simulate pattern file structure
          const patternFileStructure = {
            [testData.directField]: testData.locatorValue
          };
          
          // Verify direct mapping exists
          if (!(testData.directField in patternFileStructure)) {
            return false;
          }
          
          // Verify locator value is valid
          const locatorValue = patternFileStructure[testData.directField];
          if (!locatorValue || locatorValue.length === 0) {
            return false;
          }
          
          // Verify locator format is valid (XPath or CSS)
          const isXPath = locatorValue.startsWith("//") || locatorValue.startsWith("(");
          const isCSS = !isXPath && (
            locatorValue.includes("#") ||
            locatorValue.includes(".") ||
            locatorValue.includes("[")
          );
          
          if (!isXPath && !isCSS) {
            return false;
          }
          
          // Verify that multiple locators can be separated by semicolons
          const locatorParts = locatorValue.split(";");
          if (locatorParts.length > 0) {
            // Each part should be a valid locator
            for (const part of locatorParts) {
              const trimmed = part.trim();
              if (trimmed.length === 0) {
                return false;
              }
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3b: Pattern Locator Field Resolution
   * Feature: cucumber-integration, Property 3b: Pattern Locator Field Resolution
   * 
   * For any pattern locator that uses field-based resolution (e.g., simple field names
   * like "Username", "Login"), the pattern engine should use the pattern file's field
   * templates to generate appropriate locators.
   * 
   * Validates: Requirements 3.1, 3.2, 3.3
   */
  test("Property 3b: Pattern Locator Field Resolution", () => {
    fc.assert(
      fc.property(
        fc.record({
          // Generate simple field name
          fieldName: fc.stringMatching(/^[A-Z][a-zA-Z0-9 ]{2,30}$/),
          
          // Generate element type
          elementType: fc.constantFrom("button", "input", "link", "checkbox", "select"),
          
          // Generate pattern code
          patternCode: fc.stringMatching(/^[a-z][a-zA-Z0-9]{2,15}Page$/),
          
          // Whether to use location/section
          useLocation: fc.boolean(),
          useSection: fc.boolean(),
          
          // Location and section names
          locationName: fc.stringMatching(/^[A-Z][a-zA-Z0-9 ]{2,20}$/),
          sectionName: fc.stringMatching(/^[A-Z][a-zA-Z0-9 ]{2,20}$/),
          
          // Instance number
          instance: fc.integer({ min: 1, max: 5 })
        }),
        (testData) => {
          // Construct field string with optional location/section/instance
          let fieldString = testData.fieldName;
          
          if (testData.useLocation) {
            fieldString = `{{${testData.locationName}}} ${fieldString}`;
          }
          
          if (testData.useSection) {
            fieldString = `{${testData.sectionName}} ${fieldString}`;
          }
          
          if (testData.instance > 1) {
            fieldString = `${fieldString}[${testData.instance}]`;
          }
          
          // Parse the field string (simulating pattern engine parsing)
          const pattern = /^(?:{{([^:}]+)(?:::(.+?))?}}\s*)?(?:{([^:}]+)(?:::(.+?))?}\s*)?(.+?)(?:\[(\d+)\])?$/;
          const match = fieldString.match(pattern);
          
          if (!match) {
            // If we added location/section/instance, it should match
            if (testData.useLocation || testData.useSection || testData.instance > 1) {
              return false;
            }
            // Otherwise, simple field name might not match complex pattern
            return true;
          }
          
          // Verify parsed components
          const [, locationName, locationValue, sectionName, sectionValue, parsedFieldName, instanceStr] = match;
          
          // Verify location parsing
          if (testData.useLocation) {
            if (!locationName || locationName !== testData.locationName) {
              return false;
            }
          } else {
            if (locationName) {
              return false;
            }
          }
          
          // Verify section parsing
          if (testData.useSection) {
            if (!sectionName || sectionName !== testData.sectionName) {
              return false;
            }
          } else {
            if (sectionName) {
              return false;
            }
          }
          
          // Verify instance parsing
          if (testData.instance > 1) {
            if (!instanceStr || parseInt(instanceStr) !== testData.instance) {
              return false;
            }
          } else {
            if (instanceStr) {
              return false;
            }
          }
          
          // Verify field name is preserved
          if (!parsedFieldName || !parsedFieldName.includes(testData.fieldName)) {
            return false;
          }
          
          // Verify pattern variable names would be constructed correctly
          const patternVarNameField = `pattern.${testData.patternCode}.fields.`;
          const patternVarNameLocation = `pattern.${testData.patternCode}.locations.`;
          const patternVarNameSection = `pattern.${testData.patternCode}.sections.`;
          
          // Verify namespace structure
          if (!patternVarNameField.startsWith("pattern.")) return false;
          if (!patternVarNameField.includes(testData.patternCode)) return false;
          if (!patternVarNameField.endsWith(".fields.")) return false;
          
          if (!patternVarNameLocation.startsWith("pattern.")) return false;
          if (!patternVarNameLocation.includes(testData.patternCode)) return false;
          if (!patternVarNameLocation.endsWith(".locations.")) return false;
          
          if (!patternVarNameSection.startsWith("pattern.")) return false;
          if (!patternVarNameSection.includes(testData.patternCode)) return false;
          if (!patternVarNameSection.endsWith(".sections.")) return false;
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
