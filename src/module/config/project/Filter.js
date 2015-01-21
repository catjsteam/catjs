var _path = require("path");

module.exports = function (config) {

    var me = this;

    if (config) {
        this.type = (config.type || "*"); // * || file || folder
        this.pattern = (config.pattern || undefined);
        this.exclude = (config.exclude || undefined);

        this.apply = function (callback) {
            return callback.call(this, me);
        };


    }

};