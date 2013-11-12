
var jmr = require("test-model-reporter");
if (jmr === undefined) {
    console.log("Test Unit Reporter is not supported, consider adding it to the .catproject dependencies");
}

var testsuite = jmr.create({
    type: "model.testsuite",
    data: {
        name: "testsuite"
    }
});

exports.result = function (req, res) {

    var testName = req.query.testName,
         message = req.query.message,
         status = req.query.status,
         reportType = req.query.type,
         testCase,
         failure,
         result;

    console.log("requesting " + testName + message + status);
    res.setHeader('Content-Type', 'text/javascript;charset=UTF-8');
    res.send({"testName": testName, "message": message, "status": status});




    testCase = jmr.create({
        type: "model.testcase",
        data: {
            time: (new Date()).toUTCString()
        }
    });
    testCase.set("name", testName);

    if (status == 'failure') {
        result = jmr.create({
            type: "model.failure",
            data: {
                message: message,
                type: status
            }
        });
        testCase.add(result);
    }


    testsuite.add(testCase);

    var output = testsuite.compile();
    console.log(output);
    jmr.write("./cattestresult" + reportType + ".xml", output);

}