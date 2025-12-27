// Simple test script to verify pattern loading
const path = require('path');

// Set up environment
process.env.PLAYQ_CORE_ROOT = path.resolve(process.cwd(), "src");
process.env.PLAYQ_PROJECT_ROOT = process.cwd();

// Import vars module
const vars = require('./src/helper/bundle/vars');

console.log('\n=== Testing Pattern Loading ===\n');

// Get loaded pattern codes
const loadedCodes = vars.getLoadedPatternCodes();
console.log('Loaded pattern codes:', loadedCodes);

// Test each pattern file
const expectedPatterns = ['loginPage', 'homePage', 'checkoutPage', 'uportalOb'];

let allPassed = true;

expectedPatterns.forEach(patternCode => {
  console.log(`\nTesting pattern: ${patternCode}`);
  
  // Check if pattern is loaded
  const isLoaded = loadedCodes.includes(patternCode);
  console.log(`  - Is loaded: ${isLoaded ? '✓' : '✗'}`);
  
  if (!isLoaded) {
    allPassed = false;
    return;
  }
  
  // Check if pattern entries are accessible
  const buttonKey = `pattern.${patternCode}.fields.button`;
  const buttonValue = vars.getValue(buttonKey, true);
  const hasButton = buttonValue !== "" && buttonValue !== buttonKey;
  console.log(`  - Has button pattern: ${hasButton ? '✓' : '✗'}`);
  
  if (!hasButton) {
    allPassed = false;
  }
});

console.log(`\n=== Test Result: ${allPassed ? 'PASSED ✓' : 'FAILED ✗'} ===\n`);

process.exit(allPassed ? 0 : 1);
