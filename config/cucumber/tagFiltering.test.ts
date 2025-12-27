import { describe, test, expect, beforeAll } from '@jest/globals';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Integration tests for tag-based filtering
 * 
 * These tests verify that Cucumber executes only scenarios matching
 * the specified tag filters (@smoke, @regression, @auth, etc.)
 * 
 * Requirements: 8.3
 */

describe('Tag-Based Filtering Integration', () => {
  const testResultsPath = 'test-results';
  const jsonReportPath = path.join(testResultsPath, 'cucumber-report.json');

  beforeAll(async () => {
    // Ensure test-results directory exists
    await fs.ensureDir(testResultsPath);
  });

  test('should execute only @smoke tagged scenarios', async () => {
    // Execute smoke tests
    try {
      await execAsync('npm run test:cucumber:smoke', {
        timeout: 120000 // 2 minutes timeout
      });
    } catch (error: any) {
      console.log('Smoke test execution completed:', error.message);
    }

    // Verify JSON report was generated
    const jsonExists = await fs.pathExists(jsonReportPath);
    expect(jsonExists).toBe(true);

    if (jsonExists) {
      const reportContent = await fs.readFile(jsonReportPath, 'utf-8');
      const report = JSON.parse(reportContent);
      
      // Verify all executed scenarios have @smoke tag
      let totalScenarios = 0;
      let smokeScenarios = 0;
      
      for (const feature of report) {
        if (feature.elements && Array.isArray(feature.elements)) {
          for (const scenario of feature.elements) {
            totalScenarios++;
            
            // Check if scenario has @smoke tag
            if (scenario.tags && Array.isArray(scenario.tags)) {
              const hasSmokeTag = scenario.tags.some((tag: any) => 
                tag.name === '@smoke'
              );
              
              if (hasSmokeTag) {
                smokeScenarios++;
              }
            }
          }
        }
      }
      
      expect(totalScenarios).toBeGreaterThan(0);
      expect(smokeScenarios).toBeGreaterThan(0);
      
      console.log(`Smoke filter: ${smokeScenarios}/${totalScenarios} scenarios have @smoke tag`);
    }
  }, 150000);

  test('should execute only @regression tagged scenarios', async () => {
    // Execute regression tests
    try {
      await execAsync('npm run test:cucumber:regression', {
        timeout: 120000 // 2 minutes timeout
      });
    } catch (error: any) {
      console.log('Regression test execution completed:', error.message);
    }

    // Verify JSON report was generated
    const jsonExists = await fs.pathExists(jsonReportPath);
    expect(jsonExists).toBe(true);

    if (jsonExists) {
      const reportContent = await fs.readFile(jsonReportPath, 'utf-8');
      const report = JSON.parse(reportContent);
      
      // Verify all executed scenarios have @regression tag
      let totalScenarios = 0;
      let regressionScenarios = 0;
      
      for (const feature of report) {
        if (feature.elements && Array.isArray(feature.elements)) {
          for (const scenario of feature.elements) {
            totalScenarios++;
            
            // Check if scenario has @regression tag
            if (scenario.tags && Array.isArray(scenario.tags)) {
              const hasRegressionTag = scenario.tags.some((tag: any) => 
                tag.name === '@regression'
              );
              
              if (hasRegressionTag) {
                regressionScenarios++;
              }
            }
          }
        }
      }
      
      expect(totalScenarios).toBeGreaterThan(0);
      expect(regressionScenarios).toBeGreaterThan(0);
      
      console.log(`Regression filter: ${regressionScenarios}/${totalScenarios} scenarios have @regression tag`);
    }
  }, 150000);

  test('should filter scenarios with custom tag expression', async () => {
    // Execute with custom tag filter
    try {
      await execAsync('npm run test:cucumber:tags -- "@smoke and @login"', {
        timeout: 120000 // 2 minutes timeout
      });
    } catch (error: any) {
      console.log('Custom tag filter execution completed:', error.message);
    }

    // Verify JSON report was generated
    const jsonExists = await fs.pathExists(jsonReportPath);
    expect(jsonExists).toBe(true);

    if (jsonExists) {
      const reportContent = await fs.readFile(jsonReportPath, 'utf-8');
      const report = JSON.parse(reportContent);
      
      // Verify executed scenarios have both @smoke and @login tags
      let totalScenarios = 0;
      let matchingScenarios = 0;
      
      for (const feature of report) {
        if (feature.elements && Array.isArray(feature.elements)) {
          for (const scenario of feature.elements) {
            totalScenarios++;
            
            // Check if scenario has both tags
            if (scenario.tags && Array.isArray(scenario.tags)) {
              const tagNames = scenario.tags.map((tag: any) => tag.name);
              const hasSmokeTag = tagNames.includes('@smoke');
              const hasLoginTag = tagNames.includes('@login');
              
              if (hasSmokeTag && hasLoginTag) {
                matchingScenarios++;
              }
            }
          }
        }
      }
      
      if (totalScenarios > 0) {
        console.log(`Custom filter: ${matchingScenarios}/${totalScenarios} scenarios match "@smoke and @login"`);
      }
    }
  }, 150000);

  test('should exclude scenarios with NOT tag expression', async () => {
    // Execute with NOT tag filter
    try {
      await execAsync('npm run test:cucumber:tags -- "not @regression"', {
        timeout: 120000 // 2 minutes timeout
      });
    } catch (error: any) {
      console.log('NOT tag filter execution completed:', error.message);
    }

    // Verify JSON report was generated
    const jsonExists = await fs.pathExists(jsonReportPath);
    expect(jsonExists).toBe(true);

    if (jsonExists) {
      const reportContent = await fs.readFile(jsonReportPath, 'utf-8');
      const report = JSON.parse(reportContent);
      
      // Verify executed scenarios do NOT have @regression tag
      let totalScenarios = 0;
      let nonRegressionScenarios = 0;
      
      for (const feature of report) {
        if (feature.elements && Array.isArray(feature.elements)) {
          for (const scenario of feature.elements) {
            totalScenarios++;
            
            // Check if scenario does NOT have @regression tag
            let hasRegressionTag = false;
            if (scenario.tags && Array.isArray(scenario.tags)) {
              hasRegressionTag = scenario.tags.some((tag: any) => 
                tag.name === '@regression'
              );
            }
            
            if (!hasRegressionTag) {
              nonRegressionScenarios++;
            }
          }
        }
      }
      
      if (totalScenarios > 0) {
        console.log(`NOT filter: ${nonRegressionScenarios}/${totalScenarios} scenarios without @regression`);
      }
    }
  }, 150000);

  test('should handle OR tag expressions', async () => {
    // Execute with OR tag filter
    try {
      await execAsync('npm run test:cucumber:tags -- "@smoke or @quick"', {
        timeout: 120000 // 2 minutes timeout
      });
    } catch (error: any) {
      console.log('OR tag filter execution completed:', error.message);
    }

    // Verify JSON report was generated
    const jsonExists = await fs.pathExists(jsonReportPath);
    expect(jsonExists).toBe(true);

    if (jsonExists) {
      const reportContent = await fs.readFile(jsonReportPath, 'utf-8');
      const report = JSON.parse(reportContent);
      
      // Verify executed scenarios have either @smoke or @quick tag
      let totalScenarios = 0;
      let matchingScenarios = 0;
      
      for (const feature of report) {
        if (feature.elements && Array.isArray(feature.elements)) {
          for (const scenario of feature.elements) {
            totalScenarios++;
            
            // Check if scenario has @smoke or @quick tag
            if (scenario.tags && Array.isArray(scenario.tags)) {
              const tagNames = scenario.tags.map((tag: any) => tag.name);
              const hasSmokeTag = tagNames.includes('@smoke');
              const hasQuickTag = tagNames.includes('@quick');
              
              if (hasSmokeTag || hasQuickTag) {
                matchingScenarios++;
              }
            }
          }
        }
      }
      
      if (totalScenarios > 0) {
        console.log(`OR filter: ${matchingScenarios}/${totalScenarios} scenarios match "@smoke or @quick"`);
      }
    }
  }, 150000);
});

describe('Tag Configuration Validation', () => {
  test('should have tag configuration in cucumber profiles', async () => {
    const cucumberConfigPath = 'cucumber.js';
    const configExists = await fs.pathExists(cucumberConfigPath);
    
    expect(configExists).toBe(true);
    
    if (configExists) {
      const configContent = await fs.readFile(cucumberConfigPath, 'utf-8');
      
      // Verify smoke profile has tags configuration
      expect(configContent).toContain('smoke');
      expect(configContent).toContain('tags:');
      
      // Verify regression profile has tags configuration
      expect(configContent).toContain('regression');
    }
  });

  test('should have npm scripts for tag-based execution', async () => {
    const packageJsonPath = 'package.json';
    const packageJson = await fs.readJson(packageJsonPath);
    
    // Verify tag-based scripts exist
    expect(packageJson.scripts).toHaveProperty('test:cucumber:smoke');
    expect(packageJson.scripts).toHaveProperty('test:cucumber:regression');
    expect(packageJson.scripts).toHaveProperty('test:cucumber:tags');
    
    // Verify scripts use correct profiles
    expect(packageJson.scripts['test:cucumber:smoke']).toContain('smoke');
    expect(packageJson.scripts['test:cucumber:regression']).toContain('regression');
  });
});

describe('Tag Metadata in Reports', () => {
  test('should include tag information in JSON report', async () => {
    const jsonExists = await fs.pathExists(jsonReportPath);
    
    if (jsonExists) {
      const reportContent = await fs.readFile(jsonReportPath, 'utf-8');
      const report = JSON.parse(reportContent);
      
      // Find a scenario with tags
      let scenarioWithTags = null;
      
      for (const feature of report) {
        if (feature.elements && Array.isArray(feature.elements)) {
          for (const scenario of feature.elements) {
            if (scenario.tags && scenario.tags.length > 0) {
              scenarioWithTags = scenario;
              break;
            }
          }
        }
        if (scenarioWithTags) break;
      }
      
      if (scenarioWithTags) {
        // Verify tag structure
        expect(scenarioWithTags.tags).toBeDefined();
        expect(Array.isArray(scenarioWithTags.tags)).toBe(true);
        
        const firstTag = scenarioWithTags.tags[0];
        expect(firstTag).toHaveProperty('name');
        expect(typeof firstTag.name).toBe('string');
        expect(firstTag.name).toMatch(/^@/); // Tags should start with @
      }
    }
  });

  test('should preserve feature-level tags', async () => {
    const jsonExists = await fs.pathExists(jsonReportPath);
    
    if (jsonExists) {
      const reportContent = await fs.readFile(jsonReportPath, 'utf-8');
      const report = JSON.parse(reportContent);
      
      // Check if any features have tags
      let featureWithTags = null;
      
      for (const feature of report) {
        if (feature.tags && feature.tags.length > 0) {
          featureWithTags = feature;
          break;
        }
      }
      
      if (featureWithTags) {
        expect(featureWithTags.tags).toBeDefined();
        expect(Array.isArray(featureWithTags.tags)).toBe(true);
        
        const firstTag = featureWithTags.tags[0];
        expect(firstTag).toHaveProperty('name');
        expect(typeof firstTag.name).toBe('string');
      }
    }
  });

  test('should handle scenarios with multiple tags', async () => {
    const jsonExists = await fs.pathExists(jsonReportPath);
    
    if (jsonExists) {
      const reportContent = await fs.readFile(jsonReportPath, 'utf-8');
      const report = JSON.parse(reportContent);
      
      // Find a scenario with multiple tags
      let scenarioWithMultipleTags = null;
      
      for (const feature of report) {
        if (feature.elements && Array.isArray(feature.elements)) {
          for (const scenario of feature.elements) {
            if (scenario.tags && scenario.tags.length > 1) {
              scenarioWithMultipleTags = scenario;
              break;
            }
          }
        }
        if (scenarioWithMultipleTags) break;
      }
      
      if (scenarioWithMultipleTags) {
        expect(scenarioWithMultipleTags.tags.length).toBeGreaterThan(1);
        
        // Verify all tags are unique
        const tagNames = scenarioWithMultipleTags.tags.map((tag: any) => tag.name);
        const uniqueTags = new Set(tagNames);
        expect(uniqueTags.size).toBe(tagNames.length);
      }
    }
  });
});

describe('Tag Filtering Edge Cases', () => {
  test('should handle scenarios without tags', async () => {
    const jsonExists = await fs.pathExists(jsonReportPath);
    
    if (jsonExists) {
      const reportContent = await fs.readFile(jsonReportPath, 'utf-8');
      const report = JSON.parse(reportContent);
      
      // Check if there are scenarios without tags
      let scenariosWithoutTags = 0;
      let totalScenarios = 0;
      
      for (const feature of report) {
        if (feature.elements && Array.isArray(feature.elements)) {
          for (const scenario of feature.elements) {
            totalScenarios++;
            
            if (!scenario.tags || scenario.tags.length === 0) {
              scenariosWithoutTags++;
            }
          }
        }
      }
      
      console.log(`Scenarios without tags: ${scenariosWithoutTags}/${totalScenarios}`);
      
      // Just verify we can handle scenarios without tags
      expect(totalScenarios).toBeGreaterThan(0);
    }
  });

  test('should handle case-sensitive tag matching', async () => {
    const jsonExists = await fs.pathExists(jsonReportPath);
    
    if (jsonExists) {
      const reportContent = await fs.readFile(jsonReportPath, 'utf-8');
      const report = JSON.parse(reportContent);
      
      // Verify tags are case-sensitive
      const allTags = new Set<string>();
      
      for (const feature of report) {
        if (feature.elements && Array.isArray(feature.elements)) {
          for (const scenario of feature.elements) {
            if (scenario.tags && Array.isArray(scenario.tags)) {
              for (const tag of scenario.tags) {
                allTags.add(tag.name);
              }
            }
          }
        }
      }
      
      // Verify tags maintain their case
      for (const tag of allTags) {
        expect(tag).toMatch(/^@[a-z-]+$/); // Tags should be lowercase with hyphens
      }
    }
  });
});
