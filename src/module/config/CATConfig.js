var _global = require("./../CATGlob.js"),
    _utils = require("./../Utils.js"),
    _log = _global.log(),
    _path = require("path"),
    _fsconfig = require("./../fs/Config.js"),
    _typedas = require("typedas"),
    _props = require("./../Properties.js"),
    _watch = catrequire("cat.watch"),
    _catconfig,

    /**
     * CAT Configuration class
     *
     * @param externalConfig
     * @param data The incoming row configuration data
     */
     _CATConfig = function (externalConfig, data) {

        var me = this,
            idx = 0, size;

        /**
         * Extension initialization
         *
         * @param ext
         * @private
         */
        function _extension(ext) {
            if (ext && ext.name) {

                ext.getPhase = function() {
                    return (ext.phase || "default");
                }
                me._extmap[ext.name] = {externalConfig: externalConfig, ext: ext, ref: null};
            }
        };

        this._extmap = {};
        this._watch = {};

        this.getExtension = function (key) {
            if (key) {
                return me._extmap[key];
            }
        };

        this.extensions = data.extensions;
        this.plugins = data.plugins;
        this.externalConfig = externalConfig;

        if (this.extensions && _typedas.isArray(this.extensions)) {

            // Load all CAT extensions

            size = this.extensions.length;
            for (; idx < size; idx++) {
                _extension(this.extensions[idx]);
            }
        }
    };

    /**
     *  Sync configuration for a single task.
     *  e.g. scan that applied for scanning a deep folder gets to process one file.
     *
     * @param config
     */
    _CATConfig.prototype.watch = function(config) {
        this._watch.impl = config.impl;
    };

    _CATConfig.prototype.getWatch = function() {
        return this._watch.impl;
    };

    _CATConfig.prototype.isWatch = function() {
        return (this._watch.impl ? true : false);
    };

/**
 * Load cat.json internal configuration file
 * CAT configuration include the internal extensions meta data.
 *
 * @param externalConfig
 * @param path
 * @returns {*}
 * @private
 */
_loadCATConfig = function (externalConfig, path) {

    try {
        (new _fsconfig(path, function (data) {
            if (data) {

                _catconfig = new _CATConfig(externalConfig, data);

            } else {
                _log.error(_props.get("cat.error.config").format("[CAT Config Loader]"));
            }
        }));
    } catch (e) {
        _log.error(_props.get("cat.error.config").format("[CAT Config Loader]"), e);
    }

    return _catconfig;
};


module.exports = function () {

    return {
        /**
         * Loading internal CAT configuration
         *
         * @param externalConfig The configuration to be passed for all config classes
         *      - emitter The emitter reference
         *      - grunt The grunt reference
         *      - project The current running project
         */
        load: function (externalConfig) {

            var home = _global.get("home"),
                path = [home.path, "resources/cat.json"].join("/");

            return _loadCATConfig(externalConfig, path);
        }
    };
}();