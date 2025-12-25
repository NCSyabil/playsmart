export const config = {
  baseUrl: "https://your-app.com", // Excepted: Any url. Default: Blank
  cucumber:{
    featureFileCache: false, // [true | false] Excepted: Boolean only. Default: false
    stepGroupCache: true // [true | false] Excepted: Boolean only. Default: false
  },
  browser: {
    playwrightSession: "shared",     // "shared" | "isolated" | "perTest" | "perFile" | "none" - [ Default: shared ]     (Playwright Runner Browser Session Control)
    cucumberSession: "perScenario",  // "shared" | "perScenario" | "perFeature" - [ Default: shared ] (Cucumber Browser Session Control)
    headless: true,    // Optional: run in headless mode - [ Default: true ]
    browserType: "chromium", // "chromium" | "firefox" | "webkit" - [ Default: "chromium" ]
  },
  artifacts: {
    screenshot: true, // [true | false] Expected: Boolean only. Default: false
    video: true, // [on | false] Excepted: Boolean only. Default: false
    trace: true, // [true | false] Excepted: Boolean only. Default: false
    onFailureOnly: true, // [true | false] Expected: Boolean only. Default: true (false: Will capture on all test cases)
    onSuccessOnly: false, // [true | false] Expected: Boolean only. Default: false
    cleanUpBeforeRun: true, // [true | false] Expected: Boolean only. Default: false  
  },
  testExecution: {
    timeout: 60000, // (Test timeout) [Numeric only]. Default: 60000 milliseconds (60 seconds for each test)
    actionTimeout: 30000, // (Action timeout) [Numeric only]. Default: 10000 milliseconds (10 seconds for each action e.g., click, fill)
    navigationTimeout: 60000, // (Navigation timeout) [Numeric only]. Default: 20000 milliseconds (20 seconds for page.goto, etc.)
    retryOnFailure: true, // [true | false] Expected: Boolean only. Default: false
    parallel: true, // [true | false] Expected: Boolean only. Default: false
    maxInstances: 5, // [true | false] Expected: numeric only. Default: 5
    maxRetries: 2, // Expected: numeric only. Default: 0
    retryDelay: 1000, // Expected: numeric only. Default: 1000 milliseconds (1 second)
    retryInterval: 2000, // Expected: numeric only. Default: 5000 milliseconds (5 seconds)
    retryTimeout: 30000, // Expected: numeric only. Default: 30000 milliseconds (30 seconds)
    order: "sequential", // Expected: "sequential" or "random". Default: "sequential"
    autoReportOpen: true, // [true | false] Expected: Boolean only. Default: true
  },
  apiTest:{
    maxUrlRedirects: 5, // Expected: numeric only. Default: 5
    timeout: 10000,     // Expected: numeric only. Default: 10000 milliseconds (10 seconds)
  },
  patternIq: {
    enable:true, // Expected: Boolean only. Default: false *
    config: "uportalOb",
    retryInterval: 2000, // [in milliseconds] Expected: Numeric only. Default: 2000 milliseconds (2 seconds) *
    retryTimeout: 30000, // [in milliseconds] Expected: Numeric only. Default: 30000 milliseconds (30 seconds) *
  },
  smartAi: {
    enable:false, // [true | false] Expected: Boolean only. Default: false *
    consoleLog: true, // [true | false] Expected: Boolean only. Default: false *
    resolve: "smart", // ["smart" | "always"] Expected: string only. Default: "smart" *
  },
  addons: {
    d365Crm: {
       enable:false, // [true | false] Expected: Boolean only. Default: false *
       version: "v9.2", // Expected: "v9.2" or "v9.2.nl". Default: "v9.2"
      },
    d365FinOps: {
       enable:false, // [true | false] Expected: Boolean only. Default: false *
       version: "v9.2", // Expected: "v9.2" or "v9.2.nl". Default: "v9.2"
      },
  },
  report:{
    allure:{
      singleFile: false // [true | false] Expected: Boolean only. Default: false * [Require Allure to be installed in the system]

    }
  },
  featureFlags: {
    enableBetaUI: true,
    useMockBackend: false
  },
  supportedLanguages: ["en", "fr", "es"]
};