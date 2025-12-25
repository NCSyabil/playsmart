import fs from 'fs';
import path from 'path';
import { sync } from 'glob';
import { config, vars } from '@playq';

import { generateStepGroupsIfNeeded } from './sgGenerator';
import {
  getCachedFeatureFilePath,
  shouldUseCachedFeature,
  updateFeatureCacheMeta
} from './featureFileCache';
import { preprocessFeatureFile } from './featureFilePreProcess';

const featureFileCache = config?.cucumber?.featureFileCache || (vars.getConfigValue('cucumber.featureFileCache')|| false);
const isForce = process.argv.includes('--force');

console.log(' Running preProcessEntry.ts...');
console.log(`️ featureFileCache enabled: ${featureFileCache}`);
console.log(`️ Force flag: ${isForce}`);

generateStepGroupsIfNeeded(isForce);

const featureFiles = sync('test/features/**/*.feature');
if (!featureFiles.length) {
  console.warn('️ No feature files found under features/**/*.feature');
}

// Clean up execution folder before generating new feature files
const executionDir = path.join('_Temp', 'execution');
if (fs.existsSync(executionDir)) {
  fs.rmSync(executionDir, { recursive: true, force: true });
  console.log(` Cleaned up execution folder: ${executionDir}`);
}

for (const originalPath of featureFiles) {
  console.log(` Processing: ${originalPath}`);
  const cachedPath = getCachedFeatureFilePath(originalPath);
  console.log(` Cached path: ${cachedPath}`);

  if (featureFileCache && !isForce && shouldUseCachedFeature(originalPath, cachedPath)) {
    console.log(` Using cached feature file: ${cachedPath}`);
    continue;
  }

  const updatedContent = preprocessFeatureFile(originalPath);
  if (!updatedContent || !updatedContent.trim().startsWith('Feature')) {
    console.warn(` Skipping cache write for ${originalPath}: Invalid content. Preview:\n${(updatedContent || '').substring(0, 100)}`);
    continue;
  }

  fs.mkdirSync(path.dirname(cachedPath), { recursive: true });
  fs.writeFileSync(cachedPath, updatedContent, 'utf-8');
  console.log(` Updated cached feature file: ${cachedPath}`);

  if (featureFileCache) {
    updateFeatureCacheMeta(originalPath, cachedPath);
  }
}