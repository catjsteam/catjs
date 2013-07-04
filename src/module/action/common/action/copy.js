var _typedas = require("typedas"),
    _log = require("../../../CATGlob.js").log(),
    _utils = require("../../../Utils.js"),
    _path = require("path"),
    _fs = require("fs.extra"),
    _q = require("q"),

    /**
     * @param typeObj The reference object of type file|folder
     */
        _filtersFn = function (typeObj, filters) {

        var exitCondition = 0,
            extName;

        if (typeObj && filters && _typedas.isArray(filters)) {

            filters.forEach(function (filter) {
                if (filter) {
                    extName = _path.extname(typeObj);
                    if (filter.ext) {

                        filter.ext.forEach(function(item) {
                            if (item === extName) {
                                exitCondition++;

                            }
                        });
                        // break;
                    }
                }
            });

            if (exitCondition > 0) {
                return true;
            }

        }

        return false;
    };

module.exports = function () {

    var _filters,
        _to,
        _from,
        _basePath,
        _targetFolderName,
        _disabled = false,
        _emitter,
        _module;

    function isDisabled() {
        return _disabled;
    }

    function setDisabled(bol) {
        _disabled = bol;
    }

    function _getRelativeFile(file) {
        if (!file) {
            return file;
        }
        return file.substring(_basePath.length);
    }

    _module = {

        file: function (file) {

            var from = file, to;

            if (isDisabled()) {
                return undefined;
            }
            if (file) {
                from = _getRelativeFile(file);
                _log.debug("[Copy Action] scan file: " + from);

                if (!_filtersFn(file, _filters)) {
                    _log.debug("[Copy Action] No filter match, copy to: ", _to);

                    _utils.copySync(file, _path.normalize(_to + "/" + from), function (err) {
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
            var tmpFolder;
            if (isDisabled()) {
                return undefined;
            }
            if (folder) {
                tmpFolder = _path.normalize(_to + "/" + folder.substring(_basePath.length));
                _log.debug("[Copy Action] scan folder: " + tmpFolder);

                if (!_filtersFn(tmpFolder, _filters)) {
                    _log.debug("[Copy Action] No filter match, create folder: ", _to);

                    _utils.mkdirSync(tmpFolder);


                } else {
                    _log.debug("[Copy Action] filter match, skipping file: " + tmpFolder);
                }
            }
        },

        getListeners: function (eventName) {
            if (isDisabled()) {
                return undefined;
            }
            return _emitter.listeners(eventName);

        },

        /**
         * e.g. [{type:"file|folder|*", ext:"png", name:"*test*" callback: function(file/folder) {}}]
         *
         * @param config The configuration:
         *          data - The configuration data
         *          emitter - The emitter reference
         *          global - The global data configuration
         */
        init: function (config) {

            // TODO extract messages to resource bundle with message format
            var errors = ["[copy action] copy operation disabled, No valid 'to' folder configuration, to where should I copy your source folder/files ?!",
                    "[copy action] copy operation disabled, No valid configuration",
                    "[copy action] copy operation disabled, No valid 'from' folder configuration, from where should I copy your source folder/files ?!"],
                data, global, toFolder, fromFolder;

            if (!config) {
                _log.error(errors[1]);
                setDisabled(true);
            }

            _emitter = config.emitter;
            global = config.global;
            data = config.data;
            if (_emitter) {
                _emitter.on("file", _module.file);
                _emitter.on("folder", _module.folder);
            } else {
                _log.warning("[copy action] No valid emitter, failed to assign listeners");
            }

            // TODO refactor - create proper functionality in the configuration target
            // setting 'to' folder
            toFolder = data.to;
            if (!toFolder || !(toFolder && toFolder.path)) {
                _log.error(errors[0]);
                setDisabled(true);
            }

            // setting 'from' folder
            //fromFolder = data.from;
            if (global) {
                _basePath = global.base.path;
                 fromFolder = _basePath + (data.from.path ? data.from.path : "/");
                _from = _path.normalize(fromFolder);
            } else {
                _log.error(errors[2]);
                setDisabled(true);
            }

            _to = toFolder.path;
            _filters = data.filters;

            if (_to) {
                // setting 'folder name' project
                if (global) {
                    _targetFolderName = global.name;

                    _to += _targetFolderName;
                    _utils.mkdirSync(_to);
                }

            }
        }
    };

    return _module;
};