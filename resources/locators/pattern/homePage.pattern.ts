/**
 * Home Page Pattern Configuration
 * 
 * This file contains locator patterns specific to the home page.
 * Patterns use runtime variable substitution for dynamic locator generation.
 * 
 * AVAILABLE RUNTIME VARIABLES:
 * 
 * #{loc.auto.fieldName}
 *   - The field name exactly as provided in the test
 *   - Example: If test uses "Products", this becomes "Products"
 * 
 * #{loc.auto.fieldName.toLowerCase}
 *   - Lowercase version of the field name
 *   - Example: If test uses "Products", this becomes "products"
 *   - Useful for matching data-testid and other lowercase attributes
 * 
 * #{loc.auto.forId}
 *   - Extracted "for" attribute from associated label element
 *   - Used for label-based resolution (input, select, textarea)
 *   - Example: <label for="search-box">Search</label> → "search-box"
 * 
 * #{loc.auto.fieldInstance}
 *   - Element instance number (default: "1")
 *   - Example: "View Details[2]" → fieldInstance = "2"
 * 
 * #{loc.auto.location.name}
 *   - Location name from field string
 *   - Example: "{{Header}} Search" → "Header"
 * 
 * #{loc.auto.location.value}
 *   - Location value from field string (if specified)
 *   - Example: "{{region:: header}} Button" → "header"
 * 
 * #{loc.auto.section.name}
 *   - Section name from field string
 *   - Example: "{Navigation} Home" → "Navigation"
 * 
 * #{loc.auto.section.value}
 *   - Section value from field string (if specified)
 *   - Example: "{nav:: main} Link" → "main"
 * 
 * PATTERN SYNTAX:
 * - Use semicolons (;) to separate multiple fallback patterns
 * - Patterns are tried in order until a visible element is found
 * - Mix XPath and CSS selectors for better compatibility
 * - Order patterns from most specific to least specific
 * 
 * EXAMPLE USAGE IN TESTS:
 * - await clickLink(page, 'Products');
 * - await fill(page, '{Hero Section} Search', 'laptop');
 * - await clickButton(page, '{{Navigation}} Shop Now');
 */

export const homePage = {
  // Direct field mappings for home page elements
  getStartedButton: "//button[@data-testid='get-started'];//button[contains(text(), 'Get Started')];button[data-testid='get-started'];button:has-text('Get Started')",
  
  learnMoreButton: "//button[@data-testid='learn-more'];//button[contains(text(), 'Learn More')];button[data-testid='learn-more'];button:has-text('Learn More')",
  
  exploreButton: "//button[@data-testid='explore'];//button[contains(text(), 'Explore')];button[data-testid='explore'];button:has-text('Explore')",
  
  discoverButton: "//button[@data-testid='discover'];//button[contains(text(), 'Discover')];button[data-testid='discover'];button:has-text('Discover')",
  
  searchInput: "//input[@data-testid='search'];//input[@placeholder='Search'];//input[@aria-label='Search'];input[data-testid='search'];input[placeholder='Search']",
  
  homeLink: "//nav//a[@data-nav='home'];//nav//a[text()='Home'];nav a[data-nav='home'];nav a:text('Home')",
  
  productsLink: "//nav//a[@data-nav='products'];//nav//a[text()='Products'];nav a[data-nav='products'];nav a:text('Products')",
  
  aboutLink: "//nav//a[@data-nav='about'];//nav//a[text()='About'];nav a[data-nav='about'];nav a:text('About')",
  
  checkoutLink: "//nav//a[@data-nav='checkout'];//nav//a[text()='Checkout'];nav a[data-nav='checkout'];nav a:text('Checkout')",
  
  loginLink: "//nav//a[@data-nav='login'];//nav//a[text()='Logout'];nav a[data-nav='login'];nav a:text('Logout')",
  
  electronicsTab: "//button[@role='tab'][@data-tab='electronics'];//button[@role='tab'][text()='Electronics'];button[role='tab'][data-tab='electronics']",
  
  clothingTab: "//button[@role='tab'][@data-tab='clothing'];//button[@role='tab'][text()='Clothing'];button[role='tab'][data-tab='clothing']",
  
  booksTab: "//button[@role='tab'][@data-tab='books'];//button[@role='tab'][text()='Books'];button[role='tab'][data-tab='books']",
  
  heroSection: "//section[@class='hero'];//section[@id='hero'];section.hero;section#hero",
  
  featuresSection: "//section[@class='features'];//section[@id='features'];section.features;section#features",
  
  fields: {
    // Button patterns for home page (using data-testid attributes)
    button: "//button[@data-testid='#{loc.auto.fieldName.toLowerCase}'];//button[contains(@class, 'btn')][contains(text(), '#{loc.auto.fieldName}')];button[data-testid='#{loc.auto.fieldName.toLowerCase}'];button.btn:has-text('#{loc.auto.fieldName}')",
    
    // Link patterns for home page navigation
    link: "//nav//a[text()='#{loc.auto.fieldName}'];//a[@data-nav='#{loc.auto.fieldName.toLowerCase}'];//a[contains(text(), '#{loc.auto.fieldName}')];nav a:text('#{loc.auto.fieldName}');a[data-nav='#{loc.auto.fieldName.toLowerCase}']",
    
    // Text patterns for home page content
    text: "//h1[contains(text(), '#{loc.auto.fieldName}')];//h2[contains(text(), '#{loc.auto.fieldName}')];//p[contains(text(), '#{loc.auto.fieldName}')];h1:has-text('#{loc.auto.fieldName}');h2:has-text('#{loc.auto.fieldName}')",
    
    // Header patterns for home page
    header: "//h1[text()='#{loc.auto.fieldName}'];//h2[text()='#{loc.auto.fieldName}'];//h3[text()='#{loc.auto.fieldName}'];h1:text('#{loc.auto.fieldName}');h2:text('#{loc.auto.fieldName}')",
    
    // Input patterns for home page (e.g., search box)
    input: "//input[@placeholder='#{loc.auto.fieldName}'];//input[@aria-label='#{loc.auto.fieldName}'];//input[@data-testid='#{loc.auto.fieldName.toLowerCase}'];input[placeholder='#{loc.auto.fieldName}'];input[aria-label='#{loc.auto.fieldName}']",
    
    // Tab patterns for home page
    tab: "//button[@role='tab'][text()='#{loc.auto.fieldName}'];//div[@role='tab'][contains(text(), '#{loc.auto.fieldName}')];button[role='tab']:has-text('#{loc.auto.fieldName}')"
  },
  
  // Sections specific to home page
  sections: {
    "Navigation": "//nav[@class='main-nav'];//nav[@id='primary-nav'];nav.main-nav;nav#primary-nav",
    "Hero Section": "//section[@class='hero'];//div[@id='hero'];section.hero;div#hero",
    "Features": "//section[@class='features'];//div[@id='features'];section.features;div#features",
    "Footer": "//footer;//div[@class='footer'];footer;div.footer",
    "Sidebar": "//aside[@class='sidebar'];//div[@id='sidebar'];aside.sidebar;div#sidebar"
  },
  
  // Locations specific to home page
  locations: {
    "Main Content": "//div[@id='content'];//main[@class='main-content'];div#content;main.main-content",
    "Header": "//header[@class='site-header'];//div[@id='header'];header.site-header;div#header",
    "Banner": "//div[@class='banner'];//section[@id='banner'];div.banner;section#banner"
  },
  
  // Scroll patterns for lazy-loaded content on home page
  scroll: "//div[@class='content-wrapper'];div.content-wrapper;//main;main"
};
