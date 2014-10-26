var jmrOnReady = function () {
    console.log("Test Model Reporter is ready (jmrOnReady callback can be overriden [e.g. jmrOnReady=function(tmr){}]");
}, jmr;

/**
 * RequireJS Main Configuration
 */
require.config({

    baseUrl: ".",

    paths: {
        "underscore": "node_modules/underscore/underscore-min",
        "jsutils": "node_modules/js.utils/target/jsutils-require-min",

        "jmrModule": "./tmr",
        "jmrBaseModule": "./src/model/Base",
        "jmrMapperModule": "./src/model/Mapper",
        "jmrEnumModule": "./src/model/Enum",
        "jmrUtilsModule": "./src/utils/Utils",
        "jmrConfigModule": "./src/Config",
        "jmrReporterModelModule": "./src/reporter/ReporterModel",

        "jmrModelErrModule": "./src/model/Error",
        "jmrModelFailureModule": "./src/model/Failure",
        "jmrModelSkippedModule": "./src/model/Skipped",
        "jmrModelTCaseModule": "./src/model/TestCase",
        "jmrModelTSuiteModule": "./src/model/TestSuite",
        "jmrModelTSuitesModule": "./src/model/TestSuites",
        "jmrModelSystemModule": "./src/model/System",
        "jmrModelUtilsModule": "./src/model/Utils",

        // junit
        "jmrReporterJunitModule": "./src/reporter/junit/Reporter",

        // TODO developer mode : for the browser build first the templates bundle - node ./src/reporter/TemplateBuilder.js
        "jmrTemplatesBundleModule": "./src/reporter/tplbundle"


    },

    shim: {
        'underscore': {
            exports: "_"
        },
        "jsutils": {
            deps: ["underscore"],
            exports: "jsutils"
        },        
        "jmrReporterJunitModule": {
            deps: ["jsutils"]
        },
        "jmrModule": {
            deps: ["jsutils"]
        },
        "jmrConfigModule": {
            deps: ["jsutils"]
        }
    },
    
    out: "tmr-min.js",
    name: "tmr"

});


require(["jsutils"], function () {

    
});

/*
TODO need to be fixed ... it fails on building the minified version
require(["jmrModule"], function (jmrModule) {
    jmr = jmrModule;
    
});
*/
;
define("tmrwebRequire", function(){});

