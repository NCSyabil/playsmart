/**
 * [PAGE NAME] Pattern Configuration Template
 * 
 * This template helps you create new page object pattern files.
 * Replace [PAGE NAME] with your actual page name (e.g., "Product Page", "Profile Page").
 * 
 * INSTRUCTIONS:
 * 1. Copy this file and rename it to {pageName}.pattern.ts (e.g., productPage.pattern.ts)
 * 2. Update the export name to match the file name (e.g., export const productPage)
 * 3. Define patterns for each element type your page uses
 * 4. Define sections that represent logical groupings on your page
 * 5. Define locations that represent major page regions
 * 6. Optionally define scroll patterns for lazy-loaded content
 * 7. Delete this template file or keep it for reference
 * 
 * AVAILABLE RUNTIME VARIABLES:
 * 
 * #{loc.auto.fieldName}
 *   - The field name exactly as provided in the test
 *   - Example: If test uses "Submit", this becomes "Submit"
 * 
 * #{loc.auto.fieldName.toLowerCase}
 *   - Lowercase version of the field name
 *   - Example: If test uses "Submit", this becomes "submit"
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
 *   - Example: "{{Main Content}} Button" → "Main Content"
 * 
 * #{loc.auto.location.value}
 *   - Location value from field string (if specified)
 *   - Example: "{{region:: main}} Button" → "main"
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
 * - First pattern should be most specific, last should be most generic
 * 
 * BEST PRACTICES:
 * - Always provide both XPath and CSS alternatives
 * - Use lowercase variables for HTML attributes (name, id, etc.)
 * - Include label patterns for form elements (enables label-based resolution)
 * - Test patterns independently before integration
 * - Document complex or non-obvious patterns with comments
 * - Keep patterns maintainable and readable
 */

// TODO: Replace 'templatePage' with your actual page name (e.g., productPage, profilePage)
export const templatePage = {
  fields: {
    // Button patterns - for clickable buttons
    // Common attributes: text content, aria-label, data-testid, class
    button: "//button[text()='#{loc.auto.fieldName}'];" +
            "//button[@aria-label='#{loc.auto.fieldName}'];" +
            "//button[@data-testid='#{loc.auto.fieldName.toLowerCase}'];" +
            "button:has-text('#{loc.auto.fieldName}');" +
            "button[aria-label='#{loc.auto.fieldName}']",
    
    // Input field patterns - for text inputs, email, password, etc.
    // Label-based resolution will try label patterns first, then these
    input: "//input[@id='#{loc.auto.forId}'];" +
           "//input[@placeholder='#{loc.auto.fieldName}'];" +
           "//input[@name='#{loc.auto.fieldName.toLowerCase}'];" +
           "input[id='#{loc.auto.forId}'];" +
           "input[placeholder='#{loc.auto.fieldName}']",
    
    // Link patterns - for anchor tags
    link: "//a[text()='#{loc.auto.fieldName}'];" +
          "//a[@title='#{loc.auto.fieldName}'];" +
          "//a[contains(text(), '#{loc.auto.fieldName}')];" +
          "a:has-text('#{loc.auto.fieldName}');" +
          "a[title='#{loc.auto.fieldName}']",
    
    // Select dropdown patterns
    select: "//select[@name='#{loc.auto.fieldName.toLowerCase}'];" +
            "//select[@id='#{loc.auto.fieldName.toLowerCase}'];" +
            "select[name='#{loc.auto.fieldName.toLowerCase}']",
    
    // Checkbox patterns
    checkbox: "//input[@type='checkbox'][@name='#{loc.auto.fieldName.toLowerCase}'];" +
              "//input[@type='checkbox'][@id='#{loc.auto.fieldName.toLowerCase}'];" +
              "input[type='checkbox'][name='#{loc.auto.fieldName.toLowerCase}']",
    
    // Radio button patterns
    radio: "//input[@type='radio'][@value='#{loc.auto.fieldName.toLowerCase}'];" +
           "//input[@type='radio'][@name='payment-method'][@value='#{loc.auto.fieldName.toLowerCase}'];" +
           "input[type='radio'][value='#{loc.auto.fieldName.toLowerCase}']",
    
    // Text patterns - for verifying text content
    text: "//*[text()='#{loc.auto.fieldName}'];" +
          "//span[contains(text(), '#{loc.auto.fieldName}')];" +
          "//p[contains(text(), '#{loc.auto.fieldName}')];" +
          "//div[contains(text(), '#{loc.auto.fieldName}')]",
    
    // Header patterns - for h1, h2, h3, etc.
    header: "//h1[text()='#{loc.auto.fieldName}'];" +
            "//h2[text()='#{loc.auto.fieldName}'];" +
            "//h3[text()='#{loc.auto.fieldName}'];" +
            "h1:text('#{loc.auto.fieldName}');" +
            "h2:text('#{loc.auto.fieldName}')",
    
    // Label patterns - IMPORTANT for label-based resolution
    // These are tried first for input, select, and textarea elements
    label: "//label[text()='#{loc.auto.fieldName}'];" +
           "//label[contains(text(), '#{loc.auto.fieldName}')];" +
           "//label[normalize-space(text())='#{loc.auto.fieldName}'];" +
           "label:has-text('#{loc.auto.fieldName}')",
    
    // Tab patterns - for tab navigation
    tab: "//button[@role='tab'][text()='#{loc.auto.fieldName}'];" +
         "//div[@role='tab'][contains(text(), '#{loc.auto.fieldName}')];" +
         "button[role='tab']:has-text('#{loc.auto.fieldName}')"
    
    // TODO: Add more element types specific to your page
    // Examples: card, tile, accordion, tooltip, badge, icon, etc.
  },
  
  sections: {
    // Define logical sections/containers on your page
    // Sections are used with syntax: {Section Name} Field Name
    // Example: await fill(page, '{Login Form} Username', 'john.doe');
    
    // TODO: Replace these examples with actual sections from your page
    "Main Form": "//form[@id='main'];//form[@class='main-form'];form#main;form.main-form",
    "Header": "//header;//div[@class='header'];header;div.header",
    "Footer": "//footer;//div[@class='footer'];footer;div.footer",
    "Sidebar": "//aside[@class='sidebar'];//div[@id='sidebar'];aside.sidebar;div#sidebar"
    
    // More examples:
    // "Navigation": "//nav[@class='main-nav'];nav.main-nav",
    // "Error Message": "//div[@class='error'];div.error;div[role='alert']",
    // "Success Message": "//div[@class='success'];div.success",
    // "Modal Dialog": "//div[@role='dialog'];div[role='dialog']"
  },
  
  locations: {
    // Define major page regions/areas
    // Locations are used with syntax: {{Location Name}} {Section Name} Field Name
    // Example: await fill(page, '{{Main Content}} {Form} Email', 'test@example.com');
    
    // TODO: Replace these examples with actual locations from your page
    "Main Content": "//main;//div[@id='content'];main;div#content",
    "Header Area": "//header;//div[@class='header'];header;div.header",
    "Footer Area": "//footer;//div[@class='footer'];footer;div.footer"
    
    // More examples:
    // "Left Panel": "//div[@class='left-panel'];div.left-panel",
    // "Right Panel": "//div[@class='right-panel'];div.right-panel",
    // "Modal Overlay": "//div[@class='modal-overlay'];div.modal-overlay"
  },
  
  // Optional: Define scroll patterns for lazy-loaded content
  // The system will scroll these containers when elements are not immediately visible
  // Use semicolons to separate multiple fallback scroll containers
  scroll: "//div[@class='scrollable'];div.scrollable;//main;main"
  
  // If your page doesn't have lazy-loaded content, you can omit the scroll property
  // or set it to scroll the main content area
};

/**
 * USAGE EXAMPLES:
 * 
 * Basic field:
 *   await fill(page, 'Username', 'john.doe');
 * 
 * Field with instance number:
 *   await clickButton(page, 'Submit[2]');  // Click second Submit button
 * 
 * Field within section:
 *   await fill(page, '{Main Form} Email', 'test@example.com');
 * 
 * Field within location and section:
 *   await clickButton(page, '{{Main Content}} {Main Form} Submit');
 * 
 * Explicit page object override:
 *   await fill(page, 'Username', 'john.doe', { pattern: 'templatePage' });
 * 
 * CONFIGURATION:
 * 
 * Add to resources/config.ts:
 * 
 * patternIq: {
 *   enable: true,
 *   config: "templatePage",  // Set as default page object
 *   pageMapping: {
 *     "/your-page-url": "templatePage"  // Map URL to this page object
 *   }
 * }
 */

