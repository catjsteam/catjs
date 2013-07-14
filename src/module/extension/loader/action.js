var _fs = require('fs.extra'),
    _path = require('path'),
    _log = require("./../../CATGlob.js").log(),
    _utils = require("./../../Utils.js"),
    _typedas = require("typedas"),
    _props = require("./../../Properties.js");

/**
 * Dependency Loader extension for CAT.
 * Mode set to 'init' the loader's 'apply' is being executed before the plugin.
 *
 * @type {module.exports}
 */
module.exports = function () {

    var _grunt,
        _project,
        _emitter,
        _phase,
        _mode;


    function _load(dirs) {
        var path;

        if (_typedas.isArray(dirs)) {
            dirs.forEach(function(dir) {
                if (dir) {
                    try {
                        if (_fs.existsSync(dir)) {
                            path = _path.resolve(dir) + "/";
                            _project.addPluginLocations([path]);
                        }
                    } catch (e) {
                        _utils.error(_props.get("cat.error").format("[scrap ext]", e));
                    }
                }
            });
        } else {
            _log.warning(_props.get("cat.arguments.type").format("[scrap ext]", "Array"));
        }
    };

    function _apply(config) {
        var dirs = (config ? config.path : undefined);

        if (!dirs) {
            _utils.error(_props.get("cat.error.config").format("[scrap ext]"));
        }
        _load(dirs);

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
     * @param ext The extension properties
     */
    function _init(config, ext) {

        function _init() {

            if (!config) {
                return undefined;
            }
            _emitter = config.emitter;
            _grunt = config.grunt;
            _project = config.project;
            _phase = ext.phase;
            _mode = ext.mode;


        }

        _init();

    }

    return {

        init: _init,

        apply: _apply,

        getPhase: function() {
            return _phase;
        }
    };
}();