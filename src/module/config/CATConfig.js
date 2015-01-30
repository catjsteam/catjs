var _global = catrequire("cat.global"),
    _utils = catrequire("cat.utils"),
    _jsutils = require("js.utils"),
    _log = _global.log(),
    _path = require("path"),
    _fsconfig = catrequire("cat.config.utils"),
    _typedas = require("typedas"),
    _props = catrequire("cat.props"),
    _watch = catrequire("cat.watch"),
    _catconfig,
    _loadCATConfig,
    _catlibrary = catrequire("cat.common.library"),

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
            librariesConfig = [],
            librariesDefault = [{name: "underscore"}, {name: "js.utils"}, {name: "jspath"}, {name: "flyer"}, {name: "chai"},  {name:"cat"}],
            libraryBuildConfig, dependenciesInfo,
            appTargetPath, appPath, jshint, minifyplugin,
            scrapfilter, projectcopy,
            scrapscan, customPlugins,
            cattarget, targetfolder,
            manifest,
            libIdx= 0,
            rmIdx=-1;

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

                    customPlugins = [];                    
                    targetfolder = project.getInfo("target");
                    cattarget = (project.getInfo("cattarget") || "./");

                    appTargetPath = _path.join("./", _path.relative(_path.resolve("."), targetfolder), project.name);
                    appPath = project.getInfo("apppath");
                    
                    if (appPath) {
                        appPath = _path.resolve(appPath); 
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
                            },
                            "filters": [
                                {
                                    "type": "folder",
                                    "pattern": ["**/cat-project**", "**/cat-project/**"],
                                    "exclude": true
                                }
                            ]

                        };
                        customPlugins.push(projectcopy);

                    } else  {
                        _log.log("error", "[CAT config] 'apppath property is missing or not valid. See catproject.json spec");
                    }

                    scrapscan =   {
                        "name": "p@init.scrap",
                        "type": "scrap",
                        "dependency": "scan"
                    };

                    scrapfilter = project.getInfo("scrapfilter");
                    if (scrapfilter) {
                        scrapscan.filters = scrapfilter;
                    }
                    customPlugins.push(scrapscan);

                    jshint = project.getInfo("jshint");
                    minifyplugin = {
                        "name": "p@project.minify",
                        "type": "minify",
                        "path": _path.join(appTargetPath, cattarget, "/cat/lib/cat"),
                        "filename": "cat.src.js",
                        "src":[["./cache/",  project.name, "/**/*.js"].join(""),["./src/",  project.name, "/**/*.js"].join(""), "./src/common/**/*.js"]
                    };
                    if (jshint) {
                        minifyplugin.jshint = jshint;
                    }
                    
                    customPlugins = customPlugins.concat([
                        {
                            "name": "p@project.wipe",
                            "type": "clean",
                            "dependency": "manager",
                            "src": ["src/" + project.name, "lib", "logs/*.log", "cache", "*.log", "*.xml", "phantom/app-view.png"]
                        },
                        {
                            "name": "p@lib.copy",
                            "type": "copy",
                            "from": {
                                "path": "./lib"
                            },
                            "to": {
                                "path": _path.join(appTargetPath, cattarget, "/cat/lib")
                            }
                        },
                        {
                            "name": "p@lib.parse",
                            "type": "fileparse",
                            "dependency": "manager",
                            "files": [_path.join(appTargetPath, cattarget, "/cat/lib/cat/cat.js")],
                            "pattern": "_getBase=\"(.*)\";",
                            "replace": "_getBase=\"" + cattarget + "\";",
                            "applyto":["content"],
                            "flags": "g"
                        },
                        {
                            "name": "p@src.copy",
                            "type": "copy",
                            "from": {
                                "path": "./src/config"
                            },
                            "to": {
                                "path": _path.join(appTargetPath, cattarget, "/cat/config")
                            }
                        }, minifyplugin                        
                        ]);

                    librariesConfig = librariesDefault;
                    librariesConfig = _catlibrary.all(librariesConfig);
                    
                    dependenciesInfo = project.getInfo("dependencies");
                    if (dependenciesInfo) {
                        dependenciesInfo = _catlibrary.all(dependenciesInfo);
                        _catlibrary.merge(dependenciesInfo, librariesConfig);
                        if (!librariesConfig || (!_typedas.isArray(librariesConfig))) {
                            librariesConfig = librariesDefault;

                        } else {
                            libIdx= 0;
                            rmIdx=-1;

                            librariesConfig.forEach(function(arg) {
                                var item = arg.name;
                                if (item === "cat") {
                                    rmIdx = libIdx;
                                }
                                libIdx++;
                            });

                            // remove "cat" if was found
                            if (rmIdx > -1) {
                                librariesConfig.splice(rmIdx, 1);
                            }

                            // set "cat" to be last
                            librariesConfig.push({name: "cat"});
                        }
                    }

                    //librariesConfig.unshift("cat.css");
                    //librariesConfig.push("cat.src.js");

                    project.setInfo("dependencies", librariesConfig);                                                  
                    
                    libraryBuildConfig = {
                        "name": "p@libraries.build",
                        "type": "libraries",
                        "dependency": "manager",
                        "imports": librariesConfig,
                        "action": "build"
                    };
                    customPlugins.push(libraryBuildConfig);

                    project.appendEntity("plugins", customPlugins);


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