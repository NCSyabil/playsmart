import * as fc from "fast-check";
import * as fs from "fs";
import * as path from "path";

/**
 * Property-Based Tests for Pattern Configuration Manager (Page Object Model)
 * Feature: pattern-locator-integration
 */

// Set up environment variables before importing vars module
process.env.PLAYQ_CORE_ROOT = path.resolve(process.cwd(), "src");
process.env.PLAYQ_PROJECT_ROOT = process.cwd();

import { initVars, getValue, getLoadedPatternCodes, getPageObjectMapping, setValue, replaceVariables } from "./vars";

describe("Pattern Configuration Manager - Page Object Model", () => {
  const testPatternDir = path.resolve(process.cwd(), "resources/locators/pattern");
  
  beforeAll(() => {
    // Ensure test pattern directory exists
    if (!fs.existsSync(testPatternDir)) {
      fs.mkdirSync(testPatternDir, { recursive: true });
    }
  });

  /**
   * Property 1: Pattern File Discovery and Loading (Page Object Model)
   * Feature: pattern-locator-integration, Property 1: Pattern File Discovery and Loading
   * 
   * For any valid TypeScript file with the ".pattern.ts" suffix placed in the 
   * "resources/locators/pattern" directory, the Config_Manager should automatically 
   * discover and load it as a page object during initialization, making its patterns 
   * accessible via the vars module with the page object's Pattern_Code as the namespace.
   * 
   * Validates: Requirements 1.1, 1.2, 1.5, 1.9
   */
  test("Property 1: Pattern File Discovery and Loading (Page Object Model)", () => {
    fc.assert(
      fc.property(
        fc.record({
          patternCode: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{2,15}$/),
          fields: fc.record({
            button: fc.array(fc.string().filter(s => s.length > 0), { minLength: 1, maxLength: 3 }),
            input: fc.array(fc.string().filter(s => s.length > 0), { minLength: 1, maxLength: 3 }),
          }),
          sections: fc.record({
            testSection: fc.string().filter(s => s.length > 0),
          }),
        }),
        (patternConfig) => {
          const { patternCode, fields, sections } = patternConfig;
          const fileName = `${patternCode}.pattern.ts`;
          const filePath = path.join(testPatternDir, fileName);

          try {
            // Create a test pattern file
            const fileContent = `export const ${patternCode} = ${JSON.stringify(
              { fields, sections },
              null,
              2
            )};`;
            fs.writeFileSync(filePath, fileContent, "utf-8");

            // Clear require cache and reinitialize
            delete require.cache[require.resolve("./vars")];
            
            // Reinitialize vars to load the new pattern file
            initVars();

            // Verify the pattern code is loaded
            const loadedCodes = getLoadedPatternCodes();
            const isLoaded = loadedCodes.includes(patternCode);

            // Verify pattern entries are accessible with correct namespace
            const buttonKey = `pattern.${patternCode}.fields.button`;
            const buttonValue = getValue(buttonKey, true);
            const hasButtonPattern = buttonValue !== "" && buttonValue !== buttonKey;

            // Cleanup
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }

            return isLoaded && hasButtonPattern;
          } catch (error) {
            // Cleanup on error
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
            return false;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Multiple Page Object Configuration Support
   * Feature: pattern-locator-integration, Property 2: Multiple Page Object Configuration Support
   * 
   * For any set of pattern files representing different page objects with unique 
   * Pattern_Code values, the Config_Manager should load all page object configurations 
   * independently and make them accessible, allowing tests to switch between different 
   * page object pattern strategies.
   * 
   * Validates: Requirements 1.3, 1.10
   */
  test("Property 2: Multiple Page Object Configuration Support", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            patternCode: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{2,15}$/),
            fields: fc.record({
              button: fc.array(fc.string().filter(s => s.length > 0), { minLength: 1, maxLength: 2 }),
            }),
          }),
          { minLength: 2, maxLength: 5 }
        ),
        (patternConfigs) => {
          // Ensure unique pattern codes
          const uniqueConfigs = patternConfigs.filter(
            (config, index, self) =>
              self.findIndex((c) => c.patternCode === config.patternCode) === index
          );

          if (uniqueConfigs.length < 2) {
            return true; // Skip if we don't have at least 2 unique configs
          }

          const createdFiles: string[] = [];

          try {
            // Create multiple pattern files
            uniqueConfigs.forEach((config) => {
              const fileName = `${config.patternCode}.pattern.ts`;
              const filePath = path.join(testPatternDir, fileName);
              const fileContent = `export const ${config.patternCode} = ${JSON.stringify(
                { fields: config.fields },
                null,
                2
              )};`;
              fs.writeFileSync(filePath, fileContent, "utf-8");
              createdFiles.push(filePath);
            });

            // Reinitialize vars to load all pattern files
            initVars();

            // Verify all pattern codes are loaded
            const loadedCodes = getLoadedPatternCodes();
            const allLoaded = uniqueConfigs.every((config) =>
              loadedCodes.includes(config.patternCode)
            );

            // Verify each pattern is independently accessible
            const allAccessible = uniqueConfigs.every((config) => {
              const buttonKey = `pattern.${config.patternCode}.fields.button`;
              const buttonValue = getValue(buttonKey, true);
              return buttonValue !== "" && buttonValue !== buttonKey;
            });

            // Cleanup
            createdFiles.forEach((filePath) => {
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            });

            return allLoaded && allAccessible;
          } catch (error) {
            // Cleanup on error
            createdFiles.forEach((filePath) => {
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            });
            return false;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3: Configuration Flattening (Page Object Scoped)
   * Feature: pattern-locator-integration, Property 3: Configuration Flattening
   * 
   * For any nested page object pattern configuration object, the Config_Manager should 
   * flatten it to dot-notation keys (e.g., "pattern.{pageObjectCode}.fields.{type}") 
   * such that all nested values are accessible as flat key-value pairs scoped to that 
   * page object.
   * 
   * Validates: Requirements 1.4
   */
  test("Property 3: Configuration Flattening (Page Object Scoped)", () => {
    fc.assert(
      fc.property(
        fc.record({
          patternCode: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{2,15}$/),
          config: fc.record({
            fields: fc.record({
              button: fc.array(fc.string().filter(s => s.length > 0), { minLength: 1, maxLength: 2 }),
              input: fc.array(fc.string().filter(s => s.length > 0), { minLength: 1, maxLength: 2 }),
              link: fc.array(fc.string().filter(s => s.length > 0), { minLength: 1, maxLength: 2 }),
            }),
            sections: fc.record({
              header: fc.string().filter(s => s.length > 0),
              footer: fc.string().filter(s => s.length > 0),
            }),
            locations: fc.record({
              mainContent: fc.string().filter(s => s.length > 0),
            }),
          }),
        }),
        (testData) => {
          const { patternCode, config } = testData;
          const fileName = `${patternCode}.pattern.ts`;
          const filePath = path.join(testPatternDir, fileName);

          try {
            // Create a test pattern file with nested structure
            const fileContent = `export const ${patternCode} = ${JSON.stringify(
              config,
              null,
              2
            )};`;
            fs.writeFileSync(filePath, fileContent, "utf-8");

            // Reinitialize vars to load the pattern file
            initVars();

            // Verify flattened keys are accessible with correct namespace
            const buttonKey = `pattern.${patternCode}.fields.button`;
            const inputKey = `pattern.${patternCode}.fields.input`;
            const linkKey = `pattern.${patternCode}.fields.link`;
            const headerKey = `pattern.${patternCode}.sections.header`;
            const footerKey = `pattern.${patternCode}.sections.footer`;
            const mainContentKey = `pattern.${patternCode}.locations.mainContent`;

            const buttonValue = getValue(buttonKey, true);
            const inputValue = getValue(inputKey, true);
            const linkValue = getValue(linkKey, true);
            const headerValue = getValue(headerKey, true);
            const footerValue = getValue(footerKey, true);
            const mainContentValue = getValue(mainContentKey, true);

            // Cleanup
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }

            // All keys should be accessible (not empty and not equal to the key itself)
            return (
              buttonValue !== "" && buttonValue !== buttonKey &&
              inputValue !== "" && inputValue !== inputKey &&
              linkValue !== "" && linkValue !== linkKey &&
              headerValue !== "" && headerValue !== headerKey &&
              footerValue !== "" && footerValue !== footerKey &&
              mainContentValue !== "" && mainContentValue !== mainContentKey
            );
          } catch (error) {
            // Cleanup on error
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
            return false;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test: Page Object Mapping Configuration
   * 
   * Verifies that the pageMapping configuration is properly loaded and accessible
   * through the getPageObjectMapping() function.
   * 
   * Validates: Requirements 6.2, 6.6, 6.9, 6.10
   */
  test("Page Object Mapping Configuration is accessible", () => {
    // Initialize vars to load configuration
    initVars();

    // Get the page object mapping
    const mapping = getPageObjectMapping();

    // Verify the mapping contains the expected entries
    expect(mapping).toBeDefined();
    expect(typeof mapping).toBe("object");
    
    // Check for the default mappings from config.ts
    expect(mapping["/login"]).toBe("loginPage");
    expect(mapping["/home"]).toBe("homePage");
    expect(mapping["/checkout"]).toBe("checkoutPage");
  });

  /**
   * Property 17: Configuration Default Values (Page Object Model)
   * Feature: pattern-locator-integration, Property 17: Configuration Default Values
   * 
   * For any configuration key (patternIq.retryTimeout, patternIq.retryInterval, 
   * patternIq.config for default page object, etc.), when no value is explicitly set, 
   * the Config_Manager should provide a sensible default value that allows the system 
   * to function correctly.
   * 
   * Validates: Requirements 6.5, 6.9
   */
  test("Property 17: Configuration Default Values (Page Object Model)", () => {
    fc.assert(
      fc.property(
        fc.record({
          // Generate configuration keys to test
          configKey: fc.constantFrom(
            "patternIq.enable",
            "patternIq.config",
            "patternIq.retryTimeout",
            "patternIq.retryInterval",
            "patternIq.pageMapping./login",
            "patternIq.pageMapping./home",
            "patternIq.pageMapping./checkout"
          ),
          
          // Whether to provide explicit value
          provideExplicitValue: fc.boolean()
        }),
        (testData) => {
          // Initialize vars with or without explicit config
          if (testData.provideExplicitValue) {
            // Skip this test case - we're testing defaults when no value is set
            return true;
          }
          
          // Initialize vars to load defaults
          initVars();
          
          // Get the configuration value
          const configValue = getValue(`config.${testData.configKey}`, true);
          
          // Verify that a default value exists
          if (configValue === "" || configValue === `config.${testData.configKey}`) {
            // No default value found - this should not happen for these keys
            return false;
          }
          
          // Verify the default values are sensible based on the key
          switch (testData.configKey) {
            case "patternIq.enable":
              // Should be a boolean value (stored as string)
              return configValue === "true" || configValue === "false";
              
            case "patternIq.config":
              // Should be a non-empty string (pattern code)
              return configValue.length > 0 && typeof configValue === "string";
              
            case "patternIq.retryTimeout":
              // Should be a positive number (stored as string)
              const timeout = parseInt(configValue, 10);
              return !isNaN(timeout) && timeout > 0 && timeout <= 60000;
              
            case "patternIq.retryInterval":
              // Should be a positive number (stored as string)
              const interval = parseInt(configValue, 10);
              return !isNaN(interval) && interval > 0 && interval <= 10000;
              
            case "patternIq.pageMapping./login":
              // Should map to loginPage
              return configValue === "loginPage";
              
            case "patternIq.pageMapping./home":
              // Should map to homePage
              return configValue === "homePage";
              
            case "patternIq.pageMapping./checkout":
              // Should map to checkoutPage
              return configValue === "checkoutPage";
              
            default:
              return true;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 18: Environment Variable Override
   * Feature: pattern-locator-integration, Property 18: Environment Variable Override
   * 
   * For any configuration value, when an environment variable with the corresponding 
   * key is set, the Config_Manager should use the environment variable value instead 
   * of the value from the configuration file.
   * 
   * Validates: Requirements 6.7
   */
  test("Property 18: Environment Variable Override", () => {
    fc.assert(
      fc.property(
        fc.record({
          // Generate configuration keys to test
          configKey: fc.constantFrom(
            "patternIq.enable",
            "patternIq.config",
            "patternIq.retryTimeout",
            "patternIq.retryInterval"
          ),
          
          // Generate override values
          overrideValue: fc.oneof(
            fc.constant("true"),
            fc.constant("false"),
            fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{2,15}$/),
            fc.integer({ min: 1000, max: 60000 }).map(n => n.toString())
          )
        }),
        (testData) => {
          // Set environment variable
          const envKey = `config.${testData.configKey}`;
          const originalEnvValue = process.env[envKey];
          process.env[envKey] = testData.overrideValue;
          
          try {
            // Reinitialize vars to pick up environment variable
            initVars();
            
            // Get the configuration value
            const configValue = getValue(envKey, true);
            
            // Verify that the environment variable value is used
            const envOverrideWorks = configValue === testData.overrideValue;
            
            // Clean up environment variable
            if (originalEnvValue !== undefined) {
              process.env[envKey] = originalEnvValue;
            } else {
              delete process.env[envKey];
            }
            
            return envOverrideWorks;
          } catch (error) {
            // Clean up on error
            if (originalEnvValue !== undefined) {
              process.env[envKey] = originalEnvValue;
            } else {
              delete process.env[envKey];
            }
            return false;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4: Variable Substitution in Patterns
   * Feature: pattern-locator-integration, Property 4: Variable Substitution in Patterns
   * 
   * For any pattern template containing variable placeholders (e.g., "#{loc.auto.fieldName}"), 
   * when runtime variables are set, the Config_Manager should replace all placeholders with 
   * their corresponding values, producing a concrete locator string.
   * 
   * Validates: Requirements 1.6, 2.7
   */
  test("Property 4: Variable Substitution in Patterns", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("xpath", "css", "mixed").chain(patternType => {
          // Base generators for all pattern types
          const fieldNameGen = fc.string({ minLength: 1, maxLength: 20 }).filter(s => 
            s.trim().length > 0 && !s.includes("{") && !s.includes("}")
          );
          const fieldInstanceGen = fc.integer({ min: 1, max: 10 }).map(n => n.toString());
          
          // For "mixed" pattern type, locationName and sectionName are required
          if (patternType === "mixed") {
            return fc.tuple(
              fieldNameGen,
              fieldInstanceGen,
              fc.string({ minLength: 1, maxLength: 15 }).filter(s => 
                s.trim().length > 0 && !s.includes("{") && !s.includes("}")
              ),
              fc.string({ minLength: 1, maxLength: 15 }).filter(s => 
                s.trim().length > 0 && !s.includes("{") && !s.includes("}")
              )
            ).map(([fieldName, fieldInstance, locationName, sectionName]) => ({
              fieldName,
              fieldInstance,
              locationName,
              sectionName,
              patternType
            }));
          } else {
            // For other pattern types, locationName and sectionName are optional
            return fc.tuple(
              fieldNameGen,
              fieldInstanceGen,
              fc.option(
                fc.string({ minLength: 1, maxLength: 15 }).filter(s => 
                  s.trim().length > 0 && !s.includes("{") && !s.includes("}")
                ),
                { nil: undefined }
              ),
              fc.option(
                fc.string({ minLength: 1, maxLength: 15 }).filter(s => 
                  s.trim().length > 0 && !s.includes("{") && !s.includes("}")
                ),
                { nil: undefined }
              )
            ).map(([fieldName, fieldInstance, locationName, sectionName]) => ({
              fieldName,
              fieldInstance,
              locationName,
              sectionName,
              patternType
            }));
          }
        }),
        (testData) => {
          // Initialize vars
          initVars();
          
          // Set runtime variables
          setValue("loc.auto.fieldName", testData.fieldName);
          setValue("loc.auto.fieldInstance", testData.fieldInstance);
          
          if (testData.locationName) {
            setValue("loc.auto.location.name", testData.locationName);
          }
          
          if (testData.sectionName) {
            setValue("loc.auto.section.name", testData.sectionName);
          }
          
          // Create pattern templates with placeholders
          let patternTemplate: string;
          let usesFieldInstance = false;
          let usesLocationName = false;
          let usesSectionName = false;
          
          switch (testData.patternType) {
            case "xpath":
              patternTemplate = `//input[@placeholder='#{loc.auto.fieldName}'][#{loc.auto.fieldInstance}]`;
              usesFieldInstance = true;
              break;
            case "css":
              patternTemplate = `input[placeholder='#{loc.auto.fieldName}']:nth-of-type(#{loc.auto.fieldInstance})`;
              usesFieldInstance = true;
              break;
            case "mixed":
              patternTemplate = `//div[@class='#{loc.auto.location.name}']//section[@id='#{loc.auto.section.name}']//input[@name='#{loc.auto.fieldName}']`;
              usesLocationName = true;
              usesSectionName = true;
              break;
          }
          
          // Perform variable substitution
          const resolvedPattern = replaceVariables(patternTemplate);
          
          // Verify that all placeholders are replaced
          const hasUnresolvedPlaceholders = resolvedPattern.includes("#{");
          if (hasUnresolvedPlaceholders) {
            // Check if the unresolved placeholders are for optional variables
            const unresolvedVars = resolvedPattern.match(/\#\{([^}]+)\}/g);
            if (unresolvedVars) {
              for (const unresolvedVar of unresolvedVars) {
                const varName = unresolvedVar.slice(2, -1); // Remove #{ and }
                // If it's an optional variable that wasn't set, that's okay
                if (varName === "loc.auto.location.name" && !testData.locationName) continue;
                if (varName === "loc.auto.section.name" && !testData.sectionName) continue;
                // Otherwise, it's an error
                return false;
              }
            }
          }
          
          // Verify that required variables are substituted correctly
          // Only check for variables that are actually used in the pattern template
          if (!resolvedPattern.includes(testData.fieldName)) return false;
          if (usesFieldInstance && !resolvedPattern.includes(testData.fieldInstance)) return false;
          
          // Verify optional variables are substituted if they were set and used
          if (usesLocationName && testData.locationName) {
            if (!resolvedPattern.includes(testData.locationName)) return false;
          }
          
          if (usesSectionName && testData.sectionName) {
            if (!resolvedPattern.includes(testData.sectionName)) return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
