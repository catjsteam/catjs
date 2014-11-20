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
         * Create/Update the CAT metadata file
         *      
         *
         * @param config The configuration for the metadata
         *          recordFn({Object} JSON object) {Function} Record functionality with update method     
         *         
         * @param override True for taking the incoming config over the existing
         */
        update: function (config, override) {

            var data,
                content,
                store,
                Record = config.recordFn;

            if (!Record) {

                _utils.error("[catjs JSON utility] Missing Record functionality ");
                return undefined;
                
            } 
            
            if (!override) {
                data = (this.exists() ? this.read() : undefined);
                if (!data) {
                    data = new Record(config);

                } else {
                    content = JSON.parse(data);
                    data = new Record(content);
                    if (data.update) {
                        data.update(config, true);
                    } else {
                        _utils.error("[catjs JSON utility] Missing Record 'update' implementation, ignore ");
                    }
                }
                store = data;

            } else {
                store = config;
            }

            this.write(JSON.stringify(store));

        },

        /**
         * 
         * @param config {Object}
         *          filename {String} The file name
         *          content {String} The file content
         * 
         */
        write: function (config) {

            var content, filename;
            
            if (!config) {
                return undefined;
            }
            
            content = _utils.getProp({key: "content", obj: config});
            filename = _utils.getProp({key: "filename", obj: config});
            
            try {
                _fs.writeFileSync(filename, _beautify(content, { indent_size: 2 }));

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
                if (_fs.existsSync()) {
                    content = _fs.readFileSync(filename, "utf8");

                } else {
                    _log.warning(_props.get("cat.mdata.file.not.exists").format("[cat mdata]"));
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