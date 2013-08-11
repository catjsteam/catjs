var _global = catrequire("cat.global"),
    _utils = catrequire("cat.utils"),
    _log = _global.log(),
    _path = require("path"),
    _fsconfig = require("./../fs/Config.js"),
    _typedas = require("typedas"),
    _props = catrequire("cat.props"),
    _watch = catrequire("cat.watch"),
    _catconfig,

    /**
     * CAT Configuration class
     *
     * Loads CAT internal configuration from resources/cat.json file
     *  and creates a configuration instance
     *
     * @param externalConfig The passed configuration
     *          emitter - The emitter reference
     *          project - Cat project
     *          grunt - The grunt reference (if available)
     *
     * @param data The incoming row configuration data
     */
     _CATConfig = function (externalConfig, data) {

        var me = this,
            idx = 0, size, project;

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
        this.extensions = data.extensions;
        this.plugins = data.plugins;
        this.externalConfig = externalConfig;

        if (this.extensions) {

            if (_typedas.isArray(this.extensions)) {
                // Index the extensions entries
                size = this.extensions.length;
                for (; idx < size; idx++) {
                    _extension(this.extensions[idx]);
                }
            }

            // load CAT environment variables and update the project class
            this.env = data.env;
            if (this.externalConfig) {
                project = this.externalConfig.project;
                if (project) {
                    project.setInfo("template", this.env.template);
                } else {
                    _log.warning(_props.get("cat.project.env.failed").format("[CAT Config Loader]"));
                }
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

    _CATConfig.prototype.getExtension = function (key) {
        if (key && this._extmap) {
            return this._extmap[key];
        }
    };

    /**
     *  TODO move any externalConfig direct access properties to use this function
     *
     * @returns {*}
     */
    _CATConfig.prototype.getProject = function () {
        if ( this.externalConfig) {
            return  this.externalConfig.project;
        }
    };

    /**
     *  TODO move any externalConfig direct access properties to use this function
     *
     * @returns {*}
     */
    _CATConfig.prototype.getGrunt = function () {
        if ( this.externalConfig) {
            return  this.externalConfig.grunt;
        }
    };

    /**
     *  TODO move any externalConfig direct access properties to use this function
     *
     * @returns {*}
     */
    _CATConfig.prototype.getEmitter = function () {
        if ( this.externalConfig) {
            return  this.externalConfig.emitter;
        }
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

            var path = [cathome, "resources/cat.json"].join("/");

            return _loadCATConfig(externalConfig, path);
        }
    };
}();