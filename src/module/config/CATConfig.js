var _global = require("./../CATGlob.js"),
    _utils = require("./../Utils.js"),
    _log = _global.log(),
    _path = require("path"),
    _fsconfig = require("./../fs/Config.js"),
    _typedas = require("typedas"),
    _props = require("./../Properties.js"),

    _catconfig,
    /**
     * CAT Configuration class
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
            var mode = (ext.mode || "default"),
                supportedExt = false;


            if (ext && ext.name) {
                me.extmap[ext.name] = {externalConfig: externalConfig, ext: ext, ref: null};
            }
        };

        this.extmap = {};

        this.getExtension = function (key) {
            if (key) {
                return me.extmap[key];
            }
        };

        this.extensions = data.extensions,
            this.plugins = data.plugins;

        if (this.extensions && _typedas.isArray(this.extensions)) {

            // Load all CAT extensions

            size = this.extensions.length;
            for (; idx < size; idx++) {
                _extension(this.extensions[idx]);
            }
        }
    };


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
         */
        load: function (externalConfig) {
            var home = _global.get("home"),
                path = [home.path, "resources/cat.json"].join("/");
            return _loadCATConfig(externalConfig, path);
        }
    };
}();