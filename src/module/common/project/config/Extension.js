var _log = require("../../../CATGlob.js").log();

/**
 * Extension configuration class
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
            this.path = data.path;

            /**
             * Apply Extension
             *
             * @param internalConfig The CAT internal configuration
             */
            this.apply = function(internalConfig) {
                var extensionobj;

                if (me.type) {
                    extensionobj = internalConfig.getExtension(me.type);
                    if (extensionobj) {
                        extensionobj.apply({path: me.path});
                    }

                }
            };


        } else {
            _log.warning("[Extension] No valid data configuration");
        }
    }

    return this;

};
