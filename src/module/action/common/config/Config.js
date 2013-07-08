var _typedas = require('typedas'),
    _Action = require("./Action"),
    _Task = require("./Task"),
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

    var actions = [], tasks = [],
        vars = {
            actions: actions,
            tasks: tasks
        },
        map = {tasks: {}, actions: {}},
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
    }

    if (!data || !(data && data.actions)) {
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

    actionsConfig = data.actions;
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

    // init the entity properties
    this.name = data.name;
    this.base = data.base;
    this.actions = actions;
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

    return this;
};