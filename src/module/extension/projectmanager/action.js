
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
        resQueue,
        emptyQueue,
        getScrap,
        scrapReadyIndex;

    scrapReadyIndex = 0;
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

    resQueue = [];
    emptyQueue = function() {

        var tempQueue = [];

        for (var indexRes in resQueue) {
            var scrapElement = resQueue[indexRes];
            if (scrapElement.scrap.index <= scrapReadyIndex) {

                globalTests[scrapElement.scrap.index].run = true;

                var result = {"readyScrap " : globalTests[scrapReadyIndex],
                    "scrapInfo" : globalTests[scrapElement.scrap.index]};

                scrapElement.response.send(result);
                scrapReadyIndex++;
            } else {
                tempQueue.push(scrapElement);
            }

        }
        resQueue = tempQueue;

    }


    getScrap = function(scrapName) {

        for (var indexGlobal in globalTests) {
            var tempScrap = globalTests[indexGlobal];
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
                result;

            if (req.query && req.query.scrap && scrapsObj[req.query.scrap]) {

                scrapName  = req.query.scrap;
                scrap = getScrap(scrapName);

                globalTests[scrap.index].signed = true;
                // if this is the next scrap
                if (scrap.index <= scrapReadyIndex) {
                    globalTests[scrap.index].run = true;

                    result = {
                        "readyScrap" : globalTests[scrapReadyIndex],
                        "scrapInfo" : globalTests[scrap.index]
                    };

                    res.send(result);
                    scrapReadyIndex++;

                    emptyQueue();

                } else {

                    resQueue.push({
                        "scrap" : globalTests[scrap.index],
                        "request" : req,
                        "response" : res
                    });
                }

            }


        }


    };

}();

module.exports = readProject;