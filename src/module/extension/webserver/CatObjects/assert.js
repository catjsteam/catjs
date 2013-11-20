
var _jmr = require("test-model-reporter"),

    _testsuite = _jmr.create({
        type: "model.testsuite",
        data: {
            name: "testsuite"
        }
    }),
    _fs = require("fs");

if (_jmr === undefined) {
    console.log("Test Unit Reporter is not supported, consider adding it to the .catproject dependencies");
}


exports.result = function (req, res) {

    var testName = req.query.testName,
         message = req.query.message,
         status = req.query.status,
         reportType = req.query.type,
         hasPhantom = req.query.hasPhantom,
         testCase,
         failure,
         result,
         file;

    console.log("requesting " + testName + message + status);
    res.setHeader('Content-Type', 'text/javascript;charset=UTF-8');
    res.send({"testName": testName, "message": message, "status": status});




    testCase = _jmr.create({
        type: "model.testcase",
        data: {
            time: (new Date()).toUTCString()
        }
    });
    testCase.set("name", testName);

    if (status == 'failure') {
        result = _jmr.create({
            type: "model.failure",
            data: {
                message: message,
                type: status
            }
        });
        testCase.add(result);
    }


    _testsuite.add(testCase);

    var output = _testsuite.compile();
    console.log(output);

    var phantomStatus = hasPhantom ? "phantom" : "nophantom";
    file = "./cattestresult" + reportType + "-" + phantomStatus + ".xml";
    if(_fs.existsSync(file))
    {
        _fs.unlinkSync(file);
    }
    _jmr.write(file, output);

}