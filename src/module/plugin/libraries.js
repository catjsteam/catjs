var _catglobal = catrequire("cat.global"),
    _log = _catglobal.log(),
    _path = require("path"),
    _props = catrequire("cat.props"),
    _basePlugin = catrequire("cat.plugin.base"),
    _utils = catrequire("cat.utils"),
    _spawn = catrequire("cat.plugin.spawn"),
    _fs = require("fs.extra"),
    _typedas = require("typedas"),
    _bower = require('bower');

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
                catProjectLib,
                library, mode,
                workPath,
                libWorkPath,
                manifest,
                libraries,
                slot = 0;

            if (_fs.existsSync(manifestLib)) {
                manifest = _fs.readFileSync(manifestLib, "utf8");
            }

            function _copyResource() {


                if (!catProjectLib) {
                    _log.error(_props.get("cat.error.config.missing").format("[libraries ext]", "lib"));
                    return undefined;
                }
                var from,
                    to,
                    artifact = library[mode];

                /**
                 * Copy resource synchronously
                 *
                 * @param item The artifact file name
                 * @param base The base path
                 * @private
                 */
                function _copy(base, item) {
                    // copy the library to the current cat project
                    try {
                        // copy dev
                        if (item) {

                            from = (base ? _path.join(libWorkPath, base, item) : _path.join(libWorkPath, item));
                            to = _path.join(catProjectLib, item);
                            _utils.copySync(from, to);

                        } else {
                            _log.warning(_props.get("cat.plugin.libraries.config.missing").format("[libraries ext]", library.name));
                        }
                    } catch (e) {
                        _log.error(_props.get("cat.file.copy.failed").format("[libraries]", from, e))
                    }
                }

                // copy artifacts
                if (artifact && _typedas.isArray(artifact)) {
                    artifact.forEach(function (item) {
                        _copy((library.base || undefined), item);
                    });
                }
            }

            function _exec() {

                var actions = {},
                    process1, process2,
                    targetManifestPath = _path.join(catProjectLib, manifestFileName);

                library = libraries[slot];
                libWorkPath = _path.join(workPath, library.name);

                // copy the manifest file
                try {
                    if (_fs.existsSync(manifestLib) && _fs.existsSync(targetManifestPath)) {
                        _utils.copySync(manifestLib, targetManifestPath);
                    }
                } catch (e) {
                    _log.error(_props.get("cat.file.copy.failed").format("[libraries]", targetManifestPath, e))
                }

                actions.install = function () {

                    var bowerConfig = {cwd: workPath};

                    if (library.install === "internal") {
                        process1 = _spawn().spawn({
                            command: "npm",
                            args: ["install"],
                            options: {cwd: libWorkPath},
                            emitter: _emitter
                        });

                        process1.on('close', function (code) {
                            if (code !== 0) {
                                _log.info('[spawn close] exited with code ' + code);
                            }

                            process2 = _spawn().spawn({
                                command: "grunt",
                                args: [action, "--no-color"],
                                options: {cwd: libWorkPath},
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

                    } else if (library.install === "bower") {

                        _bower.commands.install([library.name], {}, bowerConfig)
                            .on('end', function (installed) {
                                _log.info('[bower] library ' + library.name + ' Installed');

                            });
                        _copyResource();
                    }
                };


                actions.clean = function () {

                    if (library.install === "internal") {
                        process1 = _spawn().spawn({
                            command: "npm",
                            args: ["install"],
                            options: {cwd: libWorkPath},
                            emitter: _emitter
                        });

                        process1.on('close', function (code) {
                            if (code !== 0) {
                                _log.info('[spawn close] exited with code ' + code);
                            }

                            process2 = _spawn().spawn({
                                command: "grunt",
                                args: [action, "--no-color"],
                                options: {cwd: libWorkPath},
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
                                var nodeModulesFolders = _path.join(libWorkPath, "node_modules");
                                if (nodeModulesFolders) {
                                    _utils.deleteSync(nodeModulesFolders);
                                }

                            });
                        });
                    } else if (library.install === "bower") {
                        _utils.deleteSync(_path.join(workPath, library.name));
                    }
                };

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

                    catProjectLib = (_project ? _project.getInfo("lib.source") : undefined);
                    libraries = manifest.libraries;
                    mode = manifest.mode;
                    workPath = _path.join(cathome, _project.getInfo("libraries").path);

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