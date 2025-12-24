# PlayQ Framework Documentation
## Part 8: Implementation Checklist & Quick Reference

---

## 1. Implementation Checklist

### Phase 1: Core Framework Setup ✓

- [ ] Initialize project structure
- [ ] Install dependencies (package.json)
- [ ] Configure TypeScript (tsconfig.json)
- [ ] Set up path aliases
- [ ] Create directory structure
- [ ] Implement global.ts exports
- [ ] Configure runner detection (config/runner.ts)

### Phase 2: Variable & Environment System ✓

- [ ] Implement env.ts (environment loader)
- [ ] Implement vars.ts (variable management)
  - [ ] getValue()
  - [ ] setValue()
  - [ ] replaceVariables()
  - [ ] flattenConfig()
  - [ ] initVars()
- [ ] Create environment files (.env)
- [ ] Create config.ts
- [ ] Create variable.ts
- [ ] Implement encryption utilities

### Phase 3: Browser & Fixture Management ✓

- [ ] Implement webFixture.ts
  - [ ] Browser launch
  - [ ] Context management
  - [ ] Page management
  - [ ] World context (Cucumber)
- [ ] Implement browserManager.ts
- [ ] Configure session modes
- [ ] Implement logFixture.ts

### Phase 4: Locator Resolution System ✓

- [ ] Implement webLocFixture.ts (locator resolver)
- [ ] Support Playwright selectors (xpath=, css=, chain=)
- [ ] Support resource locators (loc.json.*, loc.ts.*)
- [ ] Create JSON locator files
- [ ] Create TypeScript locator files
- [ ] Implement pattern locator support

### Phase 5: PatternIQ Engine ✓

- [ ] Implement patternIqEngine.ts
- [ ] Pattern syntax parser
- [ ] Auto variable system
- [ ] Locator candidate generation
- [ ] Chained locator evaluation
- [ ] Scroll and retry logic
- [ ] Create pattern configuration files
- [ ] Test pattern resolution

### Phase 6: Action System ✓

- [ ] Implement webActions.ts
  - [ ] Navigation actions (openBrowser, navigateByPath)
  - [ ] Input actions (fill, type, input, set, enter)
  - [ ] Click actions (clickButton, clickLink, clickTab, clickRadioButton, clickCheckbox)
  - [ ] Verification actions (waitForTextAtLocation, waitForHeader)
  - [ ] Screenshot processing
  - [ ] Log attachment
- [ ] Implement apiActions.ts
- [ ] Implement commActions.ts
- [ ] Export actions in index.ts

### Phase 7: Cucumber System ✓

- [ ] Configure cucumber.js
- [ ] Implement Cucumber hooks
  - [ ] BeforeAll
  - [ ] Before
  - [ ] After
  - [ ] AfterAll
- [ ] Implement parameter types
- [ ] Create step definitions
- [ ] Implement World context

### Phase 8: Preprocessing Pipeline ✓

- [ ] Implement preProcessEntry.ts
- [ ] Implement featureFilePreProcess.ts
  - [ ] Variable replacement
  - [ ] Data file injection
  - [ ] Step group expansion
  - [ ] Tag injection
- [ ] Implement featureFileCache.ts
- [ ] Test preprocessing

### Phase 9: Step Group System ✓

- [ ] Implement sgGenerator.ts
  - [ ] Step group extraction
  - [ ] Step definition generation
  - [ ] Cache management
- [ ] Create step group directory
- [ ] Create step group feature files
- [ ] Test step group generation
- [ ] Test step group expansion

### Phase 10: Runner System ✓

- [ ] Implement runner.ts
  - [ ] Playwright runner
  - [ ] Cucumber runner
  - [ ] Run config support
- [ ] Implement runner_orchestrator.ts
- [ ] Create run configuration files
- [ ] Test runner execution

### Phase 11: Playwright Configuration ✓

- [ ] Configure playwright.config.ts
- [ ] Implement playwright.hooks.ts
- [ ] Implement playwright.test.ts
- [ ] Configure global setup/teardown
- [ ] Test Playwright execution

### Phase 12: Reporting & Scripts ✓

- [ ] Implement pretest.ts
- [ ] Implement posttest.ts
  - [ ] Allure report generation
  - [ ] Cucumber report generation
  - [ ] Auto-open reports
- [ ] Configure Allure reporter
- [ ] Configure HTML reporter
- [ ] Test report generation

### Phase 13: Extension System ✓

- [ ] Create addon structure
- [ ] Implement addon registration
- [ ] Create engine structure
- [ ] Implement engine registration
- [ ] Test addon/engine loading

### Phase 14: Advanced Features ✓

- [ ] Implement SmartAI engine (optional)
- [ ] Implement artifact management
- [ ] Implement data-driven testing
- [ ] Implement encryption utilities
- [ ] Configure CI/CD integration

### Phase 15: Testing & Documentation ✓

- [ ] Create example tests
- [ ] Create example feature files
- [ ] Create example step groups
- [ ] Create example locators
- [ ] Create example patterns
- [ ] Write user documentation
- [ ] Create troubleshooting guide

---

## 2. Quick Reference

### 2.1 Command Reference

```bash
# Install framework
npm install
npx playwright install

# Run tests
npm test                                    # Default runner
PLAYQ_RUNNER=playwright npm test           # Playwright runner
PLAYQ_RUNNER=cucumber npm test             # Cucumber runner

# Environment selection
PLAYQ_ENV=staging npm test                 # Use staging environment
PLAYQ_ENV=production npm test              # Use production environment

# Test filtering
PLAYQ_GREP="@smoke" npm test               # Playwright grep
PLAYQ_TAGS="@smoke and not @skip" npm test # Cucumber tags

# Run configuration
PLAYQ_RUN_CONFIG=smoke_tests npm test      # Use run config

# Preprocessing
npm run pretest                            # Run preprocessing
npm run pretest -- --force                 # Force regeneration

# Reporting
npm run posttest                           # Generate reports
npm run report:allure                      # Generate Allure report
npm run report:allure:clean                # Clean reports

# Utilities
npm run playq:getversions                  # Get version info
```

### 2.2 Variable Syntax Reference

```gherkin
# Static variables
#{var.static.username}
#{var.static.password}

# Config variables
#{config.baseUrl}
#{config.browser.browserType}

# Environment variables
#{env.API_KEY}
#{env.TEST_USER}

# Pattern variables
#{pattern.uportalOb.fields.button}

# Auto variables (generated during locator resolution)
#{loc.auto.fieldName}
#{loc.auto.fieldInstance}
#{loc.auto.forId}
#{loc.auto.location.value}
#{loc.auto.section.value}

# Encrypted variables
#{pwd.encryptedValue}
#{enc.encryptedValue}

# Type conversion
#{var.static.count.(toNumber)}
```

### 2.3 Locator Syntax Reference

```typescript
// Direct Playwright selectors
"xpath=//button[@id='submit']"
"css=.btn-primary"
"chain=div.container >> button"

// Resource locators
"loc.json.fileName.pageName.fieldName"
"loc.ts.fileName.pageName.fieldName"
"loc.fileName.pageName.fieldName"

// Pattern locators
"Username"                                    // Simple field
"{{form::registration}} Email"                // Field in form
"{section::billing} Street Address"           // Field in section
"{{form::checkout}} {section::payment} Card Number[2]"  // Complex pattern

// XPath/CSS
"//button[text()='Submit']"
".btn-primary"
"div.container > button"
```

### 2.4 Action Syntax Reference

```typescript
// Navigation
await web.openBrowser(page, url, options);
await web.navigateByPath(page, relativePath, options);

// Input
await web.fill(page, field, value, options);
await web.type(page, field, value, options);  // Alias

// Click
await web.clickButton(page, field, options);
await web.clickLink(page, field, options);
await web.clickTab(page, field, options);
await web.clickRadioButton(page, field, options);
await web.clickCheckbox(page, field, options);

// Verification
await web.waitForTextAtLocation(page, field, text, options);
await web.waitForHeader(page, header, text, options);

// API
await api.get(url, options);
await api.post(url, body, options);
await api.put(url, body, options);
await api.delete(url, options);

// Common
await comm.waitInMilliSeconds(duration);
```

### 2.5 Options Object Reference

```typescript
{
  // Timeouts
  actionTimeout: 30000,           // Action timeout (ms)
  navigationTimeout: 60000,       // Navigation timeout (ms)
  
  // Locator resolution
  pattern: "uportalOb",           // Pattern config override
  iframe: "iframe#content",       // iframe selector
  smartIQ_refreshLoc: "before",   // SmartAI refresh mode
  
  // Screenshots
  screenshot: true,               // Capture screenshot
  screenshotText: "Description",  // Screenshot description
  screenshotFullPage: true,       // Full page screenshot
  screenshotBefore: false,        // Screenshot before action
  screenshotField: false,         // Screenshot element only
  
  // Verification
  partialMatch: false,            // Substring matching
  ignoreCase: true,               // Case-insensitive
  
  // Click options
  force: true,                    // Force click
  isDoubleClick: false            // Double-click
}
```

### 2.6 Feature File Syntax Reference

```gherkin
# Basic structure
@tag1 @tag2
Feature: Feature Name
  Background:
    Given common setup
  
  @scenario_tag
  Scenario: Scenario Name
    Given precondition
    When action
    Then verification

# Scenario Outline
Scenario Outline: Parameterized test
  Given step with "<parameter>"
  
  Examples:
    | parameter |
    | value1    |
    | value2    |

# Data file injection
Examples: {dataFile: "users.xlsx", sheetName: "Sheet1", filter: "status == 'active'"}

# Step groups
* Step Group: -login_user.sg- -Login User-

# Variable usage
Given Web: Open Browser -url: "#{config.baseUrl}" -options: ""
When Web: Fill -field: "Username" -value: "#{var.static.testUser}" -options: ""
```

### 2.7 Step Group Syntax Reference

```gherkin
# Step group definition file
@StepGroup
Feature: Step Group Collection

@StepGroup:login_user.sg
Scenario: Login User
  * Web: Open Browser -url: "#{config.baseUrl}" -options: ""
  * Web: Fill -field: "Username" -value: "<username>" -options: ""
  * Web: Fill -field: "Password" -value: "<password>" -options: ""
  * Web: Click Button -field: "Login" -options: ""

# Step group usage
* Step Group: -login_user.sg- -Login User-
```

### 2.8 Pattern Configuration Reference

```typescript
export const patternName = {
  fields: {
    button: "locator1;locator2;locator3",
    input: "locator1;locator2",
    link: "locator1;locator2"
  },
  locations: {
    form: "locator",
    dialog: "locator"
  },
  sections: {
    billing: "locator",
    shipping: "locator"
  },
  scroll: "scrollable-selector"
};
```

---

## 3. Troubleshooting Guide

### 3.1 Common Issues

**Issue**: "Page not initialized"
- **Cause**: Page fixture not set up correctly
- **Solution**: Ensure `webFixture.setWorld(this)` in Before hook (Cucumber) or page fixture is passed (Playwright)

**Issue**: "Variable not found"
- **Cause**: Variable not defined or initVars() not called
- **Solution**: Check variable definition in variable.ts or config.ts, ensure loadEnv() is called

**Issue**: "Locator not found"
- **Cause**: Element not visible, incorrect locator, or timeout too short
- **Solution**: Increase timeout, verify element exists, check locator syntax, enable PatternIQ logging

**Issue**: "Step group not expanded"
- **Cause**: Step group not generated or cache outdated
- **Solution**: Run `npm run pretest -- --force` to regenerate

**Issue**: "Feature file not preprocessed"
- **Cause**: Preprocessing not run or cache issue
- **Solution**: Run `npm run pretest` before test execution

### 3.2 Debug Tips

1. **Enable Verbose Logging**:
   ```typescript
   config: {
     patternIq: {
       consoleLog: true
     },
     smartAi: {
       consoleLog: true
     }
   }
   ```

2. **Check Variable Values**:
   ```typescript
   import { vars } from '@playq';
   console.log(vars.getValue('config.baseUrl'));
   vars.debugVars();
   ```

3. **Inspect Locator Resolution**:
   ```typescript
   const locator = await webLocResolver('button', 'Submit', page);
   console.log(await locator.count());
   ```

4. **Screenshot on Every Step**:
   ```gherkin
   When Web: Fill -field: "Username" -value: "test" -options: "{screenshot: true}"
   ```

5. **Use Playwright Inspector**:
   ```bash
   PWDEBUG=1 npm test
   ```

---

## 4. Key Design Patterns

### 4.1 Hybrid Runner Pattern
- Single codebase supports both Playwright and Cucumber
- Runner detection via environment variable
- Conditional Allure step wrapping

### 4.2 Locator Resolution Chain
- Multiple resolution strategies in priority order
- Fallback mechanism for robustness
- Extensible via engines

### 4.3 Variable Replacement Pattern
- Hierarchical variable system
- Late binding (runtime resolution)
- Support for encrypted values

### 4.4 Preprocessing Pipeline
- Feature file transformation before execution
- Caching for performance
- Modular transformation steps

### 4.5 Extension System
- Plugin-based architecture
- Lazy loading of addons/engines
- Configuration-driven enablement

---

## 5. Performance Optimization

### 5.1 Caching Strategies
- Feature file caching
- Step group caching
- Locator caching (SmartAI)
- Pattern resolution caching

### 5.2 Parallel Execution
- Playwright workers
- Cucumber parallel mode
- Run configuration parallelization

### 5.3 Resource Management
- Shared browser sessions
- Context reuse
- Lazy loading of modules

---

## 6. Security Best Practices

1. **Never commit secrets**: Use .gitignore for .env files
2. **Encrypt sensitive data**: Use #{pwd.*} or #{enc.*}
3. **Rotate credentials**: Regular credential rotation
4. **Environment separation**: Different credentials per environment
5. **Secure CI/CD**: Use secret management services
6. **Audit logging**: Log access to sensitive operations

---

## 7. Maintenance Guidelines

### 7.1 Regular Tasks
- Update dependencies monthly
- Review and update locators quarterly
- Optimize slow tests
- Clean up obsolete test data
- Update documentation

### 7.2 Code Quality
- Follow TypeScript best practices
- Use ESLint/Prettier
- Write meaningful test names
- Keep tests independent
- Avoid test interdependencies

### 7.3 Version Control
- Use semantic versioning
- Tag releases
- Maintain changelog
- Document breaking changes

---

## 8. Framework Metrics

### 8.1 Key Metrics to Track
- Test execution time
- Test pass rate
- Flaky test rate
- Locator resolution success rate
- Pattern match confidence scores
- Cache hit rate

### 8.2 Monitoring
- CI/CD pipeline metrics
- Test result trends
- Error patterns
- Performance degradation

---

## 9. Support & Resources

### 9.1 Documentation
- Framework architecture (this document)
- API reference
- Configuration guide
- Troubleshooting guide
- Best practices

### 9.2 Examples
- Example tests (playq-examples-main/)
- Example patterns
- Example step groups
- Example run configurations

### 9.3 Community
- Internal wiki
- Team chat channel
- Code review guidelines
- Contribution guidelines

---

## 10. Future Enhancements

### 10.1 Planned Features
- Visual regression testing
- Performance testing integration
- Mobile testing support
- API contract testing
- Database validation utilities

### 10.2 Experimental Features
- AI-powered test generation
- Self-healing test maintenance
- Predictive test selection
- Intelligent test parallelization

---

## Conclusion

The PlayQ framework provides a comprehensive, enterprise-ready solution for test automation that combines the power of Playwright and Cucumber BDD. Its modular architecture, intelligent locator resolution, and extensive feature set make it suitable for complex testing scenarios while maintaining ease of use.

**Key Strengths**:
- Dual runner support (Playwright + Cucumber)
- Intelligent locator resolution (PatternIQ, SmartAI)
- Comprehensive variable management
- Modular extension system
- Enterprise-grade reporting
- CI/CD ready

**Implementation Priority**:
1. Core framework (Phases 1-4)
2. Action system (Phase 6)
3. Runner system (Phase 10)
4. Cucumber system (Phases 7-9) - if needed
5. Advanced features (Phases 13-14) - as needed

This documentation provides all the information needed to recreate the PlayQ framework from scratch. Follow the implementation checklist, refer to the code examples, and adapt the patterns to your specific needs.
