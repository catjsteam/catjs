var _typedas = require('typedas'),
    _Action = require("./Action.js"),
    _Extension = require("./Extension.js"),
    _Task = require("./Task.js"),
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _utils = catrequire("cat.utils"),
    _props = catrequire("cat.props"),
    _fs = require("fs.extra"),
    _path = require("path");

/**
 * Configuration Class
 *
 * @param config The configuration:
 *              data - the configuration data
 *              emitter - the emitter reference
 * @returns {*}
 * @constructor
 */
module.exports = function Config(config) {

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
            sourcefolder, targetFolder, tplPath,
            sourcePath, targetPath, libPath;

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

    }

    if (!data || !(data && data.plugins)) {
        _utils.error(_props.get("cat.error.config").format("[CAT Config]"));
        return undefined;
    }

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
        _log.warning("[CAT Config] Missing 'actions' configuration section");
    }

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
        _log.warning("[CAT Config] Missing 'actions' configuration section");
    }

    // init the entity properties
    this.name = data.name;
    this.base = data.base;
    this.actions = actions;
    this.extensions = extensions;
    this.tasks = tasks;
    this.pluginPaths = [];
    this.info = {};

    // indexing the objects arrays [actions, tasks, etc..]
    _initIndexing();
    // create target skeleton project
    _postCreation();

    this.destroy = function() {

    };

    /**
     * Get a task by key
     *
     * @param key
     * @returns {*}
     */
    this.getTask = function (key) {
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
    this.getAction = function (key) {
        if (key && map.actions) {
            return map.actions[key];
        }
    };

    /**
     * Get an Extension by key
     *
     * @param key
     */
    this.getExtension = function (key) {
        if (key && map.extensions) {
            return map.extensions[key];
        }
    };

    /**
     * Add plugin bundle locations
     *
     * @param paths The locations to be added
     */
    this.addPluginLocations = function (paths) {
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
    this.pluginLookup = function (pluginType) {

        var plugin,
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

    this.getTargetFolder = function() {
        return _path.join(_global.get("home").working.path, "target", this.name);
    };

    this.getInfo = function (key) {
        if (!this.info[key]) {
            _log.error(_props.get("cat.error.config.missing").format("[cat config]", key));
        }
        return this.info[key];
    };

    this.setInfo = function (key, value) {
        return this.info[key] = value;
    };

    return this;
};