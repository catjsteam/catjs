var  _utils = catrequire("cat.utils"),
    _JSONUtils = catrequire("cat.jsonutils"),
    _nodeutil = require("util"),
    _fs = require("fs"),
    _Generic = require("./Generic.js"),
    _generic = new _Generic();

_generic.setProto("init", function() {
    this.read(); 
});

module.exports = _generic; 