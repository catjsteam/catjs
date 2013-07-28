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

    var actions = [], tasks = [], extensions = [],
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

        initModule("actions");
        initModule("tasks");
        initModule("extensions");
    }

    function _postCreation() {
        var workpath = _global.get("home").working.path,
            targetfolder, targetPath;

        // create project's src folder
        targetfolder = _path.normalize([workpath, "src"].join("/"));
        if (targetfolder) {
            if (!_fs.existsSync(targetfolder)) {
                _utils.mkdirSync(targetfolder);
            } else {
                _log.debug(_props.get("cat.project.resource.exists").format("[cat project]", targetfolder));
            }
            me.info.srcFolder = targetfolder;
        }

        // create target project's folder
        targetPath = [workpath, "target"].join("/");
        if (targetPath) {
            if (!_fs.existsSync(targetPath)) {
                _utils.mkdirSync(targetPath);
            } else {
                _log.debug(_props.get("cat.project.resource.exists").format("[cat project]", targetfolder));
            }
            me.info.targetFolder = targetPath;
        }
    }

    if (!data || !(data && data.plugins)) {
        _log.error("[CAT Config] no valid configuration");
        return undefined;
    }

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

    extensionsConfig = (data.extensions || data.dependencies);
    if (extensionsConfig &&
        _typedas.isArray(extensionsConfig)) {
        extensionsConfig.forEach(function (item) {
            if (item) {
                extensions.push(new _Extension({data: item, emitter: emitter, global: data, catconfig: me}));
            }
        });
    } else {
        _log.warning("[CAT Config] Missing 'actions' configuration section");
    }

    // init the entity properties
    this.name = data.name;
    this.base = data.base;
    this.actions = actions;
    this.extensions = extensions;
    this.tasks = tasks;
    this.pluginPaths = [[_global.get("home").path, "src/module/common/plugin/"].join("/")];
    this.info = {};

    // indexing the objects arrays [actions, tasks]
    _initIndexing();
    // create target skeleton project
    _postCreation();

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
            _util.error(_props.get("cat.arguments.type").format("[cat config]", "Array"));
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

    this.getInfo = function () {
        return this.info;
    };

    this.update = function (config) {


    };


    return this;
};