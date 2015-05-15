_cat.core.Config = function(args) {

    var me = this,
        catjson = "cat/config/cat.json",
        _log = args.log,
        _enum = _cat.core.TestManager.enum,
        hasPhantomjs = args.hasPhantomjs,
        callback = args.callback,
        _proto = function(innerConfig) {
            
            if (innerConfig) {

                me.getType = function () {
                    return innerConfig.type;
                };

                me.getName = function () {
                    return innerConfig.name;
                };

                me.getIp = function () {
                    if (innerConfig.ip) {
                        return innerConfig.ip;
                    } else {
                        return  document.location.hostname;
                    }
                };

                me.getMethod = function () {
                    if (innerConfig.method) {
                        return innerConfig.method;
                    } else {
                        return  "http";
                    }
                };

                me.getPort = function () {
                    if (innerConfig.port) {
                        return innerConfig.port;
                    } else {
                        return  document.location.port;
                    }
                };

                me.size = function() {
                    var tests = this.getTests();
                    return  ((tests && tests.length && tests.length > 0) ? tests.length : 0);                    
                };
                
                me.isTests = function() {
                    var size = this.size();
                    if (size) {
                        return true;
                    }

                    return false;
                };

                /**
                 * Validate if the current test is in the test scenarios scope and
                 * did not exceeded the test project index
                 *
                 * @param currentidx {Number} The current test index
                 * @returns {boolean} If the test has ended return true or else false
                 */
                me.isTestEnd = function(currentidx) {

                    var tests = this.getTests(),
                        size;

                    if (tests && tests.length) {

                        size = tests.length;
                        if (currentidx >= size) {

                            return true;
                        }
                    }

                    return false;
                };

                me.getNextTest = function() {
                   var state = _cat.core.manager.client.getCurrentState(),
                       idx;
                    
                    if (state) {
                        idx = state.index;
                        return me.getTest(idx);
                    }
                    return undefined;
                };

                me.hasNextTest = function() {
                    var size = me.size(),
                        state = _cat.core.manager.client.getCurrentState(),
                        idx;
                 
                    if (state) {
                        idx = state.index;
                        return (idx < size-1); 
                    }
                   
                    return false;
                };
                
                me.getTest = function(idx) {

                    var tests = this.getTests();
                    if (tests && tests.length && tests.length > 0) {
                        return tests[idx];
                    }

                    return undefined;
                };

                me.getTestNames = function() {
                    var list = this.getTests(),
                        names = [];
                    list.forEach(function(test){
                        if (test) {
                            names.push(test.scenario.name + ":" + test.name);
                        }
                    });

                    return names.join(",");
                };

                me.getTests = function () {

                    function _GetTestsClass(config) {

                        this.globalTests = [];

                        // do this once
                        this.setTests = function (config) {

                            var getScenarioTests = function (testsList, globalDelay, scenarioName) {
                                    var innerConfigMap = [],
                                        repeatFlow, i, j, tempArr;

                                    if (testsList.tests) {
                                        for (i = 0; i < testsList.tests.length; i++) {
                                            if (!(testsList.tests[i].disable)) {
                                                if (testsList.tests[i].tests) {
                                                    repeatFlow = testsList.tests[i].repeat ? testsList.tests[i].repeat : 1;

                                                    for (j = 0; j < repeatFlow; j++) {
                                                        tempArr = getScenarioTests(testsList.tests[i], testsList.tests[i].delay);
                                                        innerConfigMap = innerConfigMap.concat(tempArr);
                                                    }

                                                } else {

                                                    // set the global delay
                                                    if (!testsList.tests[i].delay && globalDelay) {
                                                        testsList.tests[i].delay = globalDelay;
                                                    }
                                                    testsList.tests[i].wasRun = false;
                                                    testsList.tests[i].scenario = {
                                                        name: (scenarioName || null),
                                                        path: (testsList.path || null)
                                                    };
                                                    innerConfigMap.push(testsList.tests[i]);

                                                }
                                            }
                                        }
                                    }

                                    return innerConfigMap;

                                },
                                i, j, temp, testcounter = 0,
                                testsFlow, scenarios, scenario,
                                repeatScenario, currTest, currentTestName, currentTestPathTest,
                                self = this,
                                _addToGlobal = function(temp) {
                                    temp.tests.forEach(function() {
                                        self.globalTests.push(null);
                                    });
                                };

                            testsFlow = config.tests;
                            scenarios = config.scenarios;
                            for (i = 0; i < testsFlow.length; i++) {
                                currTest = testsFlow[i];
                                currentTestPathTest = _cat.utils.Utils.pathMatch(currTest.path);

                                if (!currTest || !("name" in currTest) ||!currentTestPathTest) {
                                    if (!("name" in currTest)) {
                                        _log.warn("[CAT] 'name' property is missing for the test configuration, see cat.json ");
                                    }

                                    temp = scenarios[currTest.name];
                                    if (temp.tests) {
                                        _addToGlobal(temp);
                                    }

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

                        if (_GetTestsClass._singletonInstance) {
                            return _GetTestsClass._singletonInstance;
                        }

                        this.setTests(config);

                        _GetTestsClass._singletonInstance = this;

                        this.getTests = function () {
                            return this.globalTests;
                        };
                    }

                    var tests = new _GetTestsClass(innerConfig);

                    return tests.getTests();

                };

                me.getTestDelay = function () {
                    return (innerConfig["run-test-delay"] || 500);
                };

                me.getRunMode = function () {
                    return (innerConfig["run-mode"] || "all");
                };

                me.getTimeout = function () {
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

                me.isReportType = function (key) {
                    var formats = this.getReportFormats(),
                        i, size, item;

                    if (formats && formats.length > 0) {
                        size = formats.length;
                        for (i = 0; i < size; i++) {
                            item = formats[i];
                            if (item === key) {
                                return true;
                            }
                        }
                    }

                    return false;
                };

                me.isAnnotationDelaySupported = function(annotationType, override) {
                    var supportedAnnotationKeys;

                    if (override !== undefined) {
                        return override;
                    }

                    supportedAnnotationKeys = {"js":1, "code":1, "assert":1, "jqm":1, "jquery":1, "enyo":1, "sencha":1, "dom":1, "angular":1};
                    if (annotationType && supportedAnnotationKeys[annotationType]) {
                        return (this.getTestDelay() || 0);
                    }

                    return 0;
                };

                me.isJUnitSupport = function () {

                    return this.isReportType("junit");
                };

                me.isConsoleSupport = function () {

                    return this.isReportType("console");
                };

                me.getReportFormats = function () {

                    var format = [],
                        report;

                    if (_cat.utils.Utils.validate(innerConfig, "report")) {

                        report = innerConfig.report;
                        format = (report.format ? report.format : format);
                    }

                    return format;
                };

                me.isReport = function () {

                    if (_cat.utils.Utils.validate(innerConfig, "report") && _cat.utils.Utils.validate(innerConfig.report, "disable", false)) {

                        return true;
                    }

                    return false;
                };

                me.isErrors = function () {

                    if (_cat.utils.Utils.validate(innerConfig, "assert") && _cat.utils.Utils.validate(innerConfig.assert, "errors", true)) {

                        return true;
                    }
                    return false;
                };

                me.isUI = function () {
                    if (_cat.utils.Utils.validate(innerConfig, "ui", true)) {

                        return true;
                    }

                    return false;
                };

                me.getTestsTypes = function () {
                    return _enum;
                };

            }

            me.hasPhantom = function () {
                return hasPhantomjs;
            };

            me.available = function () {
                return (innerConfig ? true : false);
            };            
        };

    try {

        _cat.utils.AJAX.sendRequestAsync({
            url : _cat.core.getBaseUrl(catjson), 
            callback : {
                call : function(xmlhttp) {
                    var configText = xmlhttp.response,
                        innerConfig;
                    
                    if (configText) {
                        try {
                            innerConfig = JSON.parse(configText);
                            _proto(innerConfig);
                            
                            if (callback) {
                                callback.call(this, innerConfig);
                            }
                            
                        } catch (e) {
                            _log.error("[catjs Config class] cat.json parse error: ", e);
                        }
                    }
                }
            }
        });
    }
    catch (err) {
        //todo: log error
    }

};