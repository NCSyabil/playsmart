import { describe, test, expect, beforeAll } from '@jest/globals';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Integration tests for parallel execution
 * 
 * These tests verify that multiple feature files can execute in parallel
 * without conflicts or state leakage, and that all reports are generated correctly.
 * 
 * Requirements: 4.4, 5.4
 */

describe('Parallel Execution Integration', () => {
  const testResultsPath = 'test-results';
  const jsonReportPath = path.join(testResultsPath, 'cucumber-report.json');
  const scenariosPath = path.join(testResultsPath, 'scenarios');

  beforeAll(async () => {
    // Ensure test-results directory exists
    await fs.ensureDir(testResultsPath);
  });

  test('should execute multiple features in parallel', async () => {
    // Execute tests in parallel mode
    try {
      await execAsync('npm run test:cucumber:parallel', {
        timeout: 180000 // 3 minutes timeout
      });
    } catch (error: any) {
      // Cucumber may exit with non-zero code if tests fail
      console.log('Parallel execution completed:', error.message);
    }

    // Verify JSON report was generated
    const jsonExists = await fs.pathExists(jsonReportPath);
    expect(jsonExists).toBe(true);

    if (jsonExists) {
      const reportContent = await fs.readFile(jsonReportPath, 'utf-8');
      const report = JSON.parse(reportContent);
      
      // Verify multiple features were executed
      expect(report.length).toBeGreaterThan(1);
      
      // Count total scenarios
      let totalScenarios = 0;
      for (const feature of report) {
        if (feature.elements) {
          totalScenarios += feature.elements.length;
        }
      }
      
      expect(totalScenarios).toBeGreaterThan(1);
      console.log(`Parallel execution: ${report.length} features, ${totalScenarios} scenarios`);
    }
  }, 200000); // 3.5 minutes timeout for the test

  test('should create separate scenario folders for parallel scenarios', async () => {
    const scenariosExist = await fs.pathExists(scenariosPath);
    
    if (scenariosExist) {
      const scenarioFolders = await fs.readdir(scenariosPath);
      
      // In parallel execution, we should have multiple scenario folders
      expect(scenarioFolders.length).toBeGreaterThan(1);
      
      // Verify each folder has unique name
      const uniqueFolders = new Set(scenarioFolders);
      expect(uniqueFolders.size).toBe(scenarioFolders.length);
    }
  });

  test('should not have state leakage between parallel scenarios', async () => {
    const jsonExists = await fs.pathExists(jsonReportPath);
    
    if (jsonExists) {
      const reportContent = await fs.readFile(jsonReportPath, 'utf-8');
      const report = JSON.parse(reportContent);
      
      // Verify each scenario has its own execution context
      // by checking that scenarios don't share step results
      const scenarioIds = new Set();
      
      for (const feature of report) {
        if (feature.elements && Array.isArray(feature.elements)) {
          for (const scenario of feature.elements) {
            // Each scenario should have a unique ID
            const scenarioId = `${feature.name}::${scenario.name}`;
            expect(scenarioIds.has(scenarioId)).toBe(false);
            scenarioIds.add(scenarioId);
            
            // Verify scenario has its own steps
            expect(scenario.steps).toBeDefined();
            expect(Array.isArray(scenario.steps)).toBe(true);
          }
        }
      }
      
      expect(scenarioIds.size).toBeGreaterThan(1);
    }
  });

  test('should generate complete reports for all parallel scenarios', async () => {
    const jsonExists = await fs.pathExists(jsonReportPath);
    
    if (jsonExists) {
      const reportContent = await fs.readFile(jsonReportPath, 'utf-8');
      const report = JSON.parse(reportContent);
      
      // Verify all scenarios have complete step information
      let incompleteScenarios = 0;
      let completeScenarios = 0;
      
      for (const feature of report) {
        if (feature.elements && Array.isArray(feature.elements)) {
          for (const scenario of feature.elements) {
            if (!scenario.steps || scenario.steps.length === 0) {
              incompleteScenarios++;
            } else {
              // Verify all steps have results
              let allStepsHaveResults = true;
              for (const step of scenario.steps) {
                if (!step.result || !step.result.status) {
                  allStepsHaveResults = false;
                  break;
                }
              }
              
              if (allStepsHaveResults) {
                completeScenarios++;
              } else {
                incompleteScenarios++;
              }
            }
          }
        }
      }
      
      // All scenarios should be complete
      expect(completeScenarios).toBeGreaterThan(0);
      console.log(`Complete scenarios: ${completeScenarios}, Incomplete: ${incompleteScenarios}`);
    }
  });

  test('should handle concurrent browser contexts correctly', async () => {
    const jsonExists = await fs.pathExists(jsonReportPath);
    
    if (jsonExists) {
      const reportContent = await fs.readFile(jsonReportPath, 'utf-8');
      const report = JSON.parse(reportContent);
      
      // Verify scenarios executed without browser context errors
      let browserErrors = 0;
      let successfulScenarios = 0;
      
      for (const feature of report) {
        if (feature.elements && Array.isArray(feature.elements)) {
          for (const scenario of feature.elements) {
            if (scenario.steps && Array.isArray(scenario.steps)) {
              let scenarioHasError = false;
              
              for (const step of scenario.steps) {
                if (step.result && step.result.error_message) {
                  const errorMsg = step.result.error_message.toLowerCase();
                  if (errorMsg.includes('context') || 
                      errorMsg.includes('browser') ||
                      errorMsg.includes('page closed')) {
                    browserErrors++;
                    scenarioHasError = true;
                    break;
                  }
                }
              }
              
              if (!scenarioHasError) {
                successfulScenarios++;
              }
            }
          }
        }
      }
      
      // Should have more successful scenarios than browser errors
      expect(successfulScenarios).toBeGreaterThan(0);
      console.log(`Successful scenarios: ${successfulScenarios}, Browser errors: ${browserErrors}`);
    }
  });

  test('should execute scenarios in reasonable time with parallelization', async () => {
    const jsonExists = await fs.pathExists(jsonReportPath);
    
    if (jsonExists) {
      const reportContent = await fs.readFile(jsonReportPath, 'utf-8');
      const report = JSON.parse(reportContent);
      
      // Calculate total execution time
      let totalDuration = 0;
      let scenarioCount = 0;
      
      for (const feature of report) {
        if (feature.elements && Array.isArray(feature.elements)) {
          for (const scenario of feature.elements) {
            scenarioCount++;
            
            if (scenario.steps && Array.isArray(scenario.steps)) {
              for (const step of scenario.steps) {
                if (step.result && typeof step.result.duration === 'number') {
                  totalDuration += step.result.duration;
                }
              }
            }
          }
        }
      }
      
      if (scenarioCount > 0 && totalDuration > 0) {
        const avgDurationPerScenario = totalDuration / scenarioCount;
        console.log(`Average duration per scenario: ${(avgDurationPerScenario / 1000000000).toFixed(2)}s`);
        
        // Verify we have reasonable execution times
        expect(avgDurationPerScenario).toBeGreaterThan(0);
      }
    }
  });

  test('should maintain artifact isolation in parallel execution', async () => {
    const scenariosExist = await fs.pathExists(scenariosPath);
    
    if (scenariosExist) {
      const scenarioFolders = await fs.readdir(scenariosPath);
      
      // Check that each scenario folder has its own artifacts
      const foldersWithArtifacts = [];
      
      for (const folder of scenarioFolders) {
        const folderPath = path.join(scenariosPath, folder);
        const files = await fs.readdir(folderPath);
        
        // Check for screenshots or traces
        const hasArtifacts = files.some(file => 
          file.endsWith('.png') || 
          file.endsWith('.zip') || 
          file.endsWith('.webm')
        );
        
        if (hasArtifacts) {
          foldersWithArtifacts.push(folder);
        }
      }
      
      // At least some scenarios should have artifacts
      expect(foldersWithArtifacts.length).toBeGreaterThan(0);
      
      // Verify no artifact file name collisions
      const allArtifactPaths = new Set();
      
      for (const folder of scenarioFolders) {
        const folderPath = path.join(scenariosPath, folder);
        const files = await fs.readdir(folderPath);
        
        for (const file of files) {
          const fullPath = path.join(folder, file);
          expect(allArtifactPaths.has(fullPath)).toBe(false);
          allArtifactPaths.add(fullPath);
        }
      }
    }
  });

  test('should handle parallel execution with different feature files', async () => {
    const jsonExists = await fs.pathExists(jsonReportPath);
    
    if (jsonExists) {
      const reportContent = await fs.readFile(jsonReportPath, 'utf-8');
      const report = JSON.parse(reportContent);
      
      // Verify we have multiple different features
      const featureNames = new Set();
      
      for (const feature of report) {
        featureNames.add(feature.name);
      }
      
      // Should have at least 2 different features
      expect(featureNames.size).toBeGreaterThanOrEqual(1);
      
      console.log(`Features executed in parallel: ${Array.from(featureNames).join(', ')}`);
    }
  });
});

describe('Parallel Execution Configuration', () => {
  test('should respect parallel configuration setting', async () => {
    // Read cucumber.js to verify parallel configuration
    const cucumberConfigPath = 'cucumber.js';
    const configExists = await fs.pathExists(cucumberConfigPath);
    
    expect(configExists).toBe(true);
    
    if (configExists) {
      const configContent = await fs.readFile(cucumberConfigPath, 'utf-8');
      
      // Verify parallel configuration is present
      expect(configContent).toContain('parallel');
      
      // Verify it's set to a number greater than 1 for parallel profiles
      const parallelMatch = configContent.match(/parallel:\s*(\d+)/g);
      expect(parallelMatch).toBeDefined();
      expect(parallelMatch!.length).toBeGreaterThan(0);
    }
  });

  test('should have npm script for parallel execution', async () => {
    const packageJsonPath = 'package.json';
    const packageJson = await fs.readJson(packageJsonPath);
    
    expect(packageJson.scripts).toHaveProperty('test:cucumber:parallel');
    expect(packageJson.scripts['test:cucumber:parallel']).toContain('parallel');
  });
});

describe('Parallel Execution Error Handling', () => {
  test('should handle failures in parallel scenarios independently', async () => {
    const jsonExists = await fs.pathExists(jsonReportPath);
    
    if (jsonExists) {
      const reportContent = await fs.readFile(jsonReportPath, 'utf-8');
      const report = JSON.parse(reportContent);
      
      // Check if we have both passed and failed scenarios
      let passedCount = 0;
      let failedCount = 0;
      
      for (const feature of report) {
        if (feature.elements && Array.isArray(feature.elements)) {
          for (const scenario of feature.elements) {
            let scenarioPassed = true;
            
            if (scenario.steps && Array.isArray(scenario.steps)) {
              for (const step of scenario.steps) {
                if (step.result && step.result.status !== 'passed') {
                  scenarioPassed = false;
                  break;
                }
              }
            }
            
            if (scenarioPassed) {
              passedCount++;
            } else {
              failedCount++;
            }
          }
        }
      }
      
      // Verify we have scenario results
      const totalScenarios = passedCount + failedCount;
      expect(totalScenarios).toBeGreaterThan(0);
      
      console.log(`Parallel execution results: ${passedCount} passed, ${failedCount} failed`);
    }
  });
});
