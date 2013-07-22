var _utils = require("./../../Utils.js"),
    _log = require("./../../CATGlob.js").log(),
    _typedas = require("typedas"),
    _path = require("path");

/**
 * Abstract Base plugin functionality
 *
 * @type {module.exports}
 */
module.exports = function() {

    // TODO consider auto generate straightforward getter / setter
    function _base(proto) {

        proto._disabled = false;
        proto._to = null;
        proto._from = null;
        proto._data = null;

        proto.dataInit = function(data) {
            if (data) {
                this._data = data;
                _utils.copyObjProps(data, this);
            }
        };

        proto.isDisabled = function() {
            return this._disabled;
        };

        proto.setDisabled = function(bol) {
            this._disabled = bol;
        };

        proto.setTo = function(to) {
            this._to = to;
        };

        proto.getTo = function() {

            var toFolder;
            if (!this._to) {
                toFolder = (this._data? this._data.to : undefined);
                if (!toFolder || !(toFolder && toFolder.path)) {
                    _log.error("[copy action] copy operation disabled, No valid 'to' folder configuration, to where should I copy your source folder/files ?!");
                    this.setDisabled(true);
                }
                this.setTo(toFolder.path);
            }
            return this._to;
        };

        proto.getFrom = function() {
            return this._from;
        };

        proto.getFilters = function() {
            return this.filters;
        };

        /**
         * Filters for excluding/include file extensions
         *
         * @param filters
         * @param typeObj The reference object of type file|folder
         * @returns {boolean}
         */
        proto.applyFileExtFilters = function (filters, typeObj) {

            var exitCondition = 0;

            if (typeObj && filters && _typedas.isArray(filters)) {

                filters.forEach(function (filter) {
                    if (filter) {
                        filter.apply(function() {

                            var extName = _path.extname(typeObj),
                                me = this;
                            if (this.ext) {
                                this.ext.forEach(function(item) {
                                    if ((item === extName || item === "*")) {
                                        if (me.exclude) {
                                            exitCondition++;
                                        } else {
                                            exitCondition--;
                                        }

                                    }
                                });
                                // break;
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

    }

    return {
        ext: function(fn) {
            if (fn) {
                _base(fn.prototype);
            }
            return fn;
        }
    }

}();