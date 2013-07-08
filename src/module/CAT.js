
var CAT = function() {

    var _global = require("./CATGlob.js"),
        _log =  _global.log(),
        _project = require("./Project.js"),
        _catconfig = require("./config/CATConfig.js"),
        _path = require("path"),
        _properties = require("./Properties.js"),
        _events = require('events'),
        _emitter = new _events.EventEmitter();

    return {

        /**
         * Initial CAT module
         * @param config
         */
        init: function(config) {

            var me = this;

            // TODO create global class
            // initial global "home" property
            _global.set("home", ((config && config.home) || {home: {path: "."}}));

            // Initial Property module
            _properties.init(function (error, properties) {

                // on error
                if (error) {
                    // we don't have the error properties just yet
                    _log.error("[Properties] " + error + " result: " + p);
                    return undefined;
                }

                // After property log file loaded apply CAT module
                global.CAT.props = properties;
                me.apply.call(me, config);
            });

        },

        /**
         * Apply CAT module
         * @param config
         */
        apply: function(config) {

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

                target = config.task;
                grunt = config.grunt;
                args = config;
                path = (config.path || workingDir);

                if (path) {
                    _log.debug("[CAT] Initial, current location: " + _path.resolve(path));
                }

            }

            /**
             * Load CAT tasks and call them (e.g. scan)
             * Note: according to the command line inputs
             *
             * @private
             */
            function _apply() {


                var project,
                    catconfig,
                    task;
                if (path) {

                    // load CAT project
                    project = _project.load({path: path, emitter: _emitter});

                    if (project) {

                        // apply project's tasks
                        if (target) {
                            target = target.toString();
                            target = target.toLowerCase();
                            task = project.getTask(target);
                            if (task) {

                                // Load CAT internal configuration
                                catconfig = _catconfig.load({project: project, task: task, grunt: grunt, emitter: _emitter});

                                // execute task
                                task.apply(catconfig);

                            } else {
                                _log.error("[CAT] No valid task named: '" + target + "', validate your cat's project configuration (catproject.json)");
                            }
                        }
                    }

                } else {
                    _log.error(msg[0]);
                    throw msg[0];

                }
            }

            _log.debug("[CAT] Initial, command line arguments: " + JSON.stringify(config));

            // TODO messages should be taken from resource
            var target, grunt, args, path,
                msg = ["[CAT] Project failed to load, No valid argument path was found"];

            _init();
            _apply();

        }
    };


}();


module.exports = function() {

    return CAT;

}();
