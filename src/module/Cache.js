var _fs = require("fs"),
    _global = catrequire("cat.global"),
    _utils = catrequire("cat.utils"),
    _sysutils = catrequire("cat.sys.utils"),
    _home = _global.get("home"),
    _path = require("path"),
    _workingDir,
    _fileName;

if (_home && _home.working) {
    _workingDir = _home.working.path;
}

function _init() {
    var path = _path.join(_workingDir);

    // create log folder
    if (!_fs.existsSync(path)) {
        _sysutils.createSystemFolder("cache");
        _sysutils.chmodSyncOffset(path, 0777, 1);
    }

    _fileName = _path.join(path, ".cat");

}

/**
 * Persist a property style data (key=value) to a file named .cat
 *
 * @type {module.exports}
 */
module.exports = function () {

    function _store(data, option) {
        option = (option || "appendFileSync");
        try {
            if (option) {
                if (!_fs.existsSync(_fileName)) {
                    _init(); 
                }
                _fs[option](_fileName, data, {encoding: "utf8", mode: 0777});
                _fs.chmodSync(_fileName, 0777);
            }
        } catch (e) {
            console.log("[catcli cache store] ", e);
        }
    }

    function _load() {
        try {
            if (_fs.existsSync(_fileName)) {
                return _fs.readFileSync(_fileName, "utf8");
                
            } else {
                console.warn("[catcli cache load] warning, no valid .cat file was found");
            }

        } catch (e) {
            console.log("[catcli cache load] ", e);
        }
    }

    function _inspect(callback) {
        var content = _load(),
            rows,
            lineCounter = 0,
            obj;

        if (content) {
            rows = content.split("\n");
            rows.forEach(function (row) {
                lineCounter++;
                obj = {row: row, line: lineCounter};
                callback.call(obj);
            });
        }
    }

    return {

        /**
         * Append new line comprised of the key, value [key=value\n]
         *
         * @param key
         * @param value
         */
        set: function (key, value) {
            var data = [key, value].join("=");
            if (data.indexOf("\n") === -1) {
                data += "\n";
            }
            _store(data);
        },

        /**
         * Get lines that match the key.
         *
         * @param key
         * @returns {Array} The matched lines
         */
        get: function (key) {
            var data = [];

            _inspect(function () {
                var row = this.row,
                    line = this.line;

                if (row && row.trim().indexOf(key) === 0) {
                    data.push({row: row, line: line});
                }
            });

            return data;
        },

        remove: function (lines) {
            var rows = [],
                idx = 0, size = ((lines && lines.length) ? lines.length : 0);

            function _addRow(row) {
                if (row.trim()) {
                    if (row.indexOf("\n") === -1) {
                        row += "\n";
                    }
                    rows.push(row);
                }

            }

            if (size) {
                _inspect(function () {
                    var row = this.row,
                        lineNumber,
                        line = this.line,
                        validate = 0;

                    for (idx = 0; idx<size; idx++) {
                        lineNumber = lines[idx];
                        if (line === lineNumber) {
                            validate++;
                            break;
                        }
                    }

                    // add the row if no remove have been requested
                    if (validate === 0) {
                        _addRow(row);
                        validate = 0;
                    }

                });

                if (rows && rows.length > 0) {
                    _store((rows.join("")), "writeFileSync");
                }
            }
        },

        removeByKey: function(key, value, kill) {
            var rows = this.get(key),
                lines=[],
                values = [];

            rows.forEach(function(row){
                if (!value || (value && row.row && row.row.indexOf(value) === -1)) {
                    lines.push(row.line);
                    values.push((row.row.trim().split("="))[1]);
                }
            });
            if (lines && lines.length && lines.length > 0) {
                this.remove(lines);
            }

            return values;
        }

    };

}();