_cat.core.clientmanager = function () {

    var tests,
        commitScrap,
        getScrapTestInfo,
        totalDelay,
        runStatus,
        checkIfExists;

    runStatus = {
        "scrapReady" : 0,
        "subscrapReady" : 0,
        "numRanSubscrap" : 0,
        "scrapsNumber" : 0
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

    return {
        signScrap : function(scrap, catConfig, args, _tests) {
            var urlAddress,
                config;
            runStatus.scrapsNumber = _tests.length;
            tests = _tests;

            if (checkIfExists(scrap.name[0], tests)) {

                urlAddress = "http://" + catConfig.getIp() + ":" + catConfig.getPort() + "/scraps?scrap=" + scrap.name[0] + "&" + "testId=" + _cat.core.guid();

                config = {
                    url : urlAddress,
                    callback : function() {
                        var response = JSON.parse(this.responseText),
                            scrapReadyIndex;

                        runStatus.scrapReady = parseInt(response.readyScrap.index) + 1;
                        commitScrap(scrap, args, response);

                    }
                };

                _cat.utils.AJAX.sendRequestAsync(config);
            }

        },

        delayManager : function(codeCommands, context) {
            var catConfig = _cat.core.getConfig(),
                _enum = catConfig.getTestsTypes(),
                executeCode;

            executeCode = function(codeCommands, context) {
                var indexCommand,
                    commandObj;

                for (indexCommand in codeCommands) {
                    commandObj = codeCommands[indexCommand];

                    new Function("context", "return " + commandObj).apply(this, [context]);


                }

                runStatus.numRanSubscrap = runStatus.numRanSubscrap + codeCommands.length;

                if ((runStatus.numRanSubscrap === runStatus.subscrapReady) && runStatus.scrapReady === runStatus.scrapsNumber) {
                    var reportFormats;
                    if (catConfig.isReport()) {
                        reportFormats = catConfig.getReportFormats();
                    }
                    catConfig.endTest({reportFormats: reportFormats});
                }

            };


            runStatus.subscrapReady = runStatus.subscrapReady + codeCommands.length;

            if ((catConfig) && (catConfig.getRunMode() === _enum.TEST_MANAGER)) {
                setTimeout(function() {
                    executeCode(codeCommands, context);
                }, totalDelay);
                totalDelay += 4000;
            } else {
                executeCode(codeCommands, context);
            }

        }
    };
}();