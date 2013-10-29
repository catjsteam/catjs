exports.result = function(req, res) {

    var testName = req.query.testName;
    var result = req.query.result;

    res.setHeader('Content-Type', 'text/javascript;charset=UTF-8');
    res.send({"testName" : testName, "result" : result});

}