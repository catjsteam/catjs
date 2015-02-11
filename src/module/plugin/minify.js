var _catglobal = catrequire("cat.global"),
    _log = _catglobal.log(),
    _path = require("path"),
    _props = catrequire("cat.props"),
    _basePlugin = catrequire("cat.plugin.base"),
    _utils = catrequire("cat.utils"),
    _fs = require("fs.extra"),
    _typedas = require("typedas"),
    _jsutils = require("js.utils"),
    _glob = require("glob"),
    _minimatch = require("minimatch");

module.exports = _basePlugin.ext(function () {

    function _minify(config) {

        var task,
            mode = config.mode,
            path = config.path,
            name = config.name,
            jshint = config.jshint,
            exclude, excludes = config.excludes,
            src = config.src,
            srcexcludes = [], srcexclude, counter,
            idx = 0, size = 0;

        if (!src || !path || !name) {
            _log.error("[CAT minify plugin] src, name, path are required properties ");
            return undefined;
        }

        try {

            task = _jsutils.Task[mode];
            if (task) {
                if (excludes) {
                    size = excludes.length;
                    for (idx = 0; idx < size; idx++) {
                        exclude = excludes[idx];
                        if (exclude) {
                            if (_typedas.isArray(src)) {
                                counter = 0;
                                src.forEach(function (item) {
                                    if (_minimatch(item, exclude, { matchBase: true })) {
                                        srcexcludes.push(counter);
                                    }
                                    counter++;
                                });
                            } else if (!_typedas.isArray(src)) {
                                if (_minimatch(src, exclude, { matchBase: true })) {
                                    return undefined;
                                }
                            }
                        }
                    }
                    if (_typedas.isArray(src) && srcexcludes.length > 0) {
                        srcexcludes.forEach(function (srcexclude) {
                            src = src.splice(srcexclude, 1);
                        });
                    }
                }
                
                if (!jshint) {
                    jshint = {};
                }

                if (!jshint.opt) {
                    jshint.opt = {
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
                    };
                }

                if (!jshint.globals) {
                    jshint.globals = {};
                }
                
                jshint.globals["_cat"] = true;
                jshint.globals["angular"] = true;
                jshint.globals["chai"] = true;
                jshint.globals["$"] = true;
                jshint.globals["window"] = true;
                jshint.globals["document"] = true;
                jshint.globals["XMLHttpRequest"] = true;
                jshint.globals["describe"] = true;
                jshint.globals["xdescribe"] = true;
                jshint.globals["it"] = true;
                jshint.globals["xit"] = true;
                jshint.globals["before"] = true;
                jshint.globals["beforeEach"] = true;
                jshint.globals["after"] = true;
                jshint.globals["afterEach"] = true;


                task({
                    src: src,
                    out: {
                        name: name,
                        path: path
                    },
                    jshint: jshint
                });
            }

        } catch (e) {
            _log.error("[CAT minify plugin] failed with errors, file:", src);
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
                srcs = [],
                path,
                name,
                mode,
                jshint,
                isolate,
                excludes,
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

                src = ("src" in extensionParams ? extensionParams.src : undefined);
                jshint = ("jshint" in extensionParams ? extensionParams.jshint : undefined);
                name = ("filename" in extensionParams ? extensionParams.filename : undefined);
                path = (("path" in extensionParams ? extensionParams.path : undefined) || ".");
                mode = ( ("mode" in extensionParams ? extensionParams.mode : undefined) || "dev");
                excludes = ("excludes" in extensionParams ? extensionParams.excludes : undefined);
                isolate = ( ("isolate" in extensionParams ? (extensionParams.isolate === "true" ? true : false) : undefined) || false);


                if (src) {
                    src.forEach(function (item) {
                        srcs = srcs.concat(_glob.sync(item));
                    });

                    if (srcs && srcs.length > 0) {
                        if (isolate) {

                            srcs.forEach(function (item) {
                                var basename = _path.basename(item);
                                if (basename.indexOf(".catmin") === -1) {
                                    name = _path.basename(item, _path.extname(item)) + _path.extname(item);
                                }
                                _minify({
                                    src: item,
                                    name: name,
                                    path: _path.dirname(item),
                                    mode: mode,
                                    excludes: excludes,
                                    jshint: jshint
                                });
                            });
                        } else {
                            // TODO remove the hardcoded dev and get dev/prod
                            _minify({
                                src: src,
                                name: name,
                                path: path,
                                mode: mode,
                                excludes: excludes,
                                jshint: jshint
                            });
                        }
                    } else {
                        _fs.writeFileSync(_path.join(path, name), "", { mode: 0777 })
                    }
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
        validate: function () {
            return { dependencies: ["manager"]};
        }

    };

});