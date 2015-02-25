var  _utils = catrequire("cat.utils"),
    _fs = require("fs"),
    _Generic = require("./Generic.js"),
    _generic = new _Generic();

_generic.setProto("write", function() {
    //this.read();

});


_generic.setProto("add", function(record) {

    _fs.writeFile(this.filename, record, function (err) {
        if (err) {
            console.log("screenshot error");
        } else {
            console.log("screenshot saved");
        }

    });
});

module.exports = _generic; 