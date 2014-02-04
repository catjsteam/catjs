var _log = catrequire("cat.global").log(),
    _props = catrequire("cat.props");

/**
 * Abstract Base extension functionality
 *
 * @type {module.exports}
 */
module.exports = function () {

    // TODO consider auto generate straightforward getter / setter
    var _base = function (proto) {

        /**
         * Apply manager, mark as done, to occur just once
         */
        proto.apply = function(config) {

            var pluginHandle;

            if (this._apply) {
                _log.warning(_props.get("cat.ext.apply.warn").format("[base extension]", "?"));
            }
            this._apply ++;

            if (config.internalConfig) {
                pluginHandle = config.internalConfig.pluginHandle;
                this._data = (pluginHandle ? pluginHandle.data : undefined);
            }
        };

        /**
         * Base initializer
         *
         * @param config The passed arguments
         *          project - The project configuration object
         *          grunt - The grunt handle
         *          emitter - The emitter handle

         * @returns {undefined}
         */
        proto.initialize = function (config, ext) {

            if (!config) {
                return undefined;
            }
            this._apply = 0;
            this._emitter = config.emitter;
            this._grunt = config.grunt;
            this._project = config.project;
            this._phase = (ext ? ext.phase : undefined);
            this._mode = (ext ? ext.mode : undefined);

            _log.info("[base extension] Initialized");
            if (this._grunt) {
                _log("[base extension] Grunt supported");
            }
        };

        proto.getProject = function() {
            return this._project;
        };

        proto.getGrunt = function() {
            return this._grunt;
        };

        proto.getEmitter = function() {
            return this._emitter;
        };

        proto.getPhase = function() {
            return this._phase;
        };

        proto.getMode = function() {
            return this._mode;
        };

    };

    return {
        ext: function (fn) {
            if (fn) {
                _base(fn.prototype);
            }
            return new fn();
        }
    };

}();