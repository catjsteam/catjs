var _log = require("../../CATGlob.js").log(),
    _path = require("path"),
    _utils = require("./../../Utils.js"),
    _Scrap = require("./scrap/Scrap.js"),
    _parser = require("./../parser/Parser.js"),
    _typedas = require("typedas"),
    _basePlugin = require("./Base.js"),
    _props = require("./../../Properties.js");

module.exports = _basePlugin.ext(function () {

    var _basePath,
        _data,
        _global,
        _me = this,
        _emitter,
        _module,
        _parsers = {},
        _scraps = [];

    function _extractValidScrap(comments) {

        var scrapBlock = _Scrap.getScrapBlock(),
            scrapName = _Scrap.getName().name,
            idx = 0, size, comment, scrap = [-1, -1], currentScrap = [],
            gidx = 0, gsize, blockComment;

        if (comments && _typedas.isArray(comments)) {

            gsize = comments.length;
            for (; gidx < gsize; gidx++) {

                blockComment = comments[gidx];
                if (blockComment) {
                    size = blockComment.length;
                    for (; idx < size; idx++) {
                        comment = blockComment[idx];
                        if (comment) {
                            if (scrap[0] === -1) {
                                scrap[0] = comment.indexOf((scrapBlock.open + scrapName));
                            }
                            scrap[1] = comment.indexOf(scrapBlock.close);
                            if (scrap[0] > -1 && scrap[1] === -1) {
                                currentScrap.push(comment);
                            }
                            if (scrap[1] > -1) {
                                if (scrap[0] < -1 || scrap[0] > scrap[1]) {
                                    currentScrap = [];
                                    _log.warning(_props.get("cat.scrap.validation.close").format("[scrap plugin]"));
                                }
                                // valid comment
                                currentScrap.push(comment);
                                _scraps.push(currentScrap.splice(0));
                            }

                        }
                    }
                }
            }
        }
        return false;
    }

    function _getRelativeFile(file) {
        if (!file) {
            return file;
        }
        return file.substring(_basePath.length);
    }

    _module = {

        file: function (file) {


            var from = file,
                filters = _me.getFilters(),
                idx= 0, size, scrapComment;

            if (_me.isDisabled()) {
                return undefined;
            }
            if (file) {
                from = _getRelativeFile(file);
                _log.debug("[scrap Action] scan file: " + from);
                if (!_me.applyFileExtFilters(filters, file)) {
                    if (!_parsers["Comment"]) {
                        _parsers["Comment"] = _parser.get("Comment");
                    }
                    _parsers["Comment"].parse({file: file, callback: function (comments) {
                        if (comments && _typedas.isArray(comments)) {
                            _extractValidScrap(comments);

                            if (_scraps){
                                size = _scraps.length;
                                for (; idx<size; idx++) {
                                    scrapComment = _scraps[idx];
                                    _Scrap.create(scrapComment);
                                }
                            }
                        }
                    }});
                } else {
                    _log.debug("[Copy Action] filter match, skipping file: " + from);
                }
            }
        },

        folder: function (folder) {
//            var tmpFolder;
//            if (_me.isDisabled()) {
//                return undefined;
//            }
        },

        getListeners: function (eventName) {
            if (_me.isDisabled()) {
                return undefined;
            }
            return _emitter.listeners(eventName);

        },

        initListener: function (config) {
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
                data;

            if (!config) {
                _log.error(errors[1]);
                _me.setDisabled(true);
            }

            _emitter = config.emitter;
            _global = config.global;
            _data = config.data;

            // initial data binding to 'this'
            _me.dataInit(_data);

            // Listen to the process emitter
            if (_emitter) {
                _emitter.on("init", _module.initListener);
                _emitter.on("file", _module.file);
                //  _emitter.on("folder", _module.folder);
            } else {
                _log.warning("[Scrap plugin] No valid emitter, failed to assign listeners");
            }

            /*
             _Scrap.add({name: "code", func: function(config) {
             var code;
             if (config) {
             code = config.code;
             }
             }});

             *  scrap usage example
             *  var scrap = new _Scrap.clazz({id: "testScrap", code: "console.log(':)');"});
             *  scrap.codeApply();
             */
        },

        getType: function () {
            return "scrap";
        }
    };

    return _module;
});