var _typedas = require('typedas'),
    _Action = require("./Action.js"),
    _Extension = require("./Extension.js"),
    _Task = require("./Task.js"),
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _utils = catrequire("cat.utils"),
    _props = catrequire("cat.props"),
    _fs = require("fs.extra"),
    _path = require("path"),

    /**
     * Configuration Class
     *
     * Getting the incoming data from the catproject.json file
     * and instantiating the Configuration class based on that data.
     *
     * @param config The configuration:
     *              data - the configuration data input that is the catproject.json content
     *              emitter - the emitter reference
     * @returns {*}
     * @constructor
     */
     Config = function (config) {

        var _cathome = _global.get("home"),
            actions = [], tasks = [], extensions = [],
            vars = {
                actions: actions,
                tasks: tasks,
                extensions: extensions
            },
            map = {tasks: {}, actions: {}, extensions: {}},
            actionsConfig,
            tasksConfig,
            emitter = config.emitter,
            data = config.data,
            me = this;


        if (!data) {
            _utils.error(_props.get("cat.error.config").format("[CAT Config]"));
            return undefined;
        }

        // init the entity properties
        this.name = data.name;
        this.base = data.base;
        this.actions = actions;
        this.extensions = extensions;
        this.tasks = tasks;
        this.pluginPaths = [];
        this.info = {};


        this._get = function(key) {

            var val;

            if (key === "me") {
                val = me;
            } else if (key === "map") {
                val = map;
            }

            return val;
        };

        this._appendEntity = function(entity, data) {

            if (entity === "plugins") {
                _pluginsSetup(data);
                _initIndexing("actions");

            } else if (entity === "extensions" || entity === "dependencies") {
                _dependenciesSetup(data);
                _initIndexing("extensions");

            } else if (entity === "tasks") {
                _tasksSetup(data);
                _initIndexing("tasks");
            }
        };

        /**
         * Configuration indexing
         *
         * @private
         */
        function _initIndexing(entity) {

            function initModule(name) {
                var obj = vars[name];
                if (obj) {
                    obj.forEach(function (item) {
                        if (item) {
                            if (!item.name) {
                                _log.error("[CAT Config] Missing property 'name' for action configuration ");
                            }
                            if (map[name]) {
                                map[name][item.name] = item;
                            }
                        }
                    });
                }
            }

            // Array configuration entry goes in here
            if (entity) {
                initModule(entity);

            } else {
                initModule("actions");
                initModule("tasks");
                initModule("extensions");
            }
        }

        /**
         * Prepare the project skeleton
         *
         * @private
         */
        function _postCreation() {

            var workpath = _cathome.working.path,
                sourcefolder,
                sourcePath;

            function _mkEnvDir(prop) {
                var commonpath;

                if (prop) {
                    sourcePath = _utils.resolveObject(data, prop);
                    sourcefolder = _path.normalize([workpath, sourcePath].join("/"));
                    if (sourcefolder) {
                        if (!_fs.existsSync(sourcefolder)) {
                            _utils.mkdirSync(sourcefolder);
                        } else {
                            _log.debug(_props.get("cat.project.resource.exists").format("[cat config]", sourcefolder));
                        }

                        // add common folder for the custom user classes
                        if (prop === "source") {
                            commonpath = _path.join(sourcefolder, "common");
                            if (!_fs.existsSync(commonpath)) {
                                _utils.mkdirSync(commonpath);

                                // copy source's resources to the project
                                // TODO copy recursive sync...
                                _utils.copySync(_path.join(_cathome.path, "src/module/project/src/common/README.txt"), _path.join(commonpath, "README.txt"));
                            }
                        }

                        me.info[prop] = sourcefolder;
                    }

                }
            }


            function _setInfoData(props) {

                props.forEach(function(prop) {
                    if (prop) {
                        me.info[prop] = data[prop];
                    }
                });
            }

            // create project's src folder
            _mkEnvDir("source");

            // create target project's folder
            _mkEnvDir("target");

            // set the info properties incoming from the cat's project
            _setInfoData(["host", "port", "appserver", "apppath"]);

        }

        function _tasksSetup(entityData) {

            // -- setting tasks configuration
            tasksConfig = (entityData ? entityData : data.tasks);
            if (tasksConfig &&
                _typedas.isArray(tasksConfig)) {
                tasksConfig.forEach(function (item) {
                    if (item) {
                        if (!(item.name && map.tasks[item.name])) {
                            tasks.push(new _Task({data: item, emitter: emitter, global: data, catconfig: me}));
                        }
                    }
                });
            } else {
                _log.warning("[CAT Config] Missing 'tasks' configuration section");
            }
        }

        function _pluginsSetup(entityData) {

            // -- setting plugins configuration
            actionsConfig = (entityData ?  entityData : data.plugins);
            if (actionsConfig &&
                _typedas.isArray(actionsConfig)) {
                actionsConfig.forEach(function (item) {
                    if (item) {
                        if (!(item.name && map.actions[item.name])) {
                            actions.push(new _Action({data: item, emitter: emitter, global: data, catconfig: me}));
                        }
                    }
                });
            } else {
                _log.warning("[CAT Config] Missing 'plugins' configuration section");
            }
        }

        function _dependenciesSetup(entityData) {

            // -- setting extensions dependencies configuration
            var extensionsConfig = (entityData ? entityData : (data.extensions || data.dependencies));
            if (extensionsConfig &&
                _typedas.isArray(extensionsConfig)) {
                extensionsConfig.forEach(function (item) {
                    if (item) {
                        if (!(item.name && map.extensions[item.name])) {
                            extensions.push(new _Extension({data: item, emitter: emitter, global: data, catconfig: me}));
                        }
                    }
                });

//                if (!entityData) {
//                    // push default manager extension - only in the first init phase
//                    extensions.push(new _Extension({data: {
//                        name: "manager",
//                        type: "manager"
//                    }, emitter: emitter, global: data, catconfig: me}));
//                }

            } else {
                _log.warning("[CAT Config] Missing 'dependencies' configuration section");
            }
        }

        function _main() {

            _tasksSetup();

            _pluginsSetup();

            _dependenciesSetup();

            // indexing the objects arrays [actions, tasks, etc..]
            _initIndexing();

            // create target skeleton project
            _postCreation();

        }

        _main();

        return this;
    };


Config.prototype.destroy = function () {

};

/**
 * Append additional entries to the existing data (extensions | tasks | plugins)
 *
 */
Config.prototype.appendEntity = function(entity, data) {
    this._appendEntity(entity, data);
};

/**
 * Get a task by key
 *
 * @param key
 * @returns {*}
 */
Config.prototype.getTask = function (key) {
    var map = this._get("map");
    if (key && map.tasks) {
        return map.tasks[key];
    }
};

/**
 * Get an Action by key
 *
 * @param key
 * @returns {*}
 */
Config.prototype.getAction = function (key) {
    var map = this._get("map"),
        plugin;

    if (key && map.actions) {
        plugin = map.actions[key];

        if (!plugin) {
            // look at the loaded libraries
            plugin = this.pluginLookup(key);
            if (plugin) {
                this._appendEntity("plugins", [{
                    name: key,
                    type: key
                }]);
            }
            plugin = map.actions[key];
        }
        return plugin;
    }
};

/**
 * Get an Extension by key
 *
 * @param key
 */
Config.prototype.getExtension = function (key) {
    var map = this._get("map");
    if (key && map.extensions) {
        return map.extensions[key];
    }
};

/**
 * Add plugin bundle locations
 *
 * @param paths The locations to be added
 */
Config.prototype.addPluginLocations = function (paths) {
    var me = this._get("me");
    if (_typedas.isArray(paths)) {
        me.pluginPaths = me.pluginPaths.concat(paths);
    } else {
        _utils.error(_props.get("cat.arguments.type").format("[cat config]", "Array"));
    }
};

/**
 * Look for plugin on all given locations, by type
 * Note: in case of plugin type duplication, the first counts
 *
 * @param pluginType The plugin type
 * @returns {string}
 */
Config.prototype.pluginLookup = function (pluginType) {
    var me = this._get("me"),
        plugin,
        module,
        pluginTypePaths = me.pluginPaths,
        idx = 0, size = pluginTypePaths.length, item;

    for (; idx < size; idx++) {
        item = pluginTypePaths[idx];
        if (item) {
            try {
                module = [item, pluginType , ".js"].join("");
                module = _path.normalize(module);
                if (_fs.existsSync(module)) {
                    plugin = require(module);
                    break;
                }
            } catch (e) {
                _utils.error(_props.get("cat.error.require.module").format("[cat config]", module));
            }
        }
    }

    return plugin;
};

Config.prototype.getTargetFolder = function () {
    return _path.join(_global.get("home").working.path, "target", this.name);
};

Config.prototype.getInfo = function (key) {
    var resolve = _utils.resolveObject(this.info, key);
    if (!resolve) {
        _log.warning(_props.get("cat.error.config.missing").format("[cat config]", key));
    }
    return resolve;
};

Config.prototype.setInfo = function (key, value) {
    return this.info[key] = value;
};

Config.prototype.getPort = function () {
    var port = this.getInfo("appserver.port") || this.getInfo("port");
    return (port || "8089");
};

Config.prototype.getHost = function () {
    return this.getInfo("appserver.host") || this.getInfo("host");
};

Config.prototype.getProtocol = function () {
    var protocol = this.getInfo("appserver.protocol") || this.getInfo("protocol");
    return (protocol || "http://");
};

Config.prototype.getAddress = function () {

    var host, port, protocol;

    // try getting the app server info
    host =  this.getHost();
    port =  this.getPort();
    protocol =  this.getProtocol();

    if (!host || !port) {
        _log.warning("[CAT project config] Missing configuration properties: 'host' and/or 'port' (see catproject.json)");
        return undefined;
    }

    return [protocol, "://", host, ":", port].join("");

};

Config.prototype.update = function (config) {

    var entity, data;
    if (config) {
        if ("data" in config) {
            data = config.data;
            if (data) {
                for (entity in data) {
                    this._appendEntity(entity, data[entity]);
                }
            }
        }
    }
};


module.exports = Config;