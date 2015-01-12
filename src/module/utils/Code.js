var _underscore  = require("underscore");

module.exports = function() {
    
    return {

        /**
         * Prepare code based on line break.
         * Looking for character ";" at the end if not exists it will be added
         * and each line will be trimmed.
         *
         * @param codeRows
         */
        prepareCode: function (codeRows) {
            
            var row,
                size = (codeRows && _underscore.isArray(codeRows) ? codeRows.length : 0), 
                idx = 0;

            function _row(row, ref, idx) {
                var rowTrimmed;

                if (row) {
                    rowTrimmed = (row.trim ? row.trim() : row);
                    if (rowTrimmed.charAt(rowTrimmed.length - 1) !== ";") {
                        if (idx !== undefined) {
                            ref[idx] += ";";
                        } else {
                            ref += ";"
                        }
                    }

                    if (idx !== undefined) {
                        ref[idx] = convertTestDataRegExp(ref[idx]);
                    } else {
                        ref = convertTestDataRegExp(ref);
                    }

                }
                return ref;
            }

            function convertTestDataRegExp(codeRows) {
                
                var patt = new RegExp("(.*)@d\\.([a-z]*\\()\\.(.*)(\\).*\\).*)", "g");

                while (codeRows.match(patt)) {
                    codeRows = codeRows.replace(patt, "$1_cat.utils.TestsDB.$2\".$3\"$4");
                }
                return codeRows;
            }
            
            if (size) {
                for (; idx < size; idx++) {
                    row = codeRows[idx];
                    codeRows = _row(row, codeRows, idx);
                }
            } else {
                codeRows = _row(codeRows, codeRows);
            }
            return codeRows;
        },

        /**
         * Remove double quotes from a given code snippet
         * 
         * @param code {String} code representation
         * @returns {*}
         */
        cleanDoubleQuotes: function(code) {
    
            if (!code || !code.split) {
                return code;
            }
            
            return code.split("\"").join("");
            
        }
    };
    
}();