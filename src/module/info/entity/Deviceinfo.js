var  _utils = catrequire("cat.utils"),
    _JSONUtils = catrequire("cat.jsonutils"),
    _nodeutil = require("util"),
    _fs = require("fs"),
    _Generic = require("./Generic.js"),
    _generic = new _Generic();

_generic.setProto("write", function() {
    //this.read();

});


_generic.setProto("add", function(record) {
    var filepath = this.filename;
    _fs.readFile(filepath, 'utf8', function (err, data) {
        var dataArr, dataStr, recordObj;
        if (err) {
            dataArr = [];
        } else {
            dataArr = JSON.parse(data);
        }
        recordObj = JSON.parse(record);
        dataArr.push(recordObj);
        dataStr = JSON.stringify(dataArr, null, 4);
        _fs.writeFile(filepath, dataStr, function (err) {
            if (err) {
                console.log("deviceinfo error");
            } else {
                console.log("deviceinfo saved");
            }

        });

    });
});

module.exports = _generic; 