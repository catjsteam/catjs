_cat.utils.Signal = function () {

    var _funcmap = {

        TESTEND: function (opt) {

            var timeout = _cat.core.TestManager.getDelay();

            if (opt) {
                timeout = (opt["timeout"] || 2000);
            }

            setTimeout(function () {
                var testCount = _cat.core.TestManager.getTestCount();
                _cat.core.ui.setContent({
                    header: [testCount, "Tests complete"].join(" "),
                    desc: "",
                    tips: "",
                    style: "color:green"
                });

            }, (timeout));


            var config = _cat.core.getConfig();

            var testdata = _cat.core.TestManager.addTestData({
                name: "End",
                displayName: "End",
                status: "End",
                message: "End"
            });

            if (config) {
                _cat.utils.AJAX.sendRequestSync({
                    url: _cat.core.TestManager.generateAssertCall(config, testdata)
                });
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