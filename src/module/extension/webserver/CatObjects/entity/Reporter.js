var _jmr = require("test-model-reporter"),
    _colors = require("./../helpers/colors.js"),
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _fs = require("fs");

/**
 * Report Entity
 *
 * @param filename The test's file name
 * @param id The id of the test
 * @param scenario The current scenario
 * @param status The status of the test ["Start" | "End"]
 * @constructor
 */
function Reporter(config) {

    this.init(config);
    
}

Reporter.prototype.init = function (config) {

    var status = config.status;

    this._colors = new _colors();
    this._testconfig = config.testConfig;
    this._name = config.name;
    this._ua = config.ua;
    this._id = config.id;
    this._status = 0;
    this._fileName = config.filename;
    if (status && status !== "Start" && status != "End") {
        this._testConfigMap = this.readTestConfig(config.scenario);
    }
    this._hasFailed = false;
    this._testsuite = _jmr.create({
        type: "model.testsuite",
        data: {
            name: this.getTitle(),
            id: this._id
        }
    });
};
// TODO create test config entity
Reporter.prototype.isManagerRunMode = function() {
    return (this._testconfig["run-mode"] === "tests");
}

// TODO create test config entity
Reporter.prototype.readTestConfig = function (scenario) {

    var i, testConfigMap = {},
        scenarios, currentScenario, currentTests,
        size;

    if (this.isManagerRunMode()) {

        if (!scenario) {
            _log.warning("[CAT] Current scenario argument is required for run-mode: tests ");
        }

        //scenarios
        scenarios = this._testconfig.scenarios;
        if (scenarios) {
            currentScenario = scenarios[scenario];
            if (currentScenario) {
                currentTests = currentScenario.tests;

                if (currentTests) {
                    size = currentTests.length;
                    for (i = 0; i < size; i++) {
                        currentTests[i].wasRun = false;
                        testConfigMap[currentTests[i].name] = currentTests[i];
                    }
                } else {
                    _log.warning("[CAT] No valid tests was found for scenario '" + scenario + "' ");
                }

            } else {
                _log.warning("[CAT] No valid test scenario '" + scenario + "' was found");
            }
        }
    }

    return testConfigMap;
};


Reporter.prototype.reset = function () {

    this._status = 0;
    this._hasFailed = false;
    this._testsuite = _jmr.create({
        type: "model.testsuite",
        data: {
            name: this.getTitle(),
            id: this._id
        }
    });
};

Reporter.prototype.validate = function () {


};

Reporter.prototype.getTestConfigMap = function () {
    return this._testConfigMap;
};

Reporter.prototype.getTitle = function () {
    var ua = this._ua, uainfo;

    uainfo = (ua ? [" ", this._name, " ", ua.Browser, " " , ua.Version, " " , ua.OS, " "].join("") : "");

    return uainfo;
};

Reporter.prototype.addTestCase = function (config) {
    var failure,
        result,
        logmessage,
        output, symbol,
        me = this, isjunit, isconsole,
        testName, status, phantomStatus, message, reports, error, id;

    testName = config.testName;
    status = config.status;
    phantomStatus = config.phantomStatus;
    message = config.message;
    reports = config.reports;
    error = config.error;
    id = config.id;


    isjunit = (reports["junit"] === 1);
    isconsole = (reports["console"] === 1);

    function _printTest2Console(msg) {
        var message, title;

        if (isconsole) {
            title = me.getTitle();
            message = ["[" , id , "] ", title, msg].join("");

            console.info(message.current);
            _log.info(message);
        }
    }

    function _createTestCase() {
        var testCase = _jmr.create({
            type: "model.testcase",
            data: {
                time: (new Date()).toUTCString()
            }
        });
        testCase.set("name", phantomStatus + testName);

        if (status === 'failure') {
            result = _jmr.create({
                type: "model.failure",
                data: {
                    message: message,
                    type: status
                }
            });
            testCase.add(result);
        }

        return testCase;
    }

    function _writeTestCase() {

        me._testsuite.add(_createTestCase());
        output = me._testsuite.compile();
        if (_fs.existsSync(me._fileName)) {
            _fs.unlinkSync(me._fileName);
        }
        _jmr.write(me._fileName, output);
    }

    // set console color
    this._colors.setCurrentTheme(id);

    if (this._testConfigMap && this.isManagerRunMode()) {
        if (this._testConfigMap[testName]) {
            this._testConfigMap[testName].wasRun = true;
        }
    }

    if (status !== 'End' && status !== 'Start') {

        if (isjunit) {
            _writeTestCase();
        }

        symbol = status === 'failure' ? '✖' : '✓';
        if (status === 'failure') {
            this._hasFailed = true;
        }

        logmessage = symbol + "Test " + testName + " " + message;
        _printTest2Console(logmessage);


    } else {

        if (status === 'End') {
            if (error) {
                this._colors.setTheme({'color': "red"});
                result = "Test end with error: " + error;
                result = "======== Test End - " + result + " ========";

            } else {
                result = this._hasFailed ? "failed" : "succeeded";
                result = "======== Test End - " + result + " ========";
            }

            // print to console the test info
            _printTest2Console(result);

            // delete the color on test end
            this._colors.deleteColor(id);

            this._status = 0;

        } else if (status === 'Start') {

            if (this._status === 1) {
                // todo call end.. fail the test!!!

                result = "======== Test End - Aborted ========";
                // print to console the test info
                _printTest2Console(result);

                // delete the color on test end
                this._colors.deleteColor(id);
            }

            this.reset();
            this._status = 1;
            result = "======== Test Start  ========";

            // print to console the test info
            _printTest2Console(result);

        }

    }
};


module.exports = Reporter;