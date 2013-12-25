var _fsconfig = require("./../utils/fs/Config.js"),
    _Config = catrequire("cat.common.config"),
    _global = catrequire("cat.global"),
    _utils = catrequire("cat.utils"),
    _props = catrequire("cat.props"),
    _fs = require("fs.extra"),
    _log = _global.log(),
    _path = require("path"),
    _console = require("./../Console"),
    _project,

    /**
     * Project configuration loader
     *
     * @param config The passed arguments
     *        path - The path of the project
     *        emitter - The emitter to be used for the project
     */
    _loader = function (config) {


        function _loadProject(callback) {

            if (!callback) {
                _console.log("[CAT Project] Missing callback for the project loader ");
            }

            try {
                // Loading catproject.json file > data
                (new _fsconfig(path, callback));
            } catch (e) {
                _console.log("[CAT Project] error occured, probably not valid cat project [catproject.json]: ");
            }
        }

        var msg = ["[Project] config argument is not valid",
                "[Project] Data is not valid, expecting data of type Array",
                "[Project] Loading project: "],
            path, emitter,
            callback = (config && ("callback" in config) ? config.callback : undefined),
            baseCallback = function (data) {
                if (data) {
                    try {
                        _project = new _Config({data: data, emitter: emitter});

                    } catch (e) {
                        throw Error(e);
                    }

                } else {
                    _log.error(msg[1]);
                }
            };

        if (!config) {
            _log.error(msg[0]);
            throw msg[0];
            return undefined;
        }

        path = (config.path || ".");
        emitter = config.emitter;

        if (path) {
            path = _path.join(path, "catproject.json");

            // Load the project according to the given configuration
            _loadProject((callback || baseCallback));
        }
        return _project;
    };

module.exports = function () {

    var _me;

    _me = {
        load: _loader,

        getProject: function() {
            return _project;
        },

        getInfo: function(key) {
            return _project.getInfo(key);
        },

        /**
         *
         * @param config
         *      path {String} The path to load the project
         *      data {String} The data to be updated
         */
        update: function(config) {

            var callback = function(data) {
                if (_project) {
                    _project.update({data:data});
                }
            }, data, path;

            if (config) {
                data = ("data" in config && config.data ? config.data : undefined);
                path = ("path" in config && config.path ? config.path : undefined);
            }

            if (data) {
                callback(data);
            } else {
                if (callback && path) {
                    _me.load({
                        callback: callback,
                        path: path
                    });
                }
            }

        }
    };

    return _me;
}();