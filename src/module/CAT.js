var CAT = function () {

    var _modules,
        _global,
        _stringFormat,
        _log,
        _project,
        _catconfig,
        _path,
        _properties,
        _events,
        _emitter,
        _basedir;

    (function(){

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
         * @param config
         */
        init: function (config) {

            var me = this,
                basedir,
                projectDir;

            (function(config) {

                global["cat.config.module"] = {
                    "cat.config": "src/module/config/CATConfig.js",

                    "cat.global": "src/module/CATGlob.js",
                    "cat.utils": "src/module/Utils.js",
                    "cat.project": "src/module/Project.js",
                    "cat.props": "src/module/Properties.js",
                    "cat.plugin.base": "src/module/common/plugin/Base.js",
                    "cat.mdata": "src/module/fs/MetaData.js",
                    "cat.common.scrap": "src/module/common/plugin/scrap/Scrap.js",
                    "cat.common.parser": "src/module/common/parser/Parser.js"
                };

                global.catrequire = function (module) {
                    var catconfig = global["cat.config.module"],
                        modulepath;
                    if (catconfig) {
                        modulepath = ( catconfig[module] || module );
                        modulepath = _path.normalize([projectDir, modulepath].join("/"));
                    }
                    return require(modulepath);
                };

                basedir = _basedir(config),
                projectDir = basedir.path;

                _global = catrequire("cat.global");
                _log = _global.log();

                _project = catrequire("cat.project");
                _catconfig = catrequire("cat.config");
                _properties = catrequire("cat.props");

                // initial global "home" property
                _global.set("home", basedir);


            })(config);


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
        apply: function (config) {

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

                                if (catconfig) {
                                    // execute task
                                    task.apply(catconfig);
                                }

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


module.exports = function () {

    return CAT;

}();
