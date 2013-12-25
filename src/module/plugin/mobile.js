var _catglobal = catrequire("cat.global"),
    _log = _catglobal.log(),
    _path = require("path"),
    _props = catrequire("cat.props"),
    _basePlugin = catrequire("cat.plugin.base"),
    _utils = catrequire("cat.utils"),
    _fs = require("fs.extra"),
    _typedas = require("typedas"),
    _spawn = catrequire("cat.plugin.spawn"),
    _myip = require("my-ip");

module.exports = _basePlugin.ext(function () {

    var _emitter,
        _global,
        _data,
        _internalConfig,
        _project,
        _me = this;

    function Devices(config) {

        var me= this,
            data = {
            android : {
                default: {
                    pkg: "com.hp.aamobile.cat/.example",
                    app: "phonegap.apk"
                },
                actions: {
                    "start" : {
                        command: "adb",
                        args: function(config) {
                            var defaults = data.android.default,
                                pkg = config.pkg, ip = config.host;
                            if (!pkg) {
                                pkg = defaults.pkg;
                            }
                            return ["shell", "am", "start",  "-e", "IP", ip, "-e", "PORT", port, "-n", pkg];
                        }
                    },
                    "install" : {
                        command: "adb",
                        args: function(config) {
                            var defaults = data.android.default,
                                app = config.app;
                            if (!app) {
                                app = defaults.pkg;
                            }
                            return ["install", "-r", app];
                        }
                    }
                }
            }
        };


        (function() {

            me.host = config.host;
            me.port = config.port;
            me.pkg = config.pkg;
            me.app = config.app;

            if (!me.host) {
                _utils.log("error", "[CAT mobile plugin] No valid host was found");
                return undefined;

            } else if (me.host === "localhost") {
                // try resolving the ip
                me.ip = _myip();

                if (!me.ip) {
                    _utils.log("error", "[CAT mobile plugin] I cannot use localhost, please configure your ip (see catproject.json)");
                    return undefined;
                } else {
                    _utils.log("warning", "[CAT mobile plugin] I cannot use localhost but your ip was resolved: '" + me.ip + "' I'll try using it...");
                }

            }
        })();


        this.get = function(config) {
            var device = data[config.device],
                actions, action;

            if (!device) {
                _log.warning("[CAT mobile plugin] No support for this device: ", device);
            }

            actions = device.actions;
            action = actions[config.action];
            if (!action) {
                _log.warning("[CAT mobile plugin] No support for this action: ", action);
                return undefined;
            }

            return {
                command: action.command,
                args: action.args({
                    host: this.host,
                    port: this.port,
                    pkg: this.pkg,
                    app: this.app
                })
            };
        }
    }

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

            var extensionParams,
                errors = ["[libraries plugin] No valid configuration"],
                device,
                devices,
                host, port, pkg, app,
                action,
                commands,
                process;

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

                device = ("device" in extensionParams && extensionParams.device);
                action = ("action" in extensionParams && extensionParams.action);

                if (!device || !action) {
                    _utils.log("error", "[CAT mobile plugin] Missing parameters for plugin 'mobile' ");
                    return undefined;
                }

                host = ("host" in extensionParams ? extensionParams.host : undefined);
                port = ("port" in extensionParams ? extensionParams.port : undefined);
                pkg = ("pkg" in extensionParams ? extensionParams.pkg : undefined);
                app = ("app" in extensionParams ? extensionParams.app : undefined);

                if (!host) {
                    host = _project.getInfo("host");
                }

                devices = new Devices({
                    host: host,
                    port: port,
                    pkg: pkg,
                    app: app
                });

                if (devices) {
                    commands = devices.get({
                        action: action,
                        device: device
                    });
                }

                if (commands) {
                    process = _spawn().spawn({
                        command: commands.command,
                        args: commands.args,
                        options: {},
                        emitter: _emitter
                    });

                    process.on('close', function (code) {
                        if (code !== 0) {
                            _log.info('[CAT mobile plugin, spawn close] exited with code ' + code);
                        }

                        // done processing notification for the next task to take place
                        _emitter.emit("job.done", {status: "done"});
                    });
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
        validate: function() {
            return { dependencies: ["manager"]}
        }

    }

});