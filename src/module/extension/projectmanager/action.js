
// read configuration
var path = require("path"),
    configPath,
    data,
    _fs = require("fs"),
    project, sourceFolder;

var readProject  = function() {
    var globalTests,
        scrapsObj,
        mainProject,
        scrapsOrder,
        emptyQueue,
        getScrap,

        devicesTests;

    devicesTests = {};

    globalTests = [];
    scrapsObj = {};

    mainProject = (function() {

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
        _testconfig = JSON.parse(data);

        return _testconfig;
    }());


    scrapsOrder = (function() {

        var getScenarioTests =function(testsList, globalDelay, scenarioName) {
            var innerConfigMap = [];

            if (testsList.tests) {
                for (var i = 0; i < testsList.tests.length; i++) {
                    if (!(testsList.tests[i].disable)) {
                        if (testsList.tests[i].tests) {
                            var repeatFlow = testsList.tests[i].repeat ? testsList.tests[i].repeat : 1;

                            for (var j = 0; j < repeatFlow; j++) {
                                var tempArr = getScenarioTests(testsList.tests[i], testsList.tests[i].delay, scenarioName);
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

        },
        testsScenarios,
        scenariosList,
        currentTestName,
        indexTest;

        testsScenarios = mainProject.tests;
        scenariosList = mainProject.scenarios;

        for (indexTest in testsScenarios) {
            var currTest,
                repeatScenario,
                scenario;

            currTest = testsScenarios[indexTest];

            if (!currTest || !("name" in currTest)) {
//                _log.warn("[CAT] 'name' property is missing for the test configuration, see cat.json ");
                continue;
            }

            currentTestName = currTest.name;
            scenario = scenariosList[currentTestName];

            if (scenario) {
                repeatScenario = (scenario.repeat ? scenario.repeat : 1);
                for (var j = 0; j < repeatScenario; j++) {
                    var temp;
                    temp = (getScenarioTests(scenario, scenario.delay, currentTestName));
                    globalTests = globalTests.concat(temp);
                }
            } else {
//                _log.warn("[CAT] No valid scenario '", currTest.name, "' was found, double check your cat.json project");
            }
        }

        //add attributes
        for (var indexGlobalTests in globalTests) {
            globalTests[indexGlobalTests].run = false;
            globalTests[indexGlobalTests].index = indexGlobalTests;
            globalTests[indexGlobalTests].signed = false;

            scrapsObj[globalTests[indexGlobalTests].name] = globalTests[indexGlobalTests];
        }
    })();


    emptyQueue = function(testId) {

        var tempQueue = [],
            testsConfig = devicesTests[testId],
            tests = testsConfig.tests,
            resQueue = testsConfig.resQueue,
            indexRes,
            result,
            scrapElement,
            scrapReadyIndex = testsConfig.scrapReadyIndex;

        for (indexRes in resQueue) {
            scrapElement = resQueue[indexRes];
            if (scrapElement.scrap.index <= scrapReadyIndex) {

                tests[scrapElement.scrap.index].run = true;

                result = {
                    "readyScrap" : tests[scrapReadyIndex],
                    "scrapInfo" : tests[scrapElement.scrap.index]
                };

                scrapElement.response.send(result);
                scrapReadyIndex++;
                devicesTests[testId].scrapReadyIndex = scrapReadyIndex;

            } else {
                tempQueue.push(scrapElement);
            }

        }
        devicesTests[testId].resQueue = tempQueue;

    }


    getScrap = function(scrapName, testId) {
        var indexTests,
            tests = devicesTests[testId].tests,
            tempScrap;

        for (indexTests in tests) {
            tempScrap = tests[indexTests];
            if (tempScrap.name == scrapName && !(tempScrap.run)) {
                return tempScrap;
            }
        }
    }


    return {

        getProject : function() {
            return mainProject;
        },

        getScrapsOrder : function () {
            return globalTests;
        },

        checkScrap : function(req, res) {
            var scrapName,
                scrap,
                result,
                testId,
                currTest,
                currReadyIndex,
                testsConfig,
                cloneGlobalTests;

            testId = req.query.testId;
            if (!devicesTests[testId] ||
                (devicesTests[testId] && globalTests.length === devicesTests[testId].scrapReadyIndex)) {
                cloneGlobalTests = JSON.parse(JSON.stringify(globalTests));
                devicesTests[testId] = {
                    "scrapReadyIndex" : 0,
                    "tests" : cloneGlobalTests,
                    "resQueue" : []
                }
            }

            testsConfig = devicesTests[testId];
            if (req.query && req.query.scrap && scrapsObj[req.query.scrap]) {

                scrapName  = req.query.scrap;
                scrap = getScrap(scrapName, testId);

                // test data for the test id
                currReadyIndex = testsConfig.scrapReadyIndex;

                currTest = testsConfig.tests;
                currTest[scrap.index].signed = true;

                // if this is the next scrap
                if (scrap.index <= currReadyIndex) {
                    currTest[scrap.index].run = true;

                    result = {
                        "readyScrap" : currTest[currReadyIndex],
                        "scrapInfo" : currTest[scrap.index]
                    };

                    res.send(result);
                    devicesTests[testId].scrapReadyIndex++;

                    emptyQueue(testId);

                } else {

                    testsConfig.resQueue.push({
                        "scrap" : currTest[scrap.index],
                        "request" : req,
                        "response" : res
                    });
                }

            }


        }


    };

}();

module.exports = readProject;