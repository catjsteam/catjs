var _fs = require("fs.extra"),
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _props = catrequire("cat.props"),
    _path = require("path");


module.exports = function () {

    return {

        /**
         * Get the info for CAT internal generated source file name
         *
         * @param config The passed configuration
         *          scrap - The scrap object
         *          file - The file path [optional]
         *          basepath - The base path to be cut off the file path
         *
         * @return {*} The pkgname and the target file name to be saved
         */
        getCATInfo: function (config) {

            if (!config) {
                return undefined;
            }

            var file = config.file,
                scrap = config.scrap,
                basepath = config.basepath,
                fileName = _path.basename(file, ".js"),
                path,
                pkgName,
                newFile;

            if (!file) {
                _log.warning("[CAT extutils] No valid file was found, scrap info:" + (scrap || ""));
                return undefined;
            }

            path = _path.dirname(file);
            if (basepath) {
                path = path.replace(basepath, "");
            }
            if (path.indexOf("/") === 0) {
                path = path.substring(1);
            }

            newFile = _path.join(_path.dirname(file), fileName.replace(fileName, ["_cat", fileName].join("_")));
            pkgName = (scrap ? [path.split("/").join("."), fileName, scrap.get("name")].join(".") : undefined);

            return {
                pkgName: pkgName,
                file: newFile
            };

        },

        /**
         * Get the info for CAT User generated source file name
         *
         * @param config The passed configuration
         *          scrap - The scrap object
         *          file - The file path [optional]
         *          basepath - The base path to be cut off the file path
         *
         * @return {*} The pkgname and the target file name to be saved
         */
        getUserInfo: function (config) {

            if (!config) {
                return undefined;
            }
            var file = config.file,
                scrap = config.scrap,
                basepath = config.basepath,
                fileName = _path.basename(file, ".js"),
                path,
                pkgName;

            path = _path.dirname(file);
            if (basepath) {
                path = path.replace(basepath, "");
            }
            if (path.indexOf("/") === 0) {
                path = path.substring(1);
            }
            pkgName = (scrap ? [path.split("/").join("."), fileName, scrap.get("name")].join(".") : undefined);

            return {
                pkgName: pkgName,
                file: (file ? file : undefined)
            };

        }

    };

}();