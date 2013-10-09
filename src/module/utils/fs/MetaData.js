var _fs = require("fs"),
    _path = require("path"),
    _beautify = require('js-beautify').js_beautify,
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _utils = catrequire("cat.utils"),
    _props = catrequire("cat.props");

module.exports = function () {

    var _workDir = _global.get("home").working.path,
        _mdFileName = "_cat_md.json",
        _mdFile,
        _getMDFile = function () {
            if (!_mdFile) {
                _mdFile = _path.normalize([_workDir, _mdFileName].join("/"));
            }
            return _mdFile;
        },
        _MDRecord = function(config) {

            var me = this;

            this.files = {};
            this.project = {
                basepath: undefined,
                resources: []
            };

            this.update = function(config, override) {
                if (config.files) {
                    _utils.copyObjProps(config.files, me.files, override);
                }
                if (config.project) {
                    _utils.copyObjProps(config.project, me.project, override);
                }
            };

            if (config) {
                this.update(config);
            }
        };

    return {

        /**
         *  Validate the incoming and existing metadata
         *  In case the file metadata has been stored, remove it to get the new data
         *
         * @param config The incoming metadata to be updated
         * @param content The existing metadata loaded from the file (if exists, might be the first time)
         * @private
         */
        normalize: function(config) {
            var fileKey,
                file,
                scrapKey,
                content = (this.exists() ? this.read() : undefined),
                validate;

            if (!content) {
                return undefined;
            }

            content = JSON.parse(content);
            if (config && content) {

                if (config.files && content.files) {

                    // go over the files
                    for (fileKey in config.files) {

                        file = content.files[fileKey];
                        if (file) {

                            // go over the scraps
                            for (scrapKey in file){

                                if (config.files[fileKey]) {
                                    validate = config.files[fileKey][scrapKey];

                                    /*
                                     * Delete the scrap key at the content (stored data)
                                     * We want to set the new content from the config object
                                     */
                                    if (typeof(validate) == "undefined") {
                                        delete content.files[fileKey][scrapKey];
                                    }
                                }
                            }

                        }
                    }
                }

                this.update(content, true);
            }
        },

        /**
         * Create/Update the CAT metadata file
         *
         *
         * @param config The configuration for the metadata
         *          files - The files data
         *          project - the project data
         *          e.g. {
         *                  files: ...
         *                  project: {
         *                      basepath:
         *                      resources:
         *                  }
         *              }
         * @param override True for taking the incoming config over the existing
         */
        update: function (config, override) {

            var data,
                content,
                store;

            if (!override) {
                data = (this.exists() ? this.read() : undefined)
                if (!data) {
                    data = new _MDRecord(config);

                } else {
                    content = JSON.parse(data);
                    data = new _MDRecord(content);
                    data.update(config, true);
                }
                store = data;

            } else {
                store = config;
            }

            this.write(JSON.stringify(store));

        },

        exists: function () {
            return _fs.existsSync(_getMDFile());
        },

        write: function (content) {

            try {
                _fs.writeFileSync(_getMDFile(), _beautify(content, { indent_size: 2 }));
                _log.debug(_props.get("cat.mdata.write").format("[cat mdata]"));
            } catch(e) {
                _utils.error(_props.get("cat.error").format("[cat mdata]", err));
            }

        },

        read: function () {
            var data;

            try {
                if (_fs.existsSync(_getMDFile())) {
                    data = _fs.readFileSync(_getMDFile(), "utf8");
                    _log.debug(_props.get("cat.mdata.read").format("[cat mdata]"));
                } else {
                    _log.warning(_props.get("cat.mdata.file.not.exists").format("[cat mdata]"));
                }
            } catch (e) {
                _utils.error(_props.get("cat.error").format("[cat mdata]", e));
            }

            return data;
        },

        readAsync: function (callback) {

            if (_fs.existsSync(_getMDFile())) {
                _fs.readFile(_getMDFile(), function(err, data) {
                    if (err) {
                        _utils.error(_props.get("cat.error").format("[cat mdata]", err));
                    } else {
                        _log.debug(_props.get("cat.mdata.read").format("[cat mdata]"));
                        callback.call({data: data});
                    }
                });

            } else {
                _log.warning(_props.get("cat.mdata.file.not.exists").format("[cat mdata]"));
            }

        }
    };

}();