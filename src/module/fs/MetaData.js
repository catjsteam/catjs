var _fs = require("fs.extra"),
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

            this.update = function(config) {
                if (config.files) {
                    _utils.copyObjProps(config.files, me.files);
                }
                if (config.project) {
                    _utils.copyObjProps(config.project, me.project);
                }
            };

            if (config) {
                this.update(config);
            }
        };

    return {

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
          *                     resources:
         *                  }
         *              }
         */
        update: function (config) {

            var data = (this.exists() ? this.read() : undefined);
            if (!data) {
                data = new _MDRecord(config);

            } else {
               // data = JSON.parse(data);
                data = new _MDRecord(JSON.parse(data));
                data.update(config);
            }

            this.write(JSON.stringify(data));

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
                    data = _fs.readFileSync(_getMDFile());
                    _log.debug(_props.get("cat.mdata.read").format("[cat mdata]"));
                } else {
                    _log.warning(_props.get("cat.mdata.file.not.exists").format("[cat mdata]"));
                }
            } catch (e) {
                _utils.error(_props.get("cat.error").format("[cat mdata]", e));
            }

            return data;
        }
    };

}();