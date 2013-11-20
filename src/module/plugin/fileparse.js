var _catglobal = catrequire("cat.global"),
    _log = _catglobal.log(),
    _path = require("path"),
    _props = catrequire("cat.props"),
    _basePlugin = catrequire("cat.plugin.base"),
    _utils = catrequire("cat.utils"),
    _fs = require("fs.extra"),
    _regexputils = catrequire("cat.regexp.utils"),
    _typedas = require("typedas");

module.exports = _basePlugin.ext(function () {

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

            var pattern, flags, files, replace,
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

            files = extensionParams.files;
            pattern = extensionParams.pattern;
            replace = extensionParams.replace;
            flags = extensionParams.flags;

            if (config && extensionParams) {

                if (files) {
                    files.forEach(function(file) {
                        var content,
                            newcontent;

                        if (_fs.existsSync(file)) {
                            content = _fs.readFileSync(file, "utf8");
                            if (content) {
                                newcontent = _regexputils.replace(content, pattern, replace, flags);
                                _fs.renameSync(file, [file, ".catreplace"].join(""));
                                _fs.writeFileSync(file, newcontent);
                            }
                        }

                    });
                }


                // done processing notification for the next task to take place
                _me.getEmitter().emit("job.done", {status: "done"});

            }
        }

    }

});