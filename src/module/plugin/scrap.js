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
        _global,
        _me = this,
        _emitter,
        _module,
        _parsers = {},
        _wait = 0,
        _waitcounter = 0;

    /**
     * Extract valid main scrap blocks out of comments
     *
     * @param comments
     * @private
     */
    function _extractValidScrapRoot(comments) {

        var gidx = 0, gsize, blockComment,
            scrap = [], extractedScraps;

        if (comments && _typedas.isArray(comments)) {

            gsize = comments.length;
            for (; gidx < gsize; gidx++) {

                blockComment = comments[gidx];
                if (blockComment) {
                    extractedScraps = _Scrap.extractScrapBlock(blockComment);
                    if (extractedScraps && extractedScraps.length > 0) {
                        scrap = scrap.concat(extractedScraps);
                    }
                }
            }
        }

        return scrap;
    }

    function _jobScrapWait(status, validate) {
        if (!validate) {
            _waitcounter--;
        }
        if (_wait === 2 && _waitcounter === 0) {
            _emitter.emit("job.wait", {status: "done"});
        }
    }

    _module = {

        /**
         * Done listener
         * Processing all of the Scrap that was collected out of the file
         *
         */
        done: function () {
            _emitter.removeListener("scan.init", _module.initListener);
            _emitter.removeListener("scan.file", _module.file);
            //_emitter.removeListener("scan.folder", _module.folder);
            _emitter.removeListener("scan.done", _module.done);

            if (!_wait) {
                _emitter.emit("job.wait", {status: "done"});
            } else {
                _wait = 2;
            }

            _jobScrapWait(null, true);
            //
            // _emitter.removeListener("job.scrap.wait", _jobCopyWait);
        },

        /**
         * File listener
         *
         * @param file
         * @returns {undefined}
         */
        file: function (file) {

            if (_wait !== 2) {
                _wait = 1;
            }
            _waitcounter++;

            var from = file,
                filters = _me.getFilters();

            if (_me.isDisabled()) {
                _emitter.emit("job.scrap.wait", {status: "wait"});
                return undefined;
            }
            if (file) {
         
                if (!_parsers["Comment"]) {
                    _parsers["Comment"] = _parser.get("Comment");
                }
                _parsers["Comment"].parse({file: file, callback: function (comments) {

                    var scrapComment,
                        scrap, scraps, scrapObjs=[],
                        size = 0, idx = 0;

                    if (comments && _typedas.isArray(comments)) {

                        scraps = _extractValidScrapRoot(comments);
                        if (scraps && _typedas.isArray(scraps) && scraps.length > 0) {
                            size = scraps.length;
                            for (idx = 0; idx < size; idx++) {
                                scrapComment = scraps[idx];
                                scrap = _Scrap.create({
                                    file: file,
                                    scrapComment: scrapComment
                                });

                                if (scrap) {
                                    scrapObjs.push(scrap);

                                    _Scrap.apply({
                                        basePath: _basePath,
                                        scraps: [scrap],
                                        apply: true
                                    });
                                }
                            }
                            _Scrap.normalize(scrapObjs);
                        }

                    }

                    _emitter.emit("job.scrap.wait", {status: "wait"});

                }});
            
            }
        },

        /**
         * Folder listener
         *
         * @param folder
         */
        folder: function (folder) {},

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

            // Listen to the process emitter
            if (_emitter) {
                _emitter.removeListener("job.scrap.wait", _jobScrapWait);
                _emitter.on("scan.init", _module.initListener);
                _emitter.on("scan.done", _module.done);
                _emitter.on("scan.file", _module.file);
                _emitter.on("job.scrap.wait", _jobScrapWait);
                //_emitter.on("scan.folder", _module.folder);
                if (_wait !== 2) {
                    _wait = 0;
                }
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
        },

        /**
         * Validate the plugin
         *
         *      dependencies {Array} The array of the supported dependencies types
         *
         * @returns {{dependencies: Array}}
         */
        validate: function() {
            return { dependencies: ["scan"]};
        }
    };

    return _module;
});