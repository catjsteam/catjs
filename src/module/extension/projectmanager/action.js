// read configuration
var path = require("path"),
    configPath,
    data,
    _fs = require("fs"),
    project, sourceFolder,
    _utils = catrequire("cat.utils"),
    _jsonlint = require("json-lint"),
    _catcli,
    TestConfig = require("./TestConfig.js"),

    readProject = function () {
        var globalTests,
            scrapsObj,
            mainProject,
            emptyQueue,
            getScrap,
            devicesTests,
            _module;

        devicesTests = {};
        globalTests = [];
        scrapsObj = {};

        mainProject = (function () {

            var result, jsonlint;

            _catcli = (catrequire ? catrequire("cat.cli") : null);
            if (_catcli) {

                project = _catcli.getProject();
                if (project) {
                    try {
                        sourceFolder = project.info.source;
                        configPath = path.join(sourceFolder, "config/cat.json");
                    } catch (e) {
//                    _log.error("[CAT server (assert module)] Failed to load cat.json test project, No CAT test project is available.", e);
                    }
                } else {
//                _log.error("[CAT server (assert module)] Failed to load cat.json test project, No CAT project is available.");
                }
            }

            data = _fs.readFileSync(configPath, 'utf8');

            try {
                jsonlint = _jsonlint(data, {});
                if (jsonlint.error) {
                    _utils.error("error", ["CAT project manager] cat.json load with errors: \n ", jsonlint.error,
                        " \n at line: ", jsonlint.line,
                        " \n character: ", jsonlint.character,
                        " \n "].join(""));
                }

                result = JSON.parse(data);

            } catch (e) {
                _utils.error("[CAT Core] cat.json parse error: ", e);
            }

            return result;
        }());

        function _init() {

            var getScenarioTests = function (testsList, globalDelay, scenarioName, path) {

                    var innerConfigMap = [],
                        j = 0, i = 0, tempArr,
                        testsobj = (testsList ? testsList.tests : undefined),
                        size = (testsobj ? testsobj.length : 0),
                        repeatFlow;

                    if (testsList.tests) {
                        for (i = 0; i < size; i++) {
                            if (!(testsobj[i].disable)) {
                                if (testsobj[i].tests) {
                                    repeatFlow = testsList.tests[i].repeat ? testsobj[i].repeat : 1;

                                    for (j = 0; j < repeatFlow; j++) {
                                        tempArr = getScenarioTests(testsobj[i], testsobj[i].delay, scenarioName);
                                        innerConfigMap = innerConfigMap.concat(tempArr);
                                    }

                                } else {

                                    // set the global delay
                                    if (!testsobj[i].delay && globalDelay) {
                                        testsobj[i].delay = globalDelay;
                                    }
                                    testsobj[i].wasRun = false;
                                    testsobj[i].path = path;
                                    testsobj[i].scenario = {name: (scenarioName || null)};


                                    innerConfigMap.push(testsobj[i]);

                                }
                            }
                        }
                    }

                    return innerConfigMap;

                },
                testsScenarios,
                scenariosList,
                currentTestName,
                indexTest = 0,
                currTest,
                repeatScenario,
                scenario,
                j, temp, indexGlobalTests,
                globaltestsize,
                testsscenariossize;

            testsScenarios = mainProject.tests;
            scenariosList = mainProject.scenarios;

            testsscenariossize = testsScenarios.length;
            for (indexTest = 0; indexTest < testsscenariossize; indexTest++) {
                currTest = null;
                repeatScenario = null;
                scenario = null;

                currTest = testsScenarios[indexTest];

                if (!currTest || !("name" in currTest)) {
//                _log.warn("[CAT] 'name' property is missing for the test configuration, see cat.json ");
                    continue;
                }

                currentTestName = currTest.name;
                scenario = scenariosList[currentTestName];

                if (scenario) {
                    repeatScenario = (scenario.repeat ? scenario.repeat : 1);
                    for (j = 0; j < repeatScenario; j++) {
                        temp = (getScenarioTests(scenario, scenario.delay, currentTestName, currTest.path));
                        globalTests = globalTests.concat(temp);
                    }
                } else {
//                _log.warn("[CAT] No valid scenario '", currTest.name, "' was found, double check your cat.json project");
                }
            }

            //add attributes
            globaltestsize = globalTests.length;
            for (indexGlobalTests = 0; indexGlobalTests < globaltestsize; indexGlobalTests++) {
                globalTests[indexGlobalTests].run = false;
                globalTests[indexGlobalTests].index = indexGlobalTests;
                globalTests[indexGlobalTests].signed = false;

                scrapsObj[globalTests[indexGlobalTests].name] = globalTests[indexGlobalTests];
            }
        };

        // initial call
        _init();

        emptyQueue = function (testId) {

            var testsConfig = devicesTests[testId],
                scraplist = [];

            /**
             * Validate if the queue contains any scrap that are ready and in their turn
             *
             * @private
             */
            function _getReadyScraps() {

                var idx = testsConfig.getIndex();
                if (testsConfig.isInQueue(idx)) {

                    scraplist.push(testsConfig.getTest(idx));
                    testsConfig.remove(idx);
                    testsConfig.next();

                    _getReadyScraps();

                }
            }

            _getReadyScraps();

            return scraplist;

        };

        getScrap = function (scrapName, testId) {
            var indexTests,
                tests = devicesTests[testId].tests,
                tempScrap,
                indexTests = 0, size,
                scrap;

            if (tests) {
                size = tests.length;
                for (indexTests = 0; indexTests < size; indexTests++) {
                    tempScrap = tests[indexTests];
                    if (tempScrap.name == scrapName) {
                        scrap = tempScrap;
                        break;
                    }


                }
            }

            return {scrap: scrap, run: (scrap ? scrap.run : false) };
        };

        _module = {

            getProject: function () {
                return mainProject;
            },

            getScrapsOrder: function () {
                return globalTests;
            },

            destroy: function (testId) {
                delete devicesTests[testId];
            },
            
            resetDevice: function(testId) {
                if (devicesTests[testId]) {
                    devicesTests[testId].setIndex(testId);
                }
            },

            checkScrap: function (req, res) {

                var scrapName,
                    scrap,
                    result,
                    testId,
                    currTest,
                    currReadyIndex,
                    testsConfig,
                    cloneGlobalTests,
                    isReady = false,
                    readyScrapList = [],
                    scrapReady = true;

                function _response(isready) {
                    // send back response
                    result = {
                        "ready": isReady,
                        "readyScraps": readyScrapList,
                        "scrapInfo": (scrap && currTest && isready ? currTest[scrap.index] : undefined),
                        status: 200,
                        currentIndex: currReadyIndex
                    };

                    res.setHeader('Content-Type', 'text/javascript;charset=UTF-8');
                    res.send(result);
                }

                testId = req.query.testId;
                if (testId) {
                    testsConfig = devicesTests[testId];


                    if (!testsConfig ||
                        (testsConfig && globalTests.length === testsConfig.getIndex())) {

                        cloneGlobalTests = JSON.parse(JSON.stringify(globalTests));
                        devicesTests[testId] = new TestConfig({
                            "tests": cloneGlobalTests,
                            "request": req
                        });
                    }

                    testsConfig = devicesTests[testId];
                    while (testsConfig.skip()) {
                        testsConfig.next();
                    }

                    // test data for the test id
                    currReadyIndex = testsConfig.getIndex();

                    if (req.query && req.query.scrap && scrapsObj[req.query.scrap]) {

                        scrapName = req.query.scrap;
                        scrap = getScrap(scrapName, testId);

                        if (scrap.run) {
                            if (scrap.scrap) {
                                console.warn("[catjs monitoring server] scrap:", scrap.scrap.name, " already processed ");
                            } else {
                                console.warn("[catjs monitoring server] No valid scrap was found, scrap:", scrapName);
                            }
                            scrapReady = false;
                        }
//                        else {
//                            if (scrap.scrap && (scrap.scrap.index === undefined || scrap.scrap.index === null)) {
//                                console.warn("[catjs monitoring server] No valid scrap index was found");
//                                scrapReady = false;
//                            }
//                        }

                        if (!scrapReady) {

                           _module.destroy(testId);
                            _response(false);
                            return undefined;
                        }

                        if (scrap && scrap.scrap && !scrap.run) {
                            scrap = scrap.scrap;
                        }

                        currTest = testsConfig.tests;
                        currTest[scrap.index].signed = true;

                        // if this is the next scrap
                        if (scrap.index <= currReadyIndex) {

                            currTest[scrap.index].run = true;
                            isReady = true;

                            readyScrapList.push(scrap);
                            testsConfig.next();

                            readyScrapList = readyScrapList.concat(emptyQueue(testId));

                        } else {

                            // set the scrap index into queue
                            testsConfig.resQueue[scrap.index] = 1;

                        }


                        _response(true);

                    }
                }

            }
        };
        
        return _module;

    }();

module.exports = readProject;