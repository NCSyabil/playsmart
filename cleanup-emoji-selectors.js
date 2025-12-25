const fs = require('fs');
const glob = require('glob');

// Remove emoji variation selectors and other invisible emoji-related characters
const files = glob.sync('**/*.{ts,js}', {
  ignore: ['node_modules/**', 'dist/**', 'build/**', 'cleanup-emoji-selectors.js']
});

let totalCleaned = 0;

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Remove emoji variation selectors (U+FE0E, U+FE0F) and zero-width joiners
    content = content.replace(/[\uFE0E\uFE0F\u200D]/g, '');
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      totalCleaned++;
      console.log(`Cleaned: ${file}`);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log(`\nTotal files cleaned: ${totalCleaned}`);
