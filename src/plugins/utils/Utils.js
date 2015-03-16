var regexputils = catrequire("cat.regexp.utils");

module.exports = function () {

    var _module = {

        /**
         * Generate API based functionality for a scrap
         *
         * @param config
         *      exp {String} The expression
         *      api {String} The API name to be searched within the expression
         *      apiname {String} The actual API name to be used
         */
        generate: function(config) {

            var str = regexputils.getMatch(config.exp, [config.api, "\\((.*)\\);"].join(""));
            if (str) {

                // split the args, parseInt the args that are numbers
//                str[1] = str[1].replace(/ /g, "");
                var args = str[1].split(",");
                var functionArg = "";
                for (var i = 0; i < args.length; i++) {
                    if (/^\d+$/.test(args[i])) {
                        args[i] = parseInt(args[i]);
                    }
                    functionArg += args[i] + ",";
                }

                functionArg = functionArg.substring(0, functionArg.length - 1);
                return [(config.apiname || config.api), ".call((context || this)" + (functionArg ? ", " : "") + functionArg + ");"].join("");

            }
        },

        /**
         * Match a given expression to the API list 
         * 
         * @param exp {Object} The expression to be matched against the given API
         * @param api {Array} The api to be matched against the expression. 
         *          Array's elements:
         *              api {String} The API name to be searched within the expression
         *              apiname {String} The actual API name to be used                   
         */
        match: function(exp, api) {
            
            var match,
                idx = 0, size = 0, apitem;
            
            function isValidAPIArgs(apitem) {
                if (!("api" in apitem)) {
                    return false;
                }
                return true;
            }
            
            if (api && api.length) {
                size = api.length;
            }
            
            for (; idx < size; idx++) {
                apitem = api[idx];
                if (apitem && isValidAPIArgs(apitem)) {
                    match = _module.generate({
                        api: apitem.api,
                        apiname: ("apiname" in apitem ? apitem.apiname : undefined),
                        exp: exp
                    });
                    
                    if (match) {
                        return match;
                    }
                }
            }
        }
    };
    
    return _module;

}();