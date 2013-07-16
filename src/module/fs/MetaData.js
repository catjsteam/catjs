var _fs = require("fs.extra"),
    _path = require("path"),
    _beautify = require('js-beautify').js_beautify,
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _utils = catrequire("cat.utils"),
    _props = catrequire("cat.props");

module.exports = function() {

    var _workDir = _global.get("home").working.path,
        _mdFileName = "_cat_md.json",
        _mdFile,
        _getMDFile = function() {
            if (!_mdFile) {
                _mdFile = _path.normalize([_workDir, _mdFileName].join("/"));
            }
            return _mdFile;
        };

    return {

            write: function(content) {

                _fs.writeFile(_getMDFile(), _beautify(content, { indent_size: 2 }), function(err) {
                    if(err) {
                        _utils.error(_props.get("cat.error").format("[cat mdata]", err));
                    } else {
                        _log.debug(_props.get("cat.mdata.write").format("[cat mdata]"));
                    }
                });
            },

            read: function() {
                var data;

                try {
                    if (_fs.existsSync(_getMDFile())) {
                        data = _fs.readFileSync(_getMDFile());
                        _log(_props.get("cat.mdata.read").format("[cat mdata]"));
                    }
                } catch(e) {
                    _utils.error(_props.get("cat.error").format("[cat mdata]", e));
                }

                return data;
            }
    };

}();