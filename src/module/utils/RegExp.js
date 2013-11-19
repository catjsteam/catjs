var _typedas = require("typedas"),
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _props = catrequire("cat.props");

module.exports = function () {


    return {

        preparePattern: function (pattern) {
            if (pattern) {
                pattern = pattern.split("[").join("\\[");
            }

            return pattern;
        },

        getMatchedValue: function (str, pattern, flags) {

            var value = this.getMatch(str, pattern, flags);
            if (value) {
                value = value[1];
                value = value.trim();
            }

            if (!value) {
                value = undefined;
            }

            return value;
        },

        getMatch: function (str, pattern, flags) {

            if (!pattern || !str) {
                return undefined;
            }
            var regexp = new RegExp(pattern, (flags || "")),
                value;

            if (str) {
                value = str.match(regexp);
            }

            return value;
        },

        replace: function(str, find, replace, flags) {
            var reg = new RegExp(find, flags);
            if (reg) {
                return str.replace(reg, replace);
            }

            return str;
        }

    }

}();