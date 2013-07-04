var _fsconfig = require("./fs/Config.js"),
    _Config = require("./action/common/config/Config.js"),
    _log = require("./CATGlob.js").log(),
    _path = require("path"),

    /**
     * Project configuration loader
     *
     * @param config The passed arguments
     *        path - The path of the project
     *        emitter - The emitter to be used for the project
     */
    _loader = function (config) {

        var msg = ["[Project] config argument is not valid",
                "[Scan] Data is not valid, expecting data of type Array",
                "[Scan] Loading project: "], projectConfig,
            path, emitter;

        if (!config) {
            _log.error(msg[0]);
            throw msg[0];
            return undefined;
        }

        var projectConfig,
            path = (config.path || "."),
            emitter = config.emitter;

        if (path) {
            path = [path, "catproject.json"].join("/");
            path = _path.normalize(path);

            (new _fsconfig(path, function (data) {
                if (data) {
                    try {
                        projectConfig = new _Config({data: data, emitter: emitter});

                    } catch (e) {
                        throw Error(e);
                    }

                } else {
                    _log.error(msg[1]);
                }
                _log.debug(msg[2], data);
            }));
        }
        return projectConfig;
    };

module.exports = function () {

    return {
        load: _loader
    };
}();