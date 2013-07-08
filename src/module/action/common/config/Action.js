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

    var filters,
        actionType,
        me = this,
        data, emitter, global, catconfig;

    this.filters = [];

    // TODO Use the Filter class instead
    function Filter(config) {
        if (config) {
            this.type = (config.type || undefined);
            this.ext = (config.ext || undefined);
            this.exclude = (config.exclude || undefined);
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
            this.type = data.type;
            this.to = data.to;
            this.from = data.from;

            /**
             * Apply Action
             *
             * @param internalConfig The CAT internal configuration
             */
            this.apply = function(internalConfig) {
                var target = me.type,
                    targetlib;
                _log.info("[CAT] running target: " + target);

                // Load action per type
                if (me.type) {
                    // instantiating action per type [common/action/copy, common/action/inject, etc..]
                    actionType = ["../action/", me.type , ".js"].join("");
                    _log.debug("[Scan] Instantiating action: " + actionType);
                    try {
                        me.ref = require(actionType);
                        if (me.ref) {
                            me.action = new me.ref();
                        }
                        if (me.action) {
                            // Action initialization
                            me.action.init({data: me, emitter: emitter, global: global, internalConfig: internalConfig});
                        }
                    } catch (e) {
                        _log.error("[Scan] action type not found or failed to load module ", e);
                    }
                }

//                // import the target module and call it
//                try {
//                    targetlib = require(["./action/", target, "/action.js"].join(""));
//                    if (targetlib) {
//                        if (targetlib[target] && _typedas.isFunction(targetlib[target])) {
//                            targetlib[target].call(me, {project: catconfig, emitter: emitter});
//                        } else {
//                            throw ["Error occurred, Task: ", target, "is not valid or not a function "].join("");
//                        }
//                    }
//                } catch (e) {
//                    _log.error("[CAT] Failed to run project task: " + target + " "  + e);
//                }
            };


            // go over the filter configuration
            filters = (data.filters || undefined);
            if (filters) {
                filters.forEach(function (item) {
                    if (item) {
                        me.filters.push(new Filter(item));
                    }
                });
            }


        } else {
            _log.warning("[Action] No valid data configuration");
        }
    }

    return this;

};
