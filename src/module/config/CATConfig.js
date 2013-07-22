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

        var path, extimp,
            me = this,
            project = externalConfig.project,
            task = externalConfig.task,
            idx= 0, size;

        /* @deprecated
        function _isSupportedExtensions(extensionName, taskExtensions) {
            var taskExtensionsTypes = [],
                project = (externalConfig ? externalConfig.project : undefined);
            if (project && taskExtensions && extensionName) {
                taskExtensions.forEach(function(item){
                    var extensionRealType = project.getExtension(item);
                    if (!extensionRealType) {
                        _utils.error(_props.get("cat.error.config.ext").format("[CAT config loader]", item));
                    }
                    taskExtensionsTypes.push(extensionRealType.type);
                });
                if (_utils.contains(taskExtensionsTypes, extensionName)){
                    return true;
                }
            }
            return false;
        }*/

        /**
         * Extension initialization
         *
         * @param ext
         * @private
         */
        function _extension(ext) {
            var mode = (ext.mode || "default"),
                supportedExt = false;

            /*  not in use
                if (mode === "default") {
                    supportedExt  = _isSupportedExtensions(ext.name, taskExtensions);
                }
             */

            if (ext && ext.name) {
               // path = ["../../../", ext.impl].join("/");
               // path = _path.normalize(path);
              //  me.extmap[ext.name] = null;
//                try {
                    me.extmap[ext.name] = {externalConfig: externalConfig, ext: ext, ref: null};
                    //  extimp = me.extmap[ext.name] = require(path);
//                    if (extimp) {
//                        if (extimp.init) {
//                            extimp.init(externalConfig, ext);
//                        } else {
//                            _log.warning(_props.get("cat.config.interface").format("[CAT Config Loader]", ext.name, "init"));
//                        }
//                    }

//                } catch (e) {
//                    _log.error(_props.get("cat.error.class").format("[CAT Config Loader]", path), e);
//                }
            }
        };

        this.extmap = {};

        this.getExtension = function(key) {
            if (key) {
                return me.extmap[key];
            }
        };

       this.extensions = data.extensions,
            this.plugins = data.plugins;

        if (this.extensions && _typedas.isArray(this.extensions)) {

            // Load all CAT extensions

            size = this.extensions.length;
            for (; idx<size; idx++) {
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