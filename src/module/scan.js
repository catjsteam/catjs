var _fs = require('fs'),
    _path = require('path'),
    _typedas = require('typedas'),
    _log = require("./CATGlob.js").log(),
    _events = require('events'),
    _fsconfig = require("./fs/Config.js");

module.exports = function () {

    function Config(config) {

        var actions = [],
            actionsConfig;

        function Action(config) {

            var filters,
                actionType,
                me = this;
            this.filters = [];

            function Filter(config) {
                if (config) {
                    this.type = (config.type || undefined);
                    this.ext = (config.ext || undefined);
                    this.exclude = (config.exclude || undefined);
                }
            }

            if (config) {

                this.type = (config.type || undefined);
                // get the scanner instance
                if (this.type) {
                    // instantiating action per type
                    actionType = ["./fs/action/", this.type ,".js"].join("");
                    _log.debug("[Scan] Instantiating action: " + actionType);
                    try {
                        this.ref = require(actionType);
                        if (this.ref) {
                            this.action = new this.ref();
                        }
                    } catch(e) {
                        _log.error("[Scan] action type not found or failed to load module ", e);
                    }
                }

                // go over the filter configuration
                filters = (config.filters || undefined);
                if (filters) {
                    filters.forEach(function (item) {
                        if (item) {
                            me.filters.push(new Filter(item));
                        }
                    });
                    if (this.action) {
                        this.action.init(this.filters);
                    }

                }
            }

            return this;

        }

        actionsConfig = config.actions;
        if (actionsConfig &&
            _typedas.isArray(actionsConfig)) {
            actionsConfig.forEach(function (item) {
                if (item) {
                    actions.push(new Action(item));
                }
            });
        }

        return actions;
    }

    function scan(config) {

        var scanConfig,
            grunt, args,
            dir, path;

        function _init() {

            if (!config) {
                return undefined;
            }
            grunt = (config.grunt || undefined);
            args = (config.args || undefined);

            if (args) {
                path = args[0];
                if (path) {
                    config = new _fsconfig(path, function (data) {
                        if (data) {
                            scanConfig = new Config(data);


                        } else {
                            _log.error("[Scan] Data is not valid, expecting data of type Array");
                        }
                        _log.debug("[Scan] configuration data: ", data);
                    });
                }
            }
        }

        _init();

        dir = "test/";

        if (scanConfig) {
            _log.info("[Scanner] Initialized");
            if (grunt) {
                _log("[Scanner] Grunt supported");
            }
        } else {
            _log.debug("[Scan] No valid configuration detected, ignore");
        }

        var walk = function (dir, done) {
            var results = [],
                emitter = new _events.EventEmitter();
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
                            walk(file, function (err, res) {
                                results = results.concat(res);
                                //copyAction.folder(res);
                                emitter.emit("folder", file, res);
                                _log.debug("[SCAN] file: " + res);
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

    return {
        scan: scan
    };
}();