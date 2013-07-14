var _log = require("../../../CATGlob.js").log(),
    _typedas = require("typedas"),
    _utils = require("./../../../Utils.js"),
    _props = require("./../../../Properties.js");

/**
 * Task configuration class
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

    // TODO Use the Task class instead
    function Task(config) {
        if (config) {
            this.name = (config.name || undefined);
            this.actions = (config.actions || undefined);
        }
    }

    function _actionApply(internalConfig) {
        var actionobj, action,
            idx, size = me.actions.length;

        for (idx = 0; idx < size; idx++) {
            action = me.actions[idx];
            if (action) {
                actionobj = catconfig.getAction(action);
                if (!actionobj.apply) {
                    _utils.error(_props.get("cat.error.interface").format("[task config]", "apply"));
                } else {
                    actionobj.apply(internalConfig);
                }
            }
        }
//        me.actions.forEach(function (action) {
//            if (action) {
//                actionobj = catconfig.getAction(action);
//                if (!actionobj.apply) {
//                    _utils.error(_props.get("cat.error.interface").format("[task config]", "apply"));
//                } else {
//                    actionobj.apply(internalConfig);
//                }
//            }
//        });
    }

    function _extApply(byPhase, internalConfig) {
        var extensionConfig, phase,
            ext, idx, size = me.extensions.length,
            extConfig;

        for (idx = 0; idx < size; idx++) {
            ext = me.extensions[idx];
            if (ext) {
                extensionConfig = catconfig.getExtension(ext);
                extConfig = internalConfig.getExtension(extensionConfig.type);
                phase = (extConfig.getPhase ? extConfig.getPhase() : "default");
                if (!extensionConfig.apply) {
                    _utils.error(_props.get("cat.error.interface").format("[task config]", "apply"));
                } else {
                    if (phase === byPhase) {
                        extensionConfig.apply(internalConfig);
                    }
                }
            }
        }

//        me.extensions.forEach(function (ext) {
//            var mode;
//            if (ext) {
//                extensionConfig = catconfig.getExtension(ext);
//                mode = extensionConfig.getMode();
//                if (!extensionConfig.apply) {
//                    _utils.error(_props.get("cat.error.interface").format("[task config]", "apply"));
//                } else {
//                    if (mode === byMode) {
//                        extensionConfig.apply(selfInternalConfig);
//                    }
//                }
//            }
//        });

    }

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
            this.extensions = (data.extensions || data.dependencies);
            this.actions = data.plugins;

            /**
             * Apply task:
             *      - load dependencies
             *      - call dependencies
             * @param internalConfig The CAT internal configuration
             */
            this.apply = function (internalConfig) {
                var actionobj,
                    extensionConfig,
                    idx = 0, size, action, ext,
                    extensionsExists = (me.extensions && _typedas.isArray(me.extensions) ? true : false),
                    actionsExists = (me.actions && _typedas.isArray(me.actions) ? true : false);

                if (!me.actions) {
                    _log.error("[CAT] No actions for task: " + this.name);

                } else {

                    // init mode - runt only init mode extensions

                    if (extensionsExists) {
                        _extApply("init", internalConfig);
                    }

                    // apply all plugins
//                    if (_typedas.isArray(me.actions)) {
//                        size = me.actions.length;
//                        for (idx = 0; idx < size; idx++) {
//                            action = me.actions[idx];
//                            if (action) {
//                                actionobj = catconfig.getAction(action);
//                                if (!actionobj.apply) {
//                                    _utils.error(_props.get("cat.error.interface").format("[task config]", "apply"));
//                                } else {
//                                    actionobj.apply(internalConfig);
//                                }
//                            }
//                        }
//                        me.actions.forEach(function (action) {
//                            if (action) {
//                                actionobj = catconfig.getAction(action);
//                                if (!actionobj.apply) {
//                                    _utils.error(_props.get("cat.error.interface").format("[task config]", "apply"));
//                                } else {
//                                    actionobj.apply(internalConfig);
//                                }
//                            }
//                        });
//                    }

                    // apply all actions
                    if (actionsExists) {
                        _actionApply(internalConfig);
                    }

                    // apply all extensions
                    if (extensionsExists) {
                        _extApply("default", internalConfig);
                    }

//                        size = me.extensions.length;
//                        for (idx = 0; idx < size; idx++) {
//                            ext = me.extensions[idx];
//                            if (ext) {
//                                extensionConfig = catconfig.getExtension(ext);
//                                if (!extensionConfig.apply) {
//                                    _utils.error(_props.get("cat.error.interface").format("[task config]", "apply"));
//                                } else {
//                                    extensionConfig.apply(internalConfig);
//                                }
//                            }
//                        }
//                        me.extensions.forEach(function (ext) {
//                            if (ext) {
//                                extensionConfig = catconfig.getExtension(ext);
//                                if (!extensionConfig.apply) {
//                                    _utils.error(_props.get("cat.error.interface").format("[task config]", "apply"));
//                                } else {
//                                    extensionConfig.apply(internalConfig);
//                                }
//                            }
//                        });


                }
            }
        }

    }

    return this;

};
