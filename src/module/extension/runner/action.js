var _path = require('path'),
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _props = catrequire("cat.props"),
    _utils = catrequire("cat.utils"),
    _basePlugin = require("./../Base.js"),
    _runner = require("./runner.js");

/**
 * Clean extension for CAT
 *
 * @type {module.exports}
 */
module.exports = _basePlugin.ext(function () {

    var _me = this,

        _module = {

            watch: function() {

            },

            /**
             * Apply the clean extension.
             *
             * @param config
             *      path - The base path to clean from
             */
            apply: function (config) {

                var dirs = (config ? config.path : undefined),
                    error = "[Scan Ext] no valid configuration for 'apply' functionality",
                    emitter = _me.getEmitter();

                _me.apply(config);

                if (!dirs) {
                    _utils.error(error);
                }

                emitter.emit("runner", {thiz: _me, runner: _runner});

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