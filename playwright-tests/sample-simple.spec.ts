import { test, expect } from '@setup/playwrightTest';
import { web } from "@playq";

test.describe('@smoke Simple Framework Test', () => {
    test('verify framework can navigate and check title', async ({ page }) => {
        test.info().annotations.push({ type: 'tag', description: 'smoke' });
        
        // Navigate to example.com
        await web.openBrowser(page, "https://example.com", "");
        
        // Verify page title
        await web.verifyPageTitle(page, "Example Domain");
        
        console.log("✓ Framework is working correctly!");
    });
});
