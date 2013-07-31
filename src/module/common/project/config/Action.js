var _log = require("../../../CATGlob.js").log(),
    _typedas = require("typedas"),
    _Filter = require("./Filter.js");

/**
 * (Plugin) Action configuration class
 *
 * @param config The configuration:
 *              data - the configuration data
 *              global - The global data configuration
 *              emitter - The emitter reference
 * @returns {*}
 * @constructor
 */
module.exports = function (config) {

    var filters,
        me = this,
        data, emitter, global, catconfig;

    this.filters = [];

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
            this.dependency = data.dependency;
            this.data = data;

            /**
             * Apply Action
             *
             * @param internalConfig The CAT internal configuration
             */
            this.apply = function(internalConfig) {
                var target = (me.type || me.name);

                _log.info("[CAT] running target: " + target);

                // Load action per type
                if (target) {
                    _log.debug("[Action] Instantiating action: " + target);
                    try {
                        me.ref = catconfig.pluginLookup(target);
                        if (me.ref) {
                            me.action = new me.ref();
                        }
                        if (me.action) {
                            // Action initialization
                            me.action.init({data: me, emitter: emitter, global: global, internalConfig: internalConfig});
                        }
                    } catch (e) {
                        _log.error("[Action] action type not found or failed to load module ", e);
                    }
                }
            };


            // go over the filter configuration
            filters = (data.filters || undefined);
            if (filters) {
                filters.forEach(function (item) {
                    if (item) {
                        me.filters.push(new _Filter(item));
                    }
                });
            }


        } else {
            _log.warning("[Action] No valid data configuration");
        }
    }

    return this;

};
