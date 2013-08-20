var _catglobal = catrequire("cat.global"),
    _log = _catglobal.log(),
    _path = require("path"),
    _props = catrequire("cat.props"),
    _basePlugin = catrequire("cat.plugin.base"),
    _utils = catrequire("cat.utils"),
    _typedas = require("typedas");


function _delete(dir) {
    if (dir) {
        if (_fs.existsSync(dir)) {
            try {
                _fs.rmrfSync(dir);
            } catch (e) {
                _utils.error(_props.get("cat.error").format("[clean action]", e));
            }
        }
    }
}

/**
 * Delete plugin
 * TODO need to be hooked to an extension, or use the manager
 *
 * @type {*}
 */
module.exports = _basePlugin.ext(function () {

    var _emitter,
        _global,
        _data,
        _me = this,

        _module = {


            apply: function(config) {

                if (!config) {
                    return undefined;
                }

                var extensionParams = (_data.data || config.data),
                    paths;

                if (extensionParams) {

                    paths = extensionParams.path;
                    if (paths && _typedas.isArray(paths)) {
                        paths.forEach(function(path) {
                            if (path) {
                                _delete(path);
                            }
                        });
                    }
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
             * Delete initialization plugin
             *
             * @param config The configuration:
             *          data - The configuration data
             *          emitter - The emitter reference
             *          global - The global data configuration
             *          internalConfig - CAT internal configuration
             */
            init: function (config) {

                // TODO extract messages to resource bundle with message format
                var errors = ["[delete plugin] delete operation disabled, No valid configuration"];

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
                    _emitter.on("clean.ext", _module.exec);
                }


            }
        };

    return _module;
});