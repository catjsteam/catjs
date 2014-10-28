
// read configuration
var path = require("path"),
    configPath,
    data,
    _fs = require("fs"),
    project, sourceFolder,
    _utils = catrequire("cat.utils"),
    _jsonlint = require("json-lint"),
    _catcli;

var readProject  = function() {
    var globalTests,
        scrapsObj,
        mainProject,
        emptyQueue,
        getScrap,
        devicesTests;

    devicesTests = {};
    globalTests = [];
    scrapsObj = {};

    mainProject = (function() {

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
            jsonlint = _jsonlint( data, {} );
            if ( jsonlint.error ) {
                _utils.error("error", ["CAT project manager] cat.json load with errors: \n ", jsonlint.error,
                    " \n at line: ", jsonlint.line,
                    " \n character: ", jsonlint.character,
                    " \n "].join(""));
            }

            result = JSON.parse(data);
            
        } catch(e) {
            _utils.error("[CAT Core] cat.json parse error: ", e);
        }

        return result;
    }());


    (function() {

        var getScenarioTests = function(testsList, globalDelay, scenarioName) {
                
            var innerConfigMap = [],
                j= 0, i= 0, tempArr,
                testsobj = (testsList ? testsList.tests : undefined), 
                size = (testsobj ? testsobj.length : 0),
                repeatFlow;

            if (testsList.tests) {
                for (i = 0; i < size; i++) {
                    if (!(testsobj[i].disable)) {
                        if (testsobj[i].tests) {
                            repeatFlow = testsList.tests[i].repeat ?testsobj[i].repeat : 1;

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
        indexTest=0,
        currTest,
        repeatScenario,
        scenario, 
        j, temp, indexGlobalTests,
            globaltestsize,
            testsscenariossize;

        testsScenarios = mainProject.tests;
        scenariosList = mainProject.scenarios;

        testsscenariossize = testsScenarios.length;
        for (indexTest=0; indexTest<testsscenariossize; indexTest++) {
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
                    temp = (getScenarioTests(scenario, scenario.delay, currentTestName));
                    globalTests = globalTests.concat(temp);
                }
            } else {
//                _log.warn("[CAT] No valid scenario '", currTest.name, "' was found, double check your cat.json project");
            }
        }

        //add attributes
        globaltestsize = globalTests.length;
        for (indexGlobalTests=0; indexGlobalTests<globaltestsize; indexGlobalTests++) {
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
            scrapReadyIndex = testsConfig.scrapReadyIndex,
            size = resQueue.length;

        for (indexRes=0; indexRes<size; indexRes++) {
            scrapElement = resQueue[indexRes];
            if (scrapElement.scrap.index <= scrapReadyIndex) {

                tests[scrapElement.scrap.index].run = true;

                result = {
                    "readyScrap" : tests[scrapReadyIndex],
                    "scrapInfo" : tests[scrapElement.scrap.index],
                    "status": 200
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

                if (!scrap) {
                    console.warn("[CAT] No valid scrap was found");
                    return undefined;
                } else {
                    if (scrap.index === undefined || scrap.index === null) {
                        console.warn("[CAT] No valid scrap index was found");
                        return undefined;                        
                    }
                }
                
                // test data for the test id
                currReadyIndex = testsConfig.scrapReadyIndex;

                currTest = testsConfig.tests;
                currTest[scrap.index].signed = true;

                // if this is the next scrap
                if (scrap.index <= currReadyIndex) {
                    currTest[scrap.index].run = true;

                    result = {
                        "readyScrap" : currTest[currReadyIndex],
                        "scrapInfo" : currTest[scrap.index],
                        status: 200
                    };

                    res.setHeader('Content-Type', 'text/javascript;charset=UTF-8');
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