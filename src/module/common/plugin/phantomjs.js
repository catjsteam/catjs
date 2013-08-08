var _log = catrequire("cat.global").log(),
    _path = require("path"),
    _props = catrequire("cat.props"),
    _basePlugin = catrequire("cat.plugin.base"),
    _utils = catrequire("cat.utils");

module.exports = _basePlugin.ext(function () {

    var _emitter,
        _global,
        _data,
        _internalConfig,
        _project,
        _me = this,

        _module = {

            /**
             * Handle phantomjs
             *
             * @param phantomjsext Phantom extension handle
             * @returns {*}
             * @private
             */
            _phantomjs: function (config) {

                if (!config) {
                    return undefined;
                }

                var extensionParams = _data.data,
                    phantomjs = config.phantomjs,
                    thiz = config.thiz,
                    basePath = _project.getTargetFolder(),
                    file = _path.join(basePath, extensionParams.file);

                try {
                    if (phantomjs) {
                        phantomjs.run.call(thiz, {
                            file: file,
                            host: extensionParams.host

                        }, function () {
                            _emitter.emit("job.done", {status: "done"});
                        });
                    }

                } catch (e) {
                    _utils.error(_props.get("cat.error").format("[spawn]", e));
                }
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
                    _emitter.on("phantomjs", _module._phantomjs);

                } else {
                    _log.warning("[Scrap plugin] No valid emitter, failed to assign listeners");
                }


            }
        };

    return _module;
});