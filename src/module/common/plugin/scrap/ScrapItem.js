
var _utils = catrequire("cat.utils"),
    _props = catrequire("cat.props"),
    _typedas = require("typedas"),
    _log = catrequire("cat.global").log(),
    _scrapEnum = require("./ScrapEnum.js"),

    __id = 0,

    _scrapId = function () {
        __id++;
        return ["scrap", __id].join("_");
    },

    _clazz;

function _validateConfigEntry(key, config) {

    var value,
        validation = {},
        thisKey;

    // validate file type
    if (key === "$type") {
        value = config[key];
        if (value) {
            _scrapEnum.scrapEnum.fileTypes.forEach(function(type){
                if (type === (_typedas.isArray(value) ? value[0] : value)) {
                    // supported type
                    validation[key] = true;
                }
            });
            if (!validation[key]) {
                _utils.error(_props.get("cat.error.scrap.file.type.not.supported").format("[scrap item]", value));
            }
        }
    }
}

/**
 * Scrap class
 *
 *   var scrap = new _Scrap.clazz({id: "testScrap", code: "console.log(':)');"});
 *   scrap.codeApply();
 */
_clazz = function (config) {

    var me = this;

    function _init(name, defaultValue) {

        // set default values
        if (me.config[name] === undefined) {
            me.set(name, defaultValue);
        }
    }

    function _cleanObjectNoise(obj) {

        function _cleanStringNoise(obj) {
            if (!obj) {
                return obj;
            }
            obj = (obj.indexOf("\r") !== -1 ? obj.split("\r").join("") : obj);
            obj = (obj.indexOf("\n") !== -1 ? obj.split("\n").join("") : obj);
            obj = (obj.indexOf("\t") !== -1 ? obj.split("\t").join("    ") : obj);

            return obj;
        }

        var idx = 0, size = 0, item;

        if (obj) {
            if (_typedas.isString(obj)) {

                return _cleanStringNoise(obj);

            } else if (_typedas.isArray(obj)) {

                size = obj.length;
                for (idx = 0; idx < size; idx++) {
                    item = obj[idx];
                    if (item) {
                        obj[idx] = _cleanStringNoise(item);
                    }
                }

                return obj;
            }

        }

        return obj;
    }

    function _getValue(key) {

        var size,
            value = me.config[key];

        value = _cleanObjectNoise(value);
        if (value !== undefined && value !== null) {
            if (_utils.contains(_scrapEnum.scrapEnum.singleTypes, key)) {
                // return only the first cell since we types this key as a single scrap value (the last cell takes)
                if (_typedas.isArray(value)) {
                    _utils.cleanupArray(value);
                    size = value.length;
                    return value[size - 1];
                } else {
                    _log.warning(_props.get("cat.arguments.type").format("[scrap class]", "Array"));
                }
            }
        }
        return value;
    }


    if (!config) {
        _utils.error(_props.get("cat.error.config").format("[Scrap Entity]"));
    }

    this.config = config;
    this.output = [];

    this.getEnum = _scrapEnum.getScrapEnum;

    this.set = function (key, value) {
        if (key) {
            config[key] = value;
            this[key] = function () {
                return this.config[key];
            };
        }
    };

    // defaults
    (function () {

        // set default values
        _init("single", false);
        _init("id", _scrapId());
        _init("$type", _scrapEnum.scrapEnum.defaultFileType);

        // set/generate config values/functionality
        if (me.config) {
            _utils.forEachProp(me.config, function (key) {
                var valid = {};

                if (key) {

                    // validate configuration keys
                    valid = _validateConfigEntry(key, me.config);

                    /**
                     * Generating a getter for each configuration that
                     * result a value of a property according to a scrap key
                     *
                     * @returns {*} Array for multi line or else the single string value
                     */
                    me[key] = function () {
                        return _getValue(key);
                    };
                }
            });
        }

    })();
};

_clazz.prototype.isSingle = function () {
    return this.config.single;
};

_clazz.prototype.$getType = function () {
    return this.config["$type"];
};

_clazz.prototype.$getEngine = function () {

    var $type = this.config["$type"];
    if ($type === "js") {
        return _scrapEnum.scrapEnum.engines.JS;

    } else if ($type === "html") {
        if (this.get("import")) {
            return _scrapEnum.scrapEnum.engines.HTML_IMPORT_JS;

        } else if (this.get("embed")) {
            return _scrapEnum.scrapEnum.engines.HTML_EMBED_JS;
        }
    }
};

_clazz.prototype.$setType = function (type) {
    var valid = _validateConfigEntry(type, this.config);
    this.config["$type"] = type;
};

_clazz.prototype.get = function (key) {
    if (key) {
        return (this[key] ? this[key]() : undefined);
    }
};

_clazz.prototype.generate = function () {
    return ( this.output ? this.output.join(" \n ") : "");
};

_clazz.prototype.print = function (line) {
    if (line) {
        if (_typedas.isArray(line)) {
            this.output = this.output.concat(line);
        } else {
            this.output.push(line);
        }
    }
};

_clazz.prototype.apply = function () {
    var me = this;

    _utils.forEachProp(this.config, function (prop) {
        var func;
        if (prop) {
            func = me[prop + "Apply"];
            if (func) {
                func.call(me, {});
            }
        }
    });
};

_clazz.prototype.serialize = function () {
    var data = {};
    _utils.forEachProp(this.config, function (key) {
        if (key) {
            data[key] = this[key];
        }
    });
    return data;
};

// Scrap class prototype
_clazz.prototype.update = function (key, config) {

    var injectinfo = this.config[key];
    if (!injectinfo) {
        this.config[key] = this.getEnum(key);
    }
    _utils.copyObjProps(this.config[key], config);

};



module.exports = _clazz;