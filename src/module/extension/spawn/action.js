var _fs = require('fs.extra'),
    _path = require('path'),
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _process = require('child_process'),
    _basePlugin = require("./../Base.js");

/**
 * Spawn extension for CAT
 *
 * @type {module.exports}
 */
module.exports = _basePlugin.ext(function () {

    var _me = this,

        _module = {

            watch: function(config) {
                this.apply(config);
            },

            /**
             * Apply the clean extension
             *
             * @param config
             *      command - command to run
             *      options - spawn options
             */
            apply: function (config) {
                _me.getEmitter().emit("spawn.exec", {spawn: _process.spawn});
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