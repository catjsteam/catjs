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
                action,
                extensionParams,
                errors = ["[libraries plugin] No valid configuration"],
                manifestFileName = "manifest.json",
                manifestLib = _path.join(global.catlibs, manifestFileName),
                manifest,
                libraries,
                slot = 0;

            if (_fs.existsSync(manifestLib)) {
                manifest = _fs.readFileSync(manifestLib, "utf8");
            }

            function _exec() {

                var library = libraries[slot],
                    actions = {},
                    process1, process2,
                    catProjectLib = (_project ? _project.getInfo("lib.source") : undefined),
                    targetManifestPath = _path.join(catProjectLib, manifestFileName),
                    workPath = _path.join(cathome, _project.getInfo("libraries").path, "cat");

                actions.install = function () {

                    process1 = _spawn().spawn({
                        command: "npm",
                        args: ["install"],
                        options: {cwd: workPath},
                        emitter: _emitter
                    });

                    process1.on('close', function (code) {
                        if (code !== 0) {
                            _log.info('[spawn close] exited with code ' + code);
                        }

                        process2 = _spawn().spawn({
                            command: "grunt",
                            args: [action, "--no-color"],
                            options: {cwd: workPath},
                            emitter: _emitter
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
                            if (_emitter) {
                                _emitter.emit("job.done", {status: "done"});
                            }

                        });
                    });
                };

                actions.clean = function () {


                    process1 = _spawn().spawn({
                        command: "npm",
                        args: ["install"],
                        options: {cwd: workPath},
                        emitter: _emitter
                    });

                    process1.on('close', function (code) {
                        if (code !== 0) {
                            _log.info('[spawn close] exited with code ' + code);
                        }

                        process2 = _spawn().spawn({
                            command: "grunt",
                            args: [action, "--no-color"],
                            options: {cwd: workPath},
                            emitter: _emitter
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
                            if (_emitter) {
                                _emitter.emit("job.done", {status: "done"});
                            }

                            // delete node_modules libs
                            var nodeModulesFolders = _path.join(workPath, "node_modules");
                            if (nodeModulesFolders) {
                                _utils.deleteSync(nodeModulesFolders);
                            }

                        });
                    });
                };

                // copy the manifest file
                try {
                    if (_fs.existsSync(manifestLib) && _fs.existsSync(targetManifestPath)) {
                        _utils.copySync(manifestLib, targetManifestPath);
                    }
                } catch (e) {
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
                        from = _path.join(workPath, "target", library.dev),
                            to = _path.join(catProjectLib, library.dev);
                        _utils.copySync(from, to);
                    } catch (e) {
                        _log.error(_props.get("cat.file.copy.failed").format("[libraries]", from, e))
                    }
                }

                if (actions[action]) {
                    actions[action].call(this);
                }

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

            imports = extensionParams.imports;
            action = extensionParams.action;

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

            }
        }

    }

});