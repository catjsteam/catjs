var _typedas = require('typedas'),
    _Action = require("./Action"),
    _log = require("../../../CATGlob.js").log();

/**
 * Configuration Class
 *
 * @param config The configuration:
 *              data - the configuration data
 *              emitter - the emitter reference
 * @returns {*}
 * @constructor
 */
module.exports = function Config(config) {

    var actions = [],
        actionsConfig,
        emitter = config.emitter,
        data = config.data;

    if (!data || !(data && data.actions)) {
        _log.error("[Config] no valid configuration");
        return undefined;
    }
    actionsConfig = data.actions;
    if (actionsConfig &&
        _typedas.isArray(actionsConfig)) {
        actionsConfig.forEach(function (item) {
            if (item) {
                actions.push(new _Action({data: item, emitter: emitter, global: data}));
            }
        });
    }

    return data;
};