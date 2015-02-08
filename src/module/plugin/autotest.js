var _catglobal = catrequire("cat.global"),
    _log = _catglobal.log(),
    _path = require("path"),
    _props = catrequire("cat.props"),
    _basePlugin = catrequire("cat.plugin.base"),
    _utils = catrequire("cat.utils"),
    _fs = require("fs.extra"),
    _typedas = require("typedas"),
    _Scrap = catrequire("cat.common.scrap"),
    _beautify = require('js-beautify').js_beautify,
    _jsonlint = require("json-lint");

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

            var scraps,
                extensionParams,
                errors = ["[libraries plugin] No valid configuration"],
                workDir = _catglobal.get("home").working.path,
                catjson, catjsondata, args = [],
                filedata, jsonlint,
                isAutoOverride = false,
                skip = false;

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

                //customAttribute = extensionParams.customAttribute;
                scraps = _Scrap.getScraps();
                if (scraps) {

                    scraps.forEach(function (scrap) {
                        if (scrap && scrap.get("auto") && !scrap.get("$standalone")) {
                            args.push({"name": scrap.get("name")});
                        }
                    });

                    catjson = (workDir ? _path.join(_project.getInfo("source"), "config/cat.json") : undefined);
                    if (catjson) {
                        if (_fs.existsSync(catjson)) {
                            catjsondata = _fs.readFileSync(catjson, "utf8");
                            if (catjsondata) {

                                try {
                                    jsonlint = _jsonlint(catjsondata, {});
                                    if (jsonlint.error) {
                                        _utils.error("error", ["catjs auto-test] cat.json load with errors: \n ", jsonlint.error,
                                            " \n at line: ", jsonlint.line,
                                            " \n character: ", jsonlint.character,
                                            " \n "].join(""));
                                    }

                                } catch (e) {
                                    _utils.error("[catjs auto-test] cat.json parse error: ", e);
                                }

                                catjsondata = JSON.parse(catjsondata);
                                isAutoOverride = (!("auto-override" in catjsondata) || ("auto-override" in catjsondata && catjsondata["auto-override"]));
                                
                                if (catjsondata && isAutoOverride) {
                                    
                                    if (!("scenarios" in catjsondata)) {
                                        skip = true;
                                        _utils.log("warn", "[catjs auto-test] No valid scenarios property was found");
                                        
                                    } else  {
                                        if (!("general" in catjsondata.scenarios)) {
                                            skip = true;
                                            _utils.log("warn", "[catjs auto-test] scenarios property was found, but no valid general property was found");
                                        }
                                    }        
                                    
                                    if (skip) {
                                        _utils.log("[catjs auto-test] skipping auto-test process");
                                        _emitter.emit("job.done", {status: "done"});
                                        return undefined;
                                    }
                                    
                                    if (catjsondata.scenarios.general.tests && catjsondata.tests) {
                                        catjsondata.scenarios.general.tests = args;
                                    }

                                    catjsondata["run-mode"] = "tests";

                                    filedata = JSON.stringify(catjsondata);
                                    if (filedata) {

                                        try {
                                            filedata = _beautify(filedata, { indent_size: 2 });
                                            _fs.writeFileSync(catjson, filedata);
                                        } catch (e) {
                                            _utils.error("[catjs autotest] Error occurred while writing the configuration data. Error: ", e);
                                        }
                                    }                                    
                                }
                                
                                if (!isAutoOverride) {
                                    _utils.log("info", "[catjs autotest] \"auto-override\" set to false, Skipping auto-test ")
                                }
                               
                            }
                        }
                    }
                }
            }

            // done processing notification for the next task to take place
            _emitter.emit("job.done", {status: "done"});

        },
        /**
         * Validate the plugin
         *
         *      dependencies {Array} The array of the supported dependencies types
         *
         * @returns {{dependencies: Array}}
         */
        validate: function () {
            return { dependencies: ["manager"]};
        }

    };

});