var _catglobal = catrequire("cat.global"),
    _log = _catglobal.log(),
    _path = require("path"),
    _props = catrequire("cat.props"),
    _basePlugin = catrequire("cat.plugin.base"),
    _utils = catrequire("cat.utils"),
    _fs = require("fs.extra"),
    _typedas = require("typedas"),
    _jsutils = require("js.utils");

module.exports = _basePlugin.ext(function () {

    function _minify(config) {

        var task,
            mode = config.mode,
            path = config.path,
            name = config.name,
            src = config.src;

        if (!src || !path || !name) {
            _log.error("[CAT minify plugin] src, name, path are required properties ");
            return undefined;
        }

        try {
            console.log(_path.resolve("./src"));
           task = _jsutils.Task[mode];
            if (task) {
                task({
                    src: src,
                    out:{
                        name: name,
                        path: path
                    },
                    jshint: {
                        opt: {
                            "evil": true,
                            "strict": false,
                            "curly": true,
                            "eqeqeq": true,
                            "immed": false,
                            "latedef": true,
                            "newcap": false,
                            "noarg": true,
                            "sub": true,
                            "undef": true,
                            "boss": true,
                            "eqnull": true,
                            "node": true,
                            "es5": false
                        },
                        "globals": {
                            XMLHttpRequest: true,
                            document: true,
                            _cat: true,
                            chai: true
                        }
                    }
                });
            }

        } catch(e) {
            _log.error("[CAT minify plugin] failed with errors: ", e);
        }

    }

    var _emitter,
        _global,
        _data,
        _internalConfig,
        _project,
        _me = this;

    return {

        /**
         *  Initial plugin function
         *
         * @param config The configuration:
         *          data - The configuration data
         *          emitter - The emitter reference
         *          global - The global data configuration
         *          internalConfig - CAT internal configuration
         */
        init: function (config) {

            var src,
                path,
                name,
                mode,
                extensionParams,
                errors = ["[libraries plugin] No valid configuration"];

            if (!config) {
                _log.error(errors[1]);
                _me.setDisabled(true);
            }

            _emitter = config.emitter;
            _global = config.global;
            _data = config.data;
            _internalConfig = config.internalConfig;
            _project = (_internalConfig ? _internalConfig.getProject() : undefined);

            // initial data binding to 'this'
            _me.dataInit(_data);
            extensionParams = _data.data;

            if (config && extensionParams) {

                src = ("src" in extensionParams && extensionParams.src);
                name = ("filename" in extensionParams && extensionParams.filename);
                path = (("path" in extensionParams && extensionParams.path) || ".");
                mode = ( ("mode" in extensionParams && extensionParams.mode) || "dev");

                if (src) {

                    // TODO remove the hardcoded dev and get dev/prod
                    _minify({
                        src: src,
                        name:name,
                        path: path,
                        mode: mode
                    });

                } else {
                    _log.error("[CAT clean plugin] 'src' property is required ");
                }

                // done processing notification for the next task to take place
                _emitter.emit("job.done", {status: "done"});

            }
        },
        /**
         * Validate the plugin
         *
         *      dependencies {Array} The array of the supported dependencies types
         *
         * @returns {{dependencies: Array}}
         */
        validate: function() {
            return { dependencies: ["manager"]}
        }

    }

});