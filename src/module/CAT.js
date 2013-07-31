var _async = require("async");

var CAT = function () {

    var _global,
        _stringFormat,
        _log,
        _project,
        _catconfig,
        _path,
        _properties,
        _events,
        _emitter,
        _basedir,
        _watch,
        _cache,
        _utils,
        _targets,
        _catconfigInternal,
        _counter=0;

    /**
     * Get which task to get to run from the CAT command line.
     *
     * @param target The passed task
     * @private
     */
    function _runTask(target, watch) {

        var project,
            task;

        target = target.toString();
        target = target.toLowerCase();

        if (_catconfigInternal) {

            project = _catconfigInternal.externalConfig.project;
            task = project.getTask(target);
            if (task) {
                if (watch) {
                    // set watch configuration
                    _catconfigInternal.watch(watch);
                }

                // apply task
                task.apply(_catconfigInternal);
            } else {
                _log.error("[CAT] No valid task named: '" + _targets + "', validate your cat's project configuration (catproject.json)");
            }
        }
    }

    function _runme(watch) {

        _runTask(_targets[_counter], watch);
        _emitter.on("job.done", function (obj) {
            _counter++;
            if (_counter < _targets.length) {
                _emitter.removeAllListeners("job.done");
                _runme(watch);
            }
        });
    }

    (function () {

        _stringFormat = require("string-format");
        _path = require("path");
        _events = require('events');
        _emitter = new _events.EventEmitter();
        _basedir = function (config) {
            return ((config && config.home) || {home: {path: "."}});
        };

    })();

    return {


        /**
         * Initial CAT module
         * Note: Get called from CATCli module
         *
         * @param config
         */
        init: function (config) {

            var me = this,
                basedir,
                projectDir;

            (function (config) {

                basedir = _basedir(config),
                    projectDir = basedir.path;

                _global = catrequire("cat.global");
                _log = _global.log();

                _project = catrequire("cat.project");
                _catconfig = catrequire("cat.config");
                _properties = catrequire("cat.props");

                // initial global "home" property
                _global.set("home", basedir);

                _cache = catrequire("cat.cache");
                _cache.set("pid", process.pid);


            })(config);


            // Property module initialization
            _properties.init(function (error, properties) {

                // on error
                if (error) {
                    // we don't have the error properties just yet
                    _log.error("[Properties] " + error + " result: " + p);
                    return undefined;
                }

                // After property log file loaded apply CAT module
                global.CAT.props = properties;

                /*
                 CAT apply call
                 */
                me.apply.call(me, config);

            });


        },

        watch: function (config) {
            if (config) {
//                _targets.forEach(function (target) {
//                    _runTask(target, config);
//                });
                _counter = 0;
                _runme(config);

            }
        },

        /**
         * Apply CAT module
         * Note: Get called after properties module initialization
         *
         * @param config
         */
        apply: function (config) {

            // TODO messages should be taken from resource
            var grunt, args, path, watch = false, kill = 0,
                msg = ["[CAT] Project failed to load, No valid argument path was found"];

            /**
             * Set environment variables
             *
             * @returns {undefined}
             * @private
             */
            function _init() {

                if (!config) {
                    return undefined;
                }
                var home = _global.get("home"),
                    workingDir;

                if (home && home.working) {
                    workingDir = home.working.path;
                }

                kill = (config.kill || kill);
                watch = (config.watch || watch);
                _targets = config.task;
                grunt = config.grunt;
                args = config;
                path = (config.path || workingDir);

                if (path) {
                    _log.debug("[CAT] Initial, current location: " + _path.resolve(path));
                }

                _log.debug("[CAT] Initial, command line arguments: " + JSON.stringify(config));

                // listen to the processes, do a cleanup on shutdown
                //process.stdin.resume();

                process.on('uncaughtException', function (err) {
                    console.error(err);
                    process.exit(1);
                });

                process.on('exit', function () {
                    _cache.removeByKey("pid", process.pid);
                });

                process.on('SIGINT', function () {
                    process.exit(1);
                });
            }

            /**
             * Load CAT tasks and call them (e.g. scan)
             * Note: according to the command line inputs
             *
             * @private
             */
            function _apply() {

                var project,
                    pids,
                    targets = _targets, counter,
                    wait = false;


                _log.info("watch: " + watch + " kill: " + kill + " process: " + process.pid);
                if (kill) {
                    _utils = catrequire("cat.utils");

                    // TODO 1 might be a process number, change it to negative maybe.
                    if (kill == 1) {
                        // kill all current running processes except me.
                        pids = _cache.removeByKey("pid", process.pid);
                        _utils.kill(pids, [process.pid]);

                    } else {
                        _utils.kill([kill], [process.pid]);
                    }
                }


                if (path) {

                    if (watch) {
                        _watch = catrequire("cat.watch");
                        _watch.init();
                    }
                    // load CAT project
                    project = _project.load({
                        path: path,
                        emitter: _emitter
                    });


                    if (project) {

                        // apply project's tasks
                        if (_targets) {

                            // Load CAT internal configuration (resources/cat.json)
                            _catconfigInternal = _catconfig.load({
                                project: project,
                                grunt: grunt,
                                emitter: _emitter
                            });

                            if (!watch) {
                                _counter = 0;
                                _runme();
                            }

                        }
                    }

                } else {

                    _log.warning(msg[0]);
                    throw msg[0];

                }

            }

            _init();
            _apply();

        }
    };


}();


module.exports = function () {

    return CAT;

}();
