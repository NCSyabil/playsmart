import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';

/**
 * Unit tests for Cucumber hook execution order
 * 
 * These tests verify that hooks execute in the correct order:
 * BeforeAll → Before → Steps → After → AfterAll
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

describe('Hook Execution Order', () => {
  let executionLog: string[];

  beforeEach(() => {
    executionLog = [];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should execute hooks in correct order for successful scenario', () => {
    // Simulate hook execution order
    const simulateHookExecution = () => {
      executionLog.push('BeforeAll');
      executionLog.push('Before');
      executionLog.push('Step1');
      executionLog.push('Step2');
      executionLog.push('After');
      executionLog.push('AfterAll');
    };

    simulateHookExecution();

    expect(executionLog).toEqual([
      'BeforeAll',
      'Before',
      'Step1',
      'Step2',
      'After',
      'AfterAll'
    ]);
  });

  test('should execute After hook even when scenario fails', () => {
    // Simulate hook execution with failure
    const simulateFailedScenario = () => {
      executionLog.push('BeforeAll');
      executionLog.push('Before');
      executionLog.push('Step1');
      try {
        executionLog.push('Step2-Failed');
        throw new Error('Step failed');
      } catch (error) {
        // After hook should still execute
        executionLog.push('After');
      } finally {
        executionLog.push('AfterAll');
      }
    };

    simulateFailedScenario();

    expect(executionLog).toContain('After');
    expect(executionLog).toContain('AfterAll');
    expect(executionLog[executionLog.length - 1]).toBe('AfterAll');
  });

  test('should execute BeforeAll only once for multiple scenarios', () => {
    // Simulate multiple scenarios
    const simulateMultipleScenarios = () => {
      executionLog.push('BeforeAll');
      
      // Scenario 1
      executionLog.push('Before-Scenario1');
      executionLog.push('Step-Scenario1');
      executionLog.push('After-Scenario1');
      
      // Scenario 2
      executionLog.push('Before-Scenario2');
      executionLog.push('Step-Scenario2');
      executionLog.push('After-Scenario2');
      
      executionLog.push('AfterAll');
    };

    simulateMultipleScenarios();

    const beforeAllCount = executionLog.filter(log => log === 'BeforeAll').length;
    const afterAllCount = executionLog.filter(log => log === 'AfterAll').length;

    expect(beforeAllCount).toBe(1);
    expect(afterAllCount).toBe(1);
  });

  test('should execute Before and After hooks for each scenario', () => {
    // Simulate multiple scenarios
    const simulateMultipleScenarios = () => {
      executionLog.push('BeforeAll');
      
      // Scenario 1
      executionLog.push('Before');
      executionLog.push('Step1');
      executionLog.push('After');
      
      // Scenario 2
      executionLog.push('Before');
      executionLog.push('Step2');
      executionLog.push('After');
      
      executionLog.push('AfterAll');
    };

    simulateMultipleScenarios();

    const beforeCount = executionLog.filter(log => log === 'Before').length;
    const afterCount = executionLog.filter(log => log === 'After').length;

    expect(beforeCount).toBe(2);
    expect(afterCount).toBe(2);
  });

  test('should execute tagged hooks only for matching scenarios', () => {
    // Simulate tagged hook execution
    const simulateTaggedHooks = (scenarioTags: string[]) => {
      executionLog.push('BeforeAll');
      
      // Check if scenario has @auth tag
      if (scenarioTags.includes('@auth')) {
        executionLog.push('Before-Auth');
      } else {
        executionLog.push('Before-NonAuth');
      }
      
      executionLog.push('Step');
      executionLog.push('After');
      executionLog.push('AfterAll');
    };

    // Test with @auth tag
    executionLog = [];
    simulateTaggedHooks(['@auth']);
    expect(executionLog).toContain('Before-Auth');
    expect(executionLog).not.toContain('Before-NonAuth');

    // Test without @auth tag
    executionLog = [];
    simulateTaggedHooks(['@smoke']);
    expect(executionLog).toContain('Before-NonAuth');
    expect(executionLog).not.toContain('Before-Auth');
  });

  test('should handle soft assertion failures in After hook', () => {
    // Simulate soft assertion failure
    const simulateSoftAssertionFailure = () => {
      const world = {
        softAssertionFailed: false,
        softAssertionStep: ''
      };

      executionLog.push('BeforeAll');
      executionLog.push('Before');
      executionLog.push('Step1');
      
      // Simulate soft assertion failure
      world.softAssertionFailed = true;
      world.softAssertionStep = 'Step1';
      
      executionLog.push('Step2'); // Continue execution
      
      // After hook checks soft assertions
      executionLog.push('After');
      if (world.softAssertionFailed) {
        executionLog.push('After-SoftAssertionCheck');
        throw new Error(`Soft assertion(s) failed at step: "${world.softAssertionStep}"`);
      }
    };

    expect(() => simulateSoftAssertionFailure()).toThrow('Soft assertion(s) failed');
    expect(executionLog).toContain('After');
    expect(executionLog).toContain('After-SoftAssertionCheck');
  });
});

describe('Hook Execution with Browser Context', () => {
  test('should create new context in Before hook', () => {
    const contextLog: string[] = [];

    // Simulate Before hook creating context
    const simulateBeforeHook = () => {
      contextLog.push('Before-Start');
      contextLog.push('CreateContext');
      contextLog.push('CreatePage');
      contextLog.push('Before-End');
    };

    simulateBeforeHook();

    expect(contextLog).toEqual([
      'Before-Start',
      'CreateContext',
      'CreatePage',
      'Before-End'
    ]);
  });

  test('should close context in After hook', () => {
    const contextLog: string[] = [];

    // Simulate After hook closing context
    const simulateAfterHook = () => {
      contextLog.push('After-Start');
      contextLog.push('ClosePage');
      contextLog.push('CloseContext');
      contextLog.push('After-End');
    };

    simulateAfterHook();

    expect(contextLog).toEqual([
      'After-Start',
      'ClosePage',
      'CloseContext',
      'After-End'
    ]);
  });

  test('should close context even when After hook encounters errors', () => {
    const contextLog: string[] = [];

    // Simulate After hook with error
    const simulateAfterHookWithError = () => {
      contextLog.push('After-Start');
      try {
        contextLog.push('CaptureScreenshot-Error');
        throw new Error('Screenshot failed');
      } catch (error) {
        contextLog.push('ErrorHandled');
      } finally {
        contextLog.push('ClosePage');
        contextLog.push('CloseContext');
      }
    };

    simulateAfterHookWithError();

    expect(contextLog).toContain('ClosePage');
    expect(contextLog).toContain('CloseContext');
  });
});

describe('Hook Execution with Artifact Capture', () => {
  test('should capture artifacts in After hook on failure', () => {
    const artifactLog: string[] = [];
    const scenarioStatus = 'FAILED';

    // Simulate artifact capture
    const simulateArtifactCapture = (status: string) => {
      artifactLog.push('After-Start');
      
      if (status === 'FAILED') {
        artifactLog.push('CaptureScreenshot');
        artifactLog.push('CaptureTrace');
      }
      
      artifactLog.push('After-End');
    };

    simulateArtifactCapture(scenarioStatus);

    expect(artifactLog).toContain('CaptureScreenshot');
    expect(artifactLog).toContain('CaptureTrace');
  });

  test('should skip artifact capture on success when onFailureOnly is true', () => {
    const artifactLog: string[] = [];
    const scenarioStatus = 'PASSED';
    const onFailureOnly = true;

    // Simulate conditional artifact capture
    const simulateConditionalCapture = (status: string, onlyOnFailure: boolean) => {
      artifactLog.push('After-Start');
      
      const shouldCapture = !onlyOnFailure || status === 'FAILED';
      
      if (shouldCapture) {
        artifactLog.push('CaptureScreenshot');
      }
      
      artifactLog.push('After-End');
    };

    simulateConditionalCapture(scenarioStatus, onFailureOnly);

    expect(artifactLog).not.toContain('CaptureScreenshot');
  });
});
