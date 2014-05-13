var regexputils = catrequire("cat.regexp.utils");

module.exports = function () {

    return {

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
                return [(config.apiname || config.api), "(" + functionArg + ");"].join("");

            }
        }

    };

}();