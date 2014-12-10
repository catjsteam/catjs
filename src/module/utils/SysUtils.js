var _fs = require("fs.extra"),
    _path = require("path");
    
/**
 * CatJS System Utilities
 *
 * @type {module.exports}
 */
module.exports = function () {

    var _module = {

        /**
         * Create the basic skeleton system folders (e.g. logs, cache .. etc)
         *
         * @param folder
         * @returns {*}
         */
        createSystemFolder: function (folder) {

            var global = catrequire("cat.global");
            
            function _getBasePath() {
                return global.get("home").working.path;
            }

            var targetfolder = _path.join(_getBasePath(), folder);

            // create log folder
            if (!_fs.existsSync(targetfolder)) {
                _fs.mkdirSync(targetfolder, 0777);
            }

            return targetfolder;
        }
    };
    
    return _module;

}();