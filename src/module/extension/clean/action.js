var _fs = require('fs.extra'),
    _path = require('path'),
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _utils = catrequire("cat.utils"),
    _typedas = require("typedas"),
    _props = catrequire("cat.props"),
    _basePlugin = require("./../Base.js");

/**
 * Clean extension for CAT
 *
 * @type {module.exports}
 */
module.exports = _basePlugin.ext(function () {

    var _me = this,
        emitter,


        /**
         * Clean the artifacts according to the given path
         *
         * @param dirs The path to be cleaned
         * @returns {undefined}
         * @private
         */
          _clean = function (dirs) {

            var projectWorkPath = _global.get("home").working.path,
                project = _me.getProject(),
                libTargetFolder;

            function _delete(dir) {
                _utils.deleteSync(dir);
            }

            emitter = _me.getEmitter();

            if (!dirs) {

                _utils.error(_props.get("cat.arguments.missing").format("[cat action]", "dirs"));
                return undefined;
            }

            if (_typedas.isArray(dirs)) {
                dirs.forEach(function (dir) {
                    _delete(dir);
                });
            } else if (_typedas.isString(dirs)) {
                _delete(dirs);

            } else {
                _log.warning(_props.get("cat.arguments").format("[clean action]", typeof(dirs)));
            }

            // TODO consider removeing all log created files.. or copy it to an archive folder
            _delete([projectWorkPath, "_cat_md.json"].join("/"));

            libTargetFolder = project.getInfo("lib.target");
            if (libTargetFolder) {
                _delete(libTargetFolder);
            }

            emitter.emit("job.done", {status: "done"});

        },


        _module = {

            watch: function() {

            },

            /**
             * Apply the clean extension.
             *
             * @param config
             *      path - The base path to clean from
             */
            apply: function (config) {

                var targetPath = (config ? config.path : undefined),
                    error = "[Scan Ext] no valid configuration for 'apply' functionality",
                    data,
                    workingPath = _global.get("home").working.path,
                    args = [];

                _me.apply(config);

                if (!targetPath) {
                    _utils.error(error);
                }

                // handle incoming target path
                args.push(targetPath);

                // handle incoming path data from the plugin
                data = _me._data;
                if (data && data.path) {
                    if (_typedas.isString(data.path)) {
                        args.push(_path.join(workingPath,data.path));

                    } else if (_typedas.isArray(data.path)) {
                        data.path.forEach(function(path){
                            if (path) {
                                args.push(_path.join(workingPath, path));
                            }
                        });
                    }
                }

                _clean(args);
            },

            /**
             * Plugin initialization
             *
             * @param config The passed arguments
             *          project - The project configuration object
             *          grunt - The grunt handle
             *          emitter - The emitter handle
             *
             * @param ext The extension properties
             */
            init: function (config, ext) {
                _me.initialize(config, ext);

            }
        };

    return _module;

});