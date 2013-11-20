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

    function _Concat() {

        this.concats = {};

        this.add = function(key, concat) {
            if (!this.concats[key]) {
                this.concats[key] = [];
            }

            this.concats[key].push(concat);
        }

        this.get = function(key) {
            return this.concats[key];
        }

        this.all = function() {
            var result = [],
                key;

            for (key in this.concats) {
                if (this.concats.hasOwnProperty(key)) {
                    result.push({
                        key: key,
                        value: this.get(key)
                    });
                }
            }

            return result;
        }
    }

    var _emitter,
        _global,
        _data,
        _internalConfig,
        _project,
        _me = this,
        concatenated = new _Concat();


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
                wipe = false,
                extensionParams,
                errors = ["[libraries plugin] No valid configuration"],
                manifestFileName = "manifest.json",
                manifestLib = _path.join(global.catlibs, manifestFileName),
                catProjectLib,
                catProjectLibName,
                catProjectLibTarget,
                library, mode,
                workPath,
                libWorkPath,
                manifest,
                libraries,
                slot = 0,
                envinfo;

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

                    function _getExtension(filename) {
                        var ext = _path.extname(filename||'').split('.');
                        return ext[ext.length - 1];
                    }

                    var content, filetype;

                    // copy the library to the current cat project
                    try {
                        // copy dev
                        if (item) {

                            from = (base ? _path.join(libWorkPath, base, item) : _path.join(libWorkPath, item));
                            to = _path.join(catProjectLib, item);
                            _utils.copySync(from, to);

                            // concatenation
                            content = _fs.readFileSync(from);
                            if (content) {
//                                concatenated.push(content);
                                filetype = _getExtension(from);
                                if (filetype) {
                                    concatenated.add(filetype, content);
                                }
                            }


                        } else {
                            _log.warning(_props.get("cat.plugin.libraries.config.missing").format("[libraries ext]", library.name));
                        }
                    } catch (e) {
                        _log.error(_props.get("cat.file.copy.failed").format("[libraries]", from, e))
                    }
                }

                if (artifact && _typedas.isArray(artifact)) {
                    artifact.forEach(function (item) {
                        // copy artifacts
                        _copy((library.base || undefined), item);
                    });
                }
            }

            function _exec() {

                var actions = {},
                    process1,
                    targetManifestPath = _path.join(catProjectLib, manifestFileName),
                    doImport = false,
                    concatsByType;

                library = libraries[slot];


                if (imports && library){
                    if (_typedas.isArray(imports)) {
                        doImport = _utils.contains(imports, library.name);
                    } else {
                        _log.warning(_props.get("cat.arguments.type").format("[libraries ext]", "Array"));
                    }
                }

                libWorkPath = (library ? _path.join(workPath, library.name) : undefined);

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

                    function _copydone() {

                        _copyResource();
                        _exec();

                    }

                    if (library.install === "static") {

                        _copydone();


                    } else if (library.install === "internal") {
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

                            var process2 = _spawn().spawn({
                                command: "grunt",
                                args: [action, "--no-color"],
                                options: {cwd: libWorkPath},
                                emitter: _emitter
                            });

                            process2.on('close', function (code) {
                                if (code !== 0) {
                                    _log.info('[spawn close] exited with code ' + code);
                                }

                                _copydone();

                            });
                        });

                    } else if (library.install === "bower") {

                        if (!_utils.isWindows()) {
                            _bower.commands.install([library.name], {}, bowerConfig)
                                .on('end', function (installed) {
                                    _log.info('[bower] library ' + library.name + ' Installed');
                                    _copydone();
                                });

                        } else {
                            /* on windows we have an issue related to git <> bower
                             thus we are running custom spawn
                             */
                            process1 = _spawn().spawn({
                                command: "bowerutils.bat",
                                args: ["install", library.name],
                                options: bowerConfig,
                                emitter: _emitter
                            });

                            process1.on('close', function (code) {
                                if (code !== 0) {
                                    _log.info('[spawn close] exited with code ' + code);
                                } else {
                                    _log.info('[bower] library ' + library.name + ' Installed');
                                    _copydone();
                                }
                            });
                        }
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

                            var process2 = _spawn().spawn({
                                command: "grunt",
                                args: [action, "--no-color"],
                                options: {cwd: libWorkPath},
                                emitter: _emitter
                            });

                            process2.on('close', function (code) {
                                var nodeModulesFolders;

                                if (code !== 0) {
                                    _log.info('[spawn close] exited with code ' + code);
                                }

                                // delete node_modules libs
                                if (wipe) {
                                    nodeModulesFolders = _path.join(libWorkPath, "node_modules");
                                    if (nodeModulesFolders) {
                                        _utils.deleteSync(nodeModulesFolders);
                                    }
                                }
                                _exec();

                            });
                        });
                    } else if (library.install === "bower") {
                        _utils.deleteSync(_path.join(workPath, library.name));
                        _exec();
                    }
                };

                slot++;
                if (slot > libraries.length) {

                    // concat artifact files
                    concatsByType = concatenated.all();

                    concatsByType.forEach(function(concatItem) {

                        if (concatItem) {
                            if (concatItem.value.length > 0) {
                                catProjectLibTarget = _path.join(catProjectLib, "target");
                                if (!_fs.existsSync(catProjectLibTarget)) {
                                    _fs.mkdirSync(catProjectLibTarget);
                                }
                                _fs.writeFileSync(_path.join(catProjectLibTarget, (catProjectLibName + "." + concatItem.key)), concatItem.value.join(""))
                            }
                        }
                    });

                    if (_emitter) {
                        _emitter.emit("job.done", {status: "done"});
                    }

                    return undefined;
                }

                if ( doImport && actions[action]) {
                    actions[action].call(this);
                } else {
                    _exec();
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
            wipe = ((extensionParams.wipe === "true") ? true : false);

            if (config && extensionParams) {

                // prepare libraries
                if (manifest) {

                    manifest = JSON.parse(manifest);


                    libraries = manifest.libraries;
                    mode = manifest.mode;


                    if (_project) {
                        catProjectLib = _project.getInfo("lib.source");
                        envinfo = _project.getInfo("env");
                        if (envinfo) {
                            catProjectLibName = (envinfo.lib ? envinfo.lib.name : undefined);
                        }
                        if (!catProjectLibName) {
                            _log.info('[library] No valid name was found for CAT library (see catproject)');
                        }
                        workPath = _path.join(cathome, _project.getInfo("libraries").path);
                    }

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