var _log = catrequire("cat.global").log(),
    _path = require("path"),
    _utils = catrequire("cat.utils"),
    _Scrap = catrequire("cat.common.scrap"),
    _parser = catrequire("cat.common.parser"),
    _typedas = require("typedas"),
    _basePlugin = catrequire("cat.plugin.base"),
    _props = catrequire("cat.props");

module.exports = _basePlugin.ext(function () {

    var _basePath,
        _data,
        _global,
        _me = this,
        _emitter,
        _module,
        _parsers = {},
        _scraps = [];

    /**
     * Extract valid main scrap blocks out of comments
     *
     * @param comments
     * @private
     */
    function _extractValidScrapRoot(comments) {

        var gidx = 0, gsize, blockComment,
            scraps;

        if (comments && _typedas.isArray(comments)) {

            gsize = comments.length;
            for (; gidx < gsize; gidx++) {

                blockComment = comments[gidx];
                if (blockComment) {
                    scraps = _Scrap.extractScrapBlock(blockComment);
                    if (scraps) {
                        _scraps = _scraps.concat(scraps);
                    }
                }
            }
        }
    }

    function _getRelativeFile(file) {
        if (!file) {
            return file;
        }
        return file.substring(_basePath.length);
    }

    _module = {

        /**
         * Done listener
         * Processing all of the Scrap that was collected out of the file
         *
         */
        done: function() {
            _Scrap.apply();
        },

        /**
         * File listener
         *
         * @param file
         * @returns {undefined}
         */
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
                            _extractValidScrapRoot(comments);

                            if (_scraps){
                                size = _scraps.length;
                                for (; idx<size; idx++) {
                                    scrapComment = _scraps[idx];
                                    _Scrap.create({
                                        file: file,
                                        scrapComment:scrapComment
                                    });
                                }
                            }
                        }
                    }});
                } else {
                    _log.debug("[Copy Action] filter match, skipping file: " + from);
                }
            }
        },

        /**
         * Folder listener
         *
         * @param folder
         */
        folder: function (folder) {
//            var tmpFolder;
//            if (_me.isDisabled()) {
//                return undefined;
//            }
        },

        /**
         * Get All listeners
         *
         * @param eventName
         * @returns {*}
         */
        getListeners: function (eventName) {
            if (_me.isDisabled()) {
                return undefined;
            }
            return _emitter.listeners(eventName);

        },

        /**
         * Init Listeners
         *
         * @param config
         */
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
                _emitter.on("done", _module.done);
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