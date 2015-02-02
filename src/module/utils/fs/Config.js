var _fs = require('fs'),
    _log = catrequire("cat.global").log(),
    _utils = catrequire("cat.utils"),
    _props = catrequire("cat.props"),
    _jsonlint = require("json-lint");



/**
 * Configuration Module
 * Loading JSON configuration
 *
 * e.g. new require('Config.js')
 *
 * @type {module.exports}
 */
module.exports = function () {

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
                json, jsonlint;

            try {
                json = _fs.readFileSync(file, "utf8");
                if (callback) {

                    jsonlint = _jsonlint( json, {} );
                    if ( jsonlint.error ) {
                        _utils.error(["CAT project loader] catproject.json load with errors: \n ", jsonlint.error,
                        " \n at line: ", jsonlint.line,
                        " \n character: ", jsonlint.character,
                        " \n "].join(""));
                    }

                    json = JSON.parse(json);
                    callback.call(me, json);
                }

            } catch(e) {
                _utils.error(_props.get("cat.error.config.loader").format("[Config Project Loader]", e));
                throw e;
            }
        };

        return get(file, callback);
    };

}();