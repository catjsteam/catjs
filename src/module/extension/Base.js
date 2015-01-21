var _log = catrequire("cat.global").log(),
    _props = catrequire("cat.props"),
    _ = require("underscore"),
    _path = require("path"),
    _fs = require("fs"),
    _minimatch = require("minimatch");

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

//            if (this._apply) {
//                _log.warning(_props.get("cat.ext.apply.warn").format("[base extension]", "?"));
//            }
            this._apply ++;

            if (config.internalConfig) {
                pluginHandle = config.internalConfig.pluginHandle;
                this._data = (pluginHandle ? pluginHandle.data : undefined);
                this._plugin = (pluginHandle ? pluginHandle : undefined);
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

        /**
         * Filters for excluding/include file extensions
         *
         *  "filters": [{ 
         *     "type": "*",
         *     "pattern": ["/cat-project"],
         *     "exclude": true
         *  }]
         *          
         * @param filters
         * @param file The reference object of type file|folder
         * @isdirectory {String} [optional] * || file || folder 
         * 
         * @returns {boolean} true filter match or else false
         */
        proto.applyFilters = function (filters, file, isdirectory) {

            var exitCondition = 0;

            function patternMatch() {
                
                if (!this.pattern) {
                    return false;
                }
                var size = this.pattern.length, idx = 0, 
                    item

                for (; idx < size; idx++) {
                    
                    item = this.pattern[idx];
                    if (_minimatch(file, item, { matchBase: true })) {
                        return true;
                    }
                    
                }
                return false;
            }
            

            if (file && filters && _.isArray(filters)) {

                filters.forEach(function (filter) {
                    if (filter) {
                        filter.apply(function () {
                            
                            var isPattern;
                            
                            if (this.type === isdirectory || this.type === "*") {
                                
                                // take the parent into the condition
                                if (this.pattern) {
                                    isPattern = patternMatch.call(this);
                                    if (!isPattern) {
                                        return undefined;
                                    }
                                }

                                if (!this.exclude) {
                                    exitCondition = 0;
                                } else {
                                    exitCondition = 1;
                                }
                            }
                        });
                    }
                });

                if (exitCondition > 0) {
                    return true;
                }

            }

            return false;
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