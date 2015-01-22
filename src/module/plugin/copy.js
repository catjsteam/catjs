var _fs = require("fs.extra"),
    _wrench = require("wrench"),
    _typedas = require("typedas"),
    _log = catrequire("cat.global").log(),
    _utils = catrequire("cat.utils"),
    _path = require("path"),
    _basePlugin = require("./Base.js"),
    _glob = require("glob"),
    _to,

    /**
     * @param typeObj The reference object of type file|folder
     */
        _filtersFn2 = function (typeObj, filters) {

        var exitCondition = 0;

        if (typeObj && filters && _typedas.isArray(filters)) {

            filters.forEach(function (filter) {
                if (filter) {
                    filter.apply(function () {

                        var extName = _path.extname(typeObj);
                        if (this.ext) {
                            this.ext.forEach(function (item) {
                                if (item === extName) {
                                    exitCondition++;

                                }
                            });
                            // break;
                        }

                    });
                }
            });

            if (exitCondition > 0) {
                return true;
            }

        }

        return false;
    };

/**
 * Copy plugin, copies a target folder to a destination folder according to CAT project
 * Note: copy plugin extends Base.js implementation
 *
 * @type {*}
 */
module.exports = _basePlugin.ext(function () {

    var _me = this,
        _basePath,
        _targetFolderName,
        _global,
        _data,
        _emitter,
        _module,
        _errors,
        _internalConfig,
        _project,
        _wait = 0;


    function _getRelativeFile(file) {
        if (!file) {
            return file;
        }
        return file.substring(_basePath.length);
    }

    function _jobCopyWait() {
        if (_wait === 2) {
            _emitter.emit("job.wait", {status: "done"});
        }
        _wait = 0;
    }

    _module = {

        done: function () {
            _emitter.removeListener("scan.init", _module.initListener);
            _emitter.removeListener("scan.file", _module.file);
            _emitter.removeListener("scan.folder", _module.folder);
            _emitter.removeListener("scan.done", _module.done);

            if (!_wait) {
                _emitter.emit("job.wait", {status: "done"});
            } else {
                _wait = 2;
            }
            //_emitter.on("job.copy.wait", _jobCopyWait);
            //_emitter.removeListener("job.copy.wait", _jobCopyWait);

        },

        file: function (file) {
            _wait = 1;

            var from = file,
                filters = _me.getFilters(),
                to = _me.getTo();

            if (_me.isDisabled()) {
                return undefined;
            }
            if (file) {
                from = _getRelativeFile(file);
                
                _utils.copySync(file, _path.normalize(_to + "/" + from), function (err) {
                    if (err) {
                        _log.error("[copy action] failed to copy file: " + file + "err: " + err);
                        throw err;
                    }
                });
    
    
            }

            _emitter.emit("job.copy.wait", {status: "wait"});

        },

        folder: function (folder) {
            _wait = 1;

            var tmpFolder;

            if (_me.isDisabled()) {
                return undefined;
            }
            if (folder) {
                tmpFolder = _path.normalize(_to + "/" + folder.substring(_basePath.length));

                if (!_fs.existsSync(tmpFolder)) {
                    _utils.mkdirSync(tmpFolder);
                }
            }

            _emitter.emit("job.copy.wait", {status: "wait"});

        },

        getListeners: function (eventName) {
            if (_me.isDisabled()) {
                return undefined;
            }
            return _emitter.listeners(eventName);

        },

        initListener: function (config) {

            _basePath = (config ? config.path : undefined);
            if (!_basePath) {
                _utils.error("[Scrap Plugin] No valid base path");
            }

            // TODO refactor - create proper functionality in the configuration target
            if (!_to) {
                // setting 'folder name' project
                // TODO change it to _project.getTargetFolder
                if (_global) {
                    _targetFolderName = _global.name;

                    _to = _me.getTo();
                    _utils.mkdirSync(_to);
                }
            }

        },

        /**
         * e.g. [{type:"file|folder|*", ext:"png", name:"*test*" callback: function(file/folder) {}}]
         *
         * @param config The configuration:
         *          data - The configuration data
         *          emitter - The emitter reference
         *          global - The global data configuration
         *          internalConfig - CAT internal configuration
         */
        init: function (config) {

            var dependency,
                frompath, topath, files,
                stats;

            function _copyRecursiveSync(src, dest) {
                _wrench.mkdirSyncRecursive(dest, 0777);

                _wrench.copyDirSyncRecursive(src, dest, {
                    forceDelete: true,
                    preserveFiles: true
                });
            }

            function _copx(afrompath, cb) {

                var me = this,
                    paths;

                paths = afrompath;
                if (paths.length > 0) {
                    paths.forEach(function(path) {

                        stats = _fs.statSync(path);

                        if (stats.isDirectory()) {
                            _copyRecursiveSync(path, topath);

                        } else {

                            _utils.copySync(path, _path.join(topath, _path.basename(path)));

                        }

                    });
                }

                if (cb) {
                    cb.call(me);
                }

            }

            // TODO extract messages to resource bundle with message format
            _errors = ["copy action] copy operation disabled, No valid configuration"];

            if (!config) {
                _log.error(_errors[0]);
                _me.setDisabled(true);
            }

            _emitter = config.emitter;
            _global = config.global;
            _data = config.data;
            _internalConfig = config.internalConfig;
            _project = config.internalConfig.externalConfig.project;

            // initial data binding to 'this'
            _me.dataInit(_data);

            function _copyrec(afrompath, cb) {

                _copx(afrompath, cb);

            }

            dependency = _me.get("dependency");

            // Listen to the process emitter
            if (!dependency) {
                // just copy :)

                frompath = _me.get("from");
                topath = _me.get("to");

                if (frompath) {
                    frompath = (frompath.path ? frompath.path : undefined);
                }
                if (topath) {
                    topath = (topath.path ? topath.path : undefined);
                }

                if (topath && frompath) {

                    if (_typedas.isArray(frompath)) {

                        frompath.forEach(function(path) {

                            frompath = _glob.sync(path);

                            _copyrec(frompath, function () {
                                _emitter.emit("job.done", {status: "done"});
                            });

                        });
                     } else {

                        frompath = _glob.sync(frompath);

                        _copyrec(frompath, function () {
                            _emitter.emit("job.done", {status: "done"});
                        });

                    }

                } else {
                    _emitter.emit("job.done", {status: "done"});
                    _log.warning("[copy action] No valid 'from' and/or 'to' properties, failed to copy");
                }

            } else if (dependency === "scan") {
                if (_emitter) {
                    _emitter.removeListener("job.copy.wait", _jobCopyWait);
                    _emitter.on("scan.init", _module.initListener);
                    _emitter.on("scan.file", _module.file);
                    _emitter.on("scan.folder", _module.folder);
                    _emitter.on("scan.done", _module.done);
                    _emitter.on("job.copy.wait", _jobCopyWait);
                    _wait = 0;
                } else {
                    _log.warning("[copy action] No valid emitter, failed to assign listeners");
                }
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
            return { dependencies: ["scan", "manager"]};
        }
    };

    return _module;
});