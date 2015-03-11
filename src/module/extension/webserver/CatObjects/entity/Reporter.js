var _jmr = require("test-model-reporter"),
    _colors = require("./../helpers/colors.js"),
    _global = catrequire("cat.global"),
    _catinfo = catrequire("cat.info"),
    _log = _global.log(),
    _fs = require("fs"),
    _projectmanager = require('./../../../projectmanager/action');

/**
 * Report Entity
 *
 * @param filename The test's file name
 * @param id The id of the test
 * @param scenario The current scenario
 * @param status The status of the test ["Start" | "End" | "success" | "failure" | "sysout"]
 * @constructor
 */
function Reporter(config) {

    this.init(config);
    
}

Reporter.prototype.init = function (config) {

    var status = config.status;

    _jmr.setReporter("junit");
    
    this._isjunit = false;
    this._isconsole = false;
    this._colors = new _colors();
    this._testconfig = config.testConfig;
    this._name = config.name;
    this._ua = config.ua;
    this._id = config.id;
    this._callback = config.callback;
    this._status = 0;
    this._fileName = config.filename;
    this._reports = ("reports" in config && config.reports ? config.reports : undefined);

    if (this._reports) {
        this._isjunit = (this._reports["junit"] === 1);
        this._isconsole = (this._reports["console"] === 1);
    }
    
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
    
    _jmr.setReporter("junit");
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

Reporter.prototype.getName = function () {
    return ( (this._name && this._name !== "End" && this._name !== "Start") ? this._name : "");
};

Reporter.prototype.getTitle = function () {
    var ua = this._ua, uainfo;

    uainfo = (ua ? [" ", this.getName(), " ", ua.Browser, " " , ua.Version, " " , ua.OS, " "].join("") : "");

    return uainfo;
};

Reporter.prototype.addTestCase = function (config) {
    var failure,
        result,
        logmessage,
        output, symbol,
        me = this,
        testName, status, phantomStatus, message, reports, error, id;

    testName = config.testName;
    status = config.status;
    phantomStatus = config.phantomStatus;
    message = config.message;
    error = config.error;
    id = config.id;

    function _printTest2Console(msg) {
        var message, title;

        if (me._isconsole) {
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
            
        } else if (status === "sysout") {
            result = _jmr.create({
                type: "system.out",
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

        var ua = me._ua, ismobile = ("isMobile" in ua && ua.isMobile) ;
         
        _catinfo.set({
            id: me._id,
            device: (ismobile ? "device" : "browser"), 
            model : (ua.Version),
            type: (ismobile ? ua.Platform : ua.Browser),
            entity: "junit",
            data: output
        });
        
        // @deprecated
        //_jmr.write(me._fileName, output);
    }

    function _testEnd(id, result) {
        
        // print to console the test info
        _printTest2Console(result);

        // delete the color on test end
        me._colors.deleteColor(id);

        _projectmanager.destroy(id);
        
        // test callback
        if (me._callback) {
            me._callback.call(me);
        }
    }
    
    // set console color
    this._colors.setCurrentTheme(id);

    if (this._testConfigMap && this.isManagerRunMode()) {
        if (this._testConfigMap[testName]) {
            this._testConfigMap[testName].wasRun = true;
        }
    }

    if (status !== 'End' && status !== 'Start') {

        if (this._isjunit) {
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
            
            // if the test has been started (1), end it, else if it already ended (0) do nothing  
            if (this._status === 1) {
            
                if (error) {
                    this._colors.setTheme({'color': "red"});
                    result = "Test end with error: " + error;
                    result = "======== Test End - " + result + " ========";
    
                } else {
                    result = this._hasFailed ? "failed" : "succeeded";
                    result = "======== Test End - " + result + " ========";
                }

                _testEnd(id, result);
    
                this._status = 0;
            }

        } else if (status === 'Start') {

            if (this._status === 1) {
                // todo call end.. fail the test!!!

                result = "======== Test End - Aborted ========";
                
                _testEnd(id, result)
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