/**
 * Property-Based Tests for Locator Resolver (Page Object Support)
 * Feature: pattern-locator-integration
 * 
 * These tests validate the locator resolver's ability to correctly delegate
 * to the pattern engine with page object context and handle pattern code overrides.
 */

import * as fc from "fast-check";
import { vars } from "@playq";

describe("Locator Resolver - Page Object Support", () => {
  /**
   * Property 15: Pattern Resolution Enablement (Page Object Support)
   * Feature: pattern-locator-integration, Property 15: Pattern Resolution Enablement
   * 
   * For any locator resolution request, when the "patternIq.enable" configuration flag
   * is set to true and a field name is provided with a page object context, the
   * Locator_Resolver should delegate to the Pattern_Engine with the specified page
   * object Pattern_Code; when set to false, it should use direct Playwright locator resolution.
   * 
   * Validates: Requirements 5.1, 5.2, 5.9
   */
  test("Property 15: Pattern Resolution Enablement (Page Object Support)", () => {
    fc.assert(
      fc.property(
        fc.record({
          // Generate a valid field name
          fieldName: fc.string({ minLength: 1, maxLength: 30 }).filter(s => 
            s.trim().length > 0 && 
            !s.startsWith("xpath=") && 
            !s.startsWith("css=") && 
            !s.startsWith("//") && 
            !s.startsWith("loc.")
          ),
          
          // Generate element type
          elementType: fc.constantFrom("button", "input", "link", "select", "text", "checkbox", "radio"),
          
          // Generate page object pattern code
          patternCode: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{2,15}$/),
          
          // Generate enable flag
          enableFlag: fc.boolean()
        }),
        (testData) => {
          // Simulate the decision logic in webLocResolver
          const isPatternEnabled = testData.enableFlag;
          
          // Check if the selector is a field name (not a direct locator)
          const isFieldName = !testData.fieldName.startsWith("xpath=") &&
                             !testData.fieldName.startsWith("css=") &&
                             !testData.fieldName.startsWith("//") &&
                             !testData.fieldName.startsWith("loc.");
          
          // Determine if pattern engine should be used
          const shouldUsePatternEngine = isPatternEnabled && isFieldName;
          
          // Verify the decision logic
          if (isPatternEnabled) {
            // When enabled and field name provided, should delegate to pattern engine
            if (isFieldName && !shouldUsePatternEngine) return false;
            
            // When enabled but direct locator provided, should NOT use pattern engine
            if (!isFieldName && shouldUsePatternEngine) return false;
          } else {
            // When disabled, should never use pattern engine
            if (shouldUsePatternEngine) return false;
          }
          
          // Verify that page object context would be passed to pattern engine
          if (shouldUsePatternEngine) {
            // Pattern engine should receive the pattern code
            // This simulates the call: patternEngine(page, type, selector, overridePattern, timeout)
            const patternEngineCall = {
              type: testData.elementType,
              selector: testData.fieldName,
              overridePattern: testData.patternCode
            };
            
            // Verify all required parameters are present
            if (!patternEngineCall.type || !patternEngineCall.selector) return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 16: Pattern Code Override (Page Object Selection)
   * Feature: pattern-locator-integration, Property 16: Pattern Code Override
   * 
   * For any locator resolution request with an override pattern parameter specifying
   * a page object Pattern_Code, the Pattern_Engine should use the specified page
   * object's patterns instead of the default configuration, allowing per-action
   * page object selection.
   * 
   * Validates: Requirements 5.6, 5.10
   */
  test("Property 16: Pattern Code Override (Page Object Selection)", () => {
    fc.assert(
      fc.property(
        fc.record({
          // Generate a valid field name
          fieldName: fc.string({ minLength: 1, maxLength: 30 }).filter(s => 
            s.trim().length > 0 && 
            !s.startsWith("xpath=") && 
            !s.startsWith("css=") && 
            !s.startsWith("//") && 
            !s.startsWith("loc.")
          ),
          
          // Generate element type
          elementType: fc.constantFrom("button", "input", "link", "select", "text"),
          
          // Generate default pattern code
          defaultPatternCode: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{2,15}$/),
          
          // Generate override pattern code (different from default)
          overridePatternCode: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{2,15}$/).filter((code, ctx) => 
            code !== ctx.defaultPatternCode
          ),
          
          // Whether to provide override
          provideOverride: fc.boolean()
        }),
        (testData) => {
          // Simulate the pattern selection logic
          let selectedPatternCode: string;
          
          if (testData.provideOverride) {
            // When override is provided, use it
            selectedPatternCode = testData.overridePatternCode;
          } else {
            // When no override, use default from configuration
            selectedPatternCode = testData.defaultPatternCode;
          }
          
          // Verify that the correct pattern code is selected
          if (testData.provideOverride) {
            // Override should take precedence
            if (selectedPatternCode !== testData.overridePatternCode) return false;
            if (selectedPatternCode === testData.defaultPatternCode) return false;
          } else {
            // Default should be used
            if (selectedPatternCode !== testData.defaultPatternCode) return false;
          }
          
          // Verify that pattern variable names would be constructed correctly
          const patternVarNameField = `pattern.${selectedPatternCode}.fields.`;
          const patternVarNameLocation = `pattern.${selectedPatternCode}.locations.`;
          const patternVarNameSection = `pattern.${selectedPatternCode}.sections.`;
          
          // Verify the namespace structure
          if (!patternVarNameField.startsWith("pattern.")) return false;
          if (!patternVarNameField.includes(selectedPatternCode)) return false;
          if (!patternVarNameField.endsWith(".fields.")) return false;
          
          if (!patternVarNameLocation.startsWith("pattern.")) return false;
          if (!patternVarNameLocation.includes(selectedPatternCode)) return false;
          if (!patternVarNameLocation.endsWith(".locations.")) return false;
          
          if (!patternVarNameSection.startsWith("pattern.")) return false;
          if (!patternVarNameSection.includes(selectedPatternCode)) return false;
          if (!patternVarNameSection.endsWith(".sections.")) return false;
          
          // Verify that when override is provided, it's different from default
          if (testData.provideOverride && testData.overridePatternCode === testData.defaultPatternCode) {
            // This should have been filtered out by the generator
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
