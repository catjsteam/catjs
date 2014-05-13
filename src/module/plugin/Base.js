var _utils = catrequire("cat.utils"),
    _global = catrequire("cat.global"),
    _props = catrequire("cat.props"),
    _log = catrequire("cat.global").log(),
    _typedas = require("typedas"),
    _path = require("path"),
    _minimatch = require("minimatch"),
    _jsutilsobj = require("js.utils").Object;

/**
 * Abstract Base plugin functionality
 *
 * @type {module.exports}
 */
module.exports = function () {

    // TODO consider auto generate straightforward getter / setter
    function _base(proto) {

        proto._disabled = false;
        proto._to = null;
        proto._from = null;
        proto._data = null;

        proto.dataInit = function (data) {
            var me = this;
            if (data) {
                this._data = data;
                _utils.copyObjProps(data, this);
            }

            this.get = function (key) {
                return (key && key in me._data ? me._data[key] : undefined);
            };
        };

        proto.isDisabled = function () {
            return this._disabled;
        };

        proto.setDisabled = function (bol) {
            this._disabled = bol;
        };

        proto.setTo = function (to) {
            this._to = to;
        };

        proto.getTo = function () {

            var toFolder;
            if (!this._to) {
                toFolder = (this._data ? this._data.to : undefined);
                if (!toFolder || !(toFolder && toFolder.path)) {
                    toFolder = {path: _global.get("home").working.path};
                    _log.info(_props.get("cat.project.property.default.value").format("[base plugin]", "path", toFolder.path));
                }
                this.setTo(toFolder.path);
            }
            return this._to;
        };

        proto.getFrom = function () {
            return this._from;
        };

        proto.getFilters = function () {
            return this.filters;
        };

        proto.validate = function(ref, data) {

            var plugindata,
                action;

            if (ref) {
                action = ref.action;
                plugindata = ( (action && action.validate) ? action.validate() : undefined );

                // validate runnable data with the plugin's data
                if (plugindata && data) {
                    if (("dependencies" in plugindata) && plugindata.dependencies) {
                        if (!_typedas.isArray(plugindata.dependencies)) {
                            _log.info("[CAT base plugin] returned property 'dependencies' of validate method should be of Array type");
                        } else {
                            if (("dependency" in data) ) {

                                if (_jsutilsobj.contains(plugindata.dependencies, data.dependency)) {

                                    // todo in case of other validation types collect the boolean values accordingly
                                    return true;

                                } else {

                                    _log.warning("[CAT base plugin] The current running dependency is: " + data.dependency +
                                        " that is not supported for the plugin named: " + ref.name +
                                        " that supports the following: " + plugindata.dependencies
                                    );
                                    return false;
                                }

                            }
                        }
                    }
                }
            } else {
                _log.info("[CAT base plugin] No plugin validation has implemented.");
            }

            return true;
        };

        /**
         * Filters for excluding/include file extensions
         *
         * @param filters
         * @param typeObj The reference object of type file|folder
         * @returns {boolean}
         */
        proto.applyFileExtFilters = function (filters, typeObj) {

            var exitCondition = 0,
                me = this;

            function patternMatch() {
                if (!this.pattern) {
                    return false;
                }
                var size = this.ext.length, idx = 0, item;

                for (; idx<size; idx++) {
                    item = this.pattern[idx];
                    if (_minimatch(typeObj, item, { matchBase: true })) {
                        return true;
                    }
                }
                return false;
            }

            function extMatch() {

                if (!this.ext) {
                    return undefined;
                }
                var extName = _path.extname(typeObj),
                    size = this.ext.length, idx = 0, item,
                    isPattern;

                for (; idx<size; idx++) {
                    item = this.ext[idx];
                    if ( (item === extName || item === "*") ) {

                        // take the parent into the condition
                        if (this.pattern) {
                            isPattern = patternMatch.call(this);
                            if (!isPattern) {
                                continue;
                            }
                        }

                        if (!this.exclude) {
                            exitCondition = 0;
                        } else {
                            exitCondition = 1;
                        }

                    }
                }
            }

            if (typeObj && filters && _typedas.isArray(filters)) {

                filters.forEach(function (filter) {
                    if (filter) {
                        filter.apply(function () {
                            extMatch.call(this);
                        });
                    }
                });

                if (exitCondition > 0) {
                    return true;
                }

            }

            return false;
        };

    }

    return {
        ext: function (fn) {
            if (fn) {
                _base(fn.prototype);
                fn.validate = fn.prototype.validate;


            }
            return fn;
        }
    };

}();