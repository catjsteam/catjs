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
        getScrapInterval,
        setupInterval;
    runStatus = {
        "scrapReady" : 0,
        "subscrapReady" : 0,
        "numRanSubscrap" : 0,
        "scrapsNumber" : 0

    };

    getScrapInterval = function(scrap) {
        var scrapId = scrap.id,
            numCommands = (scrap.numCommands ? scrap.numCommands : 1);

        if (!runStatus.intervalObj) {
            runStatus.intervalObj = {
                "interval" : undefined,
                "counter" : 0,
                "numCommands" : numCommands,
                "signScrapId" : scrapId


            };
        }
        return runStatus.intervalObj;
    };


    setupInterval = function(config, scrap) {
        var tests,
            scrapId = scrap.id,
            intervalObj = getScrapInterval(scrap),
            testManager;
        tests = config.getTests();
        if (tests) {
            testManager = (tests[tests.length-1].name || "NA");
        }


        intervalObj.interval  = setInterval(function() {

            if (intervalObj.counter < intervalObj.numCommands) {
                intervalObj.counter++;

            } else {
                var reportFormats,
                    err = "run-mode=tests catjs manager '" + testManager + "' is not reachable or not exists, review the test name and/or the tests code.";

                console.log("[CAT] " + err);
                config.endTest({reportFormats: reportFormats, error: err}, (runStatus ? runStatus.intervalObj : undefined));

            }
        }, config.getTimeout() / 3);
        return;
    };



    commitScrap = function (scrap, args, res) {
        var scrapInfo,
            repeat,
            scrapInfoArr,
            infoIndex,
            repeatIndex;

        scrapInfoArr = getScrapTestInfo(scrap.name[0]);

        for (infoIndex in scrapInfoArr) {
            scrapInfo = scrapInfoArr[infoIndex];
            repeat = scrapInfo.repeat || 1;
            for (repeatIndex = 0; repeatIndex < repeat; repeatIndex++){
                _cat.core.ui.on();
                _cat.core.actionimpl.apply(this, args);
            }
        }
    };


    getScrapTestInfo = function (scrapName) {
        var scrapTests = [],
            i, size,
            validate= 0,
            tempInfo,
            reportFormats;

        if (tests && scrapName) {
            size = tests.length;
            for (i = 0; i < size; i++) {

                if (tests[i].name === scrapName) {
                    tempInfo = {"name": tests[i].name,
                        "scenario": tests[i].scenario,
                        "wasRun": tests[i].wasRun,
                        "delay" : tests[i].delay,
                        "repeat": tests[i].repeat};
                    tempInfo.index = i;
                    scrapTests.push(tempInfo);
                    validate++;
                }
            }
        }

        if (!validate) {
            console.warn("[CAT] Failed to match a scrap with named: '" + scrapName +"'. Check your cat.json project");
            if (!_cat.core.ui.isOpen()) {
                _cat.core.ui.on();
            }
        }
        return scrapTests;
    };

    checkIfExists = function(scrapName, tests) {

        var indexScrap;
        for (indexScrap in tests) {
            if (tests[indexScrap].name === scrapName) {
                return true;
            }
        }
        return false;
    };

    totalDelay = 0;

    updateTimeouts = function(scrap) {
        var scrapId = scrap.id;
        if (runStatus.intervalObj && (scrapId !== runStatus.intervalObj.signScrapId)) {
            runStatus.intervalObj.signScrapId = scrapId;
            runStatus.intervalObj.counter = 0;
            runStatus.intervalObj.numCommands = (scrap.numCommands ? scrap.numCommands : 1);
        }
    };

    startInterval = function(catConfig, scrap) {
        if (scrap.name[0] === tests[0].name) {
            setupInterval(catConfig, scrap);
        }
    };

    return {

        signScrap : function(scrap, catConfig, args, _tests) {
            var urlAddress,
                config;
            runStatus.scrapsNumber = _tests.length;
            tests = _tests;

            startInterval(catConfig, scrap);

            if (checkIfExists(scrap.name[0], tests)) {

                urlAddress = "http://" + catConfig.getIp() + ":" + catConfig.getPort() + "/scraps?scrap=" + scrap.name[0] + "&" + "testId=" + _cat.core.guid();

                config = {
                    url : urlAddress,
                    callback : function() {
                        var response = JSON.parse(this.responseText);
                        runStatus.scrapReady = parseInt(response.readyScrap ? response.readyScrap.index : 0) + 1;

                        commitScrap(scrap, args, response);
                    }
                };

                _cat.utils.AJAX.sendRequestAsync(config);
            }

        },

        delayManager : function(codeCommands, context) {
            var indexCommand = 0,
                catConfig = _cat.core.getConfig(),
                _enum = catConfig.getTestsTypes(),
                executeCode,
                delay = catConfig.getTestDelay();            

            executeCode = function(codeCommandsArg, context) {
                var commandObj,
                    scrap = context.scrap,
                    size = (codeCommandsArg ? codeCommandsArg.length : undefined),
                    functionargskeys = [],
                    functionargs = [],
                    contextkey;


                updateTimeouts(scrap);

                for (indexCommand=0;  indexCommand<size; indexCommand++) {       
                    commandObj = codeCommandsArg[indexCommand];
                    commandObj  = (commandObj ? commandObj.trim() : undefined);                    
                    
                    if (commandObj) {
                        functionargskeys.push("context");
                        functionargs.push(context);
                        if (context && context.args) {
                            for (contextkey in context.args) {
                                if (context.args.hasOwnProperty(contextkey)) {
                                    functionargskeys.push(contextkey);
                                    functionargs.push(context.args[contextkey]);
                                }
                            }
                        }
                        new Function(functionargskeys.join(","), "return " + commandObj).apply(this, functionargs);
                    } else {
                        console.warn("[CAT] Ignore, Not a valid command: ", commandObj);
                    }
                }

                runStatus.numRanSubscrap = runStatus.numRanSubscrap + size;

                if ((runStatus.numRanSubscrap === runStatus.subscrapReady) && runStatus.scrapReady === runStatus.scrapsNumber) {
                    var reportFormats;
                    if (catConfig.isReport()) {
                        reportFormats = catConfig.getReportFormats();
                    }

                    // TODO change clear interval
                    catConfig.endTest({reportFormats: reportFormats}, (runStatus.intervalObj ? runStatus.intervalObj.interval : undefined));
                }

            };

            runStatus.subscrapReady = runStatus.subscrapReady + codeCommands.length;

            if ((catConfig) && (catConfig.getRunMode() === _enum.TEST_MANAGER)) {
                setTimeout(function() {
                    executeCode(codeCommands, context);
                }, totalDelay);
                totalDelay += delay;
            } else {
                executeCode(codeCommands, context);
            }

        }
    };
}();