import { test, expect } from '@setup/playwrightTest';
import { web } from "@playq";

test.describe('@demo Login Demo - Playwright Style', () => {
    
    test('complete login flow with form interactions', async ({ page }) => {
        test.info().annotations.push({ type: 'tag', description: 'demo' });
        
        // Navigate to the login page
        await web.openBrowser(page, "https://practicetestautomation.com/practice-test-login/", "");
        
        // Fill in username
        await web.fill(page, "#username", "student", "");
        
        // Fill in password
        await web.fill(page, "#password", "Password123", "");
        
        // Click submit button
        await web.clickButton(page, "#submit", "");
        
        // Verify successful login
        await web.verifyPageTitle(page, "Logged In Successfully | Practice Test Automation");
        
        // Verify success message is visible
        await web.verifyTextAtLocation(page, ".post-title", "Logged In Successfully");
        
        console.log("✓ Playwright Demo: Login test completed successfully!");
    });

    test('verify login page elements', async ({ page }) => {
        test.info().annotations.push({ type: 'tag', description: 'demo' });
        
        // Navigate to login page
        await web.openBrowser(page, "https://practicetestautomation.com/practice-test-login/", "");
        
        // Verify page elements exist
        await web.verifyInputFieldPresent(page, "#username", "");
        await web.verifyInputFieldPresent(page, "#password", "");
        await web.verifyInputFieldPresent(page, "#submit", "");
        
        console.log("✓ Playwright Demo: Page elements verified!");
    });
});
