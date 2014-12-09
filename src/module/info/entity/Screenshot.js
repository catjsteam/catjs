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

    _fs.writeFile(this.filename, record, function (err) {
        console.log("add screenshot fs");
    });
});

module.exports = _generic; 