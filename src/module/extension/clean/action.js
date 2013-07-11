var _fs = require('fs.extra'),
    _path = require('path'),
    _log = require("./../../CATGlob.js").log(),
    _utils = require("./../../Utils.js"),
    _typedas = require("typedas"),
    _props = require("./../../Properties.js"),
    _stringFormat = require("string-format");

/**
 * Clean extension for CAT.
 *
 * @type {module.exports}
 */
module.exports = function () {

    var _grunt,
        _project,
        _emitter;


    function _clean(dirs) {
        if (_typedas.isArray(dirs)) {
            dirs.forEach(function(dir) {
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
            });
        } else {
            _log.warning(_props.get("cat.arguments.type").format("[clean action]", "Array"));
        }
    };

    function _apply(config) {
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
    }

    /**
     *
     *
     * @param config The passed arguments
     *          project - The project configuration object
     *          grunt - The grunt handle
     *          emitter - The emitter handle
     */
    function _init(config) {

        function _init() {

            if (!config) {
                return undefined;
            }
            _emitter = config.emitter;
            _grunt = (config.grunt || undefined);
            _project = (config.project || undefined);

        }

        // TODO create global functionality
        // global settings
        //dir = globalData.project.src.path;

        _init();

    }

    return {

        init: _init,

        /**
         * Apply the clean extension.
         *
         * @param config
         *      path - The base path to clean from
         */
        apply: _apply
    };
}();