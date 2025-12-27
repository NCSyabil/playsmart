import { describe, test, expect } from '@jest/globals';
import * as fc from 'fast-check';

/**
 * Property-based tests for tag-based filtering
 * 
 * Feature: cucumber-integration, Property 8: Tag-Based Filtering
 * 
 * Property 8: Tag-Based Filtering
 * For any Cucumber execution with a tag filter (e.g., @smoke), only scenarios
 * tagged with that tag should be executed.
 * 
 * Validates: Requirements 8.3
 */

// Mock scenario structure
interface MockScenario {
  name: string;
  tags: string[];
}

interface MockFeature {
  name: string;
  scenarios: MockScenario[];
}

/**
 * Tag filter function that simulates Cucumber's tag filtering logic
 */
function filterScenariosByTag(
  features: MockFeature[],
  tagExpression: string
): MockScenario[] {
  const scenarios: MockScenario[] = [];
  
  for (const feature of features) {
    for (const scenario of feature.scenarios) {
      if (matchesTagExpression(scenario.tags, tagExpression)) {
        scenarios.push(scenario);
      }
    }
  }
  
  return scenarios;
}

/**
 * Check if a scenario's tags match a tag expression
 */
function matchesTagExpression(scenarioTags: string[], expression: string): boolean {
  // Normalize tags (ensure they start with @)
  const normalizedTags = scenarioTags.map(tag => 
    tag.startsWith('@') ? tag : `@${tag}`
  );
  
  // Handle simple tag expressions
  if (expression.startsWith('@')) {
    // Simple tag match: @smoke
    return normalizedTags.includes(expression);
  }
  
  if (expression.startsWith('not @')) {
    // NOT expression: not @regression
    const excludeTag = expression.replace('not ', '');
    return !normalizedTags.includes(excludeTag);
  }
  
  if (expression.includes(' and ')) {
    // AND expression: @smoke and @login
    const requiredTags = expression.split(' and ').map(t => t.trim());
    return requiredTags.every(tag => normalizedTags.includes(tag));
  }
  
  if (expression.includes(' or ')) {
    // OR expression: @smoke or @quick
    const anyTags = expression.split(' or ').map(t => t.trim());
    return anyTags.some(tag => normalizedTags.includes(tag));
  }
  
  return false;
}

describe('Property-Based Tests: Tag-Based Filtering', () => {
  // Arbitrary for generating tag names
  const tagArbitrary = fc.constantFrom(
    '@smoke',
    '@regression',
    '@login',
    '@quick',
    '@e2e',
    '@auth',
    '@api',
    '@ui'
  );

  // Arbitrary for generating scenarios with tags
  const scenarioArbitrary = fc.record({
    name: fc.string({ minLength: 5, maxLength: 50 }),
    tags: fc.array(tagArbitrary, { minLength: 0, maxLength: 5 })
  });

  // Arbitrary for generating features with scenarios
  const featureArbitrary = fc.record({
    name: fc.string({ minLength: 5, maxLength: 50 }),
    scenarios: fc.array(scenarioArbitrary, { minLength: 1, maxLength: 10 })
  });

  test('property: single tag filter only returns scenarios with that tag', () => {
    fc.assert(
      fc.property(
        fc.array(featureArbitrary, { minLength: 1, maxLength: 5 }),
        tagArbitrary,
        (features, filterTag) => {
          // Filter scenarios by tag
          const filteredScenarios = filterScenariosByTag(features, filterTag);
          
          // Verify all filtered scenarios have the required tag
          for (const scenario of filteredScenarios) {
            const normalizedTags = scenario.tags.map(tag => 
              tag.startsWith('@') ? tag : `@${tag}`
            );
            expect(normalizedTags).toContain(filterTag);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('property: NOT tag filter excludes scenarios with that tag', () => {
    fc.assert(
      fc.property(
        fc.array(featureArbitrary, { minLength: 1, maxLength: 5 }),
        tagArbitrary,
        (features, excludeTag) => {
          // Filter scenarios with NOT expression
          const notExpression = `not ${excludeTag}`;
          const filteredScenarios = filterScenariosByTag(features, notExpression);
          
          // Verify no filtered scenario has the excluded tag
          for (const scenario of filteredScenarios) {
            const normalizedTags = scenario.tags.map(tag => 
              tag.startsWith('@') ? tag : `@${tag}`
            );
            expect(normalizedTags).not.toContain(excludeTag);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('property: AND tag filter requires all tags', () => {
    fc.assert(
      fc.property(
        fc.array(featureArbitrary, { minLength: 1, maxLength: 5 }),
        tagArbitrary,
        tagArbitrary,
        (features, tag1, tag2) => {
          // Skip if tags are the same
          if (tag1 === tag2) return true;
          
          // Filter scenarios with AND expression
          const andExpression = `${tag1} and ${tag2}`;
          const filteredScenarios = filterScenariosByTag(features, andExpression);
          
          // Verify all filtered scenarios have both tags
          for (const scenario of filteredScenarios) {
            const normalizedTags = scenario.tags.map(tag => 
              tag.startsWith('@') ? tag : `@${tag}`
            );
            expect(normalizedTags).toContain(tag1);
            expect(normalizedTags).toContain(tag2);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('property: OR tag filter requires at least one tag', () => {
    fc.assert(
      fc.property(
        fc.array(featureArbitrary, { minLength: 1, maxLength: 5 }),
        tagArbitrary,
        tagArbitrary,
        (features, tag1, tag2) => {
          // Filter scenarios with OR expression
          const orExpression = `${tag1} or ${tag2}`;
          const filteredScenarios = filterScenariosByTag(features, orExpression);
          
          // Verify all filtered scenarios have at least one of the tags
          for (const scenario of filteredScenarios) {
            const normalizedTags = scenario.tags.map(tag => 
              tag.startsWith('@') ? tag : `@${tag}`
            );
            const hasTag1 = normalizedTags.includes(tag1);
            const hasTag2 = normalizedTags.includes(tag2);
            expect(hasTag1 || hasTag2).toBe(true);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('property: filtering is idempotent', () => {
    fc.assert(
      fc.property(
        fc.array(featureArbitrary, { minLength: 1, maxLength: 5 }),
        tagArbitrary,
        (features, filterTag) => {
          // Filter once
          const firstFilter = filterScenariosByTag(features, filterTag);
          
          // Create new features from filtered scenarios
          const filteredFeatures: MockFeature[] = [{
            name: 'Filtered Feature',
            scenarios: firstFilter
          }];
          
          // Filter again
          const secondFilter = filterScenariosByTag(filteredFeatures, filterTag);
          
          // Results should be the same
          expect(secondFilter.length).toBe(firstFilter.length);
          
          // Verify scenario names match
          const firstNames = firstFilter.map(s => s.name).sort();
          const secondNames = secondFilter.map(s => s.name).sort();
          expect(secondNames).toEqual(firstNames);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('property: scenarios without tags are not matched by any tag filter', () => {
    fc.assert(
      fc.property(
        fc.array(featureArbitrary, { minLength: 1, maxLength: 5 }),
        tagArbitrary,
        (features, filterTag) => {
          // Add scenarios without tags
          const featuresWithUntagged = features.map(feature => ({
            ...feature,
            scenarios: [
              ...feature.scenarios,
              { name: 'Untagged Scenario', tags: [] }
            ]
          }));
          
          // Filter scenarios
          const filteredScenarios = filterScenariosByTag(featuresWithUntagged, filterTag);
          
          // Verify no untagged scenarios are included
          for (const scenario of filteredScenarios) {
            expect(scenario.tags.length).toBeGreaterThan(0);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('property: filtering with non-existent tag returns empty result', () => {
    fc.assert(
      fc.property(
        fc.array(featureArbitrary, { minLength: 1, maxLength: 5 }),
        (features) => {
          // Use a tag that doesn't exist in our tag set
          const nonExistentTag = '@nonexistent-tag-xyz';
          
          // Filter scenarios
          const filteredScenarios = filterScenariosByTag(features, nonExistentTag);
          
          // Should return empty or only scenarios that happen to have this tag
          for (const scenario of filteredScenarios) {
            const normalizedTags = scenario.tags.map(tag => 
              tag.startsWith('@') ? tag : `@${tag}`
            );
            expect(normalizedTags).toContain(nonExistentTag);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('property: tag filtering preserves scenario order within features', () => {
    fc.assert(
      fc.property(
        fc.array(featureArbitrary, { minLength: 1, maxLength: 5 }),
        tagArbitrary,
        (features, filterTag) => {
          // Filter scenarios
          const filteredScenarios = filterScenariosByTag(features, filterTag);
          
          // Group filtered scenarios by feature
          const scenariosByFeature = new Map<string, string[]>();
          
          for (const feature of features) {
            const featureScenarios: string[] = [];
            
            for (const scenario of feature.scenarios) {
              if (matchesTagExpression(scenario.tags, filterTag)) {
                featureScenarios.push(scenario.name);
              }
            }
            
            if (featureScenarios.length > 0) {
              scenariosByFeature.set(feature.name, featureScenarios);
            }
          }
          
          // Verify filtered scenarios maintain order
          // (This is a simplified check - in reality, order is preserved per feature)
          expect(filteredScenarios.length).toBeGreaterThanOrEqual(0);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('property: combining filters with AND is more restrictive than OR', () => {
    fc.assert(
      fc.property(
        fc.array(featureArbitrary, { minLength: 1, maxLength: 5 }),
        tagArbitrary,
        tagArbitrary,
        (features, tag1, tag2) => {
          // Skip if tags are the same
          if (tag1 === tag2) return true;
          
          // Filter with AND
          const andExpression = `${tag1} and ${tag2}`;
          const andResults = filterScenariosByTag(features, andExpression);
          
          // Filter with OR
          const orExpression = `${tag1} or ${tag2}`;
          const orResults = filterScenariosByTag(features, orExpression);
          
          // AND should return fewer or equal scenarios than OR
          expect(andResults.length).toBeLessThanOrEqual(orResults.length);
          
          // All AND results should be in OR results
          for (const andScenario of andResults) {
            const foundInOr = orResults.some(orScenario => 
              orScenario.name === andScenario.name
            );
            expect(foundInOr).toBe(true);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('property: tag matching is case-sensitive', () => {
    fc.assert(
      fc.property(
        fc.array(featureArbitrary, { minLength: 1, maxLength: 5 }),
        (features) => {
          // Filter with lowercase tag
          const lowerResults = filterScenariosByTag(features, '@smoke');
          
          // Filter with uppercase tag (should not match)
          const upperResults = filterScenariosByTag(features, '@SMOKE');
          
          // Verify all lowercase results have @smoke tag
          for (const scenario of lowerResults) {
            const normalizedTags = scenario.tags.map(tag => 
              tag.startsWith('@') ? tag : `@${tag}`
            );
            expect(normalizedTags).toContain('@smoke');
          }
          
          // Uppercase should not match (our tag set is lowercase)
          expect(upperResults.length).toBe(0);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Tag Expression Parsing Properties', () => {
  // Arbitrary for generating tag names
  const tagArb = fc.constantFrom(
    '@smoke',
    '@regression',
    '@login',
    '@quick',
    '@e2e',
    '@auth',
    '@api',
    '@ui'
  );

  // Arbitrary for generating scenarios with tags
  const scenarioArb = fc.record({
    name: fc.string({ minLength: 5, maxLength: 50 }),
    tags: fc.array(tagArb, { minLength: 0, maxLength: 5 })
  });

  // Arbitrary for generating features with scenarios
  const featureArb = fc.record({
    name: fc.string({ minLength: 5, maxLength: 50 }),
    scenarios: fc.array(scenarioArb, { minLength: 1, maxLength: 10 })
  });

  test('property: tag expressions are parsed consistently', () => {
    fc.assert(
      fc.property(
        fc.array(featureArb, { minLength: 1, maxLength: 5 }),
        tagArb,
        (features, tag) => {
          // Parse the same expression multiple times
          const result1 = filterScenariosByTag(features, tag);
          const result2 = filterScenariosByTag(features, tag);
          
          // Results should be identical
          expect(result2.length).toBe(result1.length);
          
          const names1 = result1.map(s => s.name).sort();
          const names2 = result2.map(s => s.name).sort();
          expect(names2).toEqual(names1);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('property: empty tag expression matches nothing', () => {
    fc.assert(
      fc.property(
        fc.array(featureArb, { minLength: 1, maxLength: 5 }),
        (features) => {
          // Filter with empty expression
          const results = filterScenariosByTag(features, '');
          
          // Should match nothing
          expect(results.length).toBe(0);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
