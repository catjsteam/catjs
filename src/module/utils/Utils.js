var _ = require("underscore"),
    _fs = require("fs.extra"),
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _props = catrequire("cat.props"),
    _os = require("os"),
    _globmatch = require("glob"),
    _nodeutil = require("util"),
    _path = require("path");

module.exports = function () {

    /**
     * Synchronized process for creating folder recursively
     */
    var _mkdirSync = function (folder) {
            if (!_fs.existsSync(folder)) {
                try {
                    _fs.mkdirRecursiveSync(folder);
                    //_log.debug("[copy action] target folder was created: " + folder);

                } catch (e) {
                    _log.error("[copy action] failed to create target dir: " + folder);
                    throw e;
                }
            }
        },

        /**
         * Copy file synchronized
         */
            _copySync = function (source, target, cb) {
            var cbCalled = false,
                me = this,
                rd, wr;

            if (!_fs.existsSync(source)) {
                return undefined;
            }

            rd = _fs.createReadStream(source);
            rd.on("error", function (err) {
                done(err);
            });

            wr = _fs.createWriteStream(target);
            wr.on("error", function (err) {
                done(err);
            });

            wr.on("close", function (ex) {
                done();
            });
            rd.pipe(wr);

            function done(err) {
                if (!cbCalled) {
                    if (err) {
                        throw err;
                    }
                    if (cb) {
                        cb(err);
                    }
                    cbCalled = true;
                }
            }
        };

    return {

        /**
         *
         *
         * @param refobject {Object} The target object
         * @param values {Array} The properties to be assigned to the target object
         *              key {String} The property key
         *              obj {Object} The object to be copied the property from
         *              default {Object} The default value to be set
         */
        setProps: function (refobject, values) {
            if (values) {
                values.forEach(function (value) {

                    var defaultval = ("default" in value ? value["default"] : undefined);
                    if (value) {
                        if (value.key in value.val) {
                            if (value.val !== undefined) {
                                refobject[value.key] = value.val;

                            } else if (defaultval !== undefined) {
                                refobject[value.key] = defaultval;
                            }
                        }
                    }
                });
            }
        },

        /**
         *
         *
         * @param value {Object} The source object
         *          key {String} The property key
         *          obj {Object} The object to be copied the property from
         *          default {Object} [optional] A default value
         *
         * @returns {*}
         */
        getProp: function (value) {

            if (value) {
                var defaultval = ("default" in value ? value["default"] : undefined);
                return (value.key in value.obj ? value.obj[value.key] : (defaultval || undefined));
            }

            return undefined;
        },


        /**
         * Setting the reference object with default values or undefined for unassigned properties
         * e.g. { global: {obj: obj}, props: [{key: "test", default: 1}] }
         *
         *
         * @param value {Object} props values
         *          global {Object} global references
         *               obj {Object} [optional] The object to be copied the property from
         *
         *          props {Array} prop value
         *              key {String} The property key
         *              obj {Object} [optional] The object to be copied the property from
         *              default {Object} [optional] A default value
         *              require {Boolean} Warning about undefined value, default set to false
         *
         */
        prepareProps: function (value) {

            var globalreference, refobj;

            if (value) {
                if ("global" in value && value.global) {
                    globalreference = value.global.obj
                }
                if ("props" in value && value.props && _nodeutil.isArray(value.props)) {
                    value.props.forEach(function (prop) {

                        var defaultval;

                        if (!("require" in prop)) {
                            prop.require = false;
                        }
                        if (!"key" in prop) {
                            throw new Error("[catjs utils] 'key' is a required property for method 'getProps' ");
                        }

                        defaultval = ("default" in prop ? prop.default : undefined);
                        refobj = ("obj" in prop ? prop.obj : globalreference);

                        refobj[prop.key] = (prop.key in refobj ? refobj[prop.key] : defaultval);

                        if (prop.require && (refobj[prop.key] === undefined || refobj[prop.key] === null)) {
                            throw new Error("[catjs utils prepareProps] property '" + prop.key + "' is required ");
                        }


                    });
                }
            }
        },

        /**
         * check if the path argument exists in the current location
         *
         * @param request {Object} standard request object
         * @param path {*} a given path list of type Array or String
         * @returns {boolean} whether one of the path exists
         */
        pathMatch: function (request, path) {
            
            var location = request.originalUrl,
                referer = request.headers['referer'],
                type, n = 0;

            if (path) {
                if (_.isString(path)) {
                    path = [path];
                }

                path.forEach(function (item) {
                    if (item) {
                        if (referer && referer.indexOf(path) !== -1) {
                            n++;
                        }
                    }
                });
                
            } else {
                return true;
            }

            return (n > 0 ? true : false);
        },

        isWindows: function () {
            var type = _os.platform();
            if (type.toLocaleLowerCase() === "win32") {
                return true;
            }

            return false;
        },

        mkdirSync: _mkdirSync,

        copySync: _copySync,

        globmatch: function (config) {

            var lsrc, match,
                src = config.src,
                opt = ("opt" in config ? config.opt : {});

            function __match(item, opt) {
                var match = _globmatch.sync(item, opt);
                if (!match) {
                    console.warn("[CAT libraries install] Failed match path: ", item, " , skip");
                }

                return match;
            }

            if (src) {
                if (_.isArray(src)) {
                    lsrc = [];
                    src.forEach(function (item) {
                        var match;

                        if (item) {
                            try {
                                match = __match(item, opt);
                                if (match && match.length > 0) {
                                    lsrc = lsrc.concat(match);
                                } else {
                                    lsrc.push(item);
                                }

                            } catch (e) {
                                console.warn("[CAT libraries install] Failed to resolve path: ", item, "with errors: ", e);
                                lsrc.push(item);
                            }
                        }
                    });

                } else if (_.isString(src)) {

                    try {
                        match = __match(src, opt);
                        if (match && match.length > 0) {
                            lsrc = match;
                        } else {
                            lsrc = [src];
                        }

                    } catch (e) {
                        console.warn(" Failed to resolve path: ", src, "with errors: ", e);
                        lsrc = src;
                    }
                }
            }

            return lsrc;


        },

        deleteSync: function (dir) {
            if (dir) {
                if (_fs.existsSync(dir)) {
                    try {
                        _fs.rmrfSync(dir);
                    } catch (e) {
                        this.error(_props.get("cat.error").format("[utils (deleteSync)]", e));
                    }
                }
            }
        },

        // log to the console and to the log file
        log: function (type, msg) {
            if (type && _log[type]) {
                _log[type](msg);
            }

            if (type === "info") {
                type = "log";

            } else if (type === "warning") {
                type = "warn";
            }

            if (console[type]) {
                console[type](msg);
            } else {
                console.log("Console has no support for function: '" + type + "'");
            }
        },

        error: function () {

            function parseArgs(args) {
                var i = 0, size = args.length, out = [];

                if (size > 0) {
                    for (; i < size; i++) {
                        out.push(args[i]);
                    }
                } else {
                    return "General error occurred";
                }

                return out.join("; ");
            }

            _log.error.apply(_log, arguments);
            if (console) {
                console.error.apply(console, arguments);
            }
            throw parseArgs(arguments);
        },

        getRelativePath: function (file, basePath) {
            return ((file && basePath) ? file.substring(basePath.length) : undefined);
        },

        /**
         * Inspect a given string and try to resolve its object
         *
         * @param obj The reference object
         * @param query The query to apply over the referenced object
         */
        resolveObject: function (obj, query) {

            if (!obj || !query) {
                return obj;
            }

            var keys = query.split("."),
                size = keys.length,
                counter = 0,
                key;

            while (counter < size) {
                key = keys[counter];
                if (key && obj[key]) {
                    obj = obj[key];
                    counter++;
                } else {
                    counter = size;
                    _log.warning(_props.get("cat.utils.resolver.warn").format("[utils resolver]", query));
                    return null;
                }
            }

            return obj;
        },

        /**
         * Prepare code based on line break.
         * Looking for character ";" at the end if not exists it will be added
         * and each line will be trimmed.
         *
         * @param codeRows
         */
        prepareCode: function (codeRows) {
            var row,
                nextText,

                size = (codeRows && _.isArray(codeRows) ? codeRows.length : 0), idx = 0;

            function _row(row, ref, idx) {
                var rowTrimmed;

                if (row) {
                    rowTrimmed = (row.trim ? row.trim() : row);
                    if (rowTrimmed.charAt(rowTrimmed.length - 1) !== ";") {
                        if (idx !== undefined) {
                            ref[idx] += ";";
                        } else {
                            ref += ";"
                        }
                    }

                    if (idx !== undefined) {
                        ref[idx] = convertTestDataRexp(ref[idx]);
                    } else {
                        ref = convertTestDataRexp(ref);
                    }

                }
                return ref;
            }

            function convertTestDataRexp(codeRows) {
                var patt;

                patt = new RegExp("(.*)@d\\.([a-z]*\\()\\.(.*)(\\).*\\).*)", "g");

                while (codeRows.match(patt)) {
                    codeRows = codeRows.replace(patt, "$1_cat.utils.TestsDB.$2\".$3\"$4");
                }
                return codeRows;
            }

            if (size) {
                for (; idx < size; idx++) {
                    row = codeRows[idx];
                    row = (row.trim ? row.trim() : row);
                    codeRows = _row(row, codeRows, idx);
                }
            } else {
                codeRows = (codeRows.trim ? codeRows.trim() : codeRows);
                codeRows = _row(codeRows, codeRows);
            }
            return codeRows;
        },


        /**
         *  Check if a given object contains a value
         *
         * @param obj The object that might contains
         * @param value The value to be searched
         *
         * @returns {boolean} If the value contains in the obj return true else return false
         */
        contains: function (obj, value) {
            var key;

            if (obj) {
                for (key in obj) {
                    if (obj[key] === value) {
                        return true;
                    }
                }
            }
            return false;
        },

        removeArrayItemByIdx: function (arr, idx) {
            var newArr = [],
                counter = 0;

            if (arr && _.isArray(arr)) {

                arr.forEach(function (item) {
                    if (idx !== counter) {
                        newArr.push(item);
                    }
                    counter++;
                });
            }
            return newArr;
        },

        removeArrayItemByValue: function (arr, value) {
            var newArr = [],
                counter = 0;

            if (arr && _.isArray(arr)) {

                arr.forEach(function (item) {
                    if (item !== value && item !== null && item !== undefined) {
                        newArr.push(item);
                    }
                    counter++;
                });
            }

            return newArr;
        },

        cleanupArray: function (arr) {
            var newArr = [];

            if (arr && _.isArray(arr)) {
                arr.forEach(function (item) {
                    if (item !== null && item !== undefined) {
                        newArr.push(item);
                    }
                });
            }

            return newArr;
        },

        /**
         * Copy the source object's properties.
         * TODO TBD make it more robust, recursion and function support
         *
         * @param srcObj
         * @param destObj
         * @param override Override existing property [false as default]
         */
        copyObjProps: function (srcObj, destObj, override) {

            var name, obj,
                me = this,
                idx = 0, size = 0, item;

            override = (override || false);

            if (srcObj && destObj) {
                for (name in srcObj) {

                    if (srcObj.hasOwnProperty(name)) {

                        obj = destObj[name];

                        if (_.isArray(srcObj[name])) {

                            if (!obj) {
                                destObj[name] = srcObj[name];

                            } else if (_.isArray(obj)) {

                                me.cleanupArray(srcObj[name]);
                                if (override) {
                                    destObj[name] = srcObj[name];

                                } else {
                                    size = destObj[name].length;
                                    for (idx = 0; idx < size; idx++) {
                                        item = obj[idx];
                                        srcObj[name] = me.removeArrayItemByValue(srcObj[name], item);
                                    }
                                    destObj[name] = destObj[name].concat(srcObj[name]);
                                }
                            } else {
                                _log.warning(_props.get("cat.utils.copy.object.array.warn").format("[utils copy object]", name, typeof(obj)));
                            }

                        } else if (_.isObject(srcObj[name])) {
                            if (!destObj[name]) {
                                destObj[name] = {};
                            }
                            arguments.callee.call(me, srcObj[name], destObj[name], override);

                        } else {
                            if (override || obj === undefined) {
                                if (!destObj[name] || (destObj[name] && override)) {
                                    destObj[name] = srcObj[name];
                                }
                            }
                        }

                    }
                }
            }
        },

        forEachProp: function (srcObj, callback) {
            var name;

            if (srcObj) {
                for (name in srcObj) {
                    if (srcObj.hasOwnProperty(name)) {
                        if (callback) {
                            callback.call(srcObj, name);
                        }
                    }
                    else {

                    }
                }
            }
        },

        kill: function (pids, excludes) {
            var me = this;

            function process(pid, exclude) {
                if (pid !== exclude) {
                    try {
                        _log.error("[kill process] sending SIGKILL signal to pid: " + pid);
                        process.kill(pid, "SIGKILL");

                    } catch (e) {
                        // TODO check if the process is running
                        _log.error("[kill process] failed to kill pid: " + pid + "; The process might not exists");
                    }
                }
            }

            if (pids) {
                pids.forEach(function (pid) {

                    if (excludes) {
                        excludes.forEach(function (exclude) {
                            process(pid, exclude);
                        });
                    } else {
                        process(pid);
                    }
                });
            }
        }

    };

}();