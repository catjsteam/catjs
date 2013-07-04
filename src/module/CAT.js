
var CAT = function() {

    var _global = require("./CATGlob.js"),
        _log =  _global.log(),
        _project = require("./Project.js"),
        _typedas = require("typedas"),
        _path = require("path"),
        _properties = require("./Properties.js"),
        _events = require('events'),
        _emitter = new _events.EventEmitter();

    return {

        init: function(config) {

            // initial properties
            _global.set("home", ((config && config.home) || {home: {path: "."}}));
            _properties.init(this, config);

        },

        apply: function(config) {


            function _init() {
                if (!config) {
                    return undefined;
                }
                var home = _global.get("home"),
                    workingDir;

                if (home && home.working) {
                    workingDir = home.working.path;
                }

                target = config.task;
                grunt = config.grunt;
                args = config;
                path = (config.path || workingDir);

                if (path) {
                    _log.debug("[CAT] Initial, current location: " + _path.resolve(path));
                }

            }

            function _apply() {


                var project;
                if (path) {
                    // load the project
                    project = _project.load({path: path, emitter: _emitter});

                    // handle the incoming target input
                    if (target) {
                        target = target.toString();
                        target = target.toLowerCase();

                        _log.info("[CAT] running target: " + target);
                        // import the target module and call it
                        try {
                            targetlib = require(["./action/", target, "/action.js"].join(""));
                            if (targetlib) {
                                if (targetlib[target] && _typedas.isFunction(targetlib[target])) {
                                    targetlib[target].call(CAT, {grunt: grunt, project: project, emitter: _emitter});
                                } else {
                                    throw ["Error occurred, Task: ", target, "is not valid or not a function "].join("");
                                }
                            }
                        } catch (e) {
                            _log.error("[CAT] Failed to run project task: " + target + " "  + e);
                        }
                    }
                } else {
                    _log.error(msg[0]);
                    throw msg[0];

                }
            }

            _log.debug("[CAT] Initial, command line arguments: " + JSON.stringify(config));

            // TODO messages should be taken from resource
            var targetlib, target, grunt, args, path,
                msg = ["[CAT] Project failed to load, No valid argument path was found"];

            _init();
            _apply();

        }
    };


}();


module.exports = function() {

    return CAT;

}();
