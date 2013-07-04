var _properties = require("properties"),
    _q = require("q"),
    _async = require("async"),
    _global = require("./CATGlob.js"),
    _log =  _global.log();

module.exports = function () {

    var config = {
        comment: "# ",
        separator: " = ",
        sections: false
    }, properties;


    return {

        init: function (catRef, args) {

            var callback = function (error, p) {
                if (error) {
                    // we don't have the error properties just yet
                    _log.error("[Properties] " + error + " result: " + p);
                    return undefined;
                }
                properties = p;
                global.CAT.props = properties;

                catRef.apply.call(catRef, args);
            }, home, homePath;

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