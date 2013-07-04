/**
 * Configuration Module
 * Loading JSON configuration
 *
 * e.g. new require('Config.js')
 *
 * @type {module.exports}
 */
module.exports = function () {

    var _fs = require('fs'),
        _log = require("./../CATGlob.js").log();

    /**
     * Configuration functionality
     *
     * @param file The JSON file to be loaded
     * @param callback The function to be called when the loading completed
     *        Call back parameters: this Assigned to the module
 *                                  json The JSON stream data
     */
    return function (file, callback) {

        var get = function (file, callback) {
            var me = this,
                json;

            try {
                json = _fs.readFileSync(file);
                if (callback) {
                    json = JSON.parse(json);
                    callback.call(me, json);
                }

            } catch(e) {
                _log.error("[Config] error occured: ",e);
            }
        };

        return get(file, callback);
    };

}();