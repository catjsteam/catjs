_cat.core.Config = function(args) {

    var innerConfig,
        xmlhttp,
        configText,
        me = this,
        catjson = "cat/config/cat.json",
        _log = _cat.core.log,
        _enum = _cat.core.TestManager.enum,
        hasPhantomjs = args.hasPhantomjs;

    try {

        xmlhttp = _cat.utils.AJAX.sendRequestSync({
            url: _cat.core.getBaseUrl(catjson)
        });
        if (xmlhttp) {
            configText = xmlhttp.responseText;
            if (configText) {
                try {
                    innerConfig = JSON.parse(configText);
                } catch (e) {
                    _cat.core.log.error("[CAT Core] cat.json parse error: ", e);
                }
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

            function _GetTestsClass(config) {

                this.globalTests = [];
                
                // do this once
                this.setTests = function (config) {

                    var getScenarioTests = function (testsList, globalDelay, scenarioName) {
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
                    for (i = 0; i < testsFlow.length; i++) {
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

        this.getTestDelay = function () {
            return (innerConfig["run-test-delay"] || 2000);
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

        this.isReportType = function (key) {
            var formats = me.getReportFormats(),
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

        this.isJUnitSupport = function () {

            return this.isReportType("junit");
        };

        this.isConsoleSupport = function () {

            return this.isReportType("console");
        };

        this.getReportFormats = function () {

            var format = [],
                report;

            if (_cat.utils.Utils.validate(innerConfig, "report")) {

                report = innerConfig.report;
                format = (report.format ? report.format : format);
            }

            return format;
        };

        this.isReport = function () {

            if (_cat.utils.Utils.validate(innerConfig, "report") && _cat.utils.Utils.validate(innerConfig.report, "disable", false)) {

                return true;
            }

            return false;
        };

        this.isErrors = function () {

            if (_cat.utils.Utils.validate(innerConfig, "assert") && _cat.utils.Utils.validate(innerConfig.assert, "errors", true)) {

                return true;
            }
            return false;
        };

        this.isUI = function () {
            if (_cat.utils.Utils.validate(innerConfig, "ui", true)) {

                return true;
            }

            return false;
        };


        this.endTest = function (opt, interval) {
            _cat.utils.Signal.send('TESTEND', opt);
            if (interval === -1) {
                console.log("Test End");
            } else {
                clearInterval(interval);
            }
        };


        this.getTestsTypes = function () {
            return _enum;
        };

    }

    this.hasPhantom = function () {
        return hasPhantomjs;
    };

    this.available = function () {
        return (innerConfig ? true : false);
    };
};