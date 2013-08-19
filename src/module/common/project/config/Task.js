var _global = catrequire("cat.global"),
    _log = _global.log(),
    _path = require("path"),
    _typedas = require("typedas"),
    _utils = catrequire("cat.utils"),
    _props = catrequire("cat.props"),
    _flow;

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
        data, emitter, global, catconfig,
        extLoaded = {};

    // TODO Use the Task class instead
    function Task(config) {
        if (config) {
            this.name = (config.name || undefined);
            this.actions = (config.actions || undefined);
        }
    }

    function _actionApply(internalConfig) {
        var actionobj,
            idx=0, size = me.actions.length,
            dependency, extension;

        function _action(action) {
            if (action) {
                _flow.log({msg: [" >> Running Plugin: ", me.actions[idx]].join(" ")});

                actionobj = catconfig.getAction(action);
                dependency = actionobj.dependency;

                // if no dependency assigned use the manager default extension
                if (!dependency) {
                    dependency = "manager";
                }

                // apply default extensions
                if (dependency) {
                    extension = extLoaded[dependency];
                    _extensionApply(dependency, "default", internalConfig, extension, actionobj.apply);
                }
            }
        }

        function _runme() {
            emitter.on("job.done", function (obj) {
                _flow.log({msg: [" >> Plugin Done: ", me.actions[idx]].join(" ")});

                idx++;
                emitter.removeAllListeners("job.done");
                if (idx < size) {
                    _runme();
                } else {
                    idx = 0;
                    // the end of the loop go to the next task (if available)
                    emitter.emit("task.done", {status: "done"});

                }
            });
            _action(me.actions[idx]);
        }

        size = me.actions.length;
        _runme();
    }

    function _extensionInit(extConfig) {
        var extimp, path;

        if (extConfig) {
            if (!extConfig.ref) {
                try {
                    path = _path.normalize([cathome, extConfig.ext.impl].join("/"));
                    extimp = extConfig.ref = require(path);
                    if (extimp) {
                        if (extimp.init) {
                            extimp.init(extConfig.externalConfig, extConfig.ext);
                        } else {
                            _log.warning(_props.get("cat.config.interface").format("[CAT Config Loader]", ext.name, "init"));
                        }
                    }

                } catch (e) {
                    _log.error(_props.get("cat.error.class").format("[CAT Config Loader]", path), e);
                }
            }
        } else {
            _log.warning(_props.get("cat.config.task.ext.not.found").format("[task config]", ext))
        }
    }

    function _extensionApply(ext, byPhase, internalConfig, extensionConfig, actionApply) {

        function extensionApplyImpl() {
            if (!extensionConfig.apply) {
                _log.warning(_props.get("cat.error.interface").format("[task config]", "apply"));
            } else {
                extensionConfig.apply(internalConfig);
            }
        }

        function actionApplyImpl(actionApply) {
            // apply plugin
            if (!actionApply) {
                _log.warning(_props.get("cat.error.interface").format("[task config]", "apply"));
            } else {
                actionApply(internalConfig);
            }
        }

        var phase,
            extConfig;

        if (ext) {
            extensionConfig = (extensionConfig ? extensionConfig : catconfig.getExtension(ext));
            extConfig = internalConfig.getExtension(extensionConfig.type);
            if (!extConfig) {
                _log.error(_props.get("cat.config.task.ext.missing").format("[task config]", extensionConfig.type, ext));
                return undefined;
            }
            phase = ( extConfig.ext ? extConfig.ext.getPhase() : "default");

            // extensions initialization
            _extensionInit(extConfig);

            // indexing extensions
            // TODO refactor cat project loading design - consider strong binding plugin<>extension
            if (!extLoaded[ext]) {
                extLoaded[ext] = extensionConfig;
            }

            if (phase == "default") {
                actionApplyImpl(actionApply);
                extensionApplyImpl();
            } else {
                extensionApplyImpl();
                actionApplyImpl(actionApply);
            }
        }
    }

    function _init() {
        data = config.data;
        emitter = config.emitter;
        global = config.global;
        catconfig = config.catconfig;
        _flow = catrequire("cat.flow")
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
             *
             * @param internalConfig The CAT internal configuration
             */
            this.apply = function (internalConfig) {
                var actionsExists = (me.actions && _typedas.isArray(me.actions) ? true : false);

                if (!me.actions) {
                    _log.warning("[CAT] No actions for task: " + this.name);

                } else {

                    // apply all actions
                    if (actionsExists) {
                        _actionApply(internalConfig);
                    }

                }
            }
        }

    }

    return this;

};
