var _global = require("./../CATGlob.js"),
    _utils = require("./../Utils.js"),
    _log = _global.log(),
    _path = require("path"),
    _fsconfig = require("./../fs/Config.js"),
    _typedas = require("typedas"),

    /**
     * CAT Configuration class
     */
    _CATConfig = function (externalConfig, data) {

        var path, extimp,
            me = this,
            project = externalConfig.project,
            task = externalConfig.task,
            taskExtensions = task.extenstions;

        function _isSupportedExtensions(extensionName, taskExtensions) {
            if (task && extensionName) {
                if (_utils.contains(taskExtensions, extensionName)){
                    return true;
                }
            }
            return false;
        }

        this.extmap = {};
        this.extensions = data.extensions,
            this.plugins = data.plugins;

        if (this.extensions && _typedas.isArray(this.extensions)) {

            // Load all CAT extensions
            this.extensions.forEach(function (ext) {
                if (ext && ext.name && _isSupportedExtensions(ext.name, taskExtensions)) {
                    path = ["../../../", ext.impl].join("/");
                    path = _path.normalize(path);
                    extimp = me.extmap[ext.name] = {impl:null};
                    try {
                        extimp.impl = require(path);
                        if (extimp.impl) {
                            if (extimp.impl.init) {
                                extimp.impl.init(externalConfig);
                            } else {
                                _log.warning("[CAT Config Loader] Extension, '" + ext.name + "' has no valid interface: 'init' ");
                            }
                        }

                    } catch (e) {
                        _log.error("[CAT Config Loader] Failed to load required class: " + path + "; " + e);
                    }
                }
            });
        }
    };


_loadCATConfig = function (externalConfig, path) {

    var catconfig;
    try {
        (new _fsconfig(path, function (data) {
            if (data) {

                catconfig = new _CATConfig(externalConfig, data);

            } else {
                _log.error("[CAT Config Loader] Cannot read cat configuration file [cat.json]");
            }
        }));
    } catch (e) {
        _log.error("[CAT Config Loader] error occurred, no valid cat configuration file [cat.json]"  + e);
    }

    return catconfig;
};


module.exports = function () {

    return {
        /**
         * Loading internal CAT configuration
         * @param externalConfig
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