var _fs = require('fs'),
    _path = require('path'),
    _log = require("./../../CATGlob.js").log(),
    _utils = require("./../../Utils.js"),
    _props = require("./../../Properties.js");

/**
 * Scan extension for CAT
 *
 * @type {module.exports}
 */
module.exports = function () {

    var _grunt,
        _project,
        _emitter,

        /**
         * Walk recursively over the given directory
         *
         * @param dir The root point directory to be walked from
         */
        _walk = function (dir) {

            _emitter.emit("scan.init", {path: dir});

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
                                _emitter.emit("scan.folder", file);
                                _log.debug("[SCAN] folder: " + file);
                                walk(file, function (err, res) {
                                    //results = results.concat(res);
                                    //copyAction.folder(res);
                                    next();
                                });
                            } else {
                                // On File
                                //copyAction.file(file);
                                _emitter.emit("scan.file", file);
                                _log.debug("[SCAN] file: " + file + "; ext: " + _path.extname(file));
                                results.push(file);
                                next();
                            }
                        });
                    })();
                });
            };

            walk(dir, function (err, results) {

                _emitter.emit("scan.done", {results: results});

                if (err) {
                    _emitter.emit("scan.error", {error: err});
                    throw err;
                }
                // console.log(results);
            });

        },


        /**
         * Apply the scan extension
         *
         * @param config
         *      path - The base path to scan from
         */
          _apply = function (config) {
            var dir = (config ? config.path : undefined);

            if (!dir) {
                _utils.error(_props.get("cat.error.config").format("[scan ext]"));
            }
            _walk(dir);

            _log.info("[Scanner] Initialized");
            if (_grunt) {
                _log("[Scanner] Grunt supported");
            }
        },

        /**
         * Plugin initialization
         *
         * @param config The passed arguments
         *          project - The project configuration object
         *          grunt - The grunt handle
         *          emitter - The emitter handle
         *
         * @param ext The extension properties
         */
         _init = function (config, ext) {

            function _init() {

                if (!config) {
                    return undefined;
                }
                _emitter = config.emitter;
                _grunt = (config.grunt || undefined);
                _project = (config.project || undefined);

            }

            _init();

        };

    return {

        init: _init,

        apply: _apply
    };
}();