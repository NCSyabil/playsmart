// Verification script for pattern files and structure
const path = require('path');
const fs = require('fs');

console.log('\n=== Pattern File Verification ===\n');

// 1. Verify pattern files exist
const patternDir = path.join(process.cwd(), 'resources', 'locators', 'pattern');
console.log('1. Checking pattern directory:', patternDir);

if (!fs.existsSync(patternDir)) {
  console.log('   ✗ Pattern directory does not exist');
  process.exit(1);
}
console.log('   ✓ Pattern directory exists\n');

// 2. List pattern files
const files = fs.readdirSync(patternDir);
const patternFiles = files.filter(f => f.endsWith('.pattern.ts'));

console.log('2. Found pattern files:');
patternFiles.forEach(f => console.log(`   - ${f}`));
console.log('');

// 3. Verify expected pattern files
const expectedPatterns = [
  { file: 'loginPage.pattern.ts', code: 'loginPage' },
  { file: 'homePage.pattern.ts', code: 'homePage' },
  { file: 'checkoutPage.pattern.ts', code: 'checkoutPage' },
  { file: 'uportalOb.pattern.ts', code: 'uportalOb' }
];

console.log('3. Verifying pattern file structure:\n');

let allPassed = true;

expectedPatterns.forEach(({ file, code }) => {
  console.log(`   Testing ${file}:`);
  
  const filePath = path.join(patternDir, file);
  
  // Check file exists
  const exists = fs.existsSync(filePath);
  console.log(`     - File exists: ${exists ? '✓' : '✗'}`);
  
  if (!exists) {
    allPassed = false;
    console.log('');
    return;
  }
  
  // Read file content
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Check for export default
  const hasExport = content.includes('export default');
  console.log(`     - Has export default: ${hasExport ? '✓' : '✗'}`);
  
  // Check for pageObject property
  const hasPageObject = content.includes('pageObject:');
  console.log(`     - Has pageObject property: ${hasPageObject ? '✓' : '✗'}`);
  
  // Check for fields property
  const hasFields = content.includes('fields:');
  console.log(`     - Has fields property: ${hasFields ? '✓' : '✗'}`);
  
  // Check pageObject value matches code
  const pageObjectMatch = content.match(/pageObject:\s*['\"]([^'\"]+)['\"]/);  
  const pageObjectValue = pageObjectMatch ? pageObjectMatch[1] : null;
  const pageObjectCorrect = pageObjectValue === code;
  console.log(`     - PageObject value correct (${pageObjectValue}): ${pageObjectCorrect ? '✓' : '✗'}`);
  
  // Check for at least one field type
  const hasButtonField = content.includes('button:');
  const hasInputField = content.includes('input:');
  const hasLinkField = content.includes('link:');
  const hasAnyField = hasButtonField || hasInputField || hasLinkField;
  console.log(`     - Has field definitions: ${hasAnyField ? '✓' : '✗'}`);
  
  if (!hasExport || !hasPageObject || !hasFields || !pageObjectCorrect || !hasAnyField) {
    allPassed = false;
  }
  
  console.log('');
});

// 4. Verify pattern engine exists
console.log('4. Verifying pattern engine:\n');

const enginePath = path.join(process.cwd(), 'engines', 'patternIq', 'patternIqEngine.ts');
const engineExists = fs.existsSync(enginePath);
console.log(`   - Pattern engine file exists: ${engineExists ? '✓' : '✗'}`);

if (engineExists) {
  const engineContent = fs.readFileSync(enginePath, 'utf-8');
  const hasPatternIqClass = engineContent.includes('class PatternIqEngine') || engineContent.includes('export class PatternIqEngine');
  const hasResolveMethod = engineContent.includes('resolveLocator');
  console.log(`   - Has PatternIqEngine class: ${hasPatternIqClass ? '✓' : '✗'}`);
  console.log(`   - Has resolveLocator method: ${hasResolveMethod ? '✓' : '✗'}`);
  
  if (!hasPatternIqClass || !hasResolveMethod) {
    allPassed = false;
  }
} else {
  allPassed = false;
}

console.log('');

// 5. Verify webLocFixture exists
console.log('5. Verifying locator resolver:\n');

const fixturePath = path.join(process.cwd(), 'src', 'helper', 'fixtures', 'webLocFixture.ts');
const fixtureExists = fs.existsSync(fixturePath);
console.log(`   - Locator fixture file exists: ${fixtureExists ? '✓' : '✗'}`);

if (fixtureExists) {
  const fixtureContent = fs.readFileSync(fixturePath, 'utf-8');
  const hasWebLocResolver = fixtureContent.includes('webLocResolver');
  const hasPatternSupport = fixtureContent.includes('pattern') || fixtureContent.includes('Pattern');
  console.log(`   - Has webLocResolver function: ${hasWebLocResolver ? '✓' : '✗'}`);
  console.log(`   - Has pattern support: ${hasPatternSupport ? '✓' : '✗'}`);
  
  if (!hasWebLocResolver || !hasPatternSupport) {
    allPassed = false;
  }
} else {
  allPassed = false;
}

console.log('');

// Summary
console.log('=== Verification Summary ===\n');
console.log(`Pattern files: ${expectedPatterns.length} expected, ${patternFiles.length} found`);
console.log(`Status: ${allPassed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

process.exit(allPassed ? 0 : 1);
