_cat.utils.Utils = function () {

    return {

        getType: function (obj) {
            return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();

        },
        getMatchValue: function (pattern, text) {

            var regexp = new RegExp(pattern),
                results;

            if (regexp) {
                results = regexp.exec(text);
                if (results &&
                    results.length > 1) {
                    return results[1];
                }
            }

            return results;

        },

        /**
         * Validates an object and availability of its properties
         *
         */
        validate: function (obj, key, val) {
            if (obj) {

                // if key is available
                if (key !== undefined) {

                    if (key in obj) {

                        if (obj[key] !== undefined) {

                            if (val !== undefined) {
                                if (obj[key] !== val) {
                                    return false;
                                }
                            }

                            return true;
                        }

                    }

                    return false;


                } else {

                    return true;
                }

            }

            return false;
        }
    };

}();