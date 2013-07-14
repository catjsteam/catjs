var _utils = require("./../../../Utils.js"),
    _props = require("../../../Properties.js"),

    _clazz = function(config) {

        if (!config) {
            _utils.error(_props.get("cat.error.config").format("[Scrap Entity]"));
        }

        this.config = config;

        this.set = function(key, value) {
            if (key) {
                config[key] = value;
                this[key] = function() {
                    return this.config[key];
                };
            }
        };

        // defaults
        this.set("id", false);


        this.id = function() {
            return this.config.id;
        };

        this.isSingle = function() {
            return this.config.single;
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
                _utils.error(_props.get("cat.error.config").format("[Scrap Entity]"));
            }

            var attrName = config.name,
                func = config.func;

            _clazz.prototype[attrName] = function() {
                return this.config[attrName];
            };

            _clazz.prototype[attrName + "Apply"] = function(config) {
                return func.call(this, config);
            }
        },

        apply: function(key, config) {
            var scrap = this.get(key);
            if (scrap) {
                scrap[key + "Apply"].call(this, config);
            }
        },

        get: function(key) {
            return new this.clazz({id: key})
        },

        getScrapBlock: function () {
            return {
                open: "@[scrap",
                    close:"]@"
            };
        }
    };
}();