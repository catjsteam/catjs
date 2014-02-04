var _jmr = require("test-model-reporter"),
    _reportCreator,
    _testsuite = _jmr.create({
        type: "model.testsuite",
        data: {
            name: "testsuite"
        }
    }),
    _fs = require("fs"),
    _testConfigMap,
    _isAlive = false, //guilty until proven innocent
    _checkIfAlive; //TODO: make this configurable

function readConfig() {
    var path = require("path"),
        configPath = path.resolve("./lib/cat.json"),
        data,
        testConfig,
        testConfigMap = {},
        i;

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
    var _fileName = filename;

    this.addTestCase = function (testName, status, phantomStatus, message) {
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
            console.log("Test " + testName + " not in test manager");
        }

        _testsuite.add(testCase);

        var output = _testsuite.compile();
        console.log(output);

        if (_fs.existsSync(_fileName)) {
            _fs.unlinkSync(_fileName);
        }
        _jmr.write(_fileName, output);
    };
}

_checkIfAlive = setInterval(function () {
    if (!_isAlive) {
        clearInterval(_checkIfAlive);
        console.log("Tests stopped reporting, probably a network problem, failing the rest of the tests");
        if (!_reportCreator) {
            _reportCreator = new ReportCreator("notestname.xml");
        }

        for (var key in _testConfigMap) {
            console.log(_testConfigMap[key]);
            if (!_testConfigMap[key].wasRun) {
                _reportCreator.addTestCase(_testConfigMap[key].name, 'failure', 'unknown', 'failed due to network issue');
            }
        }
    }
}, 30000); //TODO: make this configurable

if (_jmr === undefined) {
    console.log("Test Unit Reporter is not supported, consider adding it to the .catproject dependencies");
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
        console.log("requesting " + testName + message + status);
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

