var _log = require("../../../CATGlob.js").log();

/**
 * Action configuration class
 *
 * @param config The configuration:
 *              data - the configuration data
 *              global - The global data configuration
 *              emitter - The emitter reference
 * @returns {*}
 * @constructor
 */
module.exports = function Action(config) {

    var filters,
        actionType,
        me = this,
        data, emitter, global;

    this.filters = [];

    // TODO Use the Filter class instead
    function Filter(config) {
        if (config) {
            this.type = (config.type || undefined);
            this.ext = (config.ext || undefined);
            this.exclude = (config.exclude || undefined);
        }
    }

    function _init() {
        data = config.data;
        emitter = config.emitter;
        global = config.global;
    }

    if (config) {

        _init();

        this.type = data.type;
        this.to = data.to;
        this.from = data.from;
        // get the scanner instance
        if (this.type) {
            // instantiating action per type [common/action/copy, common/action/inject, etc..]
            actionType = ["../action/", this.type ,".js"].join("");
            _log.debug("[Scan] Instantiating action: " + actionType);
            try {
                this.ref = require(actionType);
                if (this.ref) {
                    this.action = new this.ref();
                }
            } catch(e) {
                _log.error("[Scan] action type not found or failed to load module ", e);
            }
        }

        // go over the filter configuration
        filters = (data.filters || undefined);
        if (filters) {
            filters.forEach(function (item) {
                if (item) {
                    me.filters.push(new Filter(item));
                }
            });
        }

        if (this.action) {
            // Action innitialization
            this.action.init({data: this, emitter: emitter, global: global});
        }

    }

    return this;

};
