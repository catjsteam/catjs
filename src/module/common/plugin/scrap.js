var _log = require("../../CATGlob.js").log(),
    _path = require("path"),
    _utils = require("./../../Utils.js"),
    _Scrap = require("./scrap/Scrap.js"),
    _parser = require("./../parser/Parser.js"),
    _typedas = require("typedas");

module.exports = function () {

    var _basePath,
        _disabled = false,
        _emitter,
        _module,
        _parsers = {};

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


            var from = file;

            if (isDisabled()) {
                return undefined;
            }
            if (file) {
                from = _getRelativeFile(file);
                _log.debug("[scrap Action] scan file: " + from);
                if (!_parsers["Comment"]) {
                    _parsers["Comment"] = _parser.get("Comment");
                }
                _parsers["Comment"].parse({file: file, callback: function(comments) {
                    if (comments && _typedas.isArray(comments)) {
                        comments.forEach(function(comment) {
                            if (comment) {
                                console.log("----");
                                console.log(comment);
                                console.log("----");
                            }
                        });
                    }
                }});

            }
        },

        folder: function (folder) {
            var tmpFolder;
            if (isDisabled()) {
                return undefined;
            }
            if (folder) {
                _log.debug("[scrap Action] scan folder: " + tmpFolder);


            }
        },

        getListeners: function (eventName) {
            if (isDisabled()) {
                return undefined;
            }
            return _emitter.listeners(eventName);

        },

        initListener: function(config) {
            _basePath = (config ? config.path : undefined);
            if (!_basePath) {
                _utils.error("[Scrap Plugin] No valid base path");
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
            var errors = ["[Scrap plugin] scrap operation disabled, No valid configuration"],
                data, global, toFolder, fromFolder;

            if (!config) {
                _log.error(errors[1]);
                setDisabled(true);
            }

            _emitter = config.emitter;
            global = config.global;
            data = config.data;
            // Listen to the process emitter
            if (_emitter) {
                _emitter.on("init", _module.initListener);
                _emitter.on("file", _module.file);
                _emitter.on("folder", _module.folder);
            } else {
                _log.warning("[Scrap plugin] No valid emitter, failed to assign listeners");
            }

            _Scrap.add({name: "code", func: function(config) {
                var code;
                if (config) {
                    code = config.code;
                }
            }});

            /**
             *  scrap usage example
             *  var scrap = new _Scrap.clazz({id: "testScrap", code: "console.log(':)');"});
             *  scrap.codeApply();
             */
        }
    };

    return _module;
};