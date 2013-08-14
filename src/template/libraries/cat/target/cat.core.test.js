/*! cat-library - v0.1.0 - 2013-08-14
* Copyright (c) 2013 arik; Licensed MIT */
var _cat = {};

_cat.core = function() {

    return {


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
                catObj,
                passedArguments,
                idx = 0, size = arguments.length, arg;

            if (scrap) {
                if (scrap.pkgName) {
                    catObj = _cat[scrap.pkgName];
                    if (catObj && catObj.init) {
                        if (arguments.length > 1) {
                            passedArguments = []
                            for (idx = 1; idx<size; idx++) {
                                passedArguments.push(arguments[idx]);
                            }
                        }
                        catObj.init.apply(scrap, passedArguments);
                    }
                }
                console.log("Scrap call: ",config, " scrap: " + scrap.name);
            }

        }

    }

}();
/** test manager **/
