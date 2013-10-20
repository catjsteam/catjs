_cat.utils.chai = function() {

    var _jmr,
        _report,
        _chai,
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

    return {

        assert: function(config) {

            if (!_state) {
                _isSupported();
            }

            if (_jmr === undefined) {
                _jmr = (typeof jmr !== "undefined" ? jmr : null);
                if (_jmr === null) {
                    _cat.core.log.info("Test Unit Reporter is not supported, consider adding it to the .catproject dependencies");
                }
            }

            var code,
                fail,
                failure;

            if (_jmr) {
                if (!_report) {
                    _report = jmr.create({
                        type: "model.testcase",
                        data: {
                            name: "testcase"
                        }
                    });
                }
            }

            if (_chai) {
                if (config) {
                    code = config.code;
                    fail = config.fail;
                }
                if (assert) {
                    // TODO well, I have to code the parsing section (uglifyjs) for getting a better impl in here (loosing the eval shit)
                    // TODO js execusion will be replacing this code later on...
                    if (code) {
                        try {
                            eval(code);

                        } catch(e) {

                            failure = _jmr.create({
                                type: "model.failure",
                                data: {
                                    message: ["[CAT] Test failed, exception: ", e].join(""),
                                    type: "failure"
                                }
                            });
                            _report.add(failure);

                            var output = _report.compile();
                            console.log("output report demo : ", output);

                            if (fail) {
                                throw new Error("[CAT] Test failed, exception: ", e);
                            }
                        }
                    }
                }
            }
        },

        /**
         * For the testing environment, set chai handle
         *
         * @param chai
         */
        test: function(chaiarg) {
            chai = chaiarg;
        }

    };

}();