# PlayQ Framework - Complete Technical Documentation
## Part 1: Framework Overview & Architecture

---

## Executive Summary

**PlayQ** is an enterprise-grade test automation framework that unifies **Playwright** and **Cucumber BDD** testing approaches into a single, cohesive platform. It provides intelligent element location, AI-powered pattern recognition, modular extensibility, and comprehensive test lifecycle management.

### Core Value Propositions
- **Dual Runner Support**: Seamlessly switch between Playwright (pure TypeScript) and Cucumber (BDD Gherkin)
- **Intelligent Locators**: PatternIQ engine with self-healing capabilities and SmartAI integration
- **Enterprise Features**: Step groups, variable management, data-driven testing, multi-environment support
- **Modular Architecture**: Plugin-based addons system for domain-specific integrations (D365 CRM, FinOps)
- **Developer Experience**: TypeScript-first, path aliases, comprehensive logging, Allure reporting

---

## Framework Architecture

### High-Level Structure

```
PlayQ Framework
├── playq-core-main/          # Core framework engine
├── playq-engines-main/       # Extension engines (PatternIQ, SmartAI)
├── playq-examples-main/      # Usage examples and templates
└── playq-project-main/       # User project template
```

### Core Components

1. **Test Runners**
   - Playwright Runner: Direct Playwright test execution
   - Cucumber Runner: BDD Gherkin feature file execution

2. **Locator Resolution System**
   - JSON-based locators
   - TypeScript Playwright locators
   - Pattern-based intelligent locators (PatternIQ)
   - SmartAI dynamic resolution

3. **Action Layer**
   - Web actions (click, fill, verify, navigate)
   - API actions (REST/GraphQL testing)
   - Common actions (wait, screenshot, data manipulation)

4. **Variable & Configuration Management**
   - Environment-based configuration
   - Dynamic variable replacement
   - Encrypted credential support
   - Flattened config access

5. **Preprocessing Pipeline**
   - Feature file preprocessing
   - Step group expansion
   - Variable substitution
   - Data file injection

6. **Reporting & Artifacts**
   - Allure integration
   - HTML/JSON reports
   - Screenshots, videos, traces
   - Cucumber HTML reports

---

## Directory Structure Deep Dive

### playq-core-main/ (Framework Core)

```
playq-core-main/
├── config/                    # Runner configurations
│   ├── cucumber/             # Cucumber-specific hooks and setup
│   │   ├── hooks.ts          # Cucumber lifecycle hooks
│   │   ├── dataFileHook.ts   # Data file injection hooks
│   │   ├── parameterHook.ts  # Parameter transformation
│   │   ├── scenarioHooks.ts  # Scenario-level hooks
│   │   ├── supportHooks.ts   # Support utilities
│   │   └── testLifecycleHooks.ts
│   ├── playwright/           # Playwright-specific configuration
│   │   ├── playwright.config.ts       # Main Playwright config
│   │   ├── playwright.hooks.ts        # Test hooks & fixtures
│   │   ├── playwright.test.ts         # Test wrapper export
│   │   ├── playwright.global-setup.ts
│   │   └── playwright.global-teardown.ts
│   └── runner.ts             # Runner detection utilities
│
├── src/
│   ├── exec/                 # Execution orchestration
│   │   ├── runner.ts         # Main test runner entry point
│   │   ├── runner_orchestrator.ts  # Multi-config runner
│   │   ├── preProcessEntry.ts      # Preprocessing coordinator
│   │   ├── featureFilePreProcess.ts # Feature file transformation
│   │   ├── sgGenerator.ts          # Step group generator
│   │   ├── featureFileCache.ts     # Feature caching logic
│   │   └── preLoader.ts            # Pre-execution loader
│   │
│   ├── helper/
│   │   ├── actions/          # Action implementations
│   │   │   ├── webActions.ts       # Web interaction actions
│   │   │   ├── apiActions.ts       # API testing actions
│   │   │   ├── commActions.ts      # Common utilities
│   │   │   └── index.ts            # Action exports
│   │   │
│   │   ├── fixtures/         # Test fixtures & context
│   │   │   ├── webFixture.ts       # Browser/page management
│   │   │   ├── webLocFixture.ts    # Locator resolver
│   │   │   └── logFixture.ts       # Logging utilities
│   │   │
│   │   ├── bundle/           # Core utilities
│   │   │   ├── vars.ts             # Variable management
│   │   │   ├── env.ts              # Environment loader
│   │   │   └── defaultEntries.ts   # Default values
│   │   │
│   │   ├── browsers/         # Browser management
│   │   │   └── browserManager.ts
│   │   │
│   │   ├── faker/            # Test data generation
│   │   │   ├── customFaker.ts
│   │   │   └── modules/
│   │   │       ├── passport.ts
│   │   │       ├── dateTime.ts
│   │   │       └── ...
│   │   │
│   │   ├── report/           # Reporting utilities
│   │   │   ├── allureStepLogger.ts
│   │   │   └── stepHelpers.ts
│   │   │
│   │   ├── util/             # General utilities
│   │   │   ├── utils.ts
│   │   │   ├── test-data/
│   │   │   └── utilities/
│   │   │
│   │   └── wrapper/          # API wrappers
│   │
│   ├── scripts/              # CLI scripts
│   │   ├── pretest.ts        # Pre-test setup
│   │   ├── posttest.ts       # Post-test cleanup & reporting
│   │   ├── get-versions.ts   # Version information
│   │   └── util.ts           # Script utilities
│   │
│   └── global.ts             # Global exports & initialization
│
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript configuration
├── cucumber.js               # Cucumber configuration
└── readme.md
```
