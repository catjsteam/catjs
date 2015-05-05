var _catglobal = catrequire("cat.global"),
    _log = _catglobal.log(),
    _path = require("path"),
    _props = catrequire("cat.props"),
    _basePlugin = catrequire("cat.plugin.base"),
    _utils = catrequire("cat.utils"),
    _fs = require("fs.extra"),
    _typedas = require("typedas");

module.exports = _basePlugin.ext(function () {

    var _data,
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

            var extensionParams,
                message,
                method;
            
            _data = config.data;
            _internalConfig = config.internalConfig;
            _project = (_internalConfig ? _internalConfig.getProject() : undefined);

            _me.dataInit(_data);
            extensionParams = _data.data;

            if (config && extensionParams) {

                message = ("message" in extensionParams && extensionParams.message);
                method = ("method" in extensionParams && extensionParams.method);
            
                _utils.log((method || "log"), message);
                
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
            return { dependencies: ["manager"]};
        }

    };

});