var _fs = require("fs.extra"),
    _path = require("path"),
    _beautify = require('js-beautify').js_beautify,
    _global = catrequire("cat.global");

module.exports = function() {

    var _workDir = _global.get("home").working.path,
        _mdFileName = "_cat_md.json";

    return {

            write: function(content) {

                var workDir = _global.get("home").working.path;

                _fs.writeFile(_path.normalize([workDir, _mdFileName].join("/")), _beautify(content, { indent_size: 2 }), function(err) {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log("The file was saved!");
                    }
                });
            },

            read: function() {

            }
    };

}();