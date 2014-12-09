_cat.core.TestAction = function () {

    return {

        NOTEST: function(opt) {
            var guid = _cat.core.guid(),
                testdata,
                config = _cat.core.getConfig();

            opt = (opt || {});

            testdata = _cat.core.TestManager.addTestData({
                name: "NOTEST",
                displayName: "No valid tests were found",
                message: "See cat.json configuration file for adding tests to scenarios",
                status: "sysout",
                error: (opt.error || ""),
                reportFormats: opt.reportFormats
            });

            if (config.isUI()) {
                _cat.core.ui.setContent({
                    header: testdata.getDisplayName(),
                    desc: testdata.getMessage(),
                    tips: {tests: "?" ,passed: "?", failed: "?", total: "?"},
                    style: "color:gray"
                });
            }
            
            // server signal notification
            if (config.isReport()) {
                               
                if (config) {
                    _cat.utils.AJAX.sendRequestSync({
                        url: _cat.core.TestManager.generateAssertCall(config, testdata)
                    });
                }
            }  
        },
        
        TESTSTART: function (opt) {

            var guid = _cat.core.guid(),
                testdata,            
                config = _cat.core.getConfig();

            opt = (opt || {});
                
            // server signal notification
            if (config.isReport()) {
                testdata = _cat.core.TestManager.addTestData({
                    name: "Start",
                    displayName: "start",
                    status: "Start",
                    message: "Start",
                    error: (opt.error || ""),
                    reportFormats: opt.reportFormats
                });

                if (config) {
                    _cat.utils.AJAX.sendRequestSync({
                        url: _cat.core.TestManager.generateAssertCall(config, testdata)
                    });
                }
            }
        },

        TESTEND: function (opt) {

            var timeout = _cat.core.TestManager.getDelay(),
                config, testdata;

            opt = (opt || {});
            config = _cat.core.getConfig();

            // ui signal notification
            if (config.isUI()) {

                timeout = (opt["timeout"] || 2000);

                setTimeout(function () {
                    var testCount;
                    if (opt.error) {
                        _cat.core.ui.setContent({
                            header: "Test failed with errors",
                            desc: opt.error,
                            tips: {status: "failed"},
                            style: "color:red"
                        });

                    } 
                }, (timeout));
            }

            // server signal notification
            if (config.isReport()) {
                testdata = _cat.core.TestManager.addTestData({
                    name: "End",
                    displayName: "End",
                    status: "End",
                    message: "End",
                    error: (opt.error || ""),
                    reportFormats: opt.reportFormats
                });

                if (config) {
                    _cat.utils.AJAX.sendRequestSync({
                        url: _cat.core.TestManager.generateAssertCall(config, testdata)
                    });
                    _cat.core.TestManager.testEnd();
                }
            }


        },

        KILL: function () {

            // close CAT UI
            _cat.core.ui.off();

        }
    };

}();