var _log = require("../../../CATGlob.js").log(),
    _typedas = require("typedas");

/**
 * Task configuration class
 *
 * @param config The configuration:
 *              data - the configuration data
 *              global - The global data configuration
 *              emitter - The emitter reference
 * @returns {*}
 * @constructor
 */
module.exports = function (config) {

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
            this.extensions = data.extensions;
            this.actions = data.plugins;

            /**
             * Apply task:
             *      - load dependencies
             *      - call dependencies
             * @param internalConfig The CAT internal configuration
             */
            this.apply = function (internalConfig) {
                var actionobj,
                    extensionConfig;

                if (!me.actions) {
                    _log.error("[CAT] No actions for task: " + this.name);
                } else {

                    // apply all plugins
                    if (_typedas.isArray(me.actions)) {
                        me.actions.forEach(function (action) {
                            if (action) {
                                actionobj = catconfig.getAction(action);
                                actionobj.apply(internalConfig);
                            }
                        });
                    }

                    // apply all extensions
                    if (_typedas.isArray(me.extensions)) {
                        me.extensions.forEach(function (ext) {
                            if (ext) {
                                extensionConfig = catconfig.getExtension(ext);
                                extensionConfig.apply(internalConfig);
                            }
                        });


                    }
                }
            }
        }

    }

    return this;

};
