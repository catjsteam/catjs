module.exports = function () {

    var _fs = require("fs.extra"),
        _typedas = require("typedas"),
        _log = catrequire("cat.global").log(),
        _mkdirSync = function (folder) {
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
        _copySync = function (source, target, cb) {
            var cbCalled = false;

            var rd = _fs.createReadStream(source);
            rd.on("error", function (err) {
                done(err);
            });
            var wr = _fs.createWriteStream(target);
            wr.on("error", function (err) {
                done(err);
            });
            wr.on("close", function (ex) {
                done();
            });
            rd.pipe(wr);

            function done(err) {
                if (!cbCalled) {
                    if (cb) {
                        cb(err);
                    }
                    cbCalled = true;
                }
            }
        };

    return {

        mkdirSync: _mkdirSync,

        copySync: _copySync,

        error: function (msg) {
            _log.error(msg);
            throw msg;
        },

        contains: function (obj, value) {
            var contain = 0,
                ii = 0, size = 0, item;
            if (obj && value) {
                if (_typedas.isArray(obj)) {
                    size = obj.length;
                    for (; ii < size; ii++) {
                        item = obj[ii];
                        if (item && value == item) {
                            contain++;
                            break;
                        }
                    }
                }
            }

            return (contain > 0 ? true : false);
        },

        /**
         * Copy the source object's properties.
         * TODO TBD make it more robust, recursion and function support
         *
         * @param srcObj
         * @param destObj
         */
        copyObjProps: function (srcObj, destObj) {

            var name;

            if (srcObj && destObj) {
                for (name in srcObj) {
                    if (srcObj.hasOwnProperty(name)) {
                        destObj[name] = srcObj[name];
                    }
                    else {

                    }
                }
            }
        },

        forEachProp: function(srcObj, callback) {
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
        }
    }

}();