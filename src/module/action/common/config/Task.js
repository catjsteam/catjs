var _log = require("../../../CATGlob.js").log(),
    _typedas = require("typedas");

/**
 * Action configuration class
 *
 * @param config The configuration:
 *              data - the configuration data
 *              global - The global data configuration
 *              emitter - The emitter reference
 * @returns {*}
 * @constructor
 */
module.exports = function Action(config) {

    var me = this,
        data, emitter, global, catconfig;

    // TODO Use the Task class instead
    function Task(config) {
        if (config) {
            this.name = (config.name || undefined);
            this.actions = (config.actions || undefined);
        }
    }

    function _init() {
        data = config.data;
        emitter = config.emitter;
        global = config.global;
        catconfig = config.catconfig;
    }

    if (config) {

        _init();

        if (data) {
            this.name = data.name;
            this.actions = data.actions;

            /**
             * Apply task:
             *      - load dependencies
             *      - call dependencies
             * @param internalConfig The CAT internal configuration
             */
            this.apply = function(internalConfig) {
                var actionobj
                if (!me.actions) {
                    _log.error("[CAT] No actions for task: " + this.name);
                } else {
                    if (_typedas.isArray(me.actions)) {
                        me.actions.forEach(function(action){
                           if (action) {
                               actionobj = catconfig.getAction(action);
                               actionobj.apply(internalConfig);

                           }
                        });
                    }
                }
            }
        }

    }

    return this;

};
