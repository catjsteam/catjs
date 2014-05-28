_cat.core.clientmanager = function () {

    var tests,
        commitScrap,
        getScrapTestInfo,
        totalDelay,
        checkIfExists;

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
//            if (_config.isReport()) {
//                reportFormats = _config.getReportFormats();
//            }
//            _cat.utils.Signal.send('TESTEND', {reportFormats: reportFormats, error: " CAT project configuration error (cat.json), Failed to match a scrap named: '" + scrapName +"'"});
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

            tests = _tests;

            if (checkIfExists(scrap.name[0], tests)) {

                urlAddress = "http://" + catConfig.getIp() + ":" + catConfig.getPort() + "/scraps?scrap=" + scrap.name[0] + "&" + "testId=" + _cat.core.guid();

                config = {
                    url : urlAddress,
                    callback : function() {
                        var response = JSON.parse(this.responseText),
                            scrapReadyIndex;

                        scrapReadyIndex = parseInt(response.readyScrap.index) + 1;
                        commitScrap(scrap, args, response);

                        if (scrapReadyIndex === tests.length) {
                            console.log(catConfig);
                            catConfig.endTest();

                        }
                    }
                };

                _cat.utils.AJAX.sendRequestAsync(config);
            }

        },

        delayManager : function(codeCommands) {
            var catConfig = _cat.core.getConfig(),
                _enum = catConfig.getTestsTypes(),
                executeCode;

            executeCode = function(codeCommands) {
                var indexCommand,
                    commandObj,
                    tempCommand;

                for (indexCommand in codeCommands) {
                    commandObj = codeCommands[indexCommand];
                    tempCommand = commandObj.command + commandObj.onObject;
                    eval(tempCommand);
                }
            };

            if ((catConfig) && (catConfig.getRunMode() === _enum.TEST_MANAGER)) {
                setTimeout(function() {
                    executeCode(codeCommands);
                }, totalDelay);
                totalDelay += 4000;
            } else {
                executeCode(codeCommands);
            }

        }
    };
}();