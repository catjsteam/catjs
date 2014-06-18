var _cat = {
    utils: {},
    plugins: {},
    ui: {},
    errors:{}
};

var hasPhantomjs = false;

_cat.core = function () {

    var managerScraps = [],
        testNumber = 0,
        getScrapTestInfo,
        addScrapToManager,
        _vars, _managers, _context,
        _config, _log,
        _guid,
        _enum = {
            TEST_MANAGER: "tests",
            ALL: "all",
            TEST_MANAGER_OFFLINE : "offline"
        },
        _getBase,
        _getBaseUrl,
        _runModeValidation,
        _runModeValidationRetry=0;

    _getBase="/";

    _getBaseUrl = function() {
        var base;

        if (!_getBase) {
            base = "/";

        } else {
            if (_getBase.trim) {
                _getBase = _getBase.trim();
            }
            if (_getBase.charAt(0) === ".") {
                base = _getBase.slice(1);
            }
            if (!base) {
                base = "/";
            }
        }

        return base;
    };

    addScrapToManager = function (testsInfo, scrap) {

        var i, test, testRepeats,
            testDelay, preformVal,pkgNameVal;

        for (i = 0; i < testsInfo.length; i++) {
            testNumber--;
            test = testsInfo[i];

            testRepeats = parseInt((test.repeat ? test.repeat : 1));
            test.repeat = "repeat(" + testRepeats + ")";
			testDelay = "delay(" + (test.delay ? test.delay : 2000) + ")";
            preformVal = "@@" + scrap.name[0] + " " + testRepeats;
            pkgNameVal = scrap.pkgName + "$$cat";
            if (test.scenario) {
                scrap.scenario = test.scenario;
            }
            managerScraps[test.index] = {"preform": preformVal,
                "pkgName": pkgNameVal,
                "repeat": testRepeats,
                "delay" : testDelay,
                "name": scrap.name[0],
                "scrap": scrap};
        }

    };

    getScrapTestInfo = function (tests, scrapName) {
        var scrapTests = [],
            i, size,
            validate= 0,
            tempInfo,
            testsNames = [],
            testsname;

        if (tests && scrapName) {
            size = tests.length;
            for (i = 0; i < size; i++) {
                testsname = tests[i].name;
                testsNames.push(testsname);
                if (testsname === scrapName) {
                    tempInfo = {"name": testsname,
                        "scenario": tests[i].scenario,
                        "wasRun": tests[i].wasRun,
                        "delay" : tests[i].delay,
                        "repeat": tests[i].repeat};
                    tempInfo.index = i;
                    scrapTests.push(tempInfo);
                    validate++;
                }
            }
        }

        if (!_cat.core.ui.isOpen()) {
            _cat.core.ui.on();
        }

        if (!validate) {
            _log.log("[CAT Info] skipping scrap: '" + scrapName + ";  Not included in the test project: [ " + (tests && testsNames ? testsNames.join(", ") : "" ) +  "]");
        }
        return scrapTests;
    };


    _vars = {};
    _managers = {};
    _context = function () {

        var _scraps = {};

        function _Scrap(config) {

            var me = this;

            (function () {
                var key;

                for (key in config) {
                    me[key] = config[key];
                }
            })();
        }

        _Scrap.prototype.get = function (key) {
            return this[key];
        };

        _Scrap.prototype.getArg = function (key) {
            if (this.scrap && this.scrap.arguments) {
                return this.arguments[this.scrap.arguments[key]];
            }
        };


        return {

            get: function (pkgName) {
                if (!pkgName) {
                    return undefined;
                }
                return _scraps[pkgName];
            },

            "$$put": function (config, pkgName) {
                if (!pkgName) {
                    return pkgName;
                }
                _scraps[pkgName] = new _Scrap(config);
            },

            getAll: function() {
                return _scraps;
            }
        };

    }();

    _log = console;

    (function () {
        if (!String.prototype.trim) {
            String.prototype.trim = function () {
                return this.replace(/^\s+|\s+$/g, '');
            };
        }
    })();

    // singelton class
    function GetTestsClass(config) {
        this.globalTests = [];
        // do this once
        this.setTests = function (config) {

            var getScenarioTests =function(testsList, globalDelay, scenarioName) {
                var innerConfigMap = [];
                if (testsList.tests) {
                    for (var i = 0; i < testsList.tests.length; i++) {
                        if (!(testsList.tests[i].disable)) {
                            if (testsList.tests[i].tests) {
                                var repeatFlow = testsList.tests[i].repeat ? testsList.tests[i].repeat : 1;

                                for (var j = 0; j < repeatFlow; j++) {
                                    var tempArr = getScenarioTests(testsList.tests[i], testsList.tests[i].delay);
                                    innerConfigMap = innerConfigMap.concat(tempArr);
                                }

                            } else {

                                // set the global delay
                                if (!testsList.tests[i].delay && globalDelay) {
                                    testsList.tests[i].delay = globalDelay;
                                }
                                testsList.tests[i].wasRun = false;
                                testsList.tests[i].scenario = {name: (scenarioName || null)};
                                innerConfigMap.push(testsList.tests[i]);

                            }
                        }
                    }
                }

                return innerConfigMap;

            }, i, j, temp,
                testsFlow, scenarios, scenario,
                repeatScenario, currTest, currentTestName;

            testsFlow = config.tests;
            scenarios = config.scenarios;
            for ( i = 0; i < testsFlow.length; i++) {
                 currTest = testsFlow[i];

                 if (!currTest || !("name" in currTest)) {
                     _log.warn("[CAT] 'name' property is missing for the test configuration, see cat.json ");
                     continue;
                 }
                 currentTestName = currTest.name;
                 scenario = scenarios[currentTestName];

                if (scenario) {
                    repeatScenario = (scenario.repeat ? scenario.repeat : 1);
                    for (j = 0; j < repeatScenario; j++) {
                        temp = (getScenarioTests(scenario, scenario.delay, currentTestName));
                        this.globalTests = this.globalTests.concat(temp);
                    }
                } else {
                    _log.warn("[CAT] No valid scenario '", currTest.name, "' was found, double check your cat.json project");
                }
            }
        };

        if ( GetTestsClass._singletonInstance ) {
            return GetTestsClass._singletonInstance;
        }

        this.setTests(config);

        GetTestsClass._singletonInstance = this;

        this.getTests = function() { return this.globalTests; };
    }

    function Config() {

        var innerConfig,
            xmlhttp,
            configText,
            me = this,
            url, catjson = "cat/config/cat.json",
            baseurl = _getBaseUrl(),
            tests, testManager;

        try {
            if (baseurl && baseurl.charAt(baseurl.length-1) !== "/") {
                baseurl += "/";
            }
            url = [baseurl , catjson].join("");
            xmlhttp = _cat.utils.AJAX.sendRequestSync({
                url: url
            });
            if (xmlhttp) {
                configText = xmlhttp.responseText;
                if (configText) {
                    innerConfig = JSON.parse(configText);
                }
            }
        }
        catch (err) {
            //todo: log error
        }

        if (innerConfig) {

            this.getType = function () {
                return innerConfig.type;
            };

            this.getName = function () {
                return innerConfig.name;
            };

            this.getIp = function () {
                if (innerConfig.ip) {
                    return innerConfig.ip;
                } else {
                    return  document.location.hostname;
                }
            };

            this.getPort = function () {
                if (innerConfig.port) {
                    return innerConfig.port;
                } else {
                    return  document.location.port;
                }
            };

            this.getTests = function () {

                var tests = new GetTestsClass(innerConfig);

                return tests.getTests();

            };

            this.getRunMode = function () {
                return (innerConfig["run-mode"] || "all");
            };

            this.getTimeout = function () {
                var timeout = innerConfig["test-failure-timeout"];
                if (timeout) {
                    timeout = parseInt(timeout);
                    if (isNaN(timeout)) {
                        timeout = 30;
                    }
                }
                timeout = timeout * 1000;
                return timeout;
            };

            this.isReportType = function(key) {
                var formats = me.getReportFormats(),
                    i, size, item;

                if (formats && formats.length > 0) {
                    size = formats.length;
                    for (i=0; i<size; i++) {
                        item = formats[i];
                        if (item === key) {
                            return true;
                        }
                    }
                }

                return false;
            };

            this.isJUnitSupport = function() {

                return this.isReportType("junit");
            };

            this.isConsoleSupport = function() {

                return this.isReportType("console");
            };

            this.getReportFormats = function() {

                var format = [],
                    report;

                if (_cat.utils.Utils.validate(innerConfig, "report") ) {

                    report = innerConfig.report;
                    format = (report.format ? report.format : format);
                }

                return format;
            };

            this.isReport = function() {

                if (_cat.utils.Utils.validate(innerConfig, "report") && _cat.utils.Utils.validate(innerConfig.report, "disable", false)) {

                    return true;
                }

                return false;
            };

            this.isErrors = function() {

                if (_cat.utils.Utils.validate(innerConfig, "assert") && _cat.utils.Utils.validate(innerConfig.assert, "errors", true)) {

                    return true;
                }

                return false;
            };

            this.isUI = function() {
                if (_cat.utils.Utils.validate(innerConfig, "ui", true)) {

                    return true;
                }

                return false;
            };


            this.endTest = function(opt, interval) {
                _cat.utils.Signal.send('TESTEND', opt);
                if (interval === -1) {
                    console.log("Test End");
                } else {
                    clearInterval(interval);
                }
            };



            this.getTestsTypes = function() {
                return _enum;
            };


//            /*  take care of run-mode === tests
//                we need to make sure that it get to run */
//            if (this.getRunMode() === _enum.TEST_MANAGER) {
//                tests = this.getTests();
//                if (tests) {
//                    testManager = (tests[tests.length-1].name || "NA");
//                }
//                _runModeValidation = setInterval(function() {
//                    if (_runModeValidationRetry < 3) {
//                        _log.log("[CAT] run-mode=tests waiting for catjs manager: '" + testManager + "' .... retry");
//                        _runModeValidationRetry++;
//
//                    } else {
//                        var reportFormats,
//                            err = "run-mode=tests catjs manager '" + testManager + "' is not reachable or not exists, review the test name and/or the tests code.";
//
//                        _log.log("[CAT] " + err);
//                        me.endTest({reportFormats: reportFormats, error: err});
//
//                    }
//                }, this.getTimeout() / 3);
//            }
        }

        this.hasPhantom = function () {
            return hasPhantomjs;
        };

        this.available = function () {
            return (innerConfig ? true : false);
        };
    }

    function _import(query) {

        var type = _cat.utils.Utils.querystring("type", query),
            basedir = _cat.utils.Utils.querystring("basedir", query),
            libs = _cat.utils.Utils.querystring("libs", query),
            idx= 0, size;

        if (type === "import") {
            libs = libs.split(",");
            size = libs.length;
            for (; idx<size; idx++) {

                libs[idx] = [basedir, libs[idx], (_cat.utils.Utils.extExists(libs[idx]) ? "" : ".js")].join("");
            }
            _cat.utils.Loader.requires(libs);
        }

    }

    return {

        log: _log,

        onload: function(libs) {
            _import(libs);
        },

        init: function() {

            _guid = _cat.utils.Storage.getGUID();

            _config = new Config();

            // display the ui, if you didn't already
            if (_config.isUI()) {
                _cat.core.ui.enable();
                if (!_cat.core.ui.isOpen()) {
                    _cat.core.ui.on();
                }
            } else {
                _cat.core.ui.disable();
                _cat.core.ui.off();
                _cat.core.ui.destroy();
            }

            if (_config.isErrors()) {

                    // register DOM's error listener
                    _cat.core.errors.listen(function(message, filename, lineno, colno, error) {

                        var catconfig = _cat.core.getConfig(),
                            reportFormats;

                        if (catconfig.isReport()) {
                            reportFormats = catconfig.getReportFormats();
                        }

                        // create catjs assertion entry
                        _cat.utils.assert.create({
                            name: "generalJSError",
                            displayName:  "General JavaScript Error",
                            status: "failure",
                            message: [message, " ;file: ", filename, " ;line: ", lineno, " ;column:", colno, " ;error:", error ].join(" "),
                            success: false,
                            ui: catconfig.isUI(),
                            send: reportFormats
                        });
                    });
            }
        },

        setManager: function (managerKey, pkgName) {
            if (!_managers[managerKey]) {
                _managers[managerKey] = {};
                _managers[managerKey].calls = [];
                _managers[managerKey].behaviors = {};
                _managers[managerKey].scrapsOrder = [];
            }
            _managers[managerKey].calls.push(pkgName);
        },

        setManagerBehavior: function (managerKey, key, value) {
            var item = _managers[managerKey].behaviors;

            if (item) {
                if (!item[key.trim()]) {
                    item[key.trim()] = [];
                }
                item[key.trim()].push(value);
            }
            _managers[managerKey].scrapsOrder.push(key.trim());
        },

        getManager: function (managerKey) {
            return _managers[managerKey.trim()];
        },

        managerCall: function (managerKey, callback) {
            var manager = _cat.core.getManager(managerKey),
                scrapref, scrapname, behaviors = [], actionItems = {},
                matchvalue = {}, matchvalues = [],
                totalDelay = 0;

            /**
             * Scrap call by its manager according to its behaviors
             *
             * @param config
             *      implKey, repeat, delay
             * @private
             */
            function __call(config) {
                totalDelay = 0;
                var delay = (config.delay || 2000),
                    repeat = (config.repeat || 1),
                    idx = 0,
                    func = function () {
                        var funcvar = (config.implKey ? _cat.core.getDefineImpl(config.implKey) : undefined);

                        if (funcvar && funcvar.call) {
                            funcvar.call(this);
                            config.callback.call(config);
                        }
                    };

                for (idx = 0; idx < repeat; idx++) {
                    totalDelay += delay * (idx + 1);
                    _cat.core.TestManager.updateDelay(totalDelay);
                    setTimeout(func, totalDelay);
                }

            }

            function __callMatchValues(callsIdx, callback) {
                if (matchvalues[callsIdx]) {
                    matchvalues[callsIdx].callback = function () {
                        callbackCounter++;
                        callsIdx++;
                        if (callsIdx < matchvalues.length) {
                            __callMatchValues(callsIdx, callback);
                        }

                        if (callbackCounter === matchvalues.length) {
                            if (callback) {
                                callback.call(this);
                            }
                        }
                    };

                    __call(matchvalues[callsIdx]);
                }
            }

            if (manager) {
                // old
                var matchValuesCalls = [];
                // Call for each Scrap assigned to this Manager
                manager.calls.forEach(function (item) {
                    var strippedItem;

                    matchvalue = {};

                    if (item) {

                        scrapref = _cat.core.getVar(item);
                        if (scrapref) {
                            scrapref = scrapref.scrap;
                            scrapname = scrapref.name[0];
                            if (scrapname) {
                                behaviors = manager.behaviors[scrapname];
                                if (behaviors) {
                                    // Go over all of the manager behaviors (e.g. repeat, delay)
                                    behaviors.forEach(function (bitem) {
                                        var behaviorsAPI = ["repeat", "delay"],
                                            behaviorPattern = "[\\(](.*)[\\)]"; //e.g. "repeat[\(](.*)[/)]"
                                        if (bitem) {
                                            // go over the APIs, looking for match (e.g. repeat, delay)
                                            behaviorsAPI.forEach(function (bapiitem) {
                                                if (bapiitem && !matchvalue[bapiitem]) {
                                                    matchvalue[bapiitem] = _cat.utils.Utils.getMatchValue((bapiitem + behaviorPattern), bitem);
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        }

//                        setTimeout(function() {
//                            (_cat.core.getDefineImpl(item)).call(this);
//                        }, 2000);
                        //__call(matchvalue);
                        matchvalue.implKey = item;
                        matchValuesCalls.push(matchvalue);
                    }
                });

                // new
                matchvalues = [];
                // set the scrap orders by the order of behaviors
                var managerBehaviors = manager.behaviors;

                manager.scrapsOrder.forEach(function (scrapName) {
                    matchvalue = {};
                    var packageName = "";
                    for (var i = 0; i < matchValuesCalls.length; i++) {
                        if (matchValuesCalls[i].implKey.indexOf((scrapName + "$$cat"), matchValuesCalls[i].implKey.length - (scrapName + "$$cat").length) !== -1) {
                            matchvalue = matchValuesCalls[i];
                            break;
                        }
                    }

                    matchvalues.push(matchvalue);
                });

//                matchvalues.forEach(function(matchItem) {
//                    if (matchItem) {
//                        // TODO Make the calls Sync
//                        __call(matchItem);
//                    }
//                });
                var callsIdx = 0,
                    callbackCounter = 0;
                __callMatchValues(callsIdx, callback);
            }

        },

        plugin: function (key) {
            var plugins;
            if (key) {
                plugins = _cat.plugins;
                if (plugins[key]) {
                    return plugins[key];
                }
            }
        },

        declare: function (key, value) {
            if (key === "scrap") {
                if (value && value.id) {
                    _vars[value.id()] = value;
                }
            }
            _vars[key] = value;
        },

        getVar: function (key) {
            return _vars[key];
        },

        varSearch: function (key) {
            var item, pos,
                results = [];

            for (item in _vars) {
                pos = item.indexOf(key);

                if (item === key) {
                    results.push(_vars[key]);

                } else if (pos !== -1) {
                    results.push(_vars[item]);
                }
            }
            return results;
        },

        define: function (key, func) {
            _cat[key] = func;
        },

        defineImpl: function (key, func) {
            _cat[key + "$$cat$$impl"] = func;
        },

        getDefineImpl: function (item) {
            return _cat[item + "$$impl"];
        },

        action: function (thiz, config) {
            var scrap = config.scrap,
                runat, manager,
                pkgname, args = arguments,
                catConfig = _cat.core.getConfig(),
                tests = catConfig ? catConfig.getTests() : [],
                storageEnum = _cat.utils.Storage.enum,
                managerScrap, tempScrap,
                i, j;

            if ((catConfig) && (catConfig.getRunMode() === _enum.TEST_MANAGER)) {
                _cat.core.clientmanager.signScrap(scrap, catConfig, arguments, tests);

            } else {
                if ((catConfig) && (catConfig.getRunMode() === _enum.TEST_MANAGER_OFFLINE)) {
                    // check if the test name is in the cat.json
                    var scrapsTestsInfo = getScrapTestInfo(tests, scrap.name[0]);


                    pkgname = scrap.pkgName;
                    _cat.core.defineImpl(pkgname, function () {
                        var scrap = (config ? config.scrap : undefined);
                        if (scrap && scrap.scenario) {
                            _cat.utils.Storage.set(storageEnum.CURRENT_SCENARIO, scrap.scenario.name, storageEnum.SESSION);
                        }
                        _cat.core.actionimpl.apply(this, args);
                    });

                    if (scrapsTestsInfo.length !== 0) {

                        // init managerScraps
                        if (managerScraps.length === 0) {
                            testNumber = tests.length;
                            managerScraps = new Array(tests.length);
                        }

                        addScrapToManager(scrapsTestsInfo, scrap);

                        if (testNumber === 0) {
                            managerScrap = managerScraps[managerScraps.length - 1];

                            // clear run-mode validation
                            clearInterval(_runModeValidation);


                            managerScrap.scrap.catui = ["on"];
                            managerScrap.scrap.manager = ["true"];


                            pkgname = managerScrap.scrap.pkgName;
                            if (!pkgname) {
                                _cat.core.log.error("[CAT action] Scrap's Package name is not valid");
                            } else {


                                for (i = 0; i < managerScraps.length; i++) {
                                    tempScrap = managerScraps[i];
                                    _cat.core.setManager(managerScrap.scrap.name[0], tempScrap.pkgName);
                                    // set number of repeats for scrap
                                    for (j = 0; j < tempScrap.repeat; j++) {
                                        _cat.core.setManagerBehavior(managerScrap.scrap.name[0], tempScrap.scrap.name[0], tempScrap.delay);
                                    }
                                }


                                /*  CAT UI call  */
                                _cat.core.ui.on();

                                /*  Manager call  */
                                (function () {
                                    _cat.core.managerCall(managerScrap.scrap.name[0], function () {
                                        var reportFormats;
                                        if (_config.isReport()) {
                                            reportFormats = _config.getReportFormats();
                                        }
                                        _cat.utils.Signal.send('TESTEND', {reportFormats: reportFormats});
                                    });
                                })();


                            }
                        }

                    }
                } else {

                    if (typeof catConfig === 'undefined' || catConfig.getRunMode() === _enum.ALL) {
                        runat = (("run@" in scrap) ? scrap["run@"][0] : undefined);
                        if (runat) {
                            manager = _cat.core.getManager(runat);
                            if (manager) {
                                pkgname = scrap.pkgName;
                                if (!pkgname) {
                                    _cat.core.log.error("[CAT action] Scrap's Package name is not valid");
                                } else {
                                    _cat.core.defineImpl(pkgname, function () {
                                        _cat.core.actionimpl.apply(this, args);
                                    });
                                }

                            }
                        } else {
                            _cat.core.actionimpl.apply(this, arguments);
                        }
                    } else {
                        _cat.core.log.info("[CAT action] " + scrap.name[0] + " was not run as it does not appears in testManager");
                    }
                }

            }

        },

        getConfig: function () {
            return (_config.available() ? _config : undefined);
        },


        /**
         * CAT core definition, used when injecting cat call
         *
         * @param config
         */
        actionimpl: function (thiz, config) {
            var scrap = config.scrap,
                catInternalObj,
                catObj,
                passedArguments,
                idx = 0, size = arguments.length,
                pkgName;

            if (scrap) {
                if (scrap.pkgName) {


                    // collect arguments
                    if (arguments.length > 2) {
                        passedArguments = [];
                        for (idx = 2; idx < size; idx++) {
                            passedArguments.push(arguments[idx]);
                        }
                    }

                    // call cat user functionality
                    catInternalObj = _cat[scrap.pkgName];
                    if (catInternalObj && catInternalObj.init) {
                        _context["$$put"]({
                            scrap: scrap,
                            arguments: passedArguments

                        }, scrap.pkgName);
                        catInternalObj.init.call(_context.get(scrap.pkgName), _context);
                    }

                    // cat internal code
                    pkgName = [scrap.pkgName, "$$cat"].join("");
                    catObj = _cat[pkgName];
                    if (catObj) {
                        _context["$$put"]({
                            scrap: scrap,
                            arguments: passedArguments

                        }, pkgName);
                        catObj.apply(_context, passedArguments);
                    }
                }
                _log.log("[CAT] Scrap call: ", config, " scrap: " + scrap.name + " this:" + thiz);
            }

        },

        guid: function() {
            return _guid;
        }

    };

}();

if (typeof exports === "object") {
    module.exports = _cat;
}
/**
 * General error handling for the hosted application
 * @type {_cat.core.errors}
 */
_cat.core.errors = function () {

    var _originalErrorListener,
        _listeners = [];

    if (window.onerror) {
        _originalErrorListener = window.onerror;
    }

    window.onerror = function(message, filename, lineno, colno, error) {

        var me = this;

        // call super
        if (_originalErrorListener) {
            _originalErrorListener.call(this, message, filename, lineno, colno, error);
        }

        // print the error
        _listeners.forEach(function(listener) {
            listener.call(me, message, filename, lineno, colno, error);
        });
    };

    return {

        listen: function(listener) {
            _listeners.push(listener);
        }
    };

}();
_cat.utils.assert = function () {


    function _sendTestResult(data) {

        var config = _cat.core.getConfig();

        if (config) {
            _cat.utils.AJAX.sendRequestSync({
                url: _cat.core.TestManager.generateAssertCall(config, data)
            });
        }
    }

    return {

        /**
         * Send assert message to the UI and/or to catjs server
         *
         * @param config
         *      name {String} The test name
         *      displayName {String} The test display name
         *      status {String} The status of the test (success | failure)
         *      message {String} The assert message
         *      success {Boolean} Whether the test succeeded or not
         *      ui {Boolean} Display the assert data in catjs UI
         *      send {Boolean} Send the assert data to the server
         */
        create: function (config) {

            if (!config) {
                return;
            }

            var testdata;

            if (config.status && config.message && config.name && config.displayName) {


                testdata = _cat.core.TestManager.addTestData({
                    name: config.name,
                    type: config.type,
                    displayName: config.displayName,
                    status: config.status,
                    message: config.message,
                    success: config.status,
                    reportFormats: config.send

                });

                if (config.ui) {
                    _cat.core.ui.setContent({
                        style: ( (testdata.getStatus() === "success") ? "color:green" : "color:red" ),
                        header: testdata.getDisplayName(),
                        desc: testdata.getMessage(),
                        tips: _cat.core.TestManager.getTestSucceededCount(),
                        elementType : ( (testdata.getStatus() === "success") ? "listImageCheck" : "listImageCross" )
                    });
                }

                // TODO parse report formats : consider api for getConsole; getJUnit ...
                if (config.send) {
                    _sendTestResult(testdata);
                }
            }
        }

    };

}();
_cat.utils.chai = function () {

    var _chai,
        assert,
        _state = 0; // state [0/1] 0 - not evaluated / 1 - evaluated

    function _isSupported() {
        _state = 1;
        if (typeof chai !== "undefined") {
            _chai = chai;
            assert = _chai.assert;

        } else {
            _cat.core.log.info("Chai library is not supported, skipping annotation 'assert', consider adding it to the .catproject dependencies");
        }
    }

    function _splitCapilalise(string) {
        if (!string) {
            return string;
        }

        return string.split(/(?=[A-Z])/);
    }

    function _capitalise(string) {
        if (!string) {
            return string;
        }
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function _getDisplayName(name) {
        var result = [];

        if (name) {
            name = _splitCapilalise(name);
            if (name) {
                name.forEach(function(item) {
                    result.push(_capitalise(item));
                });
            }
        }
        return result.join(" ");
    }

    return {

        assert: function (config) {

            if (!_state) {
                _isSupported();
            }

            var code,
                result,
                fail,
                failure,
                scrap = config.scrap,
                scrapName = (scrap.name ? scrap.name[0] : undefined),
                scrapDescription = (scrap.description ? scrap.description[0] : undefined),
                testName = (scrapName || "NA"),
                key, items=[], args=[],
                catconfig = _cat.core.getConfig(),
                reportFormats;

            if (_chai) {
                if (config) {
                    code = config.code;
                    fail = config.fail;
                }
                if (assert) {
                    // TODO well, I have to code the parsing section (uglifyjs) for getting a better impl in here (loosing the eval shit)
                    // TODO js execusion will be replacing this code later on...
                    var success = true;
                    var output;
                    if (code) {
                        try {
                            args.push("assert");
                            items.push(assert);
                            for (key in config.args) {
                                if (config.args.hasOwnProperty(key)) {
                                    args.push(key);
                                    items.push(config.args[key]);
                                }
                            }

                            if (code.indexOf("JSPath.") !== -1) {
                                items.push((typeof JSPath !== "undefined" ? JSPath : undefined));
                                args.push("JSPath");
                                result =  new Function(args, "if (JSPath) { return " + code + "} else { console.log('Missing dependency : JSPath');  }").apply(this, items);
                            } else {
                                result =  new Function(args, "return " + code).apply(this, items);
                            }

                        } catch (e) {
                            success = false;
                            output = ["[CAT] Test failed, exception: ", e].join("");
                        }
                    }

                    if (success) {
                        output = "Test Passed";
                    }

                    if (catconfig.isReport()) {
                        reportFormats = catconfig.getReportFormats();
                    }

                    // create catjs assertion entry
                    _cat.utils.assert.create({
                        name: testName,
                        displayName:  (scrapDescription || _getDisplayName(testName)),
                        status: (success ? "success" : "failure"),
                        message: output,
                        success: success,
                        ui: catconfig.isUI(),
                        send: reportFormats
                    });

                    if (!success) {
                        console.warn((output || "[CAT] Hmmm... It's an error alright, can't find any additional information"), (fail || ""));
                    }
                }
            }
        },


        /**
         * For the testing environment, set chai handle
         *
         * @param chai
         */
        test: function (chaiarg) {
            chai = chaiarg;
        }

    };

}();
_cat.core.clientmanager = function () {

    var tests,
        commitScrap,
        getScrapTestInfo,
        totalDelay,
        runStatus,
        checkIfExists,
        updateTimeouts,
        catConfig,
        startInterval,
        getScrapInterval,
        setupInterval;
    runStatus = {
        "scrapReady" : 0,
        "subscrapReady" : 0,
        "numRanSubscrap" : 0,
        "scrapsNumber" : 0

    };

    getScrapInterval = function(scrap) {
        var scrapId = scrap.id,
            numCommands = (scrap.numCommands ? scrap.numCommands : 1);

        if (!runStatus.intervalObj) {
            runStatus.intervalObj = {
                "interval" : undefined,
                "counter" : 0,
                "numCommands" : numCommands,
                "signScrapId" : scrapId


            };
        }
        return runStatus.intervalObj;
    };


    setupInterval = function(config, scrap) {
        var tests,
            scrapId = scrap.id,
            intervalObj = getScrapInterval(scrap),
            testManager;
        tests = config.getTests();
        if (tests) {
            testManager = (tests[tests.length-1].name || "NA");
        }


        intervalObj.interval  = setInterval(function() {

            if (intervalObj.counter < intervalObj.numCommands) {
                intervalObj.counter++;

            } else {
                var reportFormats,
                    err = "run-mode=tests catjs manager '" + testManager + "' is not reachable or not exists, review the test name and/or the tests code.";

                console.log("[CAT] " + err);
                config.endTest({reportFormats: reportFormats, error: err}, intervalObj.interval);

            }
        }, config.getTimeout() / 3);
        return;
    };



    commitScrap = function (scrap, args, res) {
        var scrapInfo,
            repeat,
            scrapInfoArr,
            infoIndex,
            repeatIndex;

        scrapInfoArr = getScrapTestInfo(scrap.name[0]);

        for (infoIndex in scrapInfoArr) {
            scrapInfo = scrapInfoArr[infoIndex];
            repeat = scrapInfo.repeat || 1;
            for (repeatIndex = 0; repeatIndex < repeat; repeatIndex++){
                _cat.core.ui.on();
                _cat.core.actionimpl.apply(this, args);
            }
        }
    };


    getScrapTestInfo = function (scrapName) {
        var scrapTests = [],
            i, size,
            validate= 0,
            tempInfo,
            reportFormats;

        if (tests && scrapName) {
            size = tests.length;
            for (i = 0; i < size; i++) {

                if (tests[i].name === scrapName) {
                    tempInfo = {"name": tests[i].name,
                        "scenario": tests[i].scenario,
                        "wasRun": tests[i].wasRun,
                        "delay" : tests[i].delay,
                        "repeat": tests[i].repeat};
                    tempInfo.index = i;
                    scrapTests.push(tempInfo);
                    validate++;
                }
            }
        }

        if (!validate) {
            console.warn("[CAT] Failed to match a scrap with named: '" + scrapName +"'. Check your cat.json project");
            if (!_cat.core.ui.isOpen()) {
                _cat.core.ui.on();
            }
        }
        return scrapTests;
    };

    checkIfExists = function(scrapName, tests) {

        var indexScrap;
        for (indexScrap in tests) {
            if (tests[indexScrap].name === scrapName) {
                return true;
            }
        }
        return false;
    };

    totalDelay = 0;

    updateTimeouts = function(scrap) {
        var scrapId = scrap.id;
        if (scrapId !== runStatus.intervalObj.signScrapId) {
            runStatus.intervalObj.signScrapId = scrapId;
            runStatus.intervalObj.counter = 0;
            runStatus.intervalObj.numCommands = (scrap.numCommands ? scrap.numCommands : 1);
        }
    };

    startInterval = function(catConfig, scrap) {
        if (scrap.name[0] === tests[0].name) {
            setupInterval(catConfig, scrap);
        }
    };

    return {

        signScrap : function(scrap, catConfig, args, _tests) {
            var urlAddress,
                config;
            runStatus.scrapsNumber = _tests.length;
            tests = _tests;

            startInterval(catConfig, scrap);

            if (checkIfExists(scrap.name[0], tests)) {

                urlAddress = "http://" + catConfig.getIp() + ":" + catConfig.getPort() + "/scraps?scrap=" + scrap.name[0] + "&" + "testId=" + _cat.core.guid();

                config = {
                    url : urlAddress,
                    callback : function() {
                        var response = JSON.parse(this.responseText);
                        runStatus.scrapReady = parseInt(response.readyScrap.index) + 1;

                        commitScrap(scrap, args, response);
                    }
                };

                _cat.utils.AJAX.sendRequestAsync(config);
            }

        },

        delayManager : function(codeCommands, context) {
            var catConfig = _cat.core.getConfig(),
                _enum = catConfig.getTestsTypes(),
                executeCode;

            executeCode = function(codeCommands, context) {
                var indexCommand,
                    commandObj,
                    scrap = context.scrap;


                updateTimeouts(scrap);

                for (indexCommand in codeCommands) {
                    commandObj = codeCommands[indexCommand];

                    new Function("context", "return " + commandObj).apply(this, [context]);
                }

                runStatus.numRanSubscrap = runStatus.numRanSubscrap + codeCommands.length;

                if ((runStatus.numRanSubscrap === runStatus.subscrapReady) && runStatus.scrapReady === runStatus.scrapsNumber) {
                    var reportFormats;
                    if (catConfig.isReport()) {
                        reportFormats = catConfig.getReportFormats();
                    }

                    // TODO change clear interval
                    catConfig.endTest({reportFormats: reportFormats}, runStatus.intervalObj.interval);
                }

            };

            runStatus.subscrapReady = runStatus.subscrapReady + codeCommands.length;

            if ((catConfig) && (catConfig.getRunMode() === _enum.TEST_MANAGER)) {
                setTimeout(function() {
                    executeCode(codeCommands, context);
                }, totalDelay);
                totalDelay += 4000;
            } else {
                executeCode(codeCommands, context);
            }

        }
    };
}();
_cat.core.TestManager = function() {

    var _enum = {
        TYPE_TEST: "test",
        TYPE_SIGNAL: "signal"
    };


    // Test Manager data class
    function _Data(config) {

        var me = this;

        // name, status, message
        this.config = {};


        (function() {
            var item;

            // defaults \ validation
            if (!("type" in config) || (("type" in config) && config.type === undefined)) {
                config.type = _enum.TYPE_TEST;
            }

            // configuration settings
            for (item in config) {
                if (config.hasOwnProperty(item)) {
                    me.config[item] = config[item];
                }
            }

        })();
    }

    _Data.prototype.get = function(key) {
        return this.config[key];
    };

    _Data.prototype.getMessage = function() {
        return this.get("message");
    };

    _Data.prototype.getError = function() {
        return this.get("error");
    };

    _Data.prototype.getStatus = function() {
        return this.get("status");
    };

    _Data.prototype.getName = function() {
        return this.get("name");
    };

    _Data.prototype.getDisplayName = function() {
        return this.get("displayName");
    };

    _Data.prototype.getType = function() {
        return this.get("type");
    };

    _Data.prototype.getReportFormats = function() {
        return this.get("reportFormats");
    };

    _Data.prototype.set = function(key, value) {
        return this.config[key] = value;
    };

    _Data.prototype.send = function() {


    };

    var _testsData = [],
        _counter = 0,
        _globalTestData = {};


    return {

        addTestData: function(config) {
            var data = new _Data(config);
            _testsData.push(data);
            if (config.success) {
                _counter++;
            }

            return data;

        },

        getLastTestData: function() {
            return (_testsData.length > 0 ? _testsData[_testsData.length-1] : undefined);
        },

        getTestCount: function() {
            return (_testsData ? _testsData.length : 0);
        },

        getTestSucceededCount: function() {
            return _counter;
        },

        /**
         * Update the last total delay
         *
         * @param delay
         */
        updateDelay: function(delay) {
            _globalTestData.delay = delay;
        },

        /**
         * Get the total delay between tests calls
         *
         */
        getDelay: function() {
            return (_globalTestData.delay || 0);
        },

        /**
         *
         * @param config
         *      host - The host address
         *      port - The port address
         *
         * @param testdata
         *      name - The test Name
         *      message - The test message
         *      status - The test status
         *
         * @returns {string} The assertion URL
         */
        generateAssertCall: function(config, testdata) {

            var reports = testdata.getReportFormats(),
                storageEnum = _cat.utils.Storage.enum;

            return "http://" + config.getIp() +  ":" +
                config.getPort() + "/assert?" +
                "testName=" + testdata.getName() +
                "&scenario=" + _cat.utils.Storage.get(storageEnum.CURRENT_SCENARIO, storageEnum.SESSION) +
                "&message=" + testdata.getMessage() +
                "&error=" + testdata.getError() +
                "&status=" + testdata.getStatus() +
                "&reports=" + (reports ? reports.join(",") : "") +
                "&name=" + config.getName() +
                "&type=" + testdata.getType() +
                "&hasPhantom="  + config.hasPhantom() +
                "&id="  + _cat.core.guid() +
                "&cache="+ (new Date()).toUTCString();

        }

    };


}();

_cat.core.ui = function () {

    function _addEventListener(elem, event, fn) {
        if (!elem) {
            return undefined;
        }
        if (elem.addEventListener) {
            elem.addEventListener(event, fn, false);
        } else {
            elem.attachEvent("on" + event, function () {
                return(fn.call(elem, window.event));
            });
        }
    }

    function _create() {
        var catElement;
        if (typeof document !== "undefined") {
            catElement = document.createElement("DIV");

            catElement.id = "__catelement";
            catElement.style.width = "200px";
            catElement.style.height = "200px";
            catElement.style.position = "fixed";
            catElement.style.bottom = "10px";
            catElement.style.zIndex = "10000000";
            catElement.style.display = "none";
            catElement.innerHTML =

                '<div id="cat-status" class="cat-dynamic cat-status-open">' +
                    '<div id=loading></div>' +
                    '<div id="catlogo" ></div>' +
                    '<div id="catHeader">CAT Tests<span id="catheadermask">click to mask on/off</span></div>' +
                    '<div class="text-tips"></div>' +
                    '<div id="cat-status-content">' +
                    '<ul id="testList"></ul>' +
                    '</div>' +
                    '</div>' +
                    '<div id="catmask" class="fadeMe"></div>';

            if (document.body) {
                document.body.appendChild(catElement);
            }
        }
    }

    function _getCATElt() {
        if (typeof document !== "undefined") {
            return document.getElementById("__catelement");
        }
        return undefined;
    }

    function _getCATStatusElt() {

        var catStatusElt,
            catElement = _getCATElt();
        if (catElement) {
            catStatusElt = (catElement.childNodes[0] ? catElement.childNodes[0] : undefined);
        }

        return catStatusElt;
    }

    function _getCATStatusContentElt() {

        var catStatusElt,
            catElement = _getCATElt(),
            catStatusContentElt;
        if (catElement) {
            catStatusElt = _getCATStatusElt();
            if (catStatusElt) {
                catStatusContentElt = catStatusElt.childNodes[3];
            }
        }

        return catStatusContentElt;
    }

    function _resetContent() {
        _me.setContent({
            header: "",
            desc: "",
            tips: "",
            reset: true
        });
    }

    var testNumber = 0,
        logoopacity = 0.5,
        masktipopacity = 1,

        _disabled = false,
        _me =  {

        disable: function() {
            _disabled = true;
        },

        enable: function() {
            _disabled = false;
        },

        /**
         * Display the CAT widget (if not created it will be created first)
         *
         */
        on: function () {

            if (_disabled) {
                return;
            }

            var catElement = _getCATElt();
            if (typeof document !== "undefined") {

                if (catElement) {
                    catElement.style.display = "";
                } else {
                    _create();
                    catElement = _getCATElt();
                    if (catElement) {
                        _me.toggle();
                        catElement.style.display = "";
                    }
                }

                // set logo listener
                var logoelt = document.getElementById("catlogo"),
                    catmask = document.getElementById("catmask"),
                    listener = function() {
                        var catmask = document.getElementById("catmask");
                        if (catmask) {
                            catmask.classList.toggle("fadeMe");
                        }
                    };

                if (logoelt && catmask && catmask.classList) {
                    _addEventListener(logoelt, "click", listener);
                }

                setInterval(function() {
                    var logoelt = document.getElementById("catlogo"),
                        catheadermask = document.getElementById("catheadermask");

                    if (logoopacity === 1) {
                        logoopacity = 0.5;
                        setTimeout(function() {
                            masktipopacity = 0;
                        }, 2000);

                    } else {
                        logoopacity = 1;
                    }
                    if (logoelt) {
                        catheadermask.style.opacity = masktipopacity+"";
                        logoelt.style.opacity = logoopacity+"";
                    }
                }, 2000);

            }

        },

        /**
         * Hide the CAT status widget
         *
         */
        off: function () {

            var catElement = _getCATElt();
            if (catElement) {
                _resetContent();
                catElement.style.display = "none";
            }

        },

        /**
         * Destroy the CAT status widget
         *
         */
        destroy: function () {
            var catElement = _getCATElt();
            if (catElement) {
                if (catElement.parentNode) {
                    catElement.parentNode.removeChild(catElement);
                }
            }
        },

        /**
         * Toggle the content display of CAT status widget
         *
         */
        toggle: function () {
            if (_disabled) {
                return;
            }

            var catElement = _getCATElt(),
                catStatusElt = _getCATStatusElt(),
                catStatusContentElt = _getCATStatusContentElt();

            if (catElement) {
                catStatusElt = _getCATStatusElt();
                if (catStatusElt) {
                    _resetContent();

                    catStatusElt.classList.toggle("cat-status-close");

                    if (catStatusContentElt) {
                        catStatusContentElt.classList.toggle("displayoff");
                    }
                }
            }


        },

        isOpen: function() {
            var catElement = _getCATElt(),
                catStatusElt = _getCATStatusElt();

            if (catElement) {
                catStatusElt = _getCATStatusElt();
                if (catStatusElt) {

                    if (catStatusElt.classList.contains("cat-status-close")) {
                        return false;
                    }
                }
            } else {

                return false;
            }

            return true;
        },

        isContent: function() {

            function _isText(elt) {
                if ( elt &&  elt.innerText && ((elt.innerText).trim()) ) {
                    return true;
                }
                return false;
            }

            var catStatusContentElt = _getCATStatusContentElt(),
                bool = 0;

            bool  += (_isText(catStatusContentElt.childNodes[1]) ? 1 : 0);

            if (bool === 1) {
                return true;
            }

            return false;
        },


        markedElement : function(elementId ) {
            var element = document.getElementById(elementId);
            element.className = element.className + " markedElement";
        },

        /**
         *  Set the displayable content for CAT status widget
         *
         * @param config
         *      header - The header content
         *      desc - The description content
         *      tips - The tips text (mostly for the test-cases counter)
         */
        setContent: function (config) {

            var catStatusContentElt,
                catElement = _getCATElt(),
                isOpen = false,
                reset = ("reset" in config ? config.reset : false);



            function _setText(elt, text, style) {

                var styleAttrs = (style ? style.split(";") : []);

                if (elt) {
                    styleAttrs.forEach(function (item) {
                        var value = (item ? item.split(":") : undefined);
                        if (value) {
                            elt.style[value[0]] = value[1];
                        }
                    });

                    elt.textContent = text;
                }
            }

            if (catElement) {
                catStatusContentElt = _getCATStatusContentElt();
                if (catStatusContentElt) {
                    if (config) {
                        isOpen = _me.isOpen();

                        if ("header" in config && config.header) {
                            _me.on();
                            if (!isOpen && !reset) {
                                _me.toggle();
                            }
                        } else {
                            if (!reset && isOpen) {
                                setTimeout(function () {
                                    _me.toggle();
                                }, 300);
                            }
                        }
                        var innerListElement =

                                '<div class="text-top"><span style="color:green"></span></div>' +
                                '<div class="text"></div>';

                        if (config.header || config.desc || config.tips) {
                            var ul = document.getElementById("testList");
                            var newLI = document.createElement("LI");
                            ul.insertBefore(newLI, ul.children[0]);
                            newLI.innerHTML = innerListElement;

                            var textTips =  document.getElementsByClassName("text-tips")[0];

                            setTimeout(function() {

                                // add element to ui test list
                                if ("header" in config) {
                                    _setText(newLI.childNodes[0]  , config.header, config.style);
                                }
                                if ("desc" in config) {
                                    _setText(newLI.childNodes[1], config.desc, config.style);
                                }

                                if ("tips" in config) {
                                    if (config.tips) {
                                        testNumber  = config.tips;
                                        _setText(textTips, "Number of test passed : " + testNumber, config.style);
                                    } else {
                                        _setText(textTips, "Number of test passed : " + testNumber, "color : green");
                                    }

                                }

                                if ("elementType" in config) {
                                    newLI.className = newLI.className + " " + config.elementType;

                                } else {
                                    newLI.className = newLI.className + " listImageInfo";
                                }

                            }, 300);
                        }

                    }
                }
            }
        }

    };

    return _me;

}();
_cat.utils.AJAX = function () {

    function _validate() {
        if (typeof XMLHttpRequest !== "undefined") {
            return true;
        }
        return false;
    }

    if (!_validate()) {
        console.log("[CAT AJAX] Not valid AJAX handle was found");
        return {};
    }

    return {

        /**
         * TODO pass arguments on post
         *
         * @param config
         *      url - The url to send
         *      method - The request method
         *      args - TODO
         */
        sendRequestSync: function (config) {

            var xmlhttp = new XMLHttpRequest();
            // TODO
            // config.url = encodeURI(config.url);
            _cat.core.log.info("Sending REST request: " + config.url);

            try {
                xmlhttp.open(("GET" || config.method), config.url, false);
                // TODO pass arguments on post
                xmlhttp.send();

            } catch (err) {
                _cat.core.log.warn("[CAT CHAI] error occurred: ", err, "\n");

            }

            return xmlhttp;

        },

        /**
         * TODO Not tested.. need to be checked
         * TODO pass arguments on post
         *
         * @param config
         *      url - The url to send
         *      method - The request method
         *      args - TODO
         *      onerror - [optional] error listener
         *      onreadystatechange - [optional] ready listener
         *      callback - [optional] instead of using onreadystatechange this callback will occur when the call is ready
         */
        sendRequestAsync: function(config) {

            var xmlhttp = new XMLHttpRequest(),
                onerror = function (e) {
                    _cat.core.log("[CAT CHAI] error occurred: ", e, "\n");
                },
                onreadystatechange = function () {
                    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                        // _cat.core.log("completed\n" + xmlhttp.responseText);
                        if ("callback" in config && config.callback) {
                            config.callback.call(this, xmlhttp);
                        }
                    }
                };


            xmlhttp.onreadystatechange = (("onreadystatechange" in config) ? config.onreadystatechange : onreadystatechange);
            xmlhttp.onerror = (("onerror" in config) ? config.onerror : onerror);

            xmlhttp.open(("GET" || config.method), config.url, true);

            // TODO pass arguments on post
            xmlhttp.send();
        }

    };

}();
_cat.utils.Loader = function () {

    var _module = {

        require: function (file) {

            function _css(file) {
                var node = document.createElement('link'),
                    head = (document.head || document);

                node.rel = 'stylesheet';
                node.type = 'text/css';
                node.href = file;
                document.head.appendChild(node);
            }

            function _js(file) {
                var node = document.createElement('script'),
                    head = (document.head || document);

                node.type = "text/javascript";
                node.src = file;

                head.appendChild(node);
            }

            var jsfile_extension = /(.js)$/i,
                cssfile_extension = /(.css)$/i;

            if (jsfile_extension.test(file)) {
                _js(file);

            } else if (cssfile_extension.test(file)) {
                _css(file);

            } else {
                console.warn("[catjs] no valid file was found ", (file || "NA"));
            }
        },

        requires: function () {

            var index = 0;

            return function (files, callback) {
                index += 1;
                _module.require(files[index - 1]);

                if (index === files.length) {
                    index = 0;
                    if (callback) {
                        callback.call({index:index});
                    }
                } else {
                    _module.requires(files, callback);
                }
            };

        }()

    };

    return _module;

}();


//Utilities.requires(["cat.css", "cat.js", "chai.js"], function(){
//    //Call the init function in the loaded file.
//    console.log("generation done");
//})

_cat.utils.Signal = function () {

    var _funcmap = {

        TESTEND: function (opt) {

            var timeout = _cat.core.TestManager.getDelay(),
                config, testdata;

            opt = (opt || {});
            config = _cat.core.getConfig();

            // ui signal notification
            if (config.isUI()) {

                timeout = (opt["timeout"] || 2000);

                setTimeout(function () {
                    var testCount;
                    if (opt.error) {
                        _cat.core.ui.setContent({
                            header: "Test failed with an error",
                            desc:  opt.error,
                            tips: "",
                            style: "color:red"
                        });

                    } else {
                        testCount = _cat.core.TestManager.getTestCount();
                        _cat.core.ui.setContent({
                            header: [testCount-1, "Tests complete"].join(" "),
                            desc: "",
                            tips: "",
                            style: "color:green"
                        });
                    }
                }, (timeout));
            }

            // server signal notification
            if (config.isReport()) {
                testdata = _cat.core.TestManager.addTestData({
                    name: "End",
                    displayName: "End",
                    status: "End",
                    message: "End",
                    error: (opt.error || ""),
                    reportFormats: opt.reportFormats
                });

                if (config) {
                    _cat.utils.AJAX.sendRequestSync({
                        url: _cat.core.TestManager.generateAssertCall(config, testdata)
                    });
                }
            }


        },
        KILL: function () {

            // close CAT UI
            _cat.core.ui.off();

            // Additional code in here
        }
    };

    return {

        send: function (flag, opt) {

            if (flag && _funcmap[flag]) {
                _funcmap[flag].call(this, opt);
            }

        }

    };

}();
_cat.utils.Storage = function () {

    var _catjsLocal, _catjsSession;

    function _getStorage(type) {
        if (type) {
            return window[_enum[type]];
        }
    }

    function _base(type) {
        if (!type) {
            console.warning("[CAT] Storage; 'type' argument is not valid");
        }

        return _getStorage(type);
    }

    var _enum = {
        guid : "cat.core.guid",
        session: "sessionStorage",
        local: "localStorage"
    },
        _storageEnum = {
            CURRENT_SCENARIO: "current.scenario",
            SESSION: "session",
            LOCAL: "local"
        },
        _module;

    function _init() {
        var localStorage = _getStorage("local"),
            sessionStorage = _getStorage("session");

        if (sessionStorage.catjs) {
            _catjsSession = JSON.parse(sessionStorage.catjs);
        }
        if (localStorage.catjs) {
            _catjsLocal = JSON.parse(localStorage.catjs);
        }
    }

    _init();

    _module =  {


        /**
         *  Set value to a storage
         *
         * @param key The key to be stored
         * @param value The value to set
         * @param type session | local
         */
        set: function(key, value, type) {

            var storage = _base(type);
            if (storage) {
                if (!_catjsSession) {
                    _catjsSession = {};
                }
                _catjsSession[key] = value;
                storage.catjs = JSON.stringify(_catjsSession);
            }
        },

        /**
         *  Get value from the storage
         *
         * @param key
         * @param type session | local
         */
        get: function(key, type) {

            var storage = _base(type);
            if (storage) {
                if (!storage.catjs) {
                    return undefined;
                }

                _catjsSession = JSON.parse(storage.catjs);
                if (!_catjsSession) {
                    return undefined;
                }

                return _catjsSession[key];
            }

        },

        getGUID: function() {

            var guid = _module.get(_enum.guid, _storageEnum.SESSION);

            if (!guid) {
                guid =_cat.utils.Utils.generateGUID();
                _module.set(_enum.guid, guid, _storageEnum.SESSION);
            }

            return guid;

        },

        enum: _storageEnum

    };

    return _module;
}();

_cat.utils.TestsDB = function() {

    var _data;

    (function() {
        _cat.utils.AJAX.sendRequestAsync({
            url : "/cat/config/testdata.json",
            callback : {
                call : function(check) {
                    _data = JSON.parse(check.response);
                }
            }
        });
    })();

    function _TestsDB() {

        this._DB = undefined;
        var me = this;

        _cat.utils.AJAX.sendRequestAsync({url : "tests_db.json", callback : {call : function(check) {
            me._DB = JSON.parse(check.response);
        }}});

        this.getDB = function() { return this._DB; };

        var getProp = function (propString, obj) {
            var current = obj;
            var split = propString.split('.');

            for (var i = 0; i < split.length; i++) {
                if (current.hasOwnProperty(split[i])) {
                    current = current[split[i]];
                }
            }

            return current;
        };

        var setProp = function (propString, value, obj) {
            var current = obj;
            var split = propString.split('.');

            for (var i = 0; i < split.length - 1; i++) {
                if (current.hasOwnProperty(split[i])) {
                    current = current[split[i]];
                }
            }

            current[split[split.length - 1]] = value;
            return current[split[split.length - 1]];
        };

        this.get = function(field) { return getProp(field, this._DB); };
        this.set = function(field, value) { return setProp(field, value, this._DB); };


    }

    var TestDB;

    return {

        getData : function() {
            return _data;
        },

        init : function() {
            TestDB = new _TestsDB();
            return TestDB;
        },

        getDB : function() {
            return TestDB.getDB();
        },

        get : function(field) {
            var temp = " _data" + field;
            return eval(temp);
        },

        set : function(field, value) {
            return TestDB.set(field, value);
        },
        find : function(field) {
            var code = "JSPath.apply('" + field + "', _data);";

            return new Function("JSPath", "_data", "if (JSPath) { return " + code + "} else { console.log('Missing dependency : JSPath');  }").apply(this, [(typeof JSPath !== "undefined" ? JSPath : undefined), _data]);
        }
    };
}();
if (typeof(_cat) !== "undefined") {

    _cat.utils.Utils = function () {

        return {

            querystring: function(name, query){
                var re, r=[], m;

                re = new RegExp('(?:\\?|&)' + name + '=(.*?)(?=&|$)','gi');
                while ((m=re.exec(query  || document.location.search)) != null) {
                    r[r.length]=m[1];
                }
                return (r && r[0] ? r[0] : undefined);
            },

            getType: function (obj) {
                return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();

            },

            getMatchValue: function (pattern, text) {

                var regexp = new RegExp(pattern),
                    results;

                if (regexp) {
                    results = regexp.exec(text);
                    if (results &&
                        results.length > 1) {
                        return results[1];
                    }
                }

                return results;

            },

            /**
             * Validates an object and availability of its properties
             *
             */
            validate: function (obj, key, val) {
                if (obj) {

                    // if key is available
                    if (key !== undefined) {

                        if (key in obj) {

                            if (obj[key] !== undefined) {

                                if (val !== undefined) {
                                    if (obj[key] !== val) {
                                        return false;
                                    }
                                }

                                return true;
                            }

                        }

                        return false;


                    } else {

                        return true;
                    }

                }

                return false;
            }
        };

    }();


} else {

    var _cat = {
        utils:{
            Utils:{}
        }
    };

}
_cat.utils.Utils.generateGUID = function () {

    //GUID generator
    function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    function guid() {
        return [S4(),S4(),"-",S4(),"-",S4(),"-",S4(),"-",S4(),S4(),S4()].join("");
    }

    return guid();
};

_cat.utils.Utils.extExists = function(value) {
    var pos;
    if (value) {
        pos = value.lastIndexOf(".");
        if (pos !== -1) {
            if (value.lastIndexOf(".js") !== -1 || value.lastIndexOf(".css") !== -1) {
                return true;
            }
        }
    }
    return false;
};

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        // nodejs support

        module.exports.generateGUID = _cat.utils.Utils.generateGUID;
        module.exports.extExists = _cat.utils.Utils.extExists;

    }
}


var animation = false;


_cat.plugins.dom = function () {

    function _fireEvent(name, elt) {

        var clickEvent;

        if (!elt || !name) {
            return undefined;
        }

        if(document.createEvent){

            clickEvent = document.createEvent("MouseEvents");
            clickEvent.initMouseEvent(name, true, true, window,
                0, 0, 0, 0, 0, false, false, false, 0, null);
            elt.dispatchEvent(clickEvent);

        } else {

            elt.fireEvent("on" + name);
        }
    }

    function _addEventListener(elem, event, fn) {
        if (!elem) {
            return undefined;
        }
        if (elem.addEventListener) {
            elem.addEventListener(event, fn, false);
        } else {
            elem.attachEvent("on" + event, function () {
                return(fn.call(elem, window.event));
            });
        }
    }

    function _getElement(idName) {

        var elt;

        if (!idName) {
            return undefined;
        }
        if (_cat.utils.Utils.getType(idName) === "String") {
            // try resolving by id
            elt = document.getElementById(idName);

        } else if (_cat.utils.Utils.getType(idName).indexOf("Element") !== -1) {
            // try getting the element
            elt = idName;
        }

        return (elt || idName);
    }

    return {

        actions: {


            listen: function (name, idName, callback) {

                var elt = _getElement(idName);

                if (elt) {
                    _addEventListener(elt, name, callback);
                }


            },

            fire: function (name, idName) {

                var elt = _getElement(idName);

                if (elt) {
                    _fireEvent(elt, name);
                }

            }


        }


    };

}();

_cat.plugins.enyo = function () {

    var _me;

    function _noValidMessgae(method) {
        return ["[cat enyo plugin] ", method, "call failed, no valid argument(s)"].join("");
    }

    function _genericAPI(element, name) {
        if (name) {
            if (!element) {
                _cat.core.log.info(_noValidMessgae("next"));
            }
            if (element[name]) {
                element[name]();
            } else {
                _cat.core.log.info("[cat enyo plugin] No valid method was found, '" + name + "'");
            }
        }
    }

    _me = {

        actions: {


            waterfall: function (element, eventName) {
                if (!element || !eventName) {
                    _cat.core.log.info(_noValidMessgae("waterfall"));
                }

                try {
                    element.waterfall('ontap');
                } catch (e) {
                    // ignore
                }
            },

            setSelected: function (element, name, idx, eventname) {
                eventname = (eventname || "ontap");
                if (element) {
                    _me.actions.waterfall(element.parent, eventname);
                    if (name && (idx !== undefined)) {
                        setTimeout(function () {
                            element.setSelected(element.$[name + '_' + idx]);
                        }, 600);
                    }
                    setTimeout(function () {
                        element.$[name + '_' + idx].waterfall(eventname);
                    }, 900);
                }
            },

            next: function (element) {
                _genericAPI(element, "next");
            }
        }

    };

    return _me;
}();

var animation = false;


_cat.plugins.jqm = function () {

    var oldElement = "";
    var setBoarder = function(element) {
        if (oldElement) {

            oldElement.classList.remove("markedElement");
        }
        element.className = element.className + " markedElement";
        oldElement = element;
        
    };

    function _getElt(val) {
        var sign;
        if (_cat.utils.Utils.getType(val) === "string") {
            val = val.trim();
            sign = val.charAt(0);

            return ($ ? $(val) : undefined);

        } else if (_cat.utils.Utils.getType(val) === "object") {
            return val;
        }
    }

    /**
     * Trigger an event with a given object
     *
     * @param element {Object} The element to trigger from (The element JQuery representation id/class or the object itself)
     * @param eventType {String} The event type name
     *
     * @private
     */
    function _trigger() {
        var e, idx= 0, size,
            args = arguments,
            elt = (args ? _getElt(args[0]) : undefined),
            eventType = (args ? args[1] : undefined),
            typeOfEventArgument = _cat.utils.Utils.getType(eventType);

        if (elt && eventType) {
            if (typeOfEventArgument === "string") {
                elt.trigger(eventType);

            } else  if (typeOfEventArgument === "array" && typeOfEventArgument.length > 0) {
                size = typeOfEventArgument.length;
                for (idx=0; idx<size; idx++) {
                    e = eventType[idx];
                    if (e) {
                        elt.trigger(e);
                    }
                }
            }
        }
    }

    return {

        actions: {


            scrollTo: function (idName) {

                $(document).ready(function(){
                    var elt = _getElt(idName),
                        stop = elt.offset().top,
                        delay = 1000;

                    $('body,html').animate({scrollTop: stop}, delay);

                    setBoarder( elt.eq(0)[0]);
                });

            },



            scrollTop: function () {

                $(document).ready(function(){
                    $('html, body').animate({scrollTop : 0},1000);
                });

            },

            scrollToWithRapper : function (idName, rapperId) {

                $(document).ready(function(){
                    var elt = _getElt(idName),
                        stop = elt.offset().top,
                        delay = 1000;

                    _getElt(rapperId).animate({scrollTop: stop}, delay);
                    setBoarder( _getElt(idName).eq(0)[0]);
                });

            },

            clickRef: function (idName) {
                $(document).ready(function(){
                    var elt = _getElt(idName);

                    elt.trigger('click');
                    window.location = elt.attr('href');

                    setBoarder( elt.eq(0)[0]);
                });

            },


            clickButton: function (idName) {
                $(document).ready(function(){
                    var elt = _getElt(idName);

                    $('.ui-btn').removeClass('ui-focus');
                    elt.trigger('click');
                    elt.closest('.ui-btn').addClass('ui-focus');

                    setBoarder( elt.eq(0)[0]);
                });

            },

            selectTab: function (idName) {
                $(document).ready(function(){
                    var elt = _getElt(idName);
                    elt.trigger('click');

                    setBoarder( elt.eq(0)[0]);
                });

            },



            selectMenu : function (selectId, value) {
                $(document).ready(function(){
                    var elt = _getElt(selectId);
                    if (typeof value === 'number') {
                        elt.find(" option[value=" + value + "]").attr('selected','selected');
                    } else if (typeof value === 'string') {
                        elt.find(" option[id=" + value + "]").attr('selected','selected');
                    }
                    elt.selectmenu("refresh", true);

                    setBoarder( elt.eq(0)[0]);
                });

            },


            swipeItemLeft : function(idName) {
                $(document).ready(function(){
                    var elt = _getElt(idName);

                    elt.swipeleft();
                    setBoarder( elt.eq(0)[0]);
                });
            },


            swipeItemRight : function(idName) {
                $(document).ready(function(){
                    var elt = _getElt(idName);
                    elt.swiperight();

                    setBoarder( elt.eq(0)[0]);
                });
            },


            swipePageLeft : function() {
                $(document).ready(function(){
                    $( ".ui-page-active" ).swipeleft();

                });


            },


            swipePageRight : function() {
                $(document).ready(function(){

                    var prev = $( ".ui-page-active" ).jqmData( "prev" );

                });
            },


            click: function (idName) {
                $(document).ready(function(){
                    var elt = _getElt(idName);
                    elt.trigger('click');

                    setBoarder( elt.eq(0)[0]);
                });
            },

            tap: function (idName) {
                $(document).ready(function(){
                    var elt = _getElt(idName);
                    elt.trigger('tap');

                    setBoarder( elt.eq(0)[0]);
                });
            },

            setCheck: function (idName) {
                $(document).ready(function(){
                    var elt = _getElt(idName);

                    elt.prop("checked",true).checkboxradio("refresh");
                    setBoarder( elt.eq(0)[0]);
                });

            },

            slide : function (idName, value) {
                $(document).ready(function(){
                    var elt = _getElt(idName);

                    elt.val(value).slider("refresh");
                    setBoarder( elt.eq(0)[0]);
                });
            },

            setText : function (idName, value) {
                $(document).ready(function(){
                    var elt = _getElt(idName);

                    _trigger(elt, "mouseenter");
                    _trigger(elt, "mouseover");
                    _trigger(elt, "mousemove");
                    _trigger(elt, "focus");
                    _trigger(elt, "mousedown");
                    _trigger(elt, "mouseup");
                    _trigger(elt, "click");
                    elt.val(value);
                    _trigger(elt, "keydown");
                    _trigger(elt, "keypress");
                    _trigger(elt, "input");
                    _trigger(elt, "keyup");
                    _trigger(elt, "mousemove");
                    _trigger(elt, "mouseleave");
                    _trigger(elt, "mouseout");
                    _trigger(elt, "blur");



                    setBoarder( elt.eq(0)[0]);
                });
            },


            checkRadio: function (className, idName) {
                $(document).ready(function(){
                    $( "." + className ).prop( "checked", false ).checkboxradio( "refresh" );
                    $( "#" + idName ).prop( "checked", true ).checkboxradio( "refresh" );


                    setBoarder($("label[for='" + idName + "']").eq(0)[0]);

                });

            },

            collapsible : function(idName) {
                $(document).ready(function(){
                    var elt = _getElt(idName);

                    elt.children( ".ui-collapsible-heading" ).children(".ui-collapsible-heading-toggle").click();
                    setBoarder( elt.eq(0)[0]);
                });

            },

            backClick : function () {
                $(document).ready(function(){
                    $('[data-rel="back"]')[0].click();
                });
            },

            searchInListView : function (listViewId, newValue) {
                $(document).ready(function(){
                    var elt = _getElt(listViewId),
                        listView = elt[0],
                        parentElements = listView.parentElement.children,
                        form = parentElements[$.inArray( listView, parentElements ) - 1];

                    $( form ).find( "input" ).focus();
                    $( form ).find( "input" ).val(newValue);
                    $( form ).find( "input" ).trigger( 'change' );
                });
            }


        }


    };

}();

var scrollDelay = true;

_cat.plugins.sencha = function () {
    var getItemById = function(idName) {
        return Ext.ComponentQuery.query('#' + idName)[0];

    };

    var fireItemTapFunc = function (extElement, index) {
            extElement.fireEvent('itemtap', extElement, index);
        },

        fireTapFunc = function (extElement) {
            extElement.fireEvent('tap');
        },

        setTextHelp = function (extElement, str) {

            if (extElement.hasListener('painted')) {

                extElement.setValue(str);
            } else {

                extElement.addListener('painted', function () {
                    extElement.setValue(str);
                });
            }
        };

    return {

        actions: {


            fireTap: function (extElement) {
                // check number of args
                if (arguments.length === 1) {

                    if (extElement.hasListener('painted')) {

                        fireTapFunc(extElement);
                    } else {

                        extElement.addListener('painted', fireTapFunc(extElement));
                    }


                } else {
                    // in case of list
                    var index = arguments[1];
                    if (extElement.hasListener('painted')) {
                        fireItemTapFunc(extElement, index);
                    } else {

                        extElement.addListener('painted', fireItemTapFunc(extElement, index));

                        if (extElement.hasListener('painted')) {
                            fireItemTapFunc(extElement, index);
                        } else {
                            extElement.addListener('painted', fireItemTapFunc(extElement, index));
                        }
                    }

                }

            },

            setText: function (extElement, str) {

                setTextHelp(extElement, str);

            },

            setTextValue: function (extElement, str) {
                var element = getItemById(extElement);
                element.setValue(str);
            },


            tapButton : function (btn) {

                var button = getItemById(btn);
                var buttonHandler = button.getHandler();
                button.fireAction("tap", buttonHandler());
            },

            setChecked : function (checkItem) {

                var checkbox = getItemById(checkItem);
                checkbox.setChecked(true);
            },

            setUnchecked : function (checkItem) {

                var checkbox = getItemById(checkItem);
                checkbox.setChecked(false);
            },

            setSliderValue : function (sliderId, value) {

                var slider = getItemById(sliderId);
                slider.setValue(value);
            },

            setSliderValues : function (sliderId, value1, value2) {

                var slider = getItemById(sliderId);
                slider.setValues([value1, value2]);
            },

            setToggle : function (toggleId, value) {

                var toggle = getItemById(toggleId);
                if (value) {
                    toggle.setValues(true);
                } else {
                    toggle.setValues(false);
                }

            },

            changeTab : function (barId, value) {

                var bar = getItemById(barId);
                bar.setActiveItem(value);
            },

            scrollBy : function (itemId, horizontalValue, verticalValue) {

                var item = getItemById(itemId);

                if (scrollDelay) {
                    item.getScrollable().getScroller().scrollTo(horizontalValue,verticalValue, {
                        duration : 1000
                    }) ;
                } else {
                    item.getScrollable().getScroller().scrollTo(horizontalValue,verticalValue);

                }
            },

            scrollToTop : function (itemId) {

                var item = getItemById(itemId);

                if (scrollDelay) {
                    item.getScrollable().getScroller().scrollTo(-1, -1, {
                        duration : 1000
                    }) ;
                } else {
                    item.getScrollable().getScroller().scrollTo(-1, -1);

                }
            },
            scrollToEnd : function (itemId) {

                var item = getItemById(itemId);

                if (scrollDelay) {
                    item.getScrollable().getScroller().scrollToEnd(true);
                } else {
                    item.getScrollable().getScroller().scrollToEnd(true);

                }
            },

            scrollToListIndex : function (listId, index) {

                var list = getItemById(listId);

                var scroller = list.getScrollable().getScroller();
                var item = list.getItemAt(index);
                var verticalValue = item.renderElement.dom.offsetTop;
                var horizontalValue = 0;

                if (scrollDelay) {
                    scroller.scrollTo(horizontalValue,verticalValue, {
                        duration : 1000
                    }) ;
                } else {
                    scroller.scrollTo(horizontalValue,verticalValue);

                }
            },



            carouselNext : function (carouselId) {

                var carousel = getItemById(carouselId);
                carousel.next();
            },

            carouselPrevious : function (carouselId) {

                var carousel = getItemById(carouselId);
                carousel.previous();
            },

            nestedlistSelect : function (nestedlistId, index) {

                var nestedlist = getItemById(nestedlistId);
                var indexItem = nestedlist.getActiveItem().getStore().getRange()[index];
                if (indexItem.isLeaf()) {

                    var activelist= nestedlist.getActiveItem();
                    nestedlist.fireEvent('itemtap', nestedlist, activelist,index,{},{});

                } else {
                    nestedlist.goToNode(indexItem);
                }

            },

            nestedlistBack : function (nestedlistId) {

                var nestedlist = getItemById(nestedlistId);
                var node = nestedlist.getLastNode();
                nestedlist.goToNode(node.parentNode);
            },


            listSelectIndex : function (listId, index) {
                var list = getItemById(listId);
                list.select(index);
            },


            changeView : function (viewName) {
                var firststep = Ext.create(viewName);
                Ext.Viewport.setActiveItem(firststep);
            },

            removePanel : function (panelId) {

                var panel = getItemById(panelId);
                Ext.Viewport.remove(panel);
            },

            setDate : function (dateItemId, year, month, day) {

                var dateItem = getItemById(dateItemId);
                dateItem.setValue(new Date(year, month - 1, day));
            }
        }


    };

}();

// catjs initialization
_cat.core.init();