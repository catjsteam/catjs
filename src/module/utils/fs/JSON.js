var _fs = require("fs"),
    _path = require("path"),
    _beautify = require('js-beautify').js_beautify,
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _utils = catrequire("cat.utils"),
    _props = catrequire("cat.props");

module.exports = function () {
    
    return {                

        /**
         * 
         * @param config {Object}
         *          filename {String} The file name
         *          content {String} The file content
         *          opt Object
         *                encoding String | Null default = 'utf8'
         *                mode Number default = 438 (aka 0666 in Octal)
         *                flag String default = 'w'
         * 
         */
        write: function (config) {

            var content, filename, opt, extname;
            
            if (!config) {
                return undefined;
            }
            
            content = _utils.getProp({key: "content", obj: config});
            filename = _utils.getProp({key: "filename", obj: config});
            opt = _utils.getProp({key: "opt", obj: config});
            extname = _path.extname(filename);
            if (extname === ".json") {
                content = _beautify(content, { indent_size: 2 });
            }
            
            try {
                _fs.writeFileSync(filename, content, opt);

            } catch(e) {
                _utils.error(_props.get("cat.error").format("[cat mdata]", e));
            }

        },

        /**
         *
         * @param config {Object}
         *          filename {String} The file name
         *
         */
        read: function (config) {

            var content, filename;

            if (!config) {
                return undefined;
            }

            filename = _utils.getProp({key: "filename", obj: config});
            
            try {
                if (_fs.existsSync(filename)) {
                    content = _fs.readFileSync(filename, "utf8");

                } 
            } catch (e) {
                _utils.error(_props.get("cat.error").format("[cat mdata]", e));
            }

            return content;
        },

        readAsync: function (config) {

            var callback, filename;

            if (!config) {
                return undefined;
            }

            callback = _utils.getProp({key: "callback", obj: config});
            filename = _utils.getProp({key: "filename", obj: config});

            if (_fs.existsSync(filename)) {
                _fs.readFile(filename, function(err, data) {
                    if (err) {
                        _utils.error(_props.get("cat.error").format("[cat mdata]", err));
                    } else {
                        _log.debug(_props.get("cat.mdata.read").format("[cat mdata]"));
                    }
                    callback.call({data: data});
                });

            } else {
                _log.warning(_props.get("cat.mdata.file.not.exists").format("[cat mdata]"));
                callback.call({data: null});
            }

        }
    };

}();