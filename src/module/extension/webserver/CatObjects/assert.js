var _jmr = require("test-model-reporter"),
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _reportCreator = {},
    _catcli = (catrequire ? catrequire("cat.cli") : null),
    _fs = require("fs"),
    _checkIfAlive,
    _testconfig;

function init() {

    // read configuration
    var path = require("path"),
        configPath,
        data,
        project, sourceFolder;

    if (_catcli) {
        project = _catcli.getProject();
        if (project) {
            try {
                sourceFolder = project.getInfo("source");
                configPath = path.join(sourceFolder, "/config/cat.json");
            } catch (e) {
                _log.error("[CAT server (assert module)] Failed to load cat.json test project, No CAT test project is available.", e);
            }
        } else {
            _log.error("[CAT server (assert module)] Failed to load cat.json test project, No CAT project is available.");
        }
    }

    data = _fs.readFileSync(configPath, 'utf8');
    _testconfig = JSON.parse(data);

}

function isManagerRunMode() {
    return (_testconfig["run-mode"] === "test-manager");
}

function readTestConfig() {

    var i, testConfigMap = {},
        scenarios;

    if (isManagerRunMode()) {

        //scenarios

        for (i = 0; i < _testconfig.tests.length; i++) {
            _testconfig.tests[i].wasRun = false;
            testConfigMap[_testconfig.tests[i].name] = _testconfig.tests[i];
        }

    }

    return testConfigMap;
}

function ReportCreator(filename, id, scenario) {
    this._fileName = filename;
    this._testConfigMap = readTestConfig(scenario);
    this._hasFailed = false;
    this._testsuite = _jmr.create({
        type: "model.testsuite",
        data: {
            name: id
        }
    });

    this._randomColor = "random";
}
ReportCreator.prototype.getTestConfigMap = function () {
    return this._testConfigMap;
}

ReportCreator.prototype.addTestCase = function (testName, status, phantomStatus, message, reports) {
    var failure,
        result,
        logmessage, colors,
        output, symbol,
        me = this, isjunit = true, isconsole = true;



    // set test color
    colors = require('colors');
    colors.setTheme({'info' : this._randomColor});

    function _printTest2Console(msg) {
        if (isconsole) {
            console.info(msg);
            _log.info(msg);
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

    if (isManagerRunMode()) {
        if (this._testConfigMap[testName]) {
            this._testConfigMap[testName].wasRun = true;
        }
        else {
            _printTest2Console("Test " + testName + " not in test manager");
        }
    }

    if (status !== 'End') {

        if (isjunit) {
            _writeTestCase();
        }

        symbol = status === 'failure' ? '✖' : '✓';
        if (status === 'failure') {
            this._hasFailed = true;
        }

        logmessage = symbol + "Test " + testName + " " + message;
        _printTest2Console(logmessage.current);



    } else {
        var result = this._hasFailed ? "failed" : "succeeded";
        _printTest2Console("======== Test End " + result + " ========");
    }
};


if (_jmr === undefined) {
    _log.info("Test Unit Reporter is not supported, consider adding it to the .catproject dependencies");
}


// Initialization
init();


exports.result = function (req, res) {

    var testName = req.query.testName,
        message = req.query.message,
        status = req.query.status,
        reports = req.query.reports,
        scenario = req.query.scenario,
        reportType = req.query.type,
        hasPhantom = req.query.hasPhantom,
        id = req.query.id,
        file;

    if (reports) {
        reports = reports.split(",");
    }

    clearTimeout(_checkIfAlive);
    if (status !== 'End') {

        _checkIfAlive = setTimeout(function () {
            _log.info("Tests stopped reporting, probably a network problem, failing the rest of the tests");
            if (_reportCreator == {}) {
                _reportCreator['notest'] = new ReportCreator("notestname.xml", 'notest', scenario);
            }

            for (var reportKey in _reportCreator) {
                var testConfigMap = _reportCreator[reportKey].getTestConfigMap();

                for (var key in testConfigMap) {
                    _log.info(testConfigMap[key]);
                    if (!testConfigMap[key].wasRun) {
                        _reportCreator[reportKey].addTestCase(testConfigMap[key].name, 'failure', '', 'failed due to network issue');
                    }
                }
            }

        }, 30000); //TODO: make this configurable
    }
    _log.info("requesting " + testName + message + status);
    res.setHeader('Content-Type', 'text/javascript;charset=UTF-8');
    res.send({"testName": testName, "message": message, "status": status});


    var phantomStatus = (hasPhantom === "true" ? "phantom" : "");
    file = "./" + reportType + "-" + phantomStatus + id + ".xml";

    if (!_reportCreator[id]) {
        _reportCreator[id] = new ReportCreator(file, reportType + id);
    }

    _reportCreator[id].addTestCase(testName, status, phantomStatus, message, reports);
    // }
};

