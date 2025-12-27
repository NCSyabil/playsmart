
module.exports = {
    default: {
        formatOptions: {
            snippetInterface: "async-await"
        },
        paths: [
             "./features/**/*.feature",
             "./_TEMP/execution/**/*.feature"
        ],
        dryRun: false,
        require: [
            "ts-node/register", // <-- Should be in top
            "tsconfig-paths/register",  // <-- added to enable path aliasing
            "./src/global.ts", // Should be belore the steps and hooks
            "./test/steps/**/*.ts",
            "./extend/addons/**/*.ts",
            "./src/helper/actions/webStepDefs.ts",
            "./src/helper/actions/commStepDefs.ts",
            "./src/helper/actions/hidden/*.ts",
            "config/cucumber/hooks.ts",
            "config/cucumber/stepHook.ts"
        ],
        requireModule: [
            "ts-node/register",
            "tsconfig-paths/register"
        ],
        format: [
            "progress-bar",
            "html:test-results/cucumber-report.html",
            "json:test-results/cucumber-report.json",
            "rerun:@rerun.txt",
        ],
        parallel: 1
    },
    smoke: {
        formatOptions: {
            snippetInterface: "async-await"
        },
        paths: [
             "./features/**/*.feature"
        ],
        dryRun: false,
        require: [
            "ts-node/register",
            "tsconfig-paths/register",
            "./src/global.ts",
            "./test/steps/**/*.ts",
            "./extend/addons/**/*.ts",
            "./src/helper/actions/webStepDefs.ts",
            "./src/helper/actions/commStepDefs.ts",
            "./src/helper/actions/hidden/*.ts",
            "config/cucumber/hooks.ts",
            "config/cucumber/stepHook.ts"
        ],
        requireModule: [
            "ts-node/register",
            "tsconfig-paths/register"
        ],
        format: [
            "progress-bar",
            "html:test-results/cucumber-report.html",
            "json:test-results/cucumber-report.json",
        ],
        parallel: 2,
        tags: "@smoke"
    },
    regression: {
        formatOptions: {
            snippetInterface: "async-await"
        },
        paths: [
             "./features/**/*.feature"
        ],
        dryRun: false,
        require: [
            "ts-node/register",
            "tsconfig-paths/register",
            "./src/global.ts",
            "./test/steps/**/*.ts",
            "./extend/addons/**/*.ts",
            "./src/helper/actions/webStepDefs.ts",
            "./src/helper/actions/commStepDefs.ts",
            "./src/helper/actions/hidden/*.ts",
            "config/cucumber/hooks.ts",
            "config/cucumber/stepHook.ts"
        ],
        requireModule: [
            "ts-node/register",
            "tsconfig-paths/register"
        ],
        format: [
            "progress-bar",
            "html:test-results/cucumber-report.html",
            "json:test-results/cucumber-report.json",
            "rerun:@rerun.txt",
        ],
        parallel: 2,
        tags: "@regression"
    },
    e2e: {
        formatOptions: {
            snippetInterface: "async-await"
        },
        paths: [
             "./features/**/*.feature"
        ],
        dryRun: false,
        require: [
            "ts-node/register",
            "tsconfig-paths/register",
            "./src/global.ts",
            "./test/steps/**/*.ts",
            "./extend/addons/**/*.ts",
            "./src/helper/actions/webStepDefs.ts",
            "./src/helper/actions/commStepDefs.ts",
            "./src/helper/actions/hidden/*.ts",
            "config/cucumber/hooks.ts",
            "config/cucumber/stepHook.ts"
        ],
        requireModule: [
            "ts-node/register",
            "tsconfig-paths/register"
        ],
        format: [
            "progress-bar",
            "html:test-results/cucumber-report.html",
            "json:test-results/cucumber-report.json",
            "rerun:@rerun.txt",
        ],
        parallel: 2,
        tags: "@e2e"
    },
    rerun: {
        formatOptions: {
            snippetInterface: "async-await"
        },
        paths: [
             "@rerun.txt"
        ],
        dryRun: false,
        require: [
            "ts-node/register",
            "tsconfig-paths/register",
            "./src/global.ts",
            "./test/steps/**/*.ts",
            "./extend/addons/**/*.ts",
            "./src/helper/actions/webStepDefs.ts",
            "./src/helper/actions/commStepDefs.ts",
            "./src/helper/actions/hidden/*.ts",
            "config/cucumber/hooks.ts",
            "config/cucumber/stepHook.ts"
        ],
        requireModule: [
            "ts-node/register",
            "tsconfig-paths/register"
        ],
        format: [
            "progress-bar",
            "html:test-results/cucumber-report.html",
            "json:test-results/cucumber-report.json",
        ],
        parallel: 1
    },
    dev: {
        formatOptions: {
            snippetInterface: "async-await"
        },
        paths: [
             "./features/**/*.feature"
        ],
        dryRun: false,
        require: [
            "ts-node/register",
            "tsconfig-paths/register",
            "./src/global.ts",
            "./test/steps/**/*.ts",
            "./extend/addons/**/*.ts",
            "./src/helper/actions/webStepDefs.ts",
            "./src/helper/actions/commStepDefs.ts",
            "./src/helper/actions/hidden/*.ts",
            "config/cucumber/hooks.ts",
            "config/cucumber/stepHook.ts"
        ],
        requireModule: [
            "ts-node/register",
            "tsconfig-paths/register"
        ],
        format: [
            "progress-bar",
            "html:test-results/cucumber-report.html",
            "json:test-results/cucumber-report.json",
            "rerun:@rerun.txt",
        ],
        parallel: 1,
        worldParameters: {
            environment: "dev"
        }
    },
    staging: {
        formatOptions: {
            snippetInterface: "async-await"
        },
        paths: [
             "./features/**/*.feature"
        ],
        dryRun: false,
        require: [
            "ts-node/register",
            "tsconfig-paths/register",
            "./src/global.ts",
            "./test/steps/**/*.ts",
            "./extend/addons/**/*.ts",
            "./src/helper/actions/webStepDefs.ts",
            "./src/helper/actions/commStepDefs.ts",
            "./src/helper/actions/hidden/*.ts",
            "config/cucumber/hooks.ts",
            "config/cucumber/stepHook.ts"
        ],
        requireModule: [
            "ts-node/register",
            "tsconfig-paths/register"
        ],
        format: [
            "progress-bar",
            "html:test-results/cucumber-report.html",
            "json:test-results/cucumber-report.json",
            "rerun:@rerun.txt",
        ],
        parallel: 2,
        worldParameters: {
            environment: "staging"
        }
    },
    prod: {
        formatOptions: {
            snippetInterface: "async-await"
        },
        paths: [
             "./features/**/*.feature"
        ],
        dryRun: false,
        require: [
            "ts-node/register",
            "tsconfig-paths/register",
            "./src/global.ts",
            "./test/steps/**/*.ts",
            "./extend/addons/**/*.ts",
            "./src/helper/actions/webStepDefs.ts",
            "./src/helper/actions/commStepDefs.ts",
            "./src/helper/actions/hidden/*.ts",
            "config/cucumber/hooks.ts",
            "config/cucumber/stepHook.ts"
        ],
        requireModule: [
            "ts-node/register",
            "tsconfig-paths/register"
        ],
        format: [
            "progress-bar",
            "html:test-results/cucumber-report.html",
            "json:test-results/cucumber-report.json",
            "rerun:@rerun.txt",
        ],
        parallel: 2,
        worldParameters: {
            environment: "prod"
        }
    }
}
