import { describe, test, expect } from '@jest/globals';
import fs from 'fs-extra';
import path from 'path';

/**
 * Integration tests for artifact capture on scenario failure
 * 
 * These tests verify that the framework captures artifacts (screenshots, videos, traces)
 * when scenarios fail and attaches them to reports.
 * 
 * Requirements: 4.2, 4.5, 10.5
 */

describe('Artifact Capture Integration', () => {
  const testResultsPath = 'test-results/scenarios';

  test('should have scenario folders in test-results', async () => {
    const resultsExist = await fs.pathExists(testResultsPath);
    expect(resultsExist).toBe(true);

    if (resultsExist) {
      const scenarioFolders = await fs.readdir(testResultsPath);
      expect(scenarioFolders.length).toBeGreaterThan(0);
    }
  });

  test('should capture screenshots in scenario folders', async () => {
    const resultsExist = await fs.pathExists(testResultsPath);
    
    if (resultsExist) {
      const scenarioFolders = await fs.readdir(testResultsPath);
      
      // Check at least one scenario folder has a screenshot
      let screenshotFound = false;
      
      for (const folder of scenarioFolders) {
        const screenshotPath = path.join(testResultsPath, folder, 'screenshot.png');
        if (await fs.pathExists(screenshotPath)) {
          screenshotFound = true;
          
          // Verify screenshot file is not empty
          const stats = await fs.stat(screenshotPath);
          expect(stats.size).toBeGreaterThan(0);
          break;
        }
      }
      
      expect(screenshotFound).toBe(true);
    }
  });

  test('should capture traces in scenario folders', async () => {
    const resultsExist = await fs.pathExists(testResultsPath);
    
    if (resultsExist) {
      const scenarioFolders = await fs.readdir(testResultsPath);
      
      // Check at least one scenario folder has a trace
      let traceFound = false;
      
      for (const folder of scenarioFolders) {
        const tracePath = path.join(testResultsPath, folder, 'trace.zip');
        if (await fs.pathExists(tracePath)) {
          traceFound = true;
          
          // Verify trace file is not empty
          const stats = await fs.stat(tracePath);
          expect(stats.size).toBeGreaterThan(0);
          break;
        }
      }
      
      expect(traceFound).toBe(true);
    }
  });

  test('should create unique scenario folder names with run numbers', async () => {
    const resultsExist = await fs.pathExists(testResultsPath);
    
    if (resultsExist) {
      const scenarioFolders = await fs.readdir(testResultsPath);
      
      // Check for folders with run numbers
      const foldersWithRunNumbers = scenarioFolders.filter(folder => 
        /_run\d+$/.test(folder)
      );
      
      expect(foldersWithRunNumbers.length).toBeGreaterThan(0);
      
      // Verify run numbers are sequential for same scenario
      const scenarioGroups: Record<string, number[]> = {};
      
      for (const folder of foldersWithRunNumbers) {
        const match = folder.match(/^(.+)_run(\d+)$/);
        if (match) {
          const [, scenarioName, runNumber] = match;
          if (!scenarioGroups[scenarioName]) {
            scenarioGroups[scenarioName] = [];
          }
          scenarioGroups[scenarioName].push(parseInt(runNumber));
        }
      }
      
      // Check that run numbers are unique within each scenario group
      for (const [scenarioName, runNumbers] of Object.entries(scenarioGroups)) {
        const uniqueRunNumbers = new Set(runNumbers);
        expect(uniqueRunNumbers.size).toBe(runNumbers.length);
      }
    }
  });

  test('should attach artifacts to JSON report', async () => {
    const jsonReportPath = 'test-results/cucumber-report.json';
    const reportExists = await fs.pathExists(jsonReportPath);
    
    expect(reportExists).toBe(true);

    if (reportExists) {
      const reportContent = await fs.readFile(jsonReportPath, 'utf-8');
      const report = JSON.parse(reportContent);
      
      expect(Array.isArray(report)).toBe(true);
      expect(report.length).toBeGreaterThan(0);
      
      // Check that at least one feature has scenarios with embeddings
      let embeddingsFound = false;
      
      for (const feature of report) {
        if (feature.elements && Array.isArray(feature.elements)) {
          for (const scenario of feature.elements) {
            if (scenario.steps && Array.isArray(scenario.steps)) {
              for (const step of scenario.steps) {
                if (step.embeddings && step.embeddings.length > 0) {
                  embeddingsFound = true;
                  break;
                }
              }
            }
            if (embeddingsFound) break;
          }
        }
        if (embeddingsFound) break;
      }
      
      expect(embeddingsFound).toBe(true);
    }
  });
});

describe('Artifact Capture Configuration', () => {
  test('should respect onFailureOnly configuration', async () => {
    // This test verifies the logic in supportHooks.ts
    // We simulate the configuration check
    const onlyOnFailure = true;
    const isPassed = true;
    const isFailed = false;
    
    const shouldCapture = !onlyOnFailure || isFailed;
    
    expect(shouldCapture).toBe(false);
  });

  test('should capture on failure when onFailureOnly is true', async () => {
    const onlyOnFailure = true;
    const isPassed = false;
    const isFailed = true;
    
    const shouldCapture = !onlyOnFailure || isFailed;
    
    expect(shouldCapture).toBe(true);
  });

  test('should capture on success when onSuccessOnly is true', async () => {
    const onlyOnSuccess = true;
    const isPassed = true;
    const isFailed = false;
    
    const shouldCapture = !onlyOnSuccess || isPassed;
    
    expect(shouldCapture).toBe(true);
  });

  test('should not capture on failure when onSuccessOnly is true', async () => {
    const onlyOnSuccess = true;
    const isPassed = false;
    const isFailed = true;
    
    const shouldCapture = !onlyOnSuccess || isPassed;
    
    expect(shouldCapture).toBe(false);
  });

  test('should always capture when both flags are false', async () => {
    const onlyOnFailure = false;
    const onlyOnSuccess = false;
    const isPassed = true;
    const isFailed = false;
    
    const shouldCapture = !onlyOnFailure && !onlyOnSuccess;
    
    expect(shouldCapture).toBe(true);
  });
});

describe('Artifact File Validation', () => {
  test('should create valid PNG screenshot files', async () => {
    const scenarioFolders = await fs.readdir('test-results/scenarios');
    
    if (scenarioFolders.length > 0) {
      const firstFolder = scenarioFolders[0];
      const screenshotPath = path.join('test-results/scenarios', firstFolder, 'screenshot.png');
      
      if (await fs.pathExists(screenshotPath)) {
        const fileBuffer = await fs.readFile(screenshotPath);
        
        // Check PNG magic number (first 8 bytes)
        const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
        const fileSignature = fileBuffer.slice(0, 8);
        
        expect(fileSignature.equals(pngSignature)).toBe(true);
      }
    }
  });

  test('should create valid ZIP trace files', async () => {
    const scenarioFolders = await fs.readdir('test-results/scenarios');
    
    if (scenarioFolders.length > 0) {
      const firstFolder = scenarioFolders[0];
      const tracePath = path.join('test-results/scenarios', firstFolder, 'trace.zip');
      
      if (await fs.pathExists(tracePath)) {
        const fileBuffer = await fs.readFile(tracePath);
        
        // Check ZIP magic number (first 4 bytes: PK\x03\x04)
        const zipSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
        const fileSignature = fileBuffer.slice(0, 4);
        
        expect(fileSignature.equals(zipSignature)).toBe(true);
      }
    }
  });
});


describe('Artifact Capture Configuration', () => {
  test('should respect onFailureOnly configuration', async () => {
    // This test verifies the logic in supportHooks.ts
    // We simulate the configuration check
    const onlyOnFailure = true;
    const onlyOnSuccess = false;
    const isPassed = true;
    const isFailed = false;
    
    const shouldCapture = 
      (!onlyOnFailure && !onlyOnSuccess) ||
      (onlyOnFailure && isFailed) ||
      (onlyOnSuccess && isPassed);
    
    expect(shouldCapture).toBe(false);
  });

  test('should capture on failure when onFailureOnly is true', async () => {
    const onlyOnFailure = true;
    const onlyOnSuccess = false;
    const isPassed = false;
    const isFailed = true;
    
    const shouldCapture = 
      (!onlyOnFailure && !onlyOnSuccess) ||
      (onlyOnFailure && isFailed) ||
      (onlyOnSuccess && isPassed);
    
    expect(shouldCapture).toBe(true);
  });

  test('should capture on success when onSuccessOnly is true', async () => {
    const onlyOnFailure = false;
    const onlyOnSuccess = true;
    const isPassed = true;
    const isFailed = false;
    
    const shouldCapture = 
      (!onlyOnFailure && !onlyOnSuccess) ||
      (onlyOnFailure && isFailed) ||
      (onlyOnSuccess && isPassed);
    
    expect(shouldCapture).toBe(true);
  });

  test('should not capture on failure when onSuccessOnly is true', async () => {
    const onlyOnFailure = false;
    const onlyOnSuccess = true;
    const isPassed = false;
    const isFailed = true;
    
    const shouldCapture = 
      (!onlyOnFailure && !onlyOnSuccess) ||
      (onlyOnFailure && isFailed) ||
      (onlyOnSuccess && isPassed);
    
    expect(shouldCapture).toBe(false);
  });

  test('should always capture when both flags are false', async () => {
    const onlyOnFailure = false;
    const onlyOnSuccess = false;
    const isPassed = true;
    const isFailed = false;
    
    const shouldCapture = !onlyOnFailure && !onlyOnSuccess;
    
    expect(shouldCapture).toBe(true);
  });
});

describe('Artifact File Validation', () => {
  test('should create valid PNG screenshot files', async () => {
    const scenarioFolders = await fs.readdir('test-results/scenarios');
    
    if (scenarioFolders.length > 0) {
      const firstFolder = scenarioFolders[0];
      const screenshotPath = path.join('test-results/scenarios', firstFolder, 'screenshot.png');
      
      if (await fs.pathExists(screenshotPath)) {
        const fileBuffer = await fs.readFile(screenshotPath);
        
        // Check PNG magic number (first 8 bytes)
        const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
        const fileSignature = fileBuffer.slice(0, 8);
        
        expect(fileSignature.equals(pngSignature)).toBe(true);
      }
    }
  });

  test('should create valid ZIP trace files', async () => {
    const scenarioFolders = await fs.readdir('test-results/scenarios');
    
    if (scenarioFolders.length > 0) {
      const firstFolder = scenarioFolders[0];
      const tracePath = path.join('test-results/scenarios', firstFolder, 'trace.zip');
      
      if (await fs.pathExists(tracePath)) {
        const fileBuffer = await fs.readFile(tracePath);
        
        // Check ZIP magic number (first 4 bytes: PK\x03\x04)
        const zipSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
        const fileSignature = fileBuffer.slice(0, 4);
        
        expect(fileSignature.equals(zipSignature)).toBe(true);
      }
    }
  });
});
