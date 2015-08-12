_cat.core.manager.client = function () {

    var _module,
        tests,
        commitScrap,
        getScrapTestInfo,
        totalDelay,
        runStatus,
        checkIfExists,        
        initCurrentState = false,
        getScrapInterval,
        setFailureInterval,
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

        _cat.core.manager.client.clearLastInterval();
    };

    runStatus = {
        "scrapReady": 0,
        "subscrapReady": 0,
        "numRanSubscrap": 0,
        "scrapsNumber": 0

    };

    getScrapInterval = function (scrap) {
        var scrapId = (scrap ? scrap.id : "undefined");

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

    setFailureInterval = function (config, scrap) {

        var tests,
            testManager, 
            validateExists,
            item;

        function _setInterval() {
            
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
                    var err = "run-mode=tests catjs manager '" + testManager + "' is not reachable or not exists, review the test name and/or the tests code and make sure to resolve your custom tests using the following API: _catjs.manager.resolve() ";

                    _log.log("[catjs client manager] error: ", err);
                    endTest({error: err}, (runStatus ? runStatus.intervalObj : undefined));
                    clearInterval(intervalObj.interval);
                }
            }, config.getTimeout() / 3);  
            
        }
        
        intervalObj = getScrapInterval(scrap);

        tests = config.getTests();
        if (tests) {
            item = tests[tests.length - 1];
            if (item) {
                testManager = ( item.name || "NA");
            }
        }

        if (!scrap) {

            _setInterval();
            
        } else {
            
            // try resolving by id
            validateExists = _cat.core.getScrapById(intervalObj.signScrapId);
            if (!validateExists) {
                // try resolving by name
                validateExists = _cat.core.getScrapByName(intervalObj.signScrapId);
            }

            if ( intervalObj.interval !== undefined && intervalObj.interval !== null ) {
                
                if ( (_cat.core.getScrapName(scrap.name) !== (validateExists ? _cat.core.getScrapName(validateExists.name) : undefined)) ) {
                    if (config.isUI()) {
                        _cat.core.ui.setContent({
                            header: "No Valid Scrap Name",
                            desc: "Scrap name: '" + intervalObj.signScrapId + "' is not valid, check your cat.json test project",
                            style: "color:red"
                        });
                    }
                }
                _setInterval();

            } 
            
        }
        
        return undefined;
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
            args[1].done = config.done;
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
        
        /*flyer.broadcast({
            channel: "default",
            topic: topic,
            data: {
                totalDelay: totalDelay,
                currentState: (dostate ? currentState : undefined),
                doprocess: (doprocess || true)
            }
        });*/
        _subscribeProcess({
            totalDelay: totalDelay,
            currentState: (dostate ? currentState : undefined),
            doprocess: (doprocess || true)
        }, topic, "default" );
    }


    /**
     * Listener for the process broadcaster
     * 
     * @private
     */
    function _subscribeProcess(data, topic, channel) {
       /* flyer.subscribe({
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
        });*/

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

    //_subscribeProcess();


    function broadcastAfterProcess(fullScrap) {
        var topic = "afterprocess." + _cat.core.manager.client.getClientmanagerId();

        /*flyer.broadcast({
            channel: "default",
            topic: topic,
            data: fullScrap
        });*/
        _subscribeAfterProcess(fullScrap, topic, "default");

    }



    function _subscribeAfterProcess(data, topic, channel) {

        //var clientTopic = "afterprocess." + _cat.core.manager.client.getClientmanagerId();
        // check if it's the same frame
        //if (topic !== clientTopic) {
        _cat.core.manager.client.removeIntervalFromBroadcast(data);
        //}
        
        /*flyer.subscribe({
            channel: "default",
            topic: "afterprocess.*",
            callback: function(data, topic, channel) {
                var clientTopic = "afterprocess." + _cat.core.manager.client.getClientmanagerId();
                // check if it's the same frame
                //if (topic !== clientTopic) {
                    _cat.core.manager.client.removeIntervalFromBroadcast(data);
                //}

            }
        });*/
    }

    //_subscribeAfterProcess();


    function _processReadyScraps(cameFromBroadcast) {
        var idx = currentState.index,
            catConfig, test,
            testitem = testQueue.get({index: idx}),
            testname,
            emptyQueue = testQueue.isEmpty(),
            queuedesc = (emptyQueue ? "no " : ""),
            firstfound = false;


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
                configsize = configs.length,
            testconfigs = [], futureIndex = 0;

            // update the server with the client's test index
            if (configsize > 1) {
                futureIndex = (configsize + currentState.index);
                _cat.utils.AJAX.sendRequestAsync({
                    url: _cat.utils.Request.generate({
                        service: "scraps", 
                        params:{
                            currentIndex: futureIndex, 
                            testId: _cat.core.guid()
                        }
                    })
                });
            }
            
            configs.forEach(function(config) {

                testconfigs.push(function(def, done) {
                    if (config) {
                        
                        config.def = def;
                        config.done = done;
                        _process(config);
                      
                        currentState.index++;
                        
                        _processReadyScraps(false);
                    } 
                });
            
            });
            
            _cat.core.manager.controller.state().next({
                defer: Q,
                methods: testconfigs,
                delay: ((test && "delay" in test) ? test.delay : 0)
            }, function() {
                
                // test execution callback
               
            });
            
            testitem.deleteAll();
            broadcastProcess(false, true);
            firstfound = true;
        } else {
            if (!cameFromBroadcast) {
                broadcastProcess(true, true);              
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

    _module =  {



        signScrap: function (scrap, catConfig, args, _tests) {
            var urlAddress,
                config,
                scrapName,
                currentStateIdx,
                reportFormats,
                isStandalone = _cat.utils.scrap.isStandalone(scrap);
            
            if (!testQueue) {
                testQueue = new _cat.core.TestQueue();
            }
            
            runStatus.scrapsNumber = _tests.length;
            tests = _tests;
            scrapName = (_cat.utils.Utils.isArray(scrap.name) ?  scrap.name[0] : scrap.name);

            currentStateIdx = currentState.index;
            if (catConfig.isTestEnd(currentStateIdx) && !isStandalone) {
                return undefined; 
            }
            
            if (_nextScrap({scrap: scrap, tests: tests, args: args})) {
                
                setFailureInterval(catConfig, scrap);
                
                urlAddress = _cat.utils.Request.generate({service: "scraps", params:{scrap: scrapName, testId: _cat.core.guid()}});

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
                            //errmsg = ["[catjs client manager] Something went wrong processing the scrap request, check your cat.json test project. current scrap index:", currentState.index, "; url:", urlAddress].join("");

                            errmsg = ["[catjs client manager] Could not find matching test for the current index: ", currentState.index, " tests in this view:[", JSON.stringify(response.readyScraps) ,"]"];
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
                                currentState.index = (response.readyScraps && response.readyScraps[currentState.index] ? response.readyScraps[currentState.index].index : 0);
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
                
                if (intervalObj.signScrapId !== "undefined") {
                    
                    intervalScrap = _cat.core.getScrapById(intervalObj.signScrapId);
                    if (!intervalScrap) {
                        intervalScrap = _cat.core.getScrapByName(intervalObj.signScrapId);
                    }

                    if (!intervalScrap) {
                        runIndex = scrapTestIndex(scrap);
                        intervalIndex = scrapTestIndex(intervalScrap);
        
                        if (intervalObj && intervalObj.interval && intervalIndex < runIndex) {
        
                            clearInterval(intervalObj.interval);
                        }
                    }
                } else {
                    
                    if (intervalObj.interval) {
                        clearInterval(intervalObj.interval);
                    }
                }
            }
        },

        getClientmanagerId : function() {

            if (!clientmanagerId) {
                clientmanagerId = _cat.utils.Utils.generateGUID();
            }
            return clientmanagerId;
        },
        
        setCurrentState: function(data) {
            if (data && "currentIndex" in data) {
                currentState.index = data.currentIndex;
            }
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

        clearLastInterval: function() {

            if (intervalObj) {
                clearInterval(intervalObj.interval);
            }
        },
        
        setFailureInterval: setFailureInterval,
        
        endTest: endTest
    };
    
    
    return _module;
}();