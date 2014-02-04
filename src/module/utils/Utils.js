var _ = require("underscore"),
    _fs = require("fs.extra"),
    _typedas = require("typedas"),
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _props = catrequire("cat.props"),
    _os = require("os"),
    _globmatch = require("glob");

module.exports = function () {

    /**
     * Synchronized process for creating folder recursively
     */
    var _mkdirSync = function (folder) {
        if (!_fs.existsSync(folder)) {
            try {
                _fs.mkdirRecursiveSync(folder);
                _log.debug("[copy action] target folder was created: " + folder);

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



        isWindows: function () {
            var type = _os.platform();
            if (type.toLocaleLowerCase() === "win32") {
                return true;
            }

            return false;
        },

        mkdirSync: _mkdirSync,

        copySync: _copySync,

        globmatch: function(config) {

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
                if (_typedas.isArray(src)) {
                    lsrc = [];
                    src.forEach(function (item) {
                        var match;

                        if (item) {
                            try {
                                match = __match(item, opt);
                                if (match  && match.length > 0) {
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

                } else if (_typedas.isString(src)) {

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

        log: function (type, msg) {
            if (type) {
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

        error: function (msg) {
            _log.error(msg);
            if (console) {
                console.error(msg);
            }
            throw msg;
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
            var row, rowTrimmed, size = (codeRows ? codeRows.length : 0), idx = 0;

            for (; idx < size; idx++) {
                row = codeRows[idx];
                if (row) {
                    rowTrimmed = row.trim();
                    if (rowTrimmed.indexOf(";") !== rowTrimmed.length - 1) {
                        codeRows[idx] += ";";
                    }
                }
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

            if (arr && _typedas.isArray(arr)) {

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

            if (arr && _typedas.isArray(arr)) {

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

            if (arr && _typedas.isArray(arr)) {
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

                        if (_typedas.isObject(srcObj[name])) {
                            if (!destObj[name]) {
                                destObj[name] = {};
                            }
                            arguments.callee.call(me, srcObj[name], destObj[name], override);

                        } else if (_typedas.isArray(srcObj[name])) {

                            if (!obj) {
                                destObj[name] = srcObj[name];

                            } else if (_typedas.isArray(obj)) {

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

            if (pids) {
                pids.forEach(function (pid) {
                    if (excludes) {
                        excludes.forEach(function (exclude) {
                            if (pid !== exclude) {
                                try {
                                    process.kill(pid, "SIGKILL");

                                } catch (e) {
                                    // TODO check if the process is running
                                    _log.error("[kill process] failed to kill pid: " + pid + "; The process might not exists");
                                }
                            }
                        });
                    }
                });
            }
        }
    };

}();