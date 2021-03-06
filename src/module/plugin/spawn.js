var _catglobal = catrequire("cat.global"),
    _log = _catglobal.log(),
    _path = require("path"),
    _props = catrequire("cat.props"),
    _basePlugin = catrequire("cat.plugin.base"),
    _utils = catrequire("cat.utils");

module.exports = _basePlugin.ext(function () {

    var _emitter,
        _global,
        _data,
        _me = this,

        _module = {

            exec: function (config) {

                var spawn,
                    command,
                    options,
                    args,
                    extensionParams = _data.data;

                if (config && extensionParams) {

                    spawn = config.spawn;
                    command = extensionParams.command;
                    options = extensionParams.options;
                    args = extensionParams.args;

                    _module.spawn({
                        spawn: spawn,
                        command: command,
                        options: options,
                        args: args,
                        inline: true
                    });

                }
            },

            spawn: function(config) {

                if (!config) {
                    return undefined;
                }

                var chilsp,
                    command = config.command,
                    args = config.args,
                    options = config.options,
                    spawn = (config.spawn || require('child_process').spawn),
                    inline = config.inline,
                    emitter = (_emitter || config.emitter),
                    callback;

                try {

                    if (!options) {
                        options = {cwd: _catglobal.get("home").working.path};
                    }

                    if (_utils.isWindows()) {
                        args.unshift("/c", command);
                        command = "cmd";
                    }

                    chilsp = spawn(command, args, options);

                    chilsp.stdout.on('data', function (data) {
                        _log.info("[spawn info] " + data);
                    });

                    chilsp.stderr.on('data', function (data) {
                        _log.info('[spawn info] ' + data);
                    });

                    callback = function (code) {
                        if (code !== 0) {
                            _log.info('[spawn close] exited with code ' + code);
                        }
                        if (emitter && inline) {
                            emitter.emit("job.done", {status: "done"});
                        }
                        emitter.removeListener("spawn.exec", _module.exec);

                    };

                    chilsp.on('close', callback);
                    
                    if (chilsp.stdout ) {
                        chilsp.stdout.pipe(process.stdout);
                    }
                    if (chilsp.stderr) {
                        chilsp.stderr.pipe(process.stderr);
                    }
                    
                } catch (e) {
                    _utils.error(_props.get("cat.error").format("[spawn]", e));
                    if (emitter) {
                        emitter.emit("job.done", {status: "done"});
                    }
                }

                return chilsp;
            },

            /**
             * Get All listeners
             *
             * @param eventName
             * @returns {*}
             */
            getListeners: function (eventName) {
                if (_me.isDisabled()) {
                    return undefined;
                }
                return _emitter.listeners(eventName);

            },

            /**
             *
             *
             * @param config The configuration:
             *          data - The configuration data
             *          emitter - The emitter reference
             *          global - The global data configuration
             *          internalConfig - CAT internal configuration
             */
            init: function (config) {

                // TODO extract messages to resource bundle with message format
                var errors = ["[spawn plugin] spawn operation disabled, No valid configuration"];

                if (!config) {
                    _log.error(errors[1]);
                    _me.setDisabled(true);
                }

                _emitter = config.emitter;
                _global = config.global;
                _data = config.data;

                // initial data binding to 'this'
                _me.dataInit(_data);

                // Listen to the process emitter
                if (_emitter) {
                    _emitter.removeListener("spawn.exec", _module.exec);
                    _emitter.on("spawn.exec", _module.exec);
                    //  _emitter.on("scan.folder", _module.folder);
                } else {
                    _log.warning("[Scrap plugin] No valid emitter, failed to assign listeners");
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
                return { dependencies: ["spawn"]};
            }
        };

    return _module;
});