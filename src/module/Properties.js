var _properties = require("properties"),
    _global = require("./CATGlob.js"),
    _log =  _global.log();

/**
 * Loading property file for internal use
 * Currently support only log.properties for log messages.
 *
 * TODO load property files according to a given path
 *
 * @type {module.exports}
 */
module.exports = function () {

    var config = {
        comment: "# ",
        separator: " = ",
        sections: false
    }, properties;


    return {

        init: function (callback) {
            var home, homePath;

            home = _global.get("home");
            if (home) {
                homePath = (home.path || ".");
            }
            _properties.load([homePath, "resources/log.properties"].join("/"),
                config,
                callback);

        },

        all: ( (global && global.CAT) ? global.CAT.props : undefined ),

        get: function (key) {
            if (key) {
                return global.CAT.props[key];
            }

            return undefined;
        }

    };
}();