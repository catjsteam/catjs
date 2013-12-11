var _log = catrequire("cat.global").log(),
    _path = require("path"),
    _props = catrequire("cat.props"),
    _basePlugin = catrequire("cat.plugin.base"),
    _utils = catrequire("cat.utils"),

    _emitter,
    _global,
    _data,
    _internalConfig,
    _project;

module.exports = _basePlugin.ext(function () {


        var _me = this,

        _module = {

            /**
             * Handle webserver
             *
             * @param webserverext Webserver extension handle
             * @returns {*}
             * @private
             */
            _webserver: function(config) {

                if (!config) {
                    return undefined;
                }

                var  extensionParams = _data.data,
                    webserver = config.webserver,
                    thiz = config.thiz,
                    basePath = _project.getTargetFolder(),
                    path = (extensionParams.path ? _path.join(basePath, extensionParams.path) : basePath),
                    action = extensionParams.action,
                    set = extensionParams.set;

                try {
                    if (webserver) {
                        if (action === "start") {
                            webserver.start.call(thiz, {
                                set: set,
                                path: path,
                                port: extensionParams.port
                            }, function() {
                                _emitter.emit("job.done", {status: "done"});
                            });
                        } else if (action === "stop") {
                            webserver.stop.call(thiz, function() {
                                _emitter.emit("job.done", {status: "done"});
                            });
                        }
                    }

                } catch (e) {
                    _utils.error(_props.get("cat.error").format("[spawn]", e));
                }

                // we're done, remove the listener we might add another later on...
                _emitter.removeListener("webserver", _module._webserver);

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
                _internalConfig = config.internalConfig;
                _project = _internalConfig.externalConfig.project;

                // initial data binding to 'this'
                _me.dataInit(_data);

                // Listen to the process emitter
                if (_emitter) {
                    _emitter.on("webserver", _module._webserver);

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
                return { dependencies: ["webserver"]}
            }
        };

    return _module;
});