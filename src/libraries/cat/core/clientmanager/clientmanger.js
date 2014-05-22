_cat.core.clientmanager = function () {

    var tests,
        commitScrap,
        getScrapTestInfo;

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

    return {
        signScrap : function(scrap, args, _tests) {
            var urlAddress,
                config;

            tests = _tests;
            urlAddress = "http://localhost:8089/scraps?scrap=" + scrap.name[0];
            config = {
                url : urlAddress,
                callback : function(xmlrequest) {
                    var response = JSON.parse(xmlrequest.responseText);
                    commitScrap(scrap, args, response);
                }
            };

            _cat.utils.AJAX.sendRequestAsync(config);
        }
    };
}();