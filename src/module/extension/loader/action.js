var _fs = require('fs.extra'),
    _path = require('path'),
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _utils = catrequire("cat.props"),
    _typedas = require("typedas"),
    _props = catrequire("cat.props"),
    _basePlugin = require("./../Base.js"),
    _watch = require("watch");

/**
 * Dependency Loader extension for CAT
 * Mode set to 'init' the loader's 'apply' is being executed before the plugin
 *
 * @type {module.exports}
 */
module.exports = _basePlugin.ext(function () {

    var _me = this,

        /**
         *  Load CAT external extensions according to the given path
         *
         *  @param dirs The reference directories
         */
         _load = function (dirs) {
            var path;

            if (_typedas.isArray(dirs)) {
                dirs.forEach(function (dir) {
                    if (dir) {
                        try {
                            if (_fs.existsSync(dir)) {
                                path = _path.resolve(dir) + "/";
                                _me.getProject().addPluginLocations([path]);
                            }
                        } catch (e) {
                            _log.warning("[CAT Loader] Skip, No valid directory was found: '" + dir + "'");
                        }
                    }
                });
            } else {
                _log.warning(_props.get("cat.arguments.type").format("[CAT loader]", "Array"));
            }
        },

        _module = {

            /**
             * Apply the load extension
             *
             * @param config
             *      path - The base path to scan from
             */
            apply: function (config) {

                var dirs = (config ? config.path : undefined),
                    emitter = _me.getEmitter();

                _me.apply(config);

                if (!dirs) {
                    _utils.error(_props.get("cat.error.config").format("[CAT loader]"));
                }
                _load(dirs);

                emitter.emit("job.done", {status: "done"});

            },

            /**
             * Plugin initialization
             * Use base initializer
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

            },

            getPhase: function () {
                return _me.getPhase();
            }

        };

    return _module;
});