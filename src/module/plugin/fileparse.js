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

            var pattern, flags, files, replace, applyto,
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

                files = extensionParams.files;
                pattern = extensionParams.pattern;
                replace = extensionParams.replace;
                flags = extensionParams.flags;
                // optional types : [filename / content]
                applyto = extensionParams.applyto;

                if (!applyto) {
                    applyto = ["content"];
                }
                if (files) {
                    files.forEach(function(file) {
                        var content,
                            fileName;

                        if (_fs.existsSync(file)) {

                            content = _fs.readFileSync(file, "utf8");
                            if (_utils.contains(applyto, "content")) {
                                if (content) {
                                    content = _regexputils.replace(content, pattern, replace, flags);
                                }
                            }

                            // save backup
                            _fs.renameSync(file, [file, ".catreplace"].join(""));

                            fileName = _path.basename(file);
                            if (_utils.contains(applyto, "filename")) {
                                fileName = _path.basename(file);
                                fileName = _regexputils.replace(fileName, pattern, replace, flags);
                            }
                            _fs.writeFileSync(_path.join(_path.dirname(file), fileName), content);

                        }

                    });
                }
            }
            // done processing notification for the next task to take place
            _emitter.emit("job.done", {status: "done"});
        }

    }

});