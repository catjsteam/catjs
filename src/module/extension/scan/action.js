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
        _emitter,
        _scanJobDone = function(){
            _emitter.emit("job.done", {status: "done"});
        },

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
                    if (err) {
                        return done(err);
                    }
                    var i = 0;
                    (function next() {
                        var file = list[i++];
                        if (!file) {
                            return done(null, results);
                        }

                        file = dir + '/' + file;
                        file = file.split("//").join("/");
                        
                        _fs.stat(file, function (err, stat) {
                            
                            var validfilter;
                            
                            if (err) {
                                _utils.error("[scan extension] Error occur while scanning the file system, error", err);
                            }
                                                        
                            if (stat && stat.isDirectory()) {
                                
                                validfilter = _me.applyFilters(_me._plugin.filters, file, "folder");
                                if (validfilter) {
                                    next();
                                    
                                } else {
                                
                                    // On Directory
                                    _emitter.emit("scan.folder", file);
                                    walk(file, function (err, res) {
                                        next();
                                    });
                                }
                                
                            } else {
                                
                                validfilter = _me.applyFilters(_me._plugin.filters, file, "file");
                                if (validfilter) {
                                    next();
                                    
                                } else {
                                    // On File
                                    _emitter.emit("scan.file", file);
                                    results.push(file);
                                    next();
                                }                                
                            }
                        });
                    })();
                });
            };

            walk(dir, function (err, results) {

                _emitter.emit("scan.done", {results: results});

                if (err) {
                    _emitter.emit("scan.error", {error: err});
                    _emitter.emit("job.done", {status: "error", error: err});

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

                path = config.path = watch.get("file");
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

                var dir,
                    data;

                _me.apply(config);
                data = _me._data;

                if (data && data.path) {
                    dir = data.path;

                } else {
                    dir = config.path;
                }

                if (!dir) {
                    _utils.error(_props.get("cat.error.config").format("[scan extension]"));
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

                _emitter = _me.getEmitter();
                _emitter.on("job.wait", _scanJobDone);


            }
        };

    return _module;
});