_cat.utils.Signal = function () {

    var _funcmap = {

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
                            header: "Test failed with an error",
                            desc:  opt.error,
                            tips: "",
                            style: "color:red"
                        });

                    } else {
                        testCount = _cat.core.TestManager.getTestCount();
                        _cat.core.ui.setContent({
                            header: [testCount-1, "Tests complete"].join(" "),
                            desc: "",
                            tips: "",
                            style: "color:green"
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
                }
            }


        },
        KILL: function () {

            // close CAT UI
            _cat.core.ui.off();

            // Additional code in here
        }
    };

    return {

        send: function (flag, opt) {

            if (flag && _funcmap[flag]) {
                _funcmap[flag].call(this, opt);
            }

        }

    };

}();