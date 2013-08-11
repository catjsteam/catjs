/*! cat-library - v0.1.0 - 2013-08-11
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
            console.log("Cat defined: ", config);

        }

    }

}();
/** test manager **/
