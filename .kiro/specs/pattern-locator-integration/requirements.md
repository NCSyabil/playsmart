# Requirements Document: Pattern-Based Locator System Integration

## Introduction

This document specifies the requirements for integrating a sophisticated pattern-based locator system into the existing Playwright TypeScript automation framework. The pattern system provides centralized locator management, dynamic locator generation at runtime, automatic fallback mechanisms, and intelligent element resolution strategies. This integration will enhance the framework's maintainability, reduce locator brittleness, and improve test reliability across different application versions and environments.

## Glossary

- **Pattern_System**: The centralized locator management system that uses template-based patterns to dynamically generate element locators at runtime
- **Pattern_Template**: A reusable locator template that contains placeholders for dynamic values (e.g., field names, section names, location names)
- **Pattern_Engine**: The core resolution engine (patternIqEngine.ts) that processes pattern templates and generates concrete locators
- **Locator_Resolver**: The webLocResolver function that determines which locator strategy to use (static, pattern-based, or SmartAI)
- **Field_Name**: The logical name of a UI element (e.g., "Username", "Email", "Submit Button")
- **Section**: A logical grouping or container within a page (e.g., "Login Form", "Header", "Footer")
- **Location**: A higher-level page context or region (e.g., "Main Content", "Sidebar", "Modal Dialog")
- **Pattern_Configuration**: A named set of pattern templates stored in pattern files (e.g., "uportalOb.pattern.ts")
- **Fallback_Mechanism**: The automatic retry logic that attempts multiple locator patterns when the first pattern fails
- **Label_Resolution**: The strategy of finding input elements by first locating their associated label elements
- **Chained_Locator**: A locator that combines multiple selectors using the ">>" separator to traverse DOM hierarchy
- **Static_Locator**: Traditional hard-coded locators stored in TypeScript files (e.g., letcode.loc.ts)
- **Dynamic_Locator**: Locators generated at runtime by the Pattern_System based on field names and pattern templates
- **Locator_Cache**: An in-memory storage mechanism that caches resolved locators to improve performance
- **Pattern_Code**: A unique identifier for a pattern configuration set (e.g., "uportalOb", "default")
- **WebActions**: The existing action layer (webActions.ts) that provides high-level interaction methods
- **Config_Manager**: The configuration management system that stores and retrieves pattern configurations and settings

## Requirements

### Requirement 1: Pattern Configuration Management (Page Object Model)

**User Story:** As a test automation engineer, I want to define and manage pattern templates in page-specific configuration files following the page object model pattern, so that I can organize locator strategies by page and maintain them independently.

#### Acceptance Criteria

1. THE Config_Manager SHALL load pattern templates from TypeScript files in the "resources/locators/pattern" directory
2. WHEN a pattern file is named with the ".pattern.ts" suffix, THE Config_Manager SHALL automatically discover and load it during initialization
3. THE Config_Manager SHALL support multiple pattern configurations where each file represents a page object with its own unique Pattern_Code
4. WHEN a pattern configuration is loaded, THE Config_Manager SHALL flatten nested configuration objects into dot-notation keys (e.g., "pattern.loginPage.fields.button")
5. THE Config_Manager SHALL store pattern configurations in an in-memory key-value store accessible via the vars module
6. WHEN a pattern template contains variable placeholders (e.g., "#{loc.auto.fieldName}"), THE Config_Manager SHALL support variable substitution at runtime
7. THE Config_Manager SHALL support environment-specific pattern overrides through configuration files
8. WHEN multiple pattern files define the same Pattern_Code, THE Config_Manager SHALL use the last loaded configuration
9. THE Config_Manager SHALL allow each page object pattern file to define its own fields, locations, sections, and scroll patterns independently
10. WHEN tests interact with a specific page, THE Config_Manager SHALL allow selection of the corresponding page object pattern configuration

### Requirement 2: Pattern Template Structure (Page Object Model)

**User Story:** As a test automation engineer, I want to define pattern templates with support for field types, sections, and locations within each page object, so that I can create flexible locator strategies that are specific to each page's structure.

#### Acceptance Criteria

1. THE Pattern_Template SHALL support field type definitions for common UI elements (button, input, link, select, checkbox, radio, text, header, tab) within each page object
2. WHEN a field type pattern is defined in a page object, THE Pattern_Template SHALL support multiple fallback locator strategies separated by semicolons
3. THE Pattern_Template SHALL support location patterns that define page regions or containers specific to that page
4. THE Pattern_Template SHALL support section patterns that define logical groupings within locations specific to that page
5. THE Pattern_Template SHALL support scroll patterns that define scrollable containers for lazy-loaded content specific to that page
6. WHEN a pattern template is defined, THE Pattern_Template SHALL support both XPath and CSS selector syntax
7. THE Pattern_Template SHALL support placeholder variables that are replaced at runtime (e.g., "#{loc.auto.fieldName}", "#{loc.auto.fieldInstance}")
8. THE Pattern_Template SHALL support label-based element resolution for input, select, and textarea elements
9. WHEN a page object pattern file is created, THE Pattern_Template SHALL allow the file to define only the patterns relevant to that specific page
10. THE Pattern_Template SHALL support inheritance or composition patterns where common field types can be shared across multiple page objects

### Requirement 3: Dynamic Locator Resolution (Page Object Context)

**User Story:** As a test automation engineer, I want the system to dynamically resolve locators at runtime based on field names, pattern templates, and the current page context, so that I can write tests using logical element names that are automatically scoped to the correct page object.

#### Acceptance Criteria

1. WHEN a test specifies a Field_Name (e.g., "Username"), THE Pattern_Engine SHALL resolve it to a concrete locator using the active page object pattern configuration
2. WHEN a Field_Name includes a Section (e.g., "{Login Form} Username"), THE Pattern_Engine SHALL apply section-scoped locator resolution within the current page object
3. WHEN a Field_Name includes a Location (e.g., "{{Main Content}} {Login Form} Username"), THE Pattern_Engine SHALL apply location-scoped locator resolution within the current page object
4. WHEN a Field_Name includes an instance number (e.g., "Submit Button[2]"), THE Pattern_Engine SHALL resolve to the nth matching element
5. THE Pattern_Engine SHALL support chained locators using the ">>" separator for complex DOM traversal
6. WHEN multiple pattern templates are defined for a field type in a page object, THE Pattern_Engine SHALL attempt each pattern in sequence until a visible element is found
7. THE Pattern_Engine SHALL set runtime variables (e.g., "loc.auto.fieldName", "loc.auto.fieldInstance") for use in pattern templates
8. WHEN label resolution is enabled for eligible elements, THE Pattern_Engine SHALL first locate the label element and extract its "for" attribute to find the target input element
9. WHEN a test navigates to a different page, THE Pattern_Engine SHALL allow switching to the corresponding page object pattern configuration
10. THE Pattern_Engine SHALL support explicit page object selection through configuration or test context

### Requirement 4: Fallback and Retry Mechanism

**User Story:** As a test automation engineer, I want the system to automatically retry locator resolution with different strategies and scroll the page to reveal lazy-loaded elements, so that tests are more resilient to timing issues and dynamic content.

#### Acceptance Criteria

1. WHEN a locator pattern fails to find a visible element, THE Pattern_Engine SHALL retry with the next pattern in the fallback sequence
2. WHEN all patterns fail on the first attempt, THE Pattern_Engine SHALL scroll the page to reveal lazy-loaded content
3. THE Pattern_Engine SHALL retry locator resolution at configurable intervals (default: 2000ms) until the timeout is reached (default: 30000ms)
4. WHEN a scroll pattern is defined in the configuration, THE Pattern_Engine SHALL scroll specific containers instead of the entire page
5. WHEN an element is found but not visible, THE Pattern_Engine SHALL continue to the next pattern or retry after scrolling
6. THE Pattern_Engine SHALL stop retrying and return a valid locator as soon as a visible element is found
7. WHEN the timeout is reached without finding a visible element, THE Pattern_Engine SHALL return an empty locator and log a warning message
8. THE Pattern_Engine SHALL wait for the page load state to be "load" before attempting locator resolution

### Requirement 5: Integration with Existing Locator Resolver (Page Object Support)

**User Story:** As a test automation engineer, I want the pattern system to integrate seamlessly with the existing locator resolution mechanism and support page object pattern selection, so that I can use page-specific pattern-based locators alongside static locators without breaking existing tests.

#### Acceptance Criteria

1. THE Locator_Resolver SHALL check if pattern-based resolution is enabled via the "patternIq.enable" configuration flag
2. WHEN pattern-based resolution is enabled and a Field_Name is provided, THE Locator_Resolver SHALL delegate to the Pattern_Engine with the current page object context
3. WHEN a locator string starts with "xpath=", "css=", or "chain=", THE Locator_Resolver SHALL bypass pattern resolution and return a direct Playwright locator
4. WHEN a locator string starts with "loc.ts." or "loc.json.", THE Locator_Resolver SHALL use the existing static locator resolution mechanism
5. WHEN a locator string is a raw XPath (starts with "//") or CSS selector, THE Locator_Resolver SHALL return a direct Playwright locator
6. THE Locator_Resolver SHALL support an override pattern parameter that allows tests to specify a different page object Pattern_Code for specific actions
7. WHEN the override pattern is "-no-check-", THE Locator_Resolver SHALL skip all locator resolution and return undefined
8. THE Locator_Resolver SHALL maintain backward compatibility with all existing locator formats
9. THE Locator_Resolver SHALL support automatic page object detection based on the current page URL or test context
10. THE Locator_Resolver SHALL allow explicit page object selection through the pattern override parameter

### Requirement 6: Configuration and Setup (Page Object Model)

**User Story:** As a test automation engineer, I want to configure the pattern system through environment variables and configuration files with support for page object selection, so that I can customize behavior for different environments, projects, and pages.

#### Acceptance Criteria

1. THE Config_Manager SHALL support a "patternIq.enable" configuration flag to enable or disable pattern-based resolution
2. THE Config_Manager SHALL support a "patternIq.config" configuration value that specifies the default page object Pattern_Code to use
3. THE Config_Manager SHALL support a "patternIq.retryTimeout" configuration value that specifies the maximum time to retry locator resolution (default: 30000ms)
4. THE Config_Manager SHALL support a "patternIq.retryInterval" configuration value that specifies the interval between retry attempts (default: 2000ms)
5. WHEN configuration values are not set, THE Config_Manager SHALL use sensible default values
6. THE Config_Manager SHALL load configuration values from the resources/config.ts file
7. THE Config_Manager SHALL support environment variable overrides for all configuration values
8. THE Config_Manager SHALL initialize pattern configurations during framework startup before any tests execute
9. THE Config_Manager SHALL support page object mapping configuration that associates page URLs or identifiers with Pattern_Code values
10. THE Config_Manager SHALL allow tests to specify the active page object through configuration or context variables

### Requirement 7: WebActions Integration (Page Object Context)

**User Story:** As a test automation engineer, I want all existing WebActions methods to support page object pattern-based locators, so that I can use logical field names scoped to specific pages in all interaction methods without code changes.

#### Acceptance Criteria

1. WHEN a WebActions method receives a Field_Name string, THE WebActions method SHALL pass it to the Locator_Resolver for pattern-based resolution with the current page object context
2. THE WebActions methods SHALL support an optional "pattern" parameter in the options object to override the default page object Pattern_Code
3. THE WebActions methods SHALL support passing a Playwright Locator object directly to bypass pattern resolution
4. WHEN pattern resolution is enabled, THE WebActions methods SHALL resolve locators before performing actions (click, fill, select, etc.) using the appropriate page object configuration
5. THE WebActions methods SHALL maintain all existing functionality for static locators and direct Playwright locators
6. THE WebActions methods SHALL pass the element type (button, input, link, etc.) to the Locator_Resolver to select appropriate pattern templates from the page object
7. THE WebActions methods SHALL support the "smartIQ_refreshLoc" parameter for dynamic locator refresh scenarios
8. THE WebActions methods SHALL log resolved locator information including the page object used for debugging purposes
9. THE WebActions methods SHALL support automatic page object context switching when navigating between pages
10. THE WebActions methods SHALL allow explicit page object selection through the pattern parameter for cross-page element interactions

### Requirement 8: Error Handling and Logging

**User Story:** As a test automation engineer, I want comprehensive error messages and logging when locator resolution fails, so that I can quickly diagnose and fix locator issues.

#### Acceptance Criteria

1. WHEN a pattern configuration file is not found, THE Config_Manager SHALL log a warning and continue with available configurations
2. WHEN a Pattern_Code is specified but not found in the configuration, THE Pattern_Engine SHALL throw an error with a descriptive message
3. WHEN locator resolution times out, THE Pattern_Engine SHALL log the attempted patterns and the reason for failure
4. THE Pattern_Engine SHALL log each locator pattern attempt during the resolution process
5. THE Pattern_Engine SHALL log when scrolling occurs to reveal lazy-loaded content
6. WHEN a valid locator is found, THE Pattern_Engine SHALL log the successful pattern and the resolved locator string
7. THE Pattern_Engine SHALL log when label resolution is performed and the extracted "for" attribute value
8. WHEN the page is closed during locator resolution, THE Pattern_Engine SHALL detect this condition and return gracefully with a warning

### Requirement 9: Performance Optimization

**User Story:** As a test automation engineer, I want the pattern system to perform efficiently without adding significant overhead to test execution, so that tests run quickly and reliably.

#### Acceptance Criteria

1. THE Pattern_Engine SHALL wait for the page load state only once at the start of locator resolution
2. THE Pattern_Engine SHALL evaluate chained locators in a single page.evaluate() call to minimize context switches
3. THE Pattern_Engine SHALL cache pattern template lookups within a single resolution attempt
4. THE Pattern_Engine SHALL reset global variables after each locator resolution to prevent state leakage
5. THE Pattern_Engine SHALL use efficient DOM query methods (querySelector, XPath evaluation) for element lookup
6. THE Pattern_Engine SHALL short-circuit the fallback loop as soon as a visible element is found
7. THE Pattern_Engine SHALL limit scroll attempts to a maximum of 10 iterations per retry cycle
8. THE Pattern_Engine SHALL use configurable retry intervals to balance responsiveness and performance

### Requirement 10: Testing and Validation

**User Story:** As a test automation engineer, I want comprehensive tests that validate the pattern system functionality, so that I can be confident the system works correctly across different scenarios.

#### Acceptance Criteria

1. THE test suite SHALL include unit tests for pattern template parsing and variable substitution
2. THE test suite SHALL include unit tests for the locator resolution algorithm with various field name formats
3. THE test suite SHALL include integration tests that validate pattern-based locator resolution on real web pages
4. THE test suite SHALL include tests for fallback mechanism behavior when primary patterns fail
5. THE test suite SHALL include tests for label resolution with input, select, and textarea elements
6. THE test suite SHALL include tests for chained locator resolution with location and section scoping
7. THE test suite SHALL include tests for configuration loading and pattern file discovery
8. THE test suite SHALL include tests for backward compatibility with existing static locators
9. THE test suite SHALL include tests for error handling when patterns are not found or misconfigured
10. THE test suite SHALL include performance tests to ensure locator resolution completes within acceptable timeframes
