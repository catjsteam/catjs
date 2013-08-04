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
        _me = this;

    return {

        // TODO make one file with embed dependency according to the manifest
        // TODO grunt can call import the manifest (consider)
        init: function (config) {

            var imports,
                extensionParams,
                errors = ["[libraries plugin] No valid configuration"],
                manifestFileName = "manifest.json",
                catWorkPath = _catglobal.get("home").working.path,
                manifestLib = [catlibs, manifestFileName].join("/"),
                manifest = _fs.readFileSync(manifestLib, "utf8"),
                libraries,
                slot = 0;                ;


            function _exec() {
                var library = libraries[slot],
                    process1, process2,
                    workPath = _path.normalize([catlibs, library.name].join("/")),
                    catProjectLib = _path.normalize([catWorkPath, "lib"].join("/")),
                    targetManifestPath = [catProjectLib, manifestFileName].join("/");

                // create cat project lib folder if !exists
                if (!_fs.existsSync(catProjectLib)) {
                    _fs.mkdirSync(catProjectLib);
                }
                // copy the manifest file
                try {
                    _utils.copySync(manifestLib, targetManifestPath);
                } catch(e) {
                    _log.error(_props.get("cat.file.copy.failed").format("[libraries]", targetManifestPath, e))
                }

                function _copyResource() {
                    var from = _path.normalize([workPath, "target", library.prod].join("/")),
                        to = _path.normalize([catProjectLib, library.prod].join("/"));

                    // copy the library to the current cat project
                    try {
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