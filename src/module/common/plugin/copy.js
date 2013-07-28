var _fs = require("fs"),
    _typedas = require("typedas"),
    _log = require("../../CATGlob.js").log(),
    _utils = require("../../Utils.js"),
    _path = require("path"),
    _basePlugin = require("./Base.js"),

        /**
         * @param typeObj The reference object of type file|folder
         */
        _filtersFn2 = function (typeObj, filters) {

        var exitCondition = 0;

        if (typeObj && filters && _typedas.isArray(filters)) {

            filters.forEach(function (filter) {
                if (filter) {
                    filter.apply(function() {

                        var extName = _path.extname(typeObj);
                        if (this.ext) {
                            this.ext.forEach(function(item) {
                                if (item === extName) {
                                    exitCondition++;

                                }
                            });
                            // break;
                        }

                    })
                }
            });

            if (exitCondition > 0) {
                return true;
            }

        }

        return false;
    };

/**
 * Copy plugin, copies a target folder to a destination folder according to CAT project
 * Note: copy plugin extends Base.js implementation
 *
 * @type {*}
 */
module.exports = _basePlugin.ext(function () {

    var _me = this,
        _basePath,
        _targetFolderName,
        _global,
        _data,
        _emitter,
        _module,
        _errors;


    function _getRelativeFile(file) {
        if (!file) {
            return file;
        }
        return file.substring(_basePath.length);
    }

    _module = {

        file: function (file) {

            var from = file,
                to = _me.getTo(),
                filters = _me.getFilters();

            if (_me.isDisabled()) {
                return undefined;
            }
            if (file) {
                from = _getRelativeFile(file);
                _log.debug("[Copy Action] scan file: " + from);

                if (!_me.applyFileExtFilters(filters, file)) {
                    _log.debug("[Copy Action] No filter match, copy to: ", to);

                    _utils.copySync(file, _path.normalize(to + "/" + from), function (err) {
                        if (err) {
                            _log.error("[copy action] failed to copy file: " + file + "err: " + err);
                            throw err;
                        }
                    });


                } else {
                    _log.debug("[Copy Action] filter match, skipping file: " + from);
                }
            }
        },

        folder: function (folder) {
            var tmpFolder,
                to = _me.getTo();

            if (_me.isDisabled()) {
                return undefined;
            }
            if (folder) {
                tmpFolder = _path.normalize(to + "/" + folder.substring(_basePath.length));
                _log.debug("[Copy Action] scan folder: " + tmpFolder);

                if (!_fs.existsSync(tmpFolder)) {
                    _log.debug("[Copy Action] No filter match, create folder: ", to);

                    _utils.mkdirSync(tmpFolder);


                } else {
                    _log.debug("[Copy Action] filter match, skipping file: " + tmpFolder);
                }
            }
        },

        getListeners: function (eventName) {
            if (_me.isDisabled()) {
                return undefined;
            }
            return _emitter.listeners(eventName);

        },

        initListener: function(config) {

            var toFolder,
                fromFolder;

            _basePath = (config ? config.path : undefined);
            if (!_basePath) {
                _utils.error("[Scrap Plugin] No valid base path");
            }

            // TODO refactor - create proper functionality in the configuration target
            if (_me.getTo()) {
                // setting 'folder name' project
                if (_global) {
                    _targetFolderName = _global.name;

                    _utils.mkdirSync(_me.getTo() + _targetFolderName);
                }
            }

        },

        /**
         * e.g. [{type:"file|folder|*", ext:"png", name:"*test*" callback: function(file/folder) {}}]
         *
         * @param config The configuration:
         *          data - The configuration data
         *          emitter - The emitter reference
         *          global - The global data configuration
         *          internalConfig - CAT internal configuration
         */
        init: function (config) {

            // TODO extract messages to resource bundle with message format
            _errors = ["copy action] copy operation disabled, No valid configuration"];

            if (!config) {
                _log.error(_errors[0]);
                _me.setDisabled(true);
            }

            _emitter = config.emitter;
            _global = config.global;
            _data = config.data;

            // initial data binding to 'this'
            _me.dataInit(_data);

            // Listen to the process emitter
            if (_emitter) {
                _emitter.on("scan.init", _module.initListener);
                _emitter.on("scan.file", _module.file);
                _emitter.on("scan.folder", _module.folder);
            } else {
                _log.warning("[copy action] No valid emitter, failed to assign listeners");
            }

        },

        getType: function() {
            return "copy";
        }
    };

    return _module;
});