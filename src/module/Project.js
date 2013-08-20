var _fsconfig = require("./utils/fs/Config.js"),
    _Config = require("./../module/common/project/config/Config.js"),
    _global = catrequire("cat.global"),
    _utils = catrequire("cat.utils"),
    _props = catrequire("cat.props"),
    _fs = require("fs.extra"),
    _log = _global.log(),
    _path = require("path"),
    _console = require("./Console"),
    _project,

    /**
     * Project configuration loader
     *
     * @param config The passed arguments
     *        path - The path of the project
     *        emitter - The emitter to be used for the project
     */
    _loader = function (config) {


        function _loadProject() {
            try {
                (new _fsconfig(path, function (data) {
                    if (data) {
                        try {
                            _project = new _Config({data: data, emitter: emitter});

                        } catch (e) {
                            throw Error(e);
                        }

                    } else {
                        _log.error(msg[1]);
                    }
                }));
            } catch (e) {
                _console.log("[Config] error occured, probably not valid cat project [catproject.json]: ");
            }

        }

        var msg = ["[Project] config argument is not valid",
                "[Project] Data is not valid, expecting data of type Array",
                "[Project] Loading project: "],
            path, emitter;

        if (!config) {
            _log.error(msg[0]);
            throw msg[0];
            return undefined;
        }

        path = (config.path || ".");
        emitter = config.emitter;

        if (path) {
            path = [path, "catproject.json"].join("/");
            path = _path.normalize(path);

            // Load the project according to the given configuration
            _loadProject();
        }
        return _project;
    };

module.exports = function () {

    return {
        load: _loader,

        getProject: function() {
            return _project;
        },

        getInfo: function(key) {
            return _project.getInfo(key);
        },

        update: function(config) {
            if (_project) {
                _project.update(config);

            } else {

            }
        }
    };
}();