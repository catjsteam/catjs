var _utils = require("./../../../Utils.js"),
    _props = require("../../../Properties.js"),
    _typedas = require("typedas"),

    _clazz = function (config) {

        if (!config) {
            _utils.error(_props.get("cat.error.config").format("[Scrap Entity]"));
        }

        this.config = config;

        this.set = function (key, value) {
            if (key) {
                config[key] = value;
                this[key] = function () {
                    return this.config[key];
                };
            }
        };

        // defaults
        this.set("id", false);


        this.id = function () {
            return this.config.id;
        };

        this.isSingle = function () {
            return this.config.single;
        };

        this.get = function (key) {
            if (key) {
                return this[key]();
            }
        };

    };

module.exports = function () {

    return {

        clazz: _clazz,

        /**
         * Add custom functionality to CAT's Scrap entity
         *
         * @param config
         */
        add: function (config) {
            if (!config) {
                _utils.error(_props.get("cat.error.config").format("[Scrap Entity]"));
            }

            var attrName = config.name,
                func = config.func;

            _clazz.prototype[attrName] = function () {
                return this.config[attrName];
            };

            _clazz.prototype[attrName + "Apply"] = function (config) {
                return func.call(this, config);
            }
        },

        create: function (scrapBlock) {
            if (!scrapBlock || (scrapBlock && !_typedas.isArray(scrapBlock))) {
                return undefined;
            }
            var idx = 0, size = scrapBlock.length, row, scrapRowData=[],
                scrap, config = {}, single = this.getScrapBlock().single,
                pos, startrow;

            for (; idx < size; idx++) {
                row = scrapBlock[idx];
                config = {};
                if (row) {
                    config.row = row;
                    pos = row.indexOf(single);
                    if (pos > -1) {
                        startrow = row.substring(pos);
                        config.key = startrow.substring(single.length, startrow.indexOf(" "));
                        config.value = startrow.substring(startrow.indexOf(" ")+1);
                    }
                }
                scrapRowData.push(config);
            }

            //scrap = new this.clazz()
        },

        apply: function (key, config) {
            var scrap = this.get(key);
            if (scrap) {
                scrap[key + "Apply"].call(this, config);
            }
        },

        get: function (key) {
            return new this.clazz({id: key})
        },

        getScrapBlock: function () {
            return {
                open: "@[",
                close: "]@",
                single: "@@"
            };
        },

        getName: function() {
            return {
                name: "scrap"
            };
        }
    };
}();