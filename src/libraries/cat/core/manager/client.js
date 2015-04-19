_cat.core.manager.client = function () {

    var tests,
        commitScrap,
        getScrapTestInfo,
        totalDelay,
        runStatus,
        checkIfExists,        
        initCurrentState = false,
        startInterval,
        getScrapInterval,
        setupInterval,
        intervalObj,
        endTest,
        testQueue,
        currentState = { index: 0, testend: false },
        clientmanagerId,
        _log = _cat.core.log;


    endTest = function (opt, interval) {

        // set state flag
        currentState.testend = true;
        
        _cat.core.TestManager.send({signal: 'TESTEND', error: opt.error});
        if (interval === -1) {
            _log.log("[catjs client manager] Test End");
        } else {
            clearInterval(interval);
        }
    };

    runStatus = {
        "scrapReady": 0,
        "subscrapReady": 0,
        "numRanSubscrap": 0,
        "scrapsNumber": 0

    };

    getScrapInterval = function (scrap) {
        var scrapId = scrap.id;

        if (!runStatus.intervalObj) {
            runStatus.intervalObj = {
                "interval": undefined,
                "counter": 0,
                "signScrapId": scrapId
            };
        } else {
            runStatus.intervalObj.signScrapId = scrapId;
        }

        if (intervalObj) {
            clearInterval(intervalObj.interval);
        }

        return runStatus.intervalObj;
    };


    setupInterval = function (config, scrap) {

        var tests,
            testManager, 
            validateExists,
            item;

        intervalObj = getScrapInterval(scrap);

        tests = config.getTests();
        if (tests) {
            item = tests[tests.length - 1];
            if (item) {
                testManager = ( item.name || "NA");
            }
        }


        validateExists = _cat.core.getScrapById(intervalObj.signScrapId);
        
        if ( (_cat.core.getScrapName(scrap.name) === _cat.core.getScrapName(validateExists.name)) && !intervalObj.interval ) {
        
            intervalObj.interval = setInterval(function () {
    
                var msg = ["No test activity, retry: "];
                if (intervalObj.counter < 3) {
                    intervalObj.counter++;
    
                    msg.push(intervalObj.counter);
    
                    _cat.core.ui.setContent({
                        header: "Test Status",
                        desc: msg.join(""),
                        tips: {},
                        style: "color:gray",
                        currentState: currentState
                    });
    
                    _log.log("[CatJS client manager] ", msg.join(""));
    
                } else {
                    var err = "run-mode=tests catjs manager '" + testManager + "' is not reachable or not exists, review the test name and/or the tests code.";
    
                    _log.log("[catjs client manager] error: ", err);
                    endTest({error: err}, (runStatus ? runStatus.intervalObj : undefined));
                    clearInterval(intervalObj.interval);
                }
            }, config.getTimeout() / 3);
        }
        
        return;
    };


    commitScrap = function (scrap, args) {
        var scrapInfo,
            repeat,
            scrapInfoArr,
            infoIndex,
            repeatIndex,
            size;

        scrapInfoArr = getScrapTestInfo(scrap);
        size = scrapInfoArr.length;
        for (infoIndex = 0; infoIndex < size; infoIndex++) {
            scrapInfo = scrapInfoArr[infoIndex];
            repeat = scrapInfo.repeat || 1;
            for (repeatIndex = 0; repeatIndex < repeat; repeatIndex++) {
                _cat.core.actionimpl.apply(this, args);
            }
        }
    };


    getScrapTestInfo = function (scrap) {
        var scrapTests = [],
            i, size,
            validate = 0,
            tempInfo,
            scrapName = scrap.name,
            idx = (!isNaN(scrap.index) ? scrap.index : -1),
            testItem,
            isStandalone = _cat.utils.scrap.isStandalone(scrap);

        function setScrapTests(test) {
            tempInfo = {
                "name": test.name,
                "scenario": (test.scenario || undefined),
                "wasRun": (test.wasRun || false),
                "delay": (test.delay || undefined),
                "repeat": (test.repeat || undefined)
            };
            tempInfo.index = i;
            scrapTests.push(tempInfo);
            validate++;
        }

        if (isStandalone) {
            setScrapTests({
                name: scrapName
            });

        } else if (tests && scrapName) {
            /* 
            size = tests.length;
            for (i = 0; i < size; i++) {

                if (tests[i].name === scrapName) {
                    setScrapTests(tests[i]);
                }
            } 
            */
            testItem = (idx !== -1 ? tests[idx] : undefined);
            if (testItem && testItem.name === scrapName) {
                setScrapTests(testItem);
            }
        }

        if (!validate) {
            console.warn("[CatJS] Failed to match a scrap with named: '" + scrapName + "'. Check your cat.json project");
            if (!_cat.core.ui.isOpen()) {
                _cat.core.ui.on();
            }
        }
        return scrapTests;
    };

    checkIfExists = function (scrapName, tests) {

        var indexScrap = 0, size = (tests && tests.length ? tests.length : 0),
            testitem, path;      
        
        for (; indexScrap < size; indexScrap++) {
            testitem = tests[indexScrap];
            if (testitem) {
                path = testitem.scenario.path;
                if (testitem && testitem.name === scrapName && _cat.utils.Utils.pathMatch(path)) {
                    return {scrap: testitem, idx: indexScrap};
                }
            }
        }
        return undefined;
    };

    totalDelay = 0;

    startInterval = function (catConfig, scrap) {
        setupInterval(catConfig, scrap);
    };


    function _preScrapProcess(config, args) {
        config.args = args;
        if (args.length && args.length > 1 && (_cat.utils.Utils.getType(args[1]) === "object")) {
            args[1].scrapinfo = config.scrapInfo;
        }
    }

    function _process(config) {
        var scrap = config.scrapInfo,
            args = config.args,
            fullScrap;

        if (scrap) {
            runStatus.scrapReady = parseInt(scrap ? scrap.index : 0) + 1;
            args[1].def = config.def;
            commitScrap(scrap, args);
        }

        fullScrap = _cat.core.getScrapByName(scrap.name);
        if (fullScrap) {
            broadcastAfterProcess(fullScrap);
        }

    }

    function _nextScrap(config) {

        var scrap = config.scrap,
            tests = config.tests,
            args = config.args,
            testsize = tests.length,
            currentStateIdx = currentState.index,
            scrapName = (_cat.utils.Utils.isArray(scrap.name) ?  scrap.name[0] : scrap.name),
            exists = checkIfExists(scrapName, tests),
            preScrapConfig;

        if ((exists && (!testQueue.get(currentStateIdx - 1).first()) && (exists.idx === (currentStateIdx - 1)) || _cat.utils.scrap.isStandalone(scrap))) {
            preScrapConfig = {scrapInfo: scrap, args: args};
            _preScrapProcess(preScrapConfig, args);
            commitScrap({$standalone: scrap.$standalone, name: scrapName}, args);

        } else if (exists && (currentStateIdx < testsize)) {
            return true;
        }


        return false;
    }

    /**
     * Broadcast to execute the ready process and share the current state
     * 
     * @param doprocess {Boolean} Whether to process or not  
     * 
     * @private
     */
    function broadcastProcess(doprocess, dostate) {

        var topic = "process." + _cat.core.manager.client.getClientmanagerId();

        doprocess = (doprocess === undefined ? true : doprocess);
        dostate = (dostate === undefined ? true : dostate);
        
        flyer.broadcast({
            channel: "default",
            topic: topic,
            data: {
                totalDelay: totalDelay,
                currentState: (dostate ? currentState : undefined),
                doprocess: (doprocess || true)
            }
        });
    }


    /**
     * Listener for the process broadcaster
     * 
     * @private
     */
    function _subscribeProcess() {
        flyer.subscribe({
            channel: "default",
            topic: "process.*",
            callback: function(data, topic, channel) {
                var clientTopic = "process." + _cat.core.manager.client.getClientmanagerId();
                
                // update the current state
                if ("currentState" in data && data.currentState) {
                    currentState = data.currentState;   
                }  
                
                // update the total delay
                if ("currentState" in data && data.totalDelay) {
                    totalDelay = data.totalDelay;   
                }                
                
                // check if it's the same frame
                if (topic !== clientTopic) {      
                    
                    if (data.doprocess) {
                        _processReadyScraps(true);
                    }

                }
            }
        });
    }

    _subscribeProcess();


    function broadcastAfterProcess(fullScrap) {
        var topic = "afterprocess." + _cat.core.manager.client.getClientmanagerId();

        flyer.broadcast({
            channel: "default",
            topic: topic,
            data: fullScrap
        });

    }



    function _subscribeAfterProcess() {
        flyer.subscribe({
            channel: "default",
            topic: "afterprocess.*",
            callback: function(data, topic, channel) {
                var clientTopic = "afterprocess." + _cat.core.manager.client.getClientmanagerId();
                // check if it's the same frame
                //if (topic !== clientTopic) {
                    _cat.core.manager.client.removeIntervalFromBroadcast(data);
                //}

            }
        });
    }

    _subscribeAfterProcess();


    function _processReadyScraps(cameFromBroadcast) {
        var idx = currentState.index,
            catConfig, test,
            testitem = testQueue.get({index: idx}),
            testname,
            emptyQueue = testQueue.isEmpty(),
            queuedesc = (emptyQueue ? "no " : ""),
            firstfound = false,
            broadcast = false,
            testobj;


        // TODO add as a debug info
        catConfig = _cat.core.getConfig();
        test = catConfig.getTest(idx);
        testname = (test ? _cat.core.getScrapName(test.name) : undefined );
        if (testname) {
            _log.log("[catjs client manager status] scraps execution status: ready; There are " + queuedesc + "scraps in the queue. current index: ", idx, " test: ", testname);
            _log.log("[catjs client manager status] ", _cat.core.validateUniqueScrapInfo(testname));
        } else {
            _log.log("[catjs client manager status] scraps execution status: ready; current index: ", idx);
        }
        
        if (testitem.first()) {
            var configs = testitem.all(),
                testconfigs = [];
            
            configs.forEach(function(config) {

                testconfigs.push(function(def) {
                    if (config) {
                        
                        config.def = def;
                        _process(config);
                      
                        currentState.index++;
    
                        if (intervalObj && intervalObj.interval) {
                            clearInterval(intervalObj.interval);
                        }                   
                        _processReadyScraps(false);
                    } 
                });
            
            });
            
            _cat.core.manager.controller.state().next({
                defer: Q,
                methods: testconfigs,
                delay: ((test && "delay" in test) ? test.delay : 0) 
            });
            
            testitem.deleteAll();
            broadcastProcess(false, true);
            firstfound = true;
        } else {
            if (!cameFromBroadcast) {
                broadcastProcess(true, true);
                broadcast = true;                
            }
        }        
    }

    function scrapTestIndex(scrap) {
        var index;
        for (index = 0; index < tests.length; index++) {
            if (tests && tests[index] && scrap.name[0] === tests[index].name) {
                return index;
            }
        }
    }

    return {



        signScrap: function (scrap, catConfig, args, _tests) {
            var urlAddress,
                config,
                scrapName,
                currentStateIdx,
                reportFormats;
            
            if (!testQueue) {
                testQueue = new _cat.core.TestQueue();
            }
            
            runStatus.scrapsNumber = _tests.length;
            tests = _tests;
            scrapName = (_cat.utils.Utils.isArray(scrap.name) ?  scrap.name[0] : scrap.name);

            currentStateIdx = currentState.index;
            if (catConfig.isTestEnd(currentStateIdx)) {

                //currentState.testend = true;
                
                return undefined; 
            }
            
            if (_nextScrap({scrap: scrap, tests: tests, args: args})) {
                startInterval(catConfig, scrap);
                urlAddress = _cat.utils.Utils.getCatjsServerURL("/scraps?scrap=" + scrapName + "&" + "testId=" + _cat.core.guid());

                config = {
                    
                    url: urlAddress,
                    
                    callback: function () {

                        var response = JSON.parse(this.responseText),
                            scraplist, reportFormats, errmsg;

                        function _add2Queue(config) {
                            var scrapInfo,
                                counter,
                                configclone = {};
                            
                            _preScrapProcess(config, args);
                            scrapInfo = config.scrapInfo;                            
                            testQueue.add(scrapInfo.index, config);
                            //counter = scrapInfo.index;
                            counter = 0;
                            
                            if (tests) {
                                tests.forEach(function(test) {
                                    var name, testname, size;
                                    
                                    function _setScrapInfoProperty(name, dest, src, srcScrapPropName, destScrapPropName, value) {
                                        if (name in test) {
                                            dest[destScrapPropName][name] = (value !== undefined ? value : src[name]);
                                        } else {
                                            delete dest[destScrapPropName][name];
                                        }
                                    }
                                    
                                    function _scrapInfoSerialization(dest, src, srcScrapPropName, destScrapPropName) {

                                        dest[destScrapPropName] = JSON.parse(JSON.stringify(config[srcScrapPropName]));
                                        dest[destScrapPropName].index = counter;
                                        _setScrapInfoProperty("delay", dest, src, srcScrapPropName, destScrapPropName);
                                        _setScrapInfoProperty("repeat", dest, src, srcScrapPropName, destScrapPropName);
                                        _setScrapInfoProperty("run", dest, src, srcScrapPropName, destScrapPropName, true);
                                    }
                                    
                                    size = tests.length;
                                    if (test && "name" in test &&  scrapInfo.index < size && counter < size && counter > scrapInfo.index) {
                                        name = _cat.core.getScrapName(scrapInfo.name);
                                        testname = _cat.core.getScrapName(test.name);
                                        
                                        if (name === testname) {
                                            // config.index = counter;
                                            configclone[counter] = {};

                                            _scrapInfoSerialization(configclone[counter], test, "scrapInfo", "scrapInfo");
                                            configclone[counter].args = config.args;
                                            _scrapInfoSerialization(configclone[counter].args[1], test, "scrapInfo", "scrapinfo");
                                            
                                            testQueue.add(counter, configclone[counter]);
                                        }
                                    }
                                    counter++;
                                });
                            }
                        }

                        if (!response.scrapInfo) {
                            errmsg = ["[catjs client manager] Something went wrong processing the scrap request, check your cat.json test project. current scrap index:", currentState.index, "; url:", urlAddress].join("");
                            _log.error(errmsg);

                            if (catConfig.isReport()) {
                                reportFormats = catConfig.getReportFormats();
                            }

                            endTest({error: errmsg}, (runStatus ? runStatus.intervalObj : undefined));

                            return undefined;
                        }
                        
                        if (response.ready) {
                            
                            if (!initCurrentState && !_cat.utils.iframe.isIframe()) {
                                initCurrentState = true;
                                currentState.index = (response.readyScraps && response.readyScraps[0] ? response.readyScraps[0].index : 0);
                            }


                            scraplist = response.readyScraps;
                            if (scraplist) {
                                scraplist.forEach(function (scrap) {
                                    var config = testQueue.get(scrap).first();
                                    if (config) {
                                        // already in queue;

                                    } else {
                                        var realScrap = _cat.core.getScrapByName(scrap.name);

                                        if (args[1].pkgName === realScrap.pkgName) {
                                            _add2Queue({scrapInfo: scrap, args: args});
                                        }
                                    }

                                });
                            }
                        } else {

                            _add2Queue({scrapInfo: response.scrapInfo, args: args});
                        }

                        _processReadyScraps(false);
                    }
                };

                _cat.utils.AJAX.sendRequestAsync(config);
                
            } else {
                _log.log("[catjs client manager] scrap was not signed. probably not part of the scenario [scrap: ", _cat.core.getScrapName(scrap.name), ", tests: [", catConfig.getTestNames() , "]]");
            } 

        },

     
        removeIntervalFromBroadcast : function(scrap) {
            var intervalScrap,
                runIndex,
                intervalIndex;

            if (intervalObj) {
                intervalScrap = _cat.core.getScrapById(intervalObj.signScrapId);

                runIndex = scrapTestIndex(scrap);
                intervalIndex = scrapTestIndex(intervalScrap);

                if (intervalObj && intervalObj.interval && intervalIndex < runIndex) {

                    clearInterval(intervalObj.interval);
                }
            }
        },

        getClientmanagerId : function() {

            if (!clientmanagerId) {
                clientmanagerId = _cat.utils.Utils.generateGUID();
            }
            return clientmanagerId;
        },
        
        getCurrentState: function() {
            return currentState;
        },
        
        getRunStatus: function() {
            return runStatus;
        },

        updateTimeouts: function (scrap) {
            var scrapId = scrap.id;
    
            if (runStatus.intervalObj && (scrapId !== runStatus.intervalObj.signScrapId)) {
                runStatus.intervalObj.signScrapId = scrapId;
                runStatus.intervalObj.counter = 0;
            }
        },

        endTest: endTest
    };
    
}();