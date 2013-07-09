var _utils = require("./../../../Utils.js"),
    _clazz = function(config) {

        if (!config) {
            _utils.error("[Scrap Entity] No valid configuration")
        }
        this.config = config;
        this.id = function() {
            return this.config.id;
        };

        this.get = function(key) {
            if (key) {
                return this[key]();
            }
        };
    };

module.exports = function() {

    return {

        clazz: _clazz,

        /**
         * Add custom functionality to CAT's Scrap entity
         *
         * @param config
         */
        add: function(config) {
            if (!config) {
                _utils.error("[Scrap Entity] No valid config for 'add' functionality ");
            }

            var attrName = config.name,
                func = config.func;

            _clazz.prototype[attrName] = function() {
                return this.config[attrName];
            };

            _clazz.prototype[attrName + "Apply"] = function(config) {
                return func.call(this, config);
            }
        }
    }
}();