var  _utils = catrequire("cat.utils"),
    _fs = require("fs"),
    _Generic = require("./Generic.js"),
    _generic = new _Generic(),
    _log = catrequire("cat.global").log();

_generic.setProto("write", function() {
    //this.read();

});


_generic.setProto("add", function(record) {

    var imageBuffer = new Buffer(record, 'base64');
    
    _fs.writeFile(this.filename, imageBuffer, function (err) {
        if (err) {
            _utils.error("[Scrap Plugin] failed to save screenshot: ", this.filename, " error: ",  err);
        } else {
            _log.info("[catjs screenshot entity] Screenshot saved: " + this.filename);
        }

    });
});

module.exports = _generic; 