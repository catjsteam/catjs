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


            this.endTest = function(opt) {

                _cat.utils.Signal.send('TESTEND', opt);


                clearInterval(_runModeValidation);
            };



            this.getTestsTypes = function() {
                return _enum;
            };


            /*  take care of run-mode === tests
                we need to make sure that it get to run */
            if (this.getRunMode() === _enum.TEST_MANAGER) {
                tests = this.getTests();
                if (tests) {
                    testManager = (tests[tests.length-1].name || "NA");
                }
                _runModeValidation = setInterval(function() {
                    if (_runModeValidationRetry < 3) {
                        _log.log("[CAT] run-mode=tests waiting for catjs manager: '" + testManager + "' .... retry");
                        _runModeValidationRetry++;

                    } else {
                        var reportFormats,
                            err = "run-mode=tests catjs manager '" + testManager + "' is not reachable or not exists, review the test name and/or the tests code.";

                        _log.log("[CAT] " + err);
                        me.endTest({reportFormats: reportFormats, error: err});

                    }
                }, this.getTimeout() / 3);
            }
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