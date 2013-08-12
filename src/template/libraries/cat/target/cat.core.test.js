/*! cat-library - v0.1.0 - 2013-08-12
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
            console.log("Scrap call: ",config, " scrap: " + config.scrap.name);

        }

    }

}();
/** test manager **/
