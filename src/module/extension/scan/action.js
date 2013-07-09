var _fs = require('fs'),
    _path = require('path'),
    _log = require("./../../CATGlob.js").log(),
    _utils = require("./../../Utils.js");
/**
 * Scan extension for CAT.
 * TODO: create an interface Class to enforce the extension to implement init, apply.
 *
 * @type {module.exports}
 */
module.exports = function () {

    var _grunt,
        _project,
        _emitter;

    function _walk(dir) {

        _emitter.emit("init", {path: dir});

        var walk = function (dir, done) {
            var results = [];
            _fs.readdir(dir, function (err, list) {
                if (err) return done(err);
                var i = 0;
                (function next() {
                    var file = list[i++];
                    if (!file) return done(null, results);

                    file = dir + '/' + file;
                    file = file.split("//").join("/");
                    _fs.stat(file, function (err, stat) {
                        if (stat && stat.isDirectory()) {
                            // On Directory
                            _emitter.emit("folder", file);
                            _log.debug("[SCAN] folder: " + file);
                            walk(file, function (err, res) {
                                //results = results.concat(res);
                                //copyAction.folder(res);
                                next();
                            });
                        } else {
                            // On File
                            //copyAction.file(file);
                            _emitter.emit("file", file);
                            _log.debug("[SCAN] file: " + file + "; ext: " + _path.extname(file));
                            results.push(file);
                            next();
                        }
                    });
                })();
            });
        };

        walk(dir, function (err, results) {
            if (err) throw err;
            // console.log(results);
        });

    }


    function _apply(config) {
        var dir = (config ? config.path : undefined),
            error = "[Scan Ext] no valid configuration for 'apply' functionality";

        if (!dir) {
            _utils.error(error);
        }
        _walk(dir);

        _log.info("[Scanner] Initialized");
        if (_grunt) {
            _log("[Scanner] Grunt supported");
        }
    }

    /**
     *
     *
     * @param config The passed arguments
     *          project - The project configuration object
     *          grunt - The grunt handle
     *          emitter - The emitter handle
     */
    function _init(config) {

        function _init() {

            if (!config) {
                return undefined;
            }
            _emitter = config.emitter;
            _grunt = (config.grunt || undefined);
            _project = (config.project || undefined);

        }

        // TODO create global functionality
        // global settings
        //dir = globalData.project.src.path;

        _init();

    }

    return {

        init: _init,

        /**
         * Apply the scan extension.
         *
         * @param config
         *      path - The base path to scan from
         */
        apply: _apply
    };
}();