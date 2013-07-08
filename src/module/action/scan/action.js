var _fs = require('fs'),
    _path = require('path'),
    _log = require("../../CATGlob.js").log();

module.exports = function () {

    /**
     *
     *
     * @param config The passed arguments
     *          project - The project configuration object
     *          grunt - The grunt handle
     *          emitter - The emitter handle
     */
    function scan(config) {

        var grunt,
            project,
            emitter,
            dir;

        function _init() {

            if (!config) {
                return undefined;
            }
            emitter = config.emitter;
            grunt = (config.grunt || undefined);
            project = (config.project || undefined);

        }

        function walk(dir) {

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
                                emitter.emit("folder", file);
                                _log.debug("[SCAN] folder: " + file);
                                walk(file, function (err, res) {
                                    //results = results.concat(res);
                                    //copyAction.folder(res);
                                    next();
                                });
                            } else {
                                // On File
                                //copyAction.file(file);
                                emitter.emit("file", file);
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

        // TODO create global functionality
        // global settings
        //dir = globalData.project.src.path;

        _init();

        if (project) {
            dir = project.base.path;

            walk(dir);

            _log.info("[Scanner] Initialized");
            if (grunt) {
                _log("[Scanner] Grunt supported");
            }
        } else {
            _log.debug("[Scan] No valid configuration detected, ignore");
        }


    }

    return {
        init: scan
    };
}();