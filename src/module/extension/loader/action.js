var _fs = require('fs.extra'),
    _path = require('path'),
    _log = require("./../../CATGlob.js").log(),
    _utils = require("./../../Utils.js"),
    _typedas = require("typedas"),
    _props = require("./../../Properties.js"),
    _basePlugin = require("./../Base.js");

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
                            _utils.error(_props.get("cat.error").format("[scrap ext]", e));
                        }
                    }
                });
            } else {
                _log.warning(_props.get("cat.arguments.type").format("[scrap ext]", "Array"));
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

                var dirs = (config ? config.path : undefined);

                _me.apply(config);

                if (!dirs) {
                    _utils.error(_props.get("cat.error.config").format("[scrap ext]"));
                }
                _load(dirs);
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