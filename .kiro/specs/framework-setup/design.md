# Design Document: Framework Setup

## Overview

This design outlines the approach to make the PlayQ Automation Framework fully operational. The framework is already structured with core components, but requires dependency installation, directory setup, sample tests, and configuration to execute test cases successfully.

## Architecture

The PlayQ framework follows a dual-runner architecture:

```
┌─────────────────────────────────────────┐
│         Test Execution Entry            │
│    (npm test / runner.ts)               │
└──────────────┬──────────────────────────┘
               │
               ├─── PLAYQ_RUNNER=playwright ──┐
               │                               │
               └─── PLAYQ_RUNNER=cucumber ────┤
                                               │
┌──────────────────────────────────────────────┴─────┐
│                                                     │
│  ┌─────────────────┐      ┌──────────────────┐   │
│  │  Playwright     │      │   Cucumber       │   │
│  │  Runner         │      │   Runner         │   │
│  │  (.spec.ts)     │      │   (.feature)     │   │
│  └────────┬────────┘      └────────┬─────────┘   │
│           │                         │              │
│           └──────────┬──────────────┘              │
│                      │                             │
│           ┌──────────▼──────────┐                 │
│           │   Action Layer      │                 │
│           │  (webActions, etc)  │                 │
│           └──────────┬──────────┘                 │
│                      │                             │
│           ┌──────────▼──────────┐                 │
│           │  Locator Resolution │                 │
│           │  (JSON/TS/Pattern)  │                 │
│           └──────────┬──────────┘                 │
│                      │                             │
│           ┌──────────▼──────────┐                 │
│           │   Playwright API    │                 │
│           └─────────────────────┘                 │
└─────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Dependency Installation Component

**Purpose**: Install all required npm packages and Playwright browsers

**Interface**:
```typescript
// Executed via npm scripts
npm install
npx playwright install
```

**Dependencies**:
- All packages from package.json
- Playwright browser binaries (Chromium, Firefox, WebKit)

### 2. Directory Structure Component

**Purpose**: Create required directories for test organization

**Structure**:
```
test/
├── features/          # Cucumber feature files
├── steps/             # Step definitions
│   └── _step_group/   # Auto-generated step group steps
└── step_group/        # Step group definitions

environments/          # Environment configuration files
├── dev.env
├── staging.env
└── prod.env

test-results/          # Test execution results
allure-results/        # Allure report data
allure-report/         # Generated Allure reports
```

### 3. Sample Test Component

**Purpose**: Provide working examples to verify framework functionality

**Files**:
- `test/features/sample.feature` - Cucumber BDD test
- `test/steps/sample.steps.ts` - Step definitions
- `playwright-tests/sample.spec.ts` - Playwright test (already exists)

### 4. Environment Configuration Component

**Purpose**: Define runtime settings for test execution

**Configuration Variables**:
```bash
# Runner selection
PLAYQ_RUNNER=playwright|cucumber

# Environment
PLAYQ_ENV=dev|staging|prod
BASE_URL=https://example.com

# Execution options
PLAYQ_GREP=@tag
PLAYQ_PARALLEL=true|false
```

### 5. Test Execution Component

**Purpose**: Execute tests through the framework's runner system

**Entry Points**:
- `npm test` - Main test execution
- `npm run pretest` - Pre-test setup
- `npm run posttest` - Post-test reporting

## Data Models

### Environment Configuration Model
```typescript
interface EnvironmentConfig {
  PLAYQ_RUNNER: 'playwright' | 'cucumber';
  PLAYQ_ENV: string;
  BASE_URL: string;
  PLAYQ_GREP?: string;
  PLAYQ_PARALLEL?: boolean;
  TEST_USER?: string;
  TEST_PASSWORD?: string;
}
```

### Test Result Model
```typescript
interface TestResult {
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  artifacts: {
    screenshots: string[];
    videos: string[];
    traces: string[];
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Dependency Installation Completeness
*For any* framework installation, all packages listed in package.json should be successfully installed and available in node_modules.
**Validates: Requirements 1.1, 1.3**

### Property 2: Directory Structure Consistency
*For any* framework setup, the created directory structure should match the expected pattern with all required subdirectories present.
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 3: Sample Test Validity
*For any* generated sample test file, the syntax should be valid and imports should resolve to existing framework modules.
**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 4: Environment Configuration Validity
*For any* environment configuration file, all required variables should be present and values should follow the expected format.
**Validates: Requirements 4.1, 4.2, 4.3**

### Property 5: Test Execution Success
*For any* valid test file, when executed through the framework runner, the test should either pass or fail with clear error messages (not crash due to configuration issues).
**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

## Error Handling

### Dependency Installation Errors
- **Missing npm**: Verify npm is installed and accessible
- **Network failures**: Retry with exponential backoff
- **Permission errors**: Provide guidance on running with appropriate permissions
- **Version conflicts**: Report specific package conflicts

### Directory Creation Errors
- **Permission denied**: Check write permissions in project directory
- **Path too long**: Suggest shorter project path (Windows)
- **Disk space**: Verify sufficient disk space available

### Test Execution Errors
- **Missing configuration**: Provide default values or clear error messages
- **Invalid syntax**: Report line numbers and syntax issues
- **Import errors**: Verify tsconfig paths are correctly configured
- **Browser launch failures**: Check Playwright installation

### Environment Configuration Errors
- **Missing variables**: Use defaults or fail with clear message
- **Invalid values**: Validate and provide expected format
- **File not found**: Create default environment file

## Testing Strategy

### Unit Tests
- Verify directory creation functions create expected structure
- Test environment variable parsing and validation
- Verify sample file generation produces valid syntax
- Test configuration loading and merging

### Integration Tests
- Execute sample Playwright test end-to-end
- Execute sample Cucumber feature end-to-end
- Verify report generation after test execution
- Test runner detection and switching

### Property-Based Tests
- Generate random directory structures and verify consistency (Property 2)
- Generate random environment configurations and verify validity (Property 4)
- Test with various package.json configurations (Property 1)

**Testing Configuration**:
- Minimum 100 iterations per property test
- Use fast-check library for TypeScript property-based testing
- Each test tagged with: **Feature: framework-setup, Property N: [property text]**

### Manual Verification
- Visual inspection of generated directory structure
- Review sample test files for clarity and correctness
- Verify documentation completeness and accuracy
- Test on different operating systems (Windows, macOS, Linux)
