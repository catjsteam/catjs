var _catglobal = catrequire("cat.global"),
    _log = _catglobal.log(),
    _path = require("path"),
    _props = catrequire("cat.props"),
    _basePlugin = catrequire("cat.plugin.base"),
    _utils = catrequire("cat.utils"),
    _spawn = catrequire("cat.plugin.spawn"),
    _fs = require("fs.extra"),
    _typedas = require("typedas");

module.exports = _basePlugin.ext(function () {

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

            var imports,
                extensionParams,
                errors = ["[libraries plugin] No valid configuration"],
                manifestFileName = "manifest.json",
                catWorkPath = _catglobal.get("home").working.path,
                manifestLib = [global.catlibs, manifestFileName].join("/"),
                manifest = _fs.readFileSync(manifestLib, "utf8"),
                libraries,
                slot = 0;


            function _exec() {
                var library = libraries[slot],
                    process1, process2,
                    workPath = _path.normalize([global.catlibs, library.name].join("/")),
                    catProjectLib = (_project ? _project.getInfo("lib.source") : undefined),
                    targetManifestPath = [catProjectLib, manifestFileName].join("/");

                // copy the manifest file
                try {
                    _utils.copySync(manifestLib, targetManifestPath);
                } catch(e) {
                    _log.error(_props.get("cat.file.copy.failed").format("[libraries]", targetManifestPath, e))
                }

                function _copyResource() {
                    if (!catProjectLib) {
                        _log.error(_props.get("cat.error.config.missing").format("[libraries ext]", "lib"));
                        return undefined;
                    }
                    var from,
                        to;

                    // copy the library to the current cat project
                    // TODO according to the manifest copy only the wished mode
                    try {
//                        // copy prod
//                        from = _path.normalize([workPath, "target", library.prod].join("/")),
//                        to = _path.normalize([catProjectLib, library.prod].join("/"));
//                        _utils.copySync(from, to);

                        // copy dev
                        from = _path.normalize([workPath, "target", library.dev].join("/")),
                        to = _path.normalize([catProjectLib, library.dev].join("/"));
                        _utils.copySync(from, to);
                    } catch(e) {
                        _log.error(_props.get("cat.file.copy.failed").format("[libraries]", from, e))
                    }
                }

                process1 = _spawn().spawn({
                    command: "npm",
                    args: ["install"],
                    options: {cwd: workPath}
                });

                process1.on('close', function (code) {
                    if (code !== 0) {
                        _log.info('[spawn close] exited with code ' + code);
                    }

                    process2 = _spawn().spawn({
                        command: "grunt",
                        args: ["--no-color"],
                        options: {cwd: workPath}
                    });

                    process2.on('close', function (code) {
                        if (code !== 0) {
                            _log.info('[spawn close] exited with code ' + code);
                        }

                        _copyResource();

                        slot++;
                        if (slot < libraries.length) {
                            _exec();
                        }
                    });
                });
            }

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

                // prepare libraries
                if (manifest) {
                    manifest = JSON.parse(manifest);

                    libraries = manifest.libraries;
                    if (libraries &&
                        _typedas.isArray(libraries)) {

                        if (libraries.length > 0) {
                            _exec();
                        }
                    }
                }
                imports = extensionParams.imports;

            }
        }

    }

});