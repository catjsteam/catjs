var _global = catrequire("cat.global")
    _log = _global.log(),
    _props = catrequire("cat.props"),
    _fs = require("fs.extra"),
    _utils = catrequire("cat.utils");

/**
 * Extension configuration class
 *
 * @param config The configuration:
 *              data - the configuration data
 *              global - The global data configuration
 *              emitter - The emitter reference
 * @returns {*}
 * @constructor
 */
module.exports = function (config) {

    var me = this,
        data, emitter, global, catconfig;


    function _init() {
        data = config.data;
        emitter = config.emitter;
        global = config.global;
        catconfig = config.catconfig;
    }

    if (config) {

        _init();

        if (data) {

            this.name = data.name;
            this.type = data.type;
            this.path = data.path;
            this.type = data.type;
            this.data = data;

            /**
             * Apply Extension
             *
             * @param internalConfig The CAT internal configuration
             */
            this.apply = function(internalConfig) {
                var extensionobj,
                    path,
                    project = internalConfig.externalConfig.project,
                    projectInfo = project.info,
                    targetFolder = projectInfo.target;

                if (me.type) {
                    extensionobj = internalConfig.getExtension(me.type);
                    if (extensionobj) {
                        extensionobj = extensionobj.ref;
                        // in case the extension has no path defined get the defaults
                        path = (me.path || targetFolder);
                        if (extensionobj) {
                            if (internalConfig.isWatch()) {
                                if (!extensionobj.watch) {
                                    _log.warning(_props.get("cat.error.interface").format("[extension config]", "watch"));
                                } else {
                                    extensionobj.watch({path: path, internalConfig: internalConfig});
                                }
                            } else  {
                                if (!extensionobj.apply) {
                                    _log.warning(_props.get("cat.error.interface").format("[extension config]", "apply"));
                                } else  {
                                    extensionobj.apply({path: path, internalConfig: internalConfig});
                                }
                            }
                        }
                    }

                }
            };

        } else {
            _log.warning("[Extension] No valid data configuration");
        }
    }

    return this;

};
