var _fs = require('fs.extra'),
    _path = require('path'),
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _utils = catrequire("cat.utils"),
    _typedas = require("typedas"),
    _props = catrequire("cat.props");

/**
 * Clean extension for CAT
 *
 * @type {module.exports}
 */
module.exports = function () {

    var _grunt,
        _project,
        _emitter,


        /**
         * Clean the artifacts according to the given path
         *
         * @param dirs The path to be cleaned
         * @returns {undefined}
         * @private
         */
         _clean = function (dirs) {

            function _delete(dir) {
                if (dir) {
                    try {
                        if (_fs.existsSync(dir)) {
                            _fs.rmrf(dir, function (err) {
                                if (err) {
                                    _utils.error(_props.get("cat.error").format("[clean action]", e));
                                }
                            });
                        }
                    } catch (e) {
                        _utils.error(_props.get("cat.error").format("[clean action]", e));
                    }
                }
            }

            if (!dirs) {

                _utils.error(_props.get("cat.arguments.missing").format("[cat action]", "dirs"));
                return undefined;
            }

            if (_typedas.isArray(dirs)) {
                dirs.forEach(function (dir) {
                    _delete(dir);
                });
            } else if (_typedas.isString(dirs)) {
                _delete(dirs);

            } else {
                _log.warning(_props.get("cat.arguments").format("[clean action]", typeof(dirs)));
            }

            _delete([_global.get("home").working.path, "_cat_md.json"].join("/"));
        },

        /**
         * Apply the clean extension.
         *
         * @param config
         *      path - The base path to clean from
         */
         _apply = function (config) {
            var dirs = (config ? config.path : undefined),
                error = "[Scan Ext] no valid configuration for 'apply' functionality";

            if (!dirs) {
                _utils.error(error);
            }
            _clean(dirs);

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