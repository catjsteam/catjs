var _fs = require("fs"),
    _global = catrequire("cat.global"),
    _fileName = [_global.get("home").path, ".cat"].join("/");

/**
 * Persist a property style data (key=value) to a file named .cat
 *
 * @type {module.exports}
 */
module.exports = function () {

    function _store(data, option) {
        var option = (option || "appendFileSync");
        try {
            if (option) {
                _fs[option](_fileName, data, "utf8");
            }
        } catch (e) {
            console.log("[catcli] ", e);
        }
    }

    function _load() {
        try {
            return _fs.readFileSync(_fileName, "utf8");

        } catch (e) {
            console.log("[catcli] ", e);
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
            var rows = [];

            if (lines && lines.length) {
                _inspect(function () {
                    var row = this.row,
                        line = this.line;

                    lines.forEach(function(lineNumber){
                        if (line !== lineNumber) {
                            rows.push(row);
                        }
                    });

                });

                _store((rows.join("") + "\n"), "writeFileSync");
            }
        },

        removeByKey: function(key, value) {
            var rows = this.get(key),
                lines=[];

            rows.forEach(function(row){
                if (!value || (value && row.row && row.row.indexOf(value) !== -1)) {
                    lines.push(row.line);
                }
            });
            if (lines && lines.length && lines.length > 0) {
                this.remove(lines);
            }
        }

    };

}();