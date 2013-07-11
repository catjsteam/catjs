var _typedas = require('typedas'),
    _Action = require("./Action.js"),
    _Extension = require("./Extension.js"),
    _Task = require("./Task.js"),
    _log = require("../../../CATGlob.js").log();

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
        map = {tasks: {}, actions: {}, extensions:{}},
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

    // indexing the objects arrays [actions, tasks]
    _initIndexing();

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
    this.getExtension = function(key) {
        if (key && map.extensions) {
            return map.extensions[key];
        }
    }

    return this;
};