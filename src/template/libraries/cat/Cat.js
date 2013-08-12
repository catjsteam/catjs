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