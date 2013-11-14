_cat.utils.chai = function () {

    var _chai,
        assert,
        _state = 0; // state [0/1] 0 - not evaluated / 1 - evaluated

    function _isSupported() {
        _state = 1;
        if (typeof chai != "undefined") {
            _chai = chai;
            assert = _chai.assert;

        } else {
            _cat.core.log.info("Chai library is not supported, skipping annotation 'assert', consider adding it to the .catproject dependencies");
        }
    }


    function sendTestResult(data) {

        var config  = _cat.core.getConfig();

        if (config) {
            _cat.utils.AJAX.sendRequestSync({
                url:  _cat.core.TestManager.generateAssertCall(config, data)
            });
        }
    }

    return {

        assert: function (config) {

            if (!_state) {
                _isSupported();
            }

            var code,
                fail,
                failure,
                testdata;

            if (_chai) {
                if (config) {
                    code = config.code;
                    fail = config.fail;
                }
                if (assert) {
                    // TODO well, I have to code the parsing section (uglifyjs) for getting a better impl in here (loosing the eval shit)
                    // TODO js execusion will be replacing this code later on...
                    var success = true;
                    var output;
                    if (code) {
                        try {
                            eval(code);

                        } catch (e) {
                            success = false;

                            output = ["[CAT] Test failed, exception: ", e].join("");

                            console.log("output report demo : ", output);

                            if (fail) {
                                throw new Error("[CAT] Test failed, exception: ", e);
                            }
                        }
                    }

                    if (success) {

                        output = "test succeeded";

                    }

                    testdata = _cat.core.TestManager.addTestData({
                        name: "testName",
                        status: success ? "success" : "failure",
                        message: output
                    });

                    sendTestResult(testdata);

                }
            }
        },

        /**
         * For the testing environment, set chai handle
         *
         * @param chai
         */
        test: function (chaiarg) {
            chai = chaiarg;
        }

    };

}();