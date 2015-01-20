var _utils = catrequire("cat.utils"),
    _props = catrequire("cat.props"),
    _typedas = require("typedas"),
    _log = catrequire("cat.global").log(),
    _scrapEnum = require("./ScrapEnum.js"),
    _ScrapConfigItem = require("./ScrapConfigItem.js"),
    _ScrapContext = require("./Context.js"),
    _catlibtils = catrequire("cat.lib.utils"),
    _scraputils = catrequire("cat.scrap.utils"),
    _jsutils = require("js.utils"),
    _Printer = require("./printer/Generic.js"),
    _JasminePrinter = require("./printer/Jasmine.js"),
    _cache = require("./Cache.js"),
    _ = require("underscore"),
    _scrapId = function () {
        var __id = _catlibtils.generateGUID();
        return ["scrap", __id].join("_");
    },
    _clazz;

function _validateConfigEntry(key, config) {

    var value,
        validation = {},
        thisKey;

    // validate singlton
    // TODO need to be fixed
    if (key === "singleton") {
        value = config[key];
        if (value) {
            if (value === 2) {
                config[key] = 1;
            }
        }
    }


    // validate file type
    if (key === "$type") {
        value = config[key];
        if (value) {
            _scrapEnum.scrapEnum.fileTypes.forEach(function (type) {
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

    var idx = 0, size = 0, item, value;

    if (obj) {
        if (_typedas.isString(obj)) {

            return _cleanStringNoise(obj);

        } else if (_typedas.isArray(obj)) {

            size = obj.length;
            for (idx = 0; idx < size; idx++) {
                item = obj[idx];
                if (item) {
                    if (_ScrapConfigItem.instanceOf(item)) {
                        item = _ScrapConfigItem.create(item.config);
                        value = item.getValue();
                    } else {
                        value = item;
                    }
                    obj[idx] = _cleanStringNoise(value);
                }
            }

            return obj;
        }

    }

    return obj;
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
        var items,
            value,
            values = [];

        function _defaultvalues(validateItems) {

            var idx = 0, size = validateItems.length,
                item;

            if (!defaultValue || (defaultValue && _typedas.isArray(defaultValue) && defaultValue.length === 0)) {
                return;
            }

            for (; idx < size; idx++) {
                item = validateItems[idx];
                if (_typedas.isArray(defaultValue)) {
                    if (_jsutils.Object.contains(defaultValue, item)) {
                        defaultValue.splice(defaultValue.indexOf(item), 1);
                    }
                } else {
                    if (item === defaultValue) {
                        return undefined;
                    }
                }
            }            

            if (_typedas.isArray(defaultValue)) {
                if (defaultValue.length > 0) {
                    values = values.concat(defaultValue);
                }
            } else {
                values.push(defaultValue);
            }
        }


        // set default values
        if (me.config[name] === undefined) {
            me.set(name, defaultValue, true);

        } else {
            items = me.config[name];
            if (_typedas.isArray(items)) {
                if (_ScrapConfigItem.instanceOf(items[0])) {
                    value = items[0].getValue();
                    _defaultvalues([value]);
                    values.push(value);
                } else {
                    _defaultvalues(items);
                    values = values.concat(items);
                }
                me.set(name, values);
            }
        }
    }

    function _getValue(key) {

        var size,
            value = me.config[key];

        if (value) {

            value = _cleanObjectNoise(value);
            if (value !== undefined && value !== null) {
                if (me.isSingle(key) || _utils.contains(_scrapEnum.scrapEnum.singleTypes, key)) {
                    // return only the first cell since we types this key as a single scrap value (the last cell takes)
                    if (_typedas.isArray(value)) {
                        _utils.cleanupArray(value);
                        size = value.length;
                        return value[size - 1];
                    } else {
                        // return value as is
                    }
                }
            }
        }
        return value;
    }


    function _nameValidation(config, value) {
        if (!("name" in config && config.name && config.name[0])) {
            config.name = value;
        }
    }

    if (!config) {
        _utils.error(_props.get("cat.error.config").format("[scrap class]"));
    }

    this.config = config;            
    this.arguments = [];
    this.$$context = new _ScrapContext();

    this.printer = new _Printer();
    this.userprinter = new _Printer();
    this.jasmineprinter = new _JasminePrinter();
    
    this.getEnum = _scrapEnum.getScrapEnum;

    this.set = function (key, value, defaultval) {
        if (key) {          
            config[key] = value;
            this[key] = function () {
                return this.config[key];
            };
        }
    };

    // defaults
    (function () {

        var idArg = _scrapId();

        _nameValidation(config, idArg);

        // set default values
        _init("single", {});
        _init("singleton", {});
        _init("arguments", []);
        _init("context", ["thi$"]);
        _init("auto", true);
        _init("injectcode", false);
        _init("$standalone", false);
        _init("id", idArg);
        _init("$type", _scrapEnum.scrapEnum.defaultFileType);

        // set/generate config values/functionality
        if (me.config) {
            _utils.forEachProp(me.config, function (key) {
                var valid = {},
                    initFunc;

                if (key) {

                    // set default annotation value to single
                    me.config.single[key] = true;
                    // set default singleton value
                    me.config.singleton[key] = -1;

                    // init the attribute functionality
                    initFunc = me[key + "Init"];
                    if (initFunc) {
                        initFunc.call(me);
                    }

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

_clazz.prototype.global = function (entity) {
    
};

_clazz.prototype.isSingle = function (key) {
    return this.config.single[key];
};

_clazz.prototype.print = function(line) {
    if (_.isString(line)) {
        line = {line: line};
    }
    this.printer.print(line);
};

_clazz.prototype.jasminePrint = function(config) {
    this.jasmineprinter.print(config);
};

/**
 * Set scrap's attribute as single or multi value
 * e.g. addConfig([{key: [attrName], value: [boolean]}])
 *
 * Note: Single values are store as a map, setting the same key will take the last values
 * @param arr An array of values
 * @returns {*}
 */
_clazz.prototype.addConfig = function (arr, key) {

    if (arr && _typedas.isArray(arr)) {

        arr.forEach(function (item) {

            if (item && item.key && (typeof(item.value) !== 'undefined')) {

                this.config[key][item.key] = item.value;

            } else {
                _log.warning(_props.get("cat.scrap.single.properties").format("[scrap class (addSingle)]"));
            }

        });

    } else {
        _log.warning(_props.get("cat.arguments.type").format("[scrap class (addSingle)]", "array"));
    }
};

_clazz.prototype.addSingleton = function (arr) {
    this.addConfig(arr, "singleton");
};

_clazz.prototype.setSingleton = function (key, bol) {
    this.config.singleton[key] = bol;
};

_clazz.prototype.getRunat = function () {
    return this.config["run@"];
};

_clazz.prototype.getStack = function () {
    return ("stack" in this.config ? this.config["stack"] : undefined);
};

_clazz.prototype.getPkgName = function () {
    return this.config["pkgName"];
};

_clazz.prototype.getSingleton = function (key) {
    return this.config.singleton[key];
};

_clazz.prototype.addSingle = function (arr) {
    this.addConfig(arr, "single");
};

_clazz.prototype.setSingle = function (key, bol) {
    return this.config.single[key] = bol;
};

_clazz.prototype.$getType = function () {
    return this.config["$type"];
};

_clazz.prototype.$getBehavior = function () {
    return this.config["$behavior"];
};

_clazz.prototype.$getEngine = function () {

    var $type = this.config["$type"];
    if ($type === "js") {
        if (this.get("injectcode")) {
            return _scrapEnum.scrapEnum.engines.JS_EMBED_INSERT;
        }
        return _scrapEnum.scrapEnum.engines.JS;

    } else if ($type === "html") {
        if (this.get("import")) {
            return _scrapEnum.scrapEnum.engines.HTML_IMPORT_JS;

        } else if (this.get("embed")) {
            return _scrapEnum.scrapEnum.engines.HTML_EMBED_JS;

        } else if (this.get("injectcode")) {
            return _scrapEnum.scrapEnum.engines.HTML_EMBED_INSERT;
        }

    } else if ($type === "*") {

        // TODO backward computability support .. need to be removed (use type:html, inject: true)
        if (this.get("inject")) {
            return _scrapEnum.scrapEnum.engines.HTML_EMBED_INSERT;
        }
    }
};

_clazz.prototype.$setType = function (type) {
    var valid = _validateConfigEntry(type, this.config);
    this.config["$type"] = type;
};

_clazz.prototype.$setStandalone = function (bol) {
    var valid = _validateConfigEntry(bol, this.config);
    this.config["$standalone"] = bol;
};

_clazz.prototype.$setBehavior = function (behavior) {
    this.config["$behavior"] = behavior;
};

_clazz.prototype.get = function (key) {
    var value;
    if (key) {
        if (this[key]) {
            value = this[key]();
        }
    }
    return value;
};

_clazz.prototype.getArgumentsNames = function (arr) {
    var args = this.arguments();
    
    args = (args || ["thi$"]);
    if (args === "thi$") {
        args = ["thi$"];
    }
    if (!_.isArray(args)) {
        args = ["thi$", args];
    }
    
    return args;
    
};

_clazz.prototype.setCtxArguments = function (arr) {
    if (arr) {
        if (_typedas.isArray(arr)) {
            this.config.arguments = [];
            this.config.arguments = this.config.arguments.concat(arr);
            this.set("arguments", _cleanObjectNoise(this.config.arguments));

        } else {
            _log.warning(_props.get("cat.arguments.type").format("[scrap class (addCtxArguments)]", "array"));
        }
    }
};

_clazz.prototype.generateCtxArguments = function () {
    var ctx = this.get("arguments");
    return ( ctx && ctx.join ? ctx.join(", ") : "");
};

/**
 * TODO: The singleton implementation currently depends on the _scrap.apply occurrences, that has to be changed!
 * 
 */
_clazz.prototype.apply = function () {
    var me = this,
        singleton;

    _utils.forEachProp(this.config, function (prop) {
        var func, id, cachekey;
        if (prop) {
            func = me[prop + "Apply"];
            if (func) {
                id = me.get("id");
                cachekey = [id, prop, "singleton"].join(".");
                singleton = _cache.get(cachekey);
                if (singleton === undefined) {
                    singleton = me.getSingleton(prop);
                }

                if (singleton === 2 || singleton === -1) {
                    func.call(me, {});
                }
                if (singleton >= 1) {
                    me.setSingleton(prop, singleton++);
                   _cache.set(cachekey,  singleton++);
                }

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

_clazz.prototype.getContextItem = function (key) {
    return this.$$context.get(key);
};

_clazz.prototype.buildContext = function (scrapNames) {
    var me = this;
    this.$$context.destroy();
    scrapNames.forEach(function (key) {
        var value = me.get(key);
        if (value !== undefined) {
            me.$$context.set(key, me.get(key));
        }
    });
};

_clazz.prototype.extractAnnotations = function (scrapsRows) {
    var map = {};

    // extract nested annotations
    scrapsRows.forEach(function (item) {
        var scrapItem,
            scrapItemName, scrapItemValue;

        if (item) {
            scrapItem = _scraputils.extractSingle(item);
            if (scrapItem) {
                scrapItemName = scrapItem.key.trim();
                scrapItemValue = scrapItem.value.trim();
                map[scrapItemName] = scrapItemValue;
            }
        }
    });

    return map;
};

/**
 * Replace data collector
 * Collect the relevant data to the replace action (see @@replace annotation)
 *
 * String the data using the 'replaceinfo' configuration key.
 * The data:
 *      - rows      - The rows line numbers to be replaced
 *      - action    - The action to be performed, by default set to comment (comment out the given lines)
 *      - apply     - The functionality to apply the action over the rows
 *      - content   - The output content
 *
 * @param config
 */
_clazz.prototype.$setReplaceData = function (config) {

    //parse pattern
    var info = this.get("commentinfo"),
        replaceRowsData = this.get("replace"),
        replaceRows = [],
        lvalue, rvalue,
        row,
        idx = 0, size = 0,
        action,
        value;

    function _init() {
        if (config) {
            action = (config.action || "comment");
        } else {
            action = "comment";
        }
    }

    if (info) {
        row = (info.end ? info.end.line : undefined);
        if (row && replaceRowsData && replaceRowsData[0]) {

            _init();

            replaceRowsData = replaceRowsData.split(":");
            if (replaceRowsData) {
                lvalue = (replaceRowsData[0] ? replaceRowsData[0].trim() : undefined);
                rvalue = (replaceRowsData[1] ? replaceRowsData[1].trim() : undefined);
                if (lvalue && rvalue !== undefined) {
                    if (lvalue === "after") {
                        idx = row + 1;
                        size = (idx + Number(rvalue));
                        for (; idx < size; idx++) {
                            replaceRows.push(idx);
                        }
                    }
                }

                if (replaceRows.length > 0) {
                    value = {
                        lines: [],
                        $linesmap: {},
                        rows: replaceRows,
                        action: (action || undefined),
                        $ready: 0,
                        newlines: [],
                        /**
                         * Apply the action functionality over the rows
                         *
                         * @param {Object}line The lines to be replaced
                         * @returns {Object}
                         */
                        apply: function (line) {
                            var me = this,
                                currentLine,
                                counter = 0,
                                delta, idx = 0, test;

                            if (action && line) {

                                // if the line registered add it
                                if (_jsutils.Object.contains(this.rows, line.row)) {
                                    this.lines.push(line.line);
                                    //this.$linesmap[line.row] = this.lines[this.lines.length-1];

                                    if (this.rows.indexOf(line.row) === this.rows.length - 1) {
                                        // if this is the last cell...
                                        this.newlines = action.call({}, this.lines, line.mark);
                                        if (this.newlines && _typedas.isArray(this.newlines)) {

                                            this.newlines.forEach(function (newline) {
                                                me.$linesmap[me.rows[counter]] = newline;
                                                counter++;
                                            });

                                            delta = (this.rows.length - this.newlines.length);
                                            if (delta !== 0) {
                                                for (idx = counter; idx < delta; idx++) {
                                                    me.$linesmap[me.rows[idx]] = "\r\n";
                                                }
                                            }

                                        } else {
                                            _log.warning("[CAT ScrapItem] While invoking 'replace' implementation: '" + action + "', No valid return value of type Array was found");
                                        }
                                        this.$ready = 1;

                                    }
                                }

                                // after done processing the lines, replace the involved lines.
                                if (this.$ready === 1) {
                                    // if we have processed all rows...
                                    currentLine = line.row - 1;
                                    if ((currentLine) === (line.lines.length)) {
                                        test = this.$linesmap[currentLine];
                                        if (test || test === null) {
                                            line.lines[currentLine - 1] = ( (test || "") + ( (test && test.indexOf("\n") === -1) ? "\n" : "") );
                                        }
                                    }
                                }
                            }
                        }
                    };
                    this.set("replaceinfo", value);
                }
            }
        }
    }

};


module.exports = _clazz;