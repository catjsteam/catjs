var _jmr = require("test-model-reporter"),
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _reportCreator,
    _testsuite = _jmr.create({
        type: "model.testsuite",
        data: {
            name: "testsuite"
        }
    }),
    _catcli = (catrequire ? catrequire("cat.cli") : null),
    _fs = require("fs"),
    _testConfigMap,
    _isAlive = false, //guilty until proven innocent
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
            } catch(e) {
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


_testConfigMap = readConfig();

function ReportCreator(filename) {
    this._fileName = filename;
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

    if (_testConfigMap[testName]) {
        _testConfigMap[testName].wasRun = true;
    }
    else {
        _log.info("Test " + testName + " not in test manager");
    }

    _testsuite.add(testCase);

    var output = _testsuite.compile();

    var symbol = status === 'failure' ? '✖' : '✓',
        statusDesc = status === 'failure' ? 'failed' : 'passed';

    console.log(symbol + "Test " + testName + " " + message + " " + statusDesc);

    if (_fs.existsSync(this._fileName)) {
        _fs.unlinkSync(this._fileName);
    }
    _jmr.write(this._fileName, output);
};

_checkIfAlive = setInterval(function () {
    if (!_isAlive) {
        clearInterval(_checkIfAlive);
        _log.info("Tests stopped reporting, probably a network problem, failing the rest of the tests");
        if (!_reportCreator) {
            _reportCreator = new ReportCreator("notestname.xml");
        }

        for (var key in _testConfigMap) {
            _log.info(_testConfigMap[key]);
            if (!_testConfigMap[key].wasRun) {
                _reportCreator.addTestCase(_testConfigMap[key].name, 'failure', 'unknown', 'failed due to network issue');
            }
        }
    }
}, 30000); //TODO: make this configurable

if (_jmr === undefined) {
    _log.info("Test Unit Reporter is not supported, consider adding it to the .catproject dependencies");
}


exports.result = function (req, res) {

    var testName = req.query.testName,
        message = req.query.message,
        status = req.query.status,
        reportType = req.query.type,
        hasPhantom = req.query.hasPhantom,
        file;

    /*  if (status === 'end') {
     clearInterval(_checkIfAlive);
     } else {*/
    _isAlive = true;
    _log.info("requesting " + testName + message + status);
    res.setHeader('Content-Type', 'text/javascript;charset=UTF-8');
    res.send({"testName": testName, "message": message, "status": status});


    var phantomStatus = (hasPhantom === "true" ? "phantom" : "");
    file = "./cattestresult" + reportType + "-" + phantomStatus + ".xml";

    if (!_reportCreator) {
        _reportCreator = new ReportCreator(file);
    }

    _reportCreator.addTestCase(testName, status, phantomStatus, message);
    // }
};

