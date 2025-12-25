import { shutdownBrowser } from '../cucumber/testLifecycleHooks';

export default async () => {
  console.log(' Playwright global teardown: Closing browser...');
  await shutdownBrowser();
};
