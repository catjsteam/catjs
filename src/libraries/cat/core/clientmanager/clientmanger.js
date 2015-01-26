_cat.core.clientmanager = function () {

    var tests,
        commitScrap,
        getScrapTestInfo,
        totalDelay,
        runStatus,
        checkIfExists,
        updateTimeouts,
        catConfig,
        startInterval,
        delayManagerCommands,
        getScrapInterval,
        setupInterval,
        intervalObj,
        endTest,
        testQueue = {},
        testQueueLast,
        initCurrentState = false,
        currentState = { index: 0 };

    endTest = function (opt, interval) {

        _cat.core.TestManager.send({signal: 'TESTEND', error: opt.error});
        if (interval === -1) {
            console.log("Test End");
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
            testManager;

        intervalObj = getScrapInterval(scrap);

        tests = config.getTests();
        if (tests) {
            testManager = (tests[tests.length - 1].name || "NA");
        }


        intervalObj.interval = setInterval(function () {

            var msg = ["No test activity, retry: "];
            if (intervalObj.counter < 3) {
                intervalObj.counter++;

                msg.push(intervalObj.counter);

                _cat.core.ui.setContent({
                    header: "Test Status",
                    desc: msg.join(""),
                    tips: {},
                    style: "color:gray"
                });

                console.log("[CatJS manager] ", msg.join(""));

            } else {
                var err = "run-mode=tests catjs manager '" + testManager + "' is not reachable or not exists, review the test name and/or the tests code.";

                console.log("[CatJS Error] ", err);
                endTest({error: err}, (runStatus ? runStatus.intervalObj : undefined));
                clearInterval(intervalObj.interval);
            }
        }, config.getTimeout() / 3);

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
            reportFormats,
            scrapName = scrap.name,
            isStandalone = _isStandalone(scrap);

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
            size = tests.length;
            for (i = 0; i < size; i++) {

                if (tests[i].name === scrapName) {
                    setScrapTests(tests[i]);
                }
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
            testitem;

        for (; indexScrap < size; indexScrap++) {
            testitem = tests[indexScrap];
            if (testitem && testitem.name === scrapName) {
                return {scrap: testitem, idx: indexScrap};
            }
        }
        return undefined;
    };

    totalDelay = 0;

    updateTimeouts = function (scrap) {
        var scrapId = scrap.id;
        if (runStatus.intervalObj && (scrapId !== runStatus.intervalObj.signScrapId)) {
            runStatus.intervalObj.signScrapId = scrapId;
            runStatus.intervalObj.counter = 0;
        }
    };

    startInterval = function (catConfig, scrap) {
        setupInterval(catConfig, scrap);
    };

    delayManagerCommands = function (dmcommands, dmcontext) {

        var indexCommand = 0,
            catConfig = _cat.core.getConfig(),
            _enum = catConfig.getTestsTypes(),
            executeCode,
            delay = catConfig.getTestDelay(),
            scrap = ("scrap" in dmcontext  ? dmcontext.scrap : undefined),
            standalone = _isStandalone(scrap);

        executeCode = function (codeCommandsArg, contextArg) {
            var commandObj,
                scrap = contextArg.scrap,
                size = (codeCommandsArg ? codeCommandsArg.length : undefined),
                functionargskeys = [],
                functionargs = [],
                contextkey,
                scrapName = ("scrapName" in contextArg ? contextArg.scrapName : undefined),
                scrapRowIdx = ("scrapRowIdx" in contextArg ? contextArg.scrapRowIdx : undefined),
                description = [],
                rows, idx = 0, rowssize = 0, row;


            updateTimeouts(scrap);

            for (indexCommand = 0; indexCommand < size; indexCommand++) {
                commandObj = codeCommandsArg[indexCommand];

                if (commandObj) {
                    functionargskeys.push("context");
                    functionargs.push(contextArg);

                    if (contextArg && contextArg.args) {
                        for (contextkey in contextArg.args) {
                            if (contextArg.args.hasOwnProperty(contextkey)) {
                                functionargskeys.push(contextkey);
                                functionargs.push(contextArg.args[contextkey]);
                            }
                        }
                    }

                    rows = ( (scrap && scrapName && scrapName in scrap) ? scrap[scrapName] : [commandObj]);
                    if (rows) {
                        description.push(rows[scrapRowIdx] || rows[0]);
                    }

//                    rowssize = rows.length;
//                    for (; idx<rowssize; idx++) {
//                        row = rows[idx];
//                        if (row) {
//                            description.push(row);
//                        }
//                    }

                    _cat.core.ui.setContent({
                        style: 'color:#0080FF, font-size: 10px',
                        header: ((scrap && "name" in scrap && scrap.name) || "'NA'"),
                        desc: (description.length > 0 ? description.join("_$$_") : description.join("")),
                        tips: {}
                    });

                    if (_cat.utils.Utils.getType(commandObj) === "string") {
                        commandObj = (commandObj ? commandObj.trim() : undefined);
                        new Function(functionargskeys.join(","), "return " + commandObj).apply(this, functionargs);

                    } else if (_cat.utils.Utils.getType(commandObj) === "function") {
                        commandObj.apply(this, functionargs);
                    }

                } else {
                    console.warn("[CatJS] Ignore, Not a valid command: ", commandObj);
                }
            }

            runStatus.numRanSubscrap = runStatus.numRanSubscrap + size;

            if ((runStatus.numRanSubscrap === runStatus.subscrapReady) && runStatus.scrapReady === runStatus.scrapsNumber) {
                var reportFormats;
                if (catConfig.isReport()) {
                    reportFormats = catConfig.getReportFormats();
                }

                // TODO change clear interval
                endTest({reportFormats: reportFormats}, (runStatus.intervalObj ? runStatus.intervalObj.interval : undefined));
            }

        };

        runStatus.subscrapReady = runStatus.subscrapReady + dmcommands.length;

        if ( ((catConfig) && (catConfig.getRunMode() === _enum.TEST_MANAGER)) && !standalone) {
            setTimeout(function () {
                executeCode(dmcommands, dmcontext);
            }, totalDelay);
            totalDelay += delay;
        } else {
            executeCode(dmcommands, dmcontext);
        }
    };

    function _preScrapProcess(config, args) {
        config.args = args;
        if (args.length && args.length > 1 && (_cat.utils.Utils.getType(args[1]) === "object")) {
            args[1].scrapinfo = config.scrapInfo;
        }
    }

    function _process(config) {
        var scrap = config.scrapInfo,
            args = config.args;

        if (scrap) {
            runStatus.scrapReady = parseInt(scrap ? scrap.index : 0) + 1;
            commitScrap(scrap, args);
        }
    }

    function _isStandalone(scrap) {
        var standalone = ("$standalone" in scrap ? scrap.$standalone : undefined);
        return standalone;
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

        if ((exists && (!testQueue[currentStateIdx - 1]) && (exists.idx === (currentStateIdx - 1)) || _isStandalone(scrap))) {
            preScrapConfig = {scrapInfo: scrap, args: args};
            _preScrapProcess(preScrapConfig, args);
            commitScrap({$standalone: scrap.$standalone, name: scrapName}, args);

        } else if (exists && (currentStateIdx < testsize)) {
            return true;
        }


        return false;
    }

    return {



        signScrap: function (scrap, catConfig, args, _tests) {
            var urlAddress,
                config,
                scrapName;
            
            runStatus.scrapsNumber = _tests.length;
            tests = _tests;
            scrapName = (_cat.utils.Utils.isArray(scrap.name) ?  scrap.name[0] : scrap.name);

            startInterval(catConfig, scrap);

            if (_nextScrap({scrap: scrap, tests: tests, args: args})) {

                urlAddress = "http://" + catConfig.getIp() + ":" + catConfig.getPort() + "/scraps?scrap=" + scrapName + "&" + "testId=" + _cat.core.guid();

                config = {
                    url: urlAddress,
                    callback: function () {

                        var response = JSON.parse(this.responseText),
                            scraplist;

                        function _add2Queue(config) {
                            _preScrapProcess(config, args);
                            testQueue[config.scrapInfo.index] = config;
                        }

                        function _processReadyScraps() {

                            var idx = currentState.index;
                            if (testQueue[idx]) {
                                var config = testQueue[idx];
                                if (config) {
                                    _process(config);
                                    delete testQueue[idx];
                                    currentState.index++;
                                    _processReadyScraps();
                                }

                            }

                        }

                        if (response.ready) {
                            scraplist = response.readyScraps;


                            if (!initCurrentState) {
                                initCurrentState = true;
                                currentState.index = response.readyScraps[0].index;
                            }

                            if (scraplist) {
                                scraplist.forEach(function (scrap) {
                                    var config = testQueue[scrap.index];
                                    if (config) {
                                        // already in queue;

                                    } else {
                                        _add2Queue({scrapInfo: scrap, args: args});
                                    }

                                });
                            }
                        } else {

                            _add2Queue({scrapInfo: response.scrapInfo, args: args});
                        }

                        _processReadyScraps();
                    }
                };

                _cat.utils.AJAX.sendRequestAsync(config);
            }

        },

        /**
         * Delay a set of UI actions commands
         *
         * Config:
         *       methods {Array} string javascript functions reference
         *       commands {Array} string javascript statements
         *       context {Object} catjs context object
         *
         *
         * @param config
         */
        delayManager: function (config) {
            var codeCommands, context, methods, commands = [];

            (function init() {
                if (config) {
                    codeCommands = ("commands" in config ? config.commands : undefined);
                    methods = ("methods" in config ? config.methods : undefined);
                    context = ("context" in config ? config.context : undefined);
                }
            })();

            commands = commands.concat((codeCommands || []));
            commands = commands.concat((methods || []));

            delayManagerCommands(commands, context);
        }
    };
}();