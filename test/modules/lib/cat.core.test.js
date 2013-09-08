/*! cat-library - v0.1.0 - 2013-09-08
* Copyright (c) 2013 arik; Licensed MIT */
var _cat = {utils: {}};

_cat.core = function() {

    var _context = function() {

        var _scraps = {};

        function _Scrap(config) {

            var me = this;

            (function() {
                var key;

                for (key in config) {
                    me[key] = config[key];
                }
            })();
        }

        _Scrap.prototype.get = function(key) {
            return this[key];
        };

        _Scrap.prototype.getArg = function(key) {
            if (this.scrap && this.scrap.arguments) {
                return this.arguments[this.scrap.arguments[key]];
            }
        };


        return {

            get: function(pkgName) {
                if (!pkgName) {
                    return undefined;
                }
                return _scraps[pkgName];
            },

            "$$put": function(pkgName, config) {
                if (!pkgName) {
                    return pkgName;
                }
                _scraps[pkgName] = new _Scrap(config);
            }
        };

    }(),
        _log = console;

    return {

        log: _log,

        define: function(key, func) {
            _cat[key] = func;
        },

        /**
         * CAT core definition, used when injecting cat call
         *
         * @param config
         */
        action: function(config) {
            var scrap = config.scrap,
                catInternalObj,
                catObj,
                passedArguments,
                idx = 0, size = arguments.length,
                pkgName;

            if (scrap) {
                if (scrap.pkgName) {

                    // collect arguments
                    if (arguments.length > 1) {
                        passedArguments = [];
                        for (idx = 1; idx<size; idx++) {
                            passedArguments.push(arguments[idx]);
                        }
                    }

                    // call cat user functionality
                    catInternalObj = _cat[scrap.pkgName];
                    if (catInternalObj && catInternalObj.init) {
                        _context["$$put"]({
                            scrap: scrap,
                            arguments: passedArguments

                        });
                        catInternalObj.init.call(_context.get(scrap.pkgName), _context);
                    }

                    // cat internal code
                    pkgName = [scrap.pkgName, "$$cat"].join("");
                    catObj = _cat[pkgName];
                    if (catObj) {
                        _context["$$put"]({
                            scrap: scrap,
                            arguments: passedArguments

                        }, pkgName);
                        catObj.apply(_context, passedArguments);
                    }
                }
                console.log("Scrap call: ",config, " scrap: " + scrap.name);
            }

        }

    };

}();

if (typeof exports === "object") {
    module.exports = _cat;
}
_cat.utils.chai = function() {

    var _chai,
        assert,
        _state = 0; // state [0/1] 0 - not evaluated / 1 - evaluated

    function _isSupported() {
        _state = 1;
        if (typeof chai != "undefined") {
            _chai = chai;
            assert = _chai.assert;

        } else {
            _cat.core.log.info("Chai library is not supported, skipping annotation 'assert', consider adding it to the .catproject dependencies");
        }
    }

    return {

        assert: function(config) {

            if (!_state) {
                _isSupported();
            }

            var code,
                fail;

            if (_chai) {
                if (config) {
                    code = config.code;
                    fail = config.fail;
                }
                if (assert) {
                    // TODO well, I have to code the parsing section (uglifyjs) for getting a better impl in here (loosing the eval shit)
                    // TODO js execusion will be replacing this code later on...
                    if (code) {
                        try {
                            eval(code);

                        } catch(e) {

                            if (fail) {
                                throw new Error("[CAT] Test failed, exception: ", e);
                            }
                        }
                    }
                }
            }
        },

        /**
         * For the testing environment, set chai handle
         *
         * @param chai
         */
        test: function(chaiarg) {
            chai = chaiarg;
        }

    };

}();
/** test manager **/
