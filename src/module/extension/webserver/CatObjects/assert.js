var _jmr = require("test-model-reporter"),
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _reportCreator = {},
    _catcli = (catrequire ? catrequire("cat.cli") : null),
    _fs = require("fs"),
    _checkIfAlive; //TODO: make this configurable

function readConfig() {

    var path = require("path"),
        configPath,
        data,
        testConfig,
        testConfigMap = {},
        i,
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
    testConfig = JSON.parse(data);

    //TODO: check if there are no tests
    for (i = 0; i < testConfig.tests.length; i++) {
        testConfig.tests[i].wasRun = false;
        testConfigMap[testConfig.tests[i].name] = testConfig.tests[i];
    }

    return testConfigMap;
}

function ReportCreator(filename, id) {
    this._fileName = filename;
    this._testConfigMap = readConfig();
    this._hasFailed = false;
    this._testsuite = _jmr.create({
        type: "model.testsuite",
        data: {
            name: id
        }
    });

    var colorsArray = ['grey', 'cyan', 'grey', 'grey', 'cyan', 'yellow', 'blue'];
    this._randomColor = colorsArray[Math.floor(Math.random() * colorsArray.length)];
}
ReportCreator.prototype.getTestConfigMap = function () {
    return this._testConfigMap;
}

ReportCreator.prototype.addTestCase = function (testName, status, phantomStatus, message) {
    var testCase,
        failure,
        result;

    testCase = _jmr.create({
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

    if (this._testConfigMap[testName]) {
        this._testConfigMap[testName].wasRun = true;
    }
    else {
        _log.info("Test " + testName + " not in test manager");
    }

    if (status !== 'End') {
        this._testsuite.add(testCase);

        var output = this._testsuite.compile();

        var symbol = status === 'failure' ? '✖' : '✓';
        if (status === 'failure') {
            this._hasFailed = true;
        }

        var colors = require('colors');
        colors.setTheme({'current' : this._randomColor});

        var logmessage = symbol + "Test " + testName + " " + message;
        console.log(logmessage.current);

        if (_fs.existsSync(this._fileName)) {
            _fs.unlinkSync(this._fileName);
        }
        _jmr.write(this._fileName, output);
    } else {
        var result = this._hasFailed ? "failed" : "succeeded";
        console.log("======== Test End " + result + " ========");
    }
};


if (_jmr === undefined) {
    _log.info("Test Unit Reporter is not supported, consider adding it to the .catproject dependencies");
}


exports.result = function (req, res) {

    var testName = req.query.testName,
        message = req.query.message,
        status = req.query.status,
        reportType = req.query.type,
        hasPhantom = req.query.hasPhantom,
        id = req.query.id,
        file;

    /*  if (status === 'end') {
     clearInterval(_checkIfAlive);
     } else {*/
    clearTimeout(_checkIfAlive);
    if (status !== 'End') {
        _checkIfAlive = setTimeout(function () {
            _log.info("Tests stopped reporting, probably a network problem, failing the rest of the tests");
            if (_reportCreator == {}) {
                _reportCreator['notest'] = new ReportCreator("notestname.xml", 'notest');
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
        _reportCreator[id] = new ReportCreator(file, id);
    }

    _reportCreator[id].addTestCase(testName, status, phantomStatus, message);
    // }
};

