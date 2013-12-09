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
            extensionsConfig,
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

        /**
         * Configuration indexing
         *
         * @private
         */
        function _initIndexing() {

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
            initModule("actions");
            initModule("tasks");
            initModule("extensions");
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
                if (prop) {
                    sourcePath = _utils.resolveObject(data.env, prop);
                    sourcefolder = _path.normalize([workpath, sourcePath].join("/"));
                    if (sourcefolder) {
                        if (!_fs.existsSync(sourcefolder)) {
                            _utils.mkdirSync(sourcefolder);
                        } else {
                            _log.debug(_props.get("cat.project.resource.exists").format("[cat config]", sourcefolder));
                        }
                        me.info[prop] = sourcefolder;
                    }

                }
            }

            // -- setting environment info
            // setting env data
            if (!data.env) {
                _utils.error(_props.get("cat.error.config.missing").format("[CAT Config]", "env"));

            }

            // create project's src folder
            _mkEnvDir("source");

            // create target project's folder
            _mkEnvDir("target");

            // create lib source project's folder
            _mkEnvDir("lib.source");

            // create lib target project's folder
            _mkEnvDir("lib.target");

            // save all of the global evn info
            me.info["env"] = data.env;
        }

        function _tasksSetup() {

            // -- setting tasks configuration
            tasksConfig = data.tasks;
            if (tasksConfig &&
                _typedas.isArray(tasksConfig)) {
                tasksConfig.forEach(function (item) {
                    if (item) {
                        tasks.push(new _Task({data: item, emitter: emitter, global: data, catconfig: me}));
                    }
                });
            } else {
                _log.warning("[CAT Config] Missing 'tasks' configuration section");
            }
        }

        function _pluginsSetup() {

            // -- setting plugins configuration
            actionsConfig = data.plugins;
            if (actionsConfig &&
                _typedas.isArray(actionsConfig)) {
                actionsConfig.forEach(function (item) {
                    if (item) {
                        actions.push(new _Action({data: item, emitter: emitter, global: data, catconfig: me}));
                    }
                });
            } else {
                _log.warning("[CAT Config] Missing 'plugins' configuration section");
            }
        }

        function _dependenciesSetup() {

            // -- setting extensions dependencies configuration
            extensionsConfig = (data.extensions || data.dependencies);
            if (extensionsConfig &&
                _typedas.isArray(extensionsConfig)) {
                extensionsConfig.forEach(function (item) {
                    if (item) {
                        extensions.push(new _Extension({data: item, emitter: emitter, global: data, catconfig: me}));
                    }
                });

                // push default manager extension
                extensions.push(new _Extension({data: {
                    name: "manager",
                    type: "manager"
                }, emitter: emitter, global: data, catconfig: me}));

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
    var map = this._get("map");

    if (key && map.actions) {
        return map.actions[key];
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
    if (!this.info[key]) {
        _log.error(_props.get("cat.error.config.missing").format("[cat config]", key));
    }
    return this.info[key];
};

Config.prototype.setInfo = function (key, value) {
    return this.info[key] = value;
};

module.exports = Config;