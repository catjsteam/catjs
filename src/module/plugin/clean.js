var _catglobal = catrequire("cat.global"),
    _log = _catglobal.log(),
    _path = require("path"),
    _props = catrequire("cat.props"),
    _basePlugin = catrequire("cat.plugin.base"),
    _utils = catrequire("cat.utils"),
    _fs = require("fs.extra"),
    _typedas = require("typedas");

module.exports = _basePlugin.ext(function () {

    function _rm(src) {

        var stats;

        if (!src) {
            return undefined;
        }

        if (_fs.existsSync(src)) {
            stats = _fs.lstatSync(src);
            try {
                if (stats.isDirectory()) {
                    _fs.rmrfSync(src);

                } else if (stats.isFile()) {
                    _fs.unlinkSync(src);

                }
            } catch(e) {
                _log.error("[CAT clean plugin] failed with errors: ", e)
            }
        }
    }

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

            var src,
                extensionParams,
                errors = ["[libraries plugin] No valid configuration"];

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

                src = ("src" in extensionParams && extensionParams.src);

                if (src) {
                    if (_typedas.isArray(src)) {
                        src.forEach(function(item) {
                           _rm(item);
                        });

                    } else if(_typedas.isString(src)) {
                        _rm(src)

                    } else {
                        _log.error("[CAT clean plugin] 'src' was found but not valid");
                    }

                } else {
                    _log.error("[CAT clean plugin] 'src' property is required ");
                }

                // done processing notification for the next task to take place
                _emitter.emit("job.done", {status: "done"});

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