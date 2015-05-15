var path = require("path"),
    _fs = require("fs"),
    _utils = catrequire("cat.utils"),
    _cajsconfig = require("./../config.js"),
    _TestConfig = require("./TestConfig.js"),
    _ = require("underscore");

module.exports = function () {

    var _module,        
        _testsCache = new _TestCache();

    /**
     * Test Cache Class
     * 
     * @private
     */
    function _TestCache() {
        this._testCache = {};
    }

    /**
     * Check if a test exists
     * 
     * @param id {String} The test id
     */
    _TestCache.prototype.exists = function(id) {
        return (this._testCache[id] ? true : false);      
    };
    
   _TestCache.prototype.delete = function(id) {
        delete this._testCache[id];      
    };
    
    /**
     * Get and Set the test by tests id
     * 
     * @param id {String} The test id
     * @param config {Object}
     *          currentIndex {Number} The current running test (index)
     *          testConfig {TestConfig} The test config data
     *          scraps {Array} The scraps list
     *          id {String} The id of the test
     */
    _TestCache.prototype.cache = function(id, config) {
        var test = this._testCache[id]; 

        function _update() {
            if ("id" in config) {
                test.id(config.id);
            }
            if ("testConfig" in config) {
                test.testConfig(config.testConfig);
            }
            if ("scraps" in config) {
                test.scraps(config.scraps);
            }
            if ("currentIndex" in config) {
                test.currentIndex(config.tests);
            }
        }
        
        if (!test) {
            this._testCache[id] = new _TestData();
            test = this._testCache[id];
        }
        if (config) {
            _update(config);
        }
        
        return test;
    };

    /**
     * Test Data Class
     * 
     * @private
     */
    function _TestData () {
        this._currentIndex = 0;
    }
    
    _TestData.prototype.testConfig = function(testConfig) {
        if (testConfig !== undefined) {
            this._testConfig = testConfig;
        }
        return this._testConfig;
    };    
    _TestData.prototype.id = function(id) {
        if (id !== undefined) {
            this._id = id;
        }
        return this._id;
    };
    
   _TestData.prototype.currentIndex = function(currentIndex) {
       if (currentIndex !== undefined) {
           this._currentIndex = currentIndex;
       }
       return this._currentIndex;
    };
    
    _TestData.prototype.scraps = function(scraps) {
        if (!this._scraps) {
            this._scraps = [];
        }
        if (scraps !== undefined) {
            if (_.isArray(scraps)) {
                this._scraps =  this._scraps.concat(scraps)
            } else {
                this._scraps.push(scraps);
            }
        }    
        return  this._scraps;
    };
   

    _module = {


        getProject: function () {

        },

        getScrapsOrder: function () {

        },
        
        /**
         * Clean cache data
         * 
         * @param testId
         */
        clean: function (testId) {
            _testsCache.delete(testId);
        },

        getCurrentIndex: function(id) {
            
            var currentTestCache,
                currentTestConfig;
            
            // load tests according to the current test id
            if (_testsCache.exists(id)) {
            
                currentTestCache = _testsCache.cache(id);
                currentTestConfig = currentTestCache.testConfig();               
            }

            // test data for the test id currentTestConfig.scrapReadyIndex
           return (currentTestConfig ? currentTestConfig.getIndex() : 0);  
        },
        
        /**
         * Rest for updating the current client state
         * 
         */
        update: function(req, res) {

            function _getRequestValues(req) {

                var id, currentIndex;

                if (req.query) {
                    id = req.query.testId;
                    currentIndex = req.query.currentIndex;
                }

                return {
                    id: id,
                    currentIndex: currentIndex
                };
            }

            var requestValues = _getRequestValues(req);
            if (requestValues) {
                //console.log("requestValues", requestValues);
            }

            var result = {
                status: 200
            };

            res.setHeader('Content-Type', 'text/javascript;charset=UTF-8');
            res.send(result);
        },
        
        /**
         * Rest for checking the scraps status
         * 
         * @param req
         * @param res
         * @returns {undefined}
         */
        checkScrap: function (req, res) {
           
            function _getRequestValues(req) {

                var id, scrapname;

                if (req.query) {
                    id = req.query.testId;
                    scrapname = req.query.scrap;
                }

                return {
                    id: id,
                    scrapName: scrapname
                };
            }
            
            function _loadTest(catjstests, req) {
                
                var testconfig,
                    scenario, testsScenarios, testsscenariossize, repeatScenario,
                    scenariosList,
                    indexTest,
                    currTest, currentTestName,
                    tests = [],
                    scenarioidx, testsIndex = 0;


                function _getScenarioTests(testsList, globalDelay, scenarioName, path) {

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
                                            tempArr = _getScenarioTests(testsobj[i], testsobj[i].delay, scenarioName);
                                            innerConfigMap = innerConfigMap.concat(tempArr);
                                        }

                                    } else {

                                        // set the global delay
                                        if (!testsobj[i].delay && globalDelay) {
                                            testsobj[i].delay = globalDelay;
                                        }
                                        testsobj[i].run = false;
                                        testsobj[i].signed = false;
                                        testsobj[i].path = path;
                                        testsobj[i].scenario = {name: (scenarioName || null)};
                                        testsobj[i].index = testsIndex;
                                        
                                        testsIndex++;

                                        innerConfigMap.push(testsobj[i]);

                                    }
                                }
                            }
                        }

                        return innerConfigMap;

                    };
                
                if (catjstests) {

                    testsScenarios = catjstests.tests;
                    scenariosList = catjstests.scenarios;

                    testsscenariossize = testsScenarios.length;
                    for (indexTest = 0; indexTest < testsscenariossize; indexTest++) {
                        currTest = null;
                        repeatScenario = null;
                        scenario = null;

                        currTest = testsScenarios[indexTest];

                        if (!currTest || !("name" in currTest)) {
                            continue;
                        }

                        currentTestName = currTest.name;
                        scenario = scenariosList[currentTestName];

                        if (scenario) {
                            repeatScenario = (scenario.repeat ? scenario.repeat : 1);
                            for (scenarioidx = 0; scenarioidx < repeatScenario; scenarioidx++) {
                                tests = tests.concat(_getScenarioTests(scenario, scenario.delay, currentTestName, currTest.path, testsIndex));
                            }
                        } 
                    }
                    
                    testconfig = new _TestConfig({
                        "tests": tests,
                        "request": req
                    });
                }
                
                return testconfig;
            }


            function _emptyQueue(testId) {

                var testsCache = _testsCache.cache(testId),
                    testConfig = testsCache.testConfig(), 
                    scraplist = [];

                /**
                 * Validate if the queue contains any scrap that are ready and in their turn
                 *
                 * @private
                 */
                function _getReadyScraps() {

                    var idx = testConfig.getIndex();
                    if (testConfig.isInQueue(idx)) {

                        scraplist.push(testConfig.getTest(idx));
                        testConfig.remove(idx);
                        testConfig.next();

                        _getReadyScraps();

                    }
                }

                _getReadyScraps();

                return scraplist;

            };

            function  _getScrap(scrapName, tests) {
                var indexTests,
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
            
            function _response(isReady, scraps, readyinfo) {
                // send back response
                var result = {
                    "ready": isReady,
                    "readyScraps": (scraps || []),
                    "scrapInfo": (scrap && currTest && readyinfo ? currTest[scrap.index] : undefined),
                    status: 200,
                    currentIndex: currReadyIndex
                };

                res.setHeader('Content-Type', 'text/javascript;charset=UTF-8');
                res.send(result);
            }

            var catjsconfig, scrapReady = true, isReady = false,
                id, scrapName, scrap, scrapReady, currTest,
                currentTestConfig, currentTestCache, currReadyIndex,
                requestValues = _getRequestValues(req);

            // valid test id is required
            id = requestValues.id;
            scrapName = requestValues.scrapName;
            if (!id) {
                return undefined;
            }

            // valid catjs test project (cat.json) is required
            catjsconfig = _cajsconfig.getConfig(id);

            if (catjsconfig) {

                // load tests according to the current test id
                if (!_testsCache.exists(id)) {
                    _testsCache.cache(id, {testConfig: _loadTest(catjsconfig, req)});
                }

                currentTestCache = _testsCache.cache(id);
                currentTestConfig = currentTestCache.testConfig();
                while (currentTestConfig.skip()) {
                    currentTestConfig.next();
                }

                // test data for the test id
                currReadyIndex = currentTestConfig.getIndex();
                
                // check the client index against the test project
                // we can tell if there's no existing test in the list according to the current index
                
                // handle scrap response
                scrap = _getScrap(scrapName, currentTestConfig.getTests());
                if (scrap.run) {
                    if (scrap.scrap) {
                        console.warn("[catjs monitoring server] scrap:", scrap.scrap.name, " already processed ");
                    } else {
                        console.warn("[catjs monitoring server] No valid scrap was found, scrap:", scrapName);
                    }
                    scrapReady = false;
                }

                if (!scrapReady) {
                    _module.clean(id);
                    _response(isReady, currentTestCache.scraps(), false);
                    
                    return undefined;
                }

                if (scrap && scrap.scrap && !scrap.run) {
                    scrap = scrap.scrap;
                }

                currTest = currentTestConfig.getTests();
                currTest[scrap.index].signed = true;

                // if this is the next scrap
                if (scrap.index <= currReadyIndex) {

                    currTest[scrap.index].run = true;
                    isReady = true;
                    currentTestCache.scraps(scrap);
                    currentTestConfig.next();

                    currentTestCache.scraps(_emptyQueue(id));

                } else {

                    // set the scrap index into queue
                    currentTestConfig.setToQueue(scrap.index);

                }
                
                // response back to the client
                _response(isReady, currentTestCache.scraps(), true);
            }


        }
    };

    return _module;

}
    ();

