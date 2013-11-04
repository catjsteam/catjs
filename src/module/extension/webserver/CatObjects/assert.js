exports.result = function (req, res) {

    var testName = req.query.testName;
    var message = req.query.message;
    var status = req.query.status;
    console.log("requesting " + testName + message + status);
    res.setHeader('Content-Type', 'text/javascript;charset=UTF-8');
    res.send({"testName": testName, "message": message, "status": status});

    var jmr = require("test-model-reporter");
    if (jmr === undefined) {
        console.log("Test Unit Reporter is not supported, consider adding it to the .catproject dependencies");
    }

    var testcase,
        failure,
        testsuite = jmr.create({
            type: "model.testsuite",
            data: {
                name: "testsuite"
            }
        });
    testcase = jmr.create({
        type: "model.testcase",
        data: {
            time: "now"
        }
    });
    testcase.set("name", testName);

    var result = jmr.create({
        type: "model.failure",
        data: {
            message: message,
            type: status
        }
    });

    testcase.add(result);
    testsuite.add(testcase);

    var output = testsuite.compile();
    console.log(output);
    jmr.write("./cattestresult.xml", output);

}