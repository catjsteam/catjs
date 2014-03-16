var _global = catrequire("cat.global"),
    _utils = catrequire("cat.utils"),
    _log = _global.log(),
    _path = require("path"),
    _fsconfig = catrequire("cat.config.utils"),
    _typedas = require("typedas"),
    _props = catrequire("cat.props"),
    _watch = catrequire("cat.watch"),
    _catconfig,
    _loadCATConfig,

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
            idx = 0, size, project, pluginsPath = [],
            dependencies = [],
            appTargetPath, appPath, projectcopy, customTasks;

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
                };
                me._extmap[ext.name] = {externalConfig: externalConfig, ext: ext, ref: null};
            }
        }

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

                    if (data && data.extensions) {
                        data.extensions.forEach(function(ext) {
                            if (ext && ext.name) {
                                dependencies.push({
                                    name: ext.name,
                                    type: ext.name
                                });
                            }
                        });
                        // add internal extensions info
                        project.appendEntity("dependencies", dependencies);
                    }

                    // set environment info
                    project.setInfo("template", this.env.template);
                    project.setInfo("libraries", this.env.libraries);
                    this.plugins.forEach(function(path){
                        pluginsPath.push(_path.join(cathome, path));
                    });
                    project.addPluginLocations(pluginsPath);

                    customTasks = [];
                    appTargetPath = _path.join("./", _path.relative(_path.resolve("."), project.getInfo("target")), project.name);
                    appPath = project.getInfo("apppath");
                    if (appPath) {
                        projectcopy= {
                            "name": "p@project.copy",
                            "type": "copy",
                            "dependency": "scan",
                            "path": appPath,
                            "from": {
                                "path": "/"
                            },
                            "to": {
                                "path": appTargetPath
                            }
                        };
                        customTasks.push(projectcopy);

                    } else  {
                        _utils.log("error", "[CAT config] 'apppath property is missing or not valid. See catproject.json spec")
                    }

                    customTasks = customTasks.concat([
                        {
                            "name": "p@lib.copy",
                            "type": "copy",
                            "dependency": "scan",
                            "path": "./lib",
                            "from": {
                                "path": "/"
                            },
                            "to": {
                                "path": appTargetPath
                            }
                        },
                        {
                            "name": "p@project.minify",
                            "type": "minify",
                            "path": appTargetPath,
                            "filename": "cat.src.js",
                            "src":["./src/**/*.js"]
                        }
                        ]);
                    project.appendEntity("plugins", customTasks);


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