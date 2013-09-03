var _fs = require("fs"),
    _global = catrequire("cat.global"),
    _fileName = [_global.get("home").working.path, "catunit.xml"].join("/"),
    _props = catrequire("cat.props");

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


    return {

        init: function() {
            _store("\n --------------------------  JUnit ---------------------------------------------- \n");
        },

        /**
         * Append new line comprised of the key, value [key=value\n]
         *
         * @param key
         * @param value
         */
        log: function (config) {
            _store("unit entry");
        }
    };

}();