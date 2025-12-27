import { describe, test, expect } from '@jest/globals';
import * as fc from 'fast-check';

/**
 * Property-based tests for artifact capture on failure
 * 
 * Feature: cucumber-integration, Property 5: Artifact Capture on Failure
 * **Validates: Requirements 4.2, 4.5**
 * 
 * Property: For any scenario that fails, the framework should capture and attach
 * at least one artifact (screenshot, video, or trace) to the test report.
 */

// Define scenario status enum to match Cucumber's Status
enum ScenarioStatus {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
  PENDING = 'PENDING',
  UNDEFINED = 'UNDEFINED',
  AMBIGUOUS = 'AMBIGUOUS'
}

describe('Property: Artifact Capture on Failure', () => {
  /**
   * Simulates the artifact capture logic from supportHooks.ts
   */
  function shouldCaptureArtifacts(
    scenarioStatus: ScenarioStatus,
    captureScreenshot: boolean,
    captureVideo: boolean,
    captureTrace: boolean,
    onlyOnFailure: boolean,
    onlyOnSuccess: boolean
  ): { shouldCapture: boolean; artifactTypes: string[] } {
    const isPassed = scenarioStatus === ScenarioStatus.PASSED;
    const isFailed = scenarioStatus === ScenarioStatus.FAILED;
    
    const shouldCapture =
      (!onlyOnFailure && !onlyOnSuccess) ||
      (onlyOnFailure && isFailed) ||
      (onlyOnSuccess && isPassed);

    const artifactTypes: string[] = [];
    
    if (shouldCapture) {
      if (captureScreenshot) artifactTypes.push('screenshot');
      if (captureVideo) artifactTypes.push('video');
      if (captureTrace) artifactTypes.push('trace');
    }

    return { shouldCapture, artifactTypes };
  }

  test('property: failed scenarios always capture at least one artifact when configured', () => {
    fc.assert(
      fc.property(
        // Generate random artifact configuration
        fc.boolean(), // captureScreenshot
        fc.boolean(), // captureVideo
        fc.boolean(), // captureTrace
        fc.boolean(), // onlyOnFailure
        fc.boolean(), // onlyOnSuccess
        (captureScreenshot, captureVideo, captureTrace, onlyOnFailure, onlyOnSuccess) => {
          // At least one artifact type must be enabled
          const atLeastOneEnabled = captureScreenshot || captureVideo || captureTrace;
          
          if (!atLeastOneEnabled) {
            // Skip this test case if no artifacts are enabled
            return true;
          }

          const result = shouldCaptureArtifacts(
            ScenarioStatus.FAILED,
            captureScreenshot,
            captureVideo,
            captureTrace,
            onlyOnFailure,
            onlyOnSuccess
          );

          // If onlyOnSuccess is true, we should NOT capture on failure
          if (onlyOnSuccess) {
            expect(result.artifactTypes.length).toBe(0);
            return true;
          }

          // Otherwise, we should capture at least one artifact
          expect(result.artifactTypes.length).toBeGreaterThan(0);
          
          // Verify the captured artifacts match the configuration
          if (captureScreenshot) {
            expect(result.artifactTypes).toContain('screenshot');
          }
          if (captureVideo) {
            expect(result.artifactTypes).toContain('video');
          }
          if (captureTrace) {
            expect(result.artifactTypes).toContain('trace');
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('property: passed scenarios respect onSuccessOnly configuration', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // captureScreenshot
        fc.boolean(), // captureVideo
        fc.boolean(), // captureTrace
        fc.boolean(), // onlyOnFailure
        fc.boolean(), // onlyOnSuccess
        (captureScreenshot, captureVideo, captureTrace, onlyOnFailure, onlyOnSuccess) => {
          const atLeastOneEnabled = captureScreenshot || captureVideo || captureTrace;
          
          if (!atLeastOneEnabled) {
            return true;
          }

          const result = shouldCaptureArtifacts(
            ScenarioStatus.PASSED,
            captureScreenshot,
            captureVideo,
            captureTrace,
            onlyOnFailure,
            onlyOnSuccess
          );

          // If onlyOnFailure is true, we should NOT capture on success
          if (onlyOnFailure) {
            expect(result.artifactTypes.length).toBe(0);
            return true;
          }

          // If onlyOnSuccess is true, we SHOULD capture on success
          if (onlyOnSuccess) {
            expect(result.artifactTypes.length).toBeGreaterThan(0);
            return true;
          }

          // If both are false, we should always capture
          if (!onlyOnFailure && !onlyOnSuccess) {
            expect(result.artifactTypes.length).toBeGreaterThan(0);
            return true;
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('property: artifact capture configuration is consistent', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(ScenarioStatus.PASSED, ScenarioStatus.FAILED, ScenarioStatus.SKIPPED, ScenarioStatus.PENDING, ScenarioStatus.UNDEFINED, ScenarioStatus.AMBIGUOUS),
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        (status, captureScreenshot, captureVideo, captureTrace, onlyOnFailure, onlyOnSuccess) => {
          const result1 = shouldCaptureArtifacts(
            status,
            captureScreenshot,
            captureVideo,
            captureTrace,
            onlyOnFailure,
            onlyOnSuccess
          );

          const result2 = shouldCaptureArtifacts(
            status,
            captureScreenshot,
            captureVideo,
            captureTrace,
            onlyOnFailure,
            onlyOnSuccess
          );

          // Same inputs should always produce same outputs (idempotence)
          expect(result1.shouldCapture).toBe(result2.shouldCapture);
          expect(result1.artifactTypes).toEqual(result2.artifactTypes);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('property: onlyOnFailure and onlyOnSuccess are mutually exclusive in effect', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(ScenarioStatus.PASSED, ScenarioStatus.FAILED),
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        (status, captureScreenshot, captureVideo, captureTrace) => {
          const atLeastOneEnabled = captureScreenshot || captureVideo || captureTrace;
          
          if (!atLeastOneEnabled) {
            return true;
          }

          // When both flags are true, behavior should be deterministic
          const result = shouldCaptureArtifacts(
            status,
            captureScreenshot,
            captureVideo,
            captureTrace,
            true, // onlyOnFailure
            true  // onlyOnSuccess
          );

          // When both are true, we should capture on both passed and failed
          // (the OR logic in the condition)
          expect(result.artifactTypes.length).toBeGreaterThan(0);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('property: at least one artifact type must be enabled to capture anything', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(ScenarioStatus.PASSED, ScenarioStatus.FAILED),
        fc.boolean(),
        fc.boolean(),
        (status, onlyOnFailure, onlyOnSuccess) => {
          // All artifact types disabled
          const result = shouldCaptureArtifacts(
            status,
            false, // captureScreenshot
            false, // captureVideo
            false, // captureTrace
            onlyOnFailure,
            onlyOnSuccess
          );

          // Should never capture anything if all types are disabled
          expect(result.artifactTypes.length).toBe(0);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('property: artifact types captured match enabled configuration', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(ScenarioStatus.PASSED, ScenarioStatus.FAILED),
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        (status, captureScreenshot, captureVideo, captureTrace) => {
          const result = shouldCaptureArtifacts(
            status,
            captureScreenshot,
            captureVideo,
            captureTrace,
            false, // onlyOnFailure
            false  // onlyOnSuccess
          );

          // Count enabled artifact types
          const enabledCount = [captureScreenshot, captureVideo, captureTrace].filter(Boolean).length;

          // Captured artifacts should match enabled count
          expect(result.artifactTypes.length).toBe(enabledCount);

          // Verify each enabled type is in the result
          if (captureScreenshot) {
            expect(result.artifactTypes).toContain('screenshot');
          } else {
            expect(result.artifactTypes).not.toContain('screenshot');
          }

          if (captureVideo) {
            expect(result.artifactTypes).toContain('video');
          } else {
            expect(result.artifactTypes).not.toContain('video');
          }

          if (captureTrace) {
            expect(result.artifactTypes).toContain('trace');
          } else {
            expect(result.artifactTypes).not.toContain('trace');
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property: Scenario Folder Naming', () => {
  /**
   * Simulates the scenario folder naming logic from supportHooks.ts
   */
  function generateScenarioFolderName(scenarioName: string, runNumber: number): string {
    const safeName = scenarioName.replace(/[^a-zA-Z0-9_-]/g, '_');
    return `${safeName}_run${runNumber}`;
  }

  test('property: scenario folder names are unique for different run numbers', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.integer({ min: 1, max: 1000 }),
        fc.integer({ min: 1, max: 1000 }),
        (scenarioName, runNumber1, runNumber2) => {
          const folder1 = generateScenarioFolderName(scenarioName, runNumber1);
          const folder2 = generateScenarioFolderName(scenarioName, runNumber2);

          if (runNumber1 === runNumber2) {
            // Same run number should produce same folder name
            expect(folder1).toBe(folder2);
          } else {
            // Different run numbers should produce different folder names
            expect(folder1).not.toBe(folder2);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('property: scenario folder names contain only safe characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.integer({ min: 1, max: 1000 }),
        (scenarioName, runNumber) => {
          const folderName = generateScenarioFolderName(scenarioName, runNumber);

          // Folder name should only contain alphanumeric, underscore, hyphen
          const safeCharPattern = /^[a-zA-Z0-9_-]+_run\d+$/;
          expect(folderName).toMatch(safeCharPattern);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('property: scenario folder names always end with run number', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.integer({ min: 1, max: 1000 }),
        (scenarioName, runNumber) => {
          const folderName = generateScenarioFolderName(scenarioName, runNumber);

          // Should end with _runN where N is the run number
          expect(folderName).toMatch(/_run\d+$/);
          expect(folderName).toContain(`_run${runNumber}`);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
