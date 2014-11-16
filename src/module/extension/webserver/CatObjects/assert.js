var _global = catrequire("cat.global"),
    _log = _global.log(),
    _reportCreator = {},
    _catcli = (catrequire ? catrequire("cat.cli") : null),
    _fs = require("fs"),
    _checkIfAlive,
    _testconfig,   
    _useragent = require('express-useragent'),
    _Assert = require("./entity/Assert"),
    _ReportCreator = require("./entity/Reporter");




/**
 * Initial settings
 * - Loading colors module
 * - Loading cat configuration
 */
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


// Initialization
init();


exports.get = function (req, res) {

    function _userAgent(req) {

        var source = req.headers['user-agent'],
            us;
        if (source) {
            us = _useragent.parse(source);
        }

        return us;
    }

    var query = req.query,
        assert = new _Assert({params: query}),
        params = assert.getParams(),
        testName = params.testName,
        message = params.message,
        error = params.error,
        status = params.status,
        reports = params.reports,
        scenario = params.scenario,
        reportType = params.type,
        hasPhantom = params.hasPhantom,
        id = params.id,
        name = (params.name || "NA"),
        file, checkIfAliveTimeout = (_testconfig["test-failure-timeout"] || 30) * 1000,
        reportsArr = [],
        reportKey,
        testConfigMap,
        key, ua = _userAgent(req);

    if (reports) {
        reportsArr = reports.split(",");
        reports = {};
        reportsArr.forEach(function (report) {
            if (report) {
                reports[report] = 1;
            }
        });

    }

    clearTimeout(_checkIfAlive);

    // TODO Session validation for end the test and start a new one...
    if (status !== 'End') {

        _checkIfAlive = setTimeout(function () {
            if (_reportCreator == {}) {
                _reportCreator['notest'] = new _ReportCreator({
                    filename: "notestname.xml",
                    id: 'notest',
                    scenario: scenario,
                    ua: ua,
                    name: name
                });
                _log.info("[CAT] No asserts received, probably a network problem, failing the rest of the tests ");

            } else {
                _log.info("[CAT] Tests stopped reporting, probably a network problem, failing the rest of the tests");
            }

            for (reportKey in _reportCreator) {
                testConfigMap = _reportCreator[reportKey].getTestConfigMap();

                for (key in testConfigMap) {
                    _log.info(testConfigMap[key]);
                    if (!testConfigMap[key].wasRun) {
                        _reportCreator[reportKey].addTestCase({
                            testName: testConfigMap[key].name,
                            status: 'failure', phantomStatus: '',
                            message: 'failed due to network issue',
                            reports: reports,
                            error: error,
                            id: id
                        });
                    }
                }
            }

        }, checkIfAliveTimeout);
    }

    _log.info("requesting " + testName + message + status);
    res.setHeader('Content-Type', 'text/javascript;charset=UTF-8');
    res.send({"testName": testName, "message": message, "status": status});


    var phantomStatus = (hasPhantom === "true" ? "phantom" : "");
    file = "./" + reportType + "-" + phantomStatus + id + ".xml";

    if (!_reportCreator[id]) {
        _reportCreator[id] = new _ReportCreator({
            filename: file,
            id: (reportType + id),
            scenario: scenario,
            status: status,
            ua: ua,
            name: name,
            testConfig: _testconfig
        });
    }

    _reportCreator[id].addTestCase({
        testName: testName,
        status: status,
        phantomStatus: phantomStatus,
        message: message, 
        reports: reports, 
        error: error,
        id: id,
        testConfig: _testconfig
    });
};

