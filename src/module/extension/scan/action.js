var _fs = require('fs'),
    _path = require('path'),
    _log = catrequire("cat.global").log(),
    _utils = catrequire("cat.utils"),
    _props = catrequire("cat.props"),
    _basePlugin = require("./../Base.js");

/**
 * Scan extension for CAT
 *
 * @type {module.exports}
 */
module.exports = _basePlugin.ext(function () {

    var _me = this,

        /**
         * Walk recursively over the given directory
         *
         * @param dir The root point directory to be walked from
         */
          _walk = function (dir) {

            var emitter = _me.getEmitter();

            emitter.emit("scan.init", {path: dir});

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
                                emitter.emit("scan.folder", file);
                                _log.debug("[SCAN] folder: " + file);
                                walk(file, function (err, res) {
                                    //results = results.concat(res);
                                    //copyAction.folder(res);
                                    next();
                                });
                            } else {
                                // On File
                                //copyAction.file(file);
                                emitter.emit("scan.file", file);
                                _log.debug("[SCAN] file: " + file + "; ext: " + _path.extname(file));
                                results.push(file);
                                next();
                            }
                        });
                    })();
                });
            };

            walk(dir, function (err, results) {

                emitter.emit("scan.done", {results: results});
                emitter.emit("job.done", {status: "done"});

                if (err) {
                    emitter.emit("scan.error", {error: err});
                    emitter.emit("job.done", {status: "error", error: err});

                    throw err;
                }
                // console.log(results);
            });

        },

        _module = {

            watch: function(config) {
                console.log("scean: ", config);

                var ic = config.internalConfig,
                    emitter = _me.getEmitter(),
                    watch = ic.getWatch(),
                    path, stat;

                path = config.path = watch.get("file"),
                stat = watch.get("stat");

                emitter.emit("scan.init", {path: _path.dirname(path)});

                if (stat && stat.isDirectory()) {
                    emitter.emit("scan.folder", path);
                    _log.debug("[SCAN] folder: " + path);

                } else {
                    emitter.emit("scan.file", path);
                    _log.debug("[SCAN] file: " + path + "; ext: " + _path.extname(path));
                }


                emitter.emit("job.done", {status: "done"});
            },

            /**
             * Apply the scan extension
             *
             * @param config
             *      path - The base path to scan from
             */
            apply: function (config) {

                var dir = (config ? config.path : undefined);

                _me.apply(config);

                if (!dir) {
                    _utils.error(_props.get("cat.error.config").format("[scan ext]"));
                }
                _walk(dir);
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
            init: function (config, ext) {
                _me.initialize(config, ext);

            }
        };

    return _module;
});