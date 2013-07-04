var _fs = require('fs'),
    _Log = require('log');

module.exports = function () {

    if (!global.CAT) {
        global.CAT = {
            _log: null,
            log: function () {

                var log;

                if (!global.CAT._log) {

                    log = new _Log('debug', _fs.createWriteStream('CAT.log', { flags: 'w',
                        encoding: null}));
                    global.CAT._log = log;

                }
                return global.CAT._log;
            },
            get: function(key) {
                if (global.CAT) {
                    return global.CAT[key];
                }
            },
            set: function(key, value) {
                if (global.CAT &&
                    key &&
                    (value !== undefined && value !== null) ) {
                    global.CAT[key] = value;
                }
            }
        };

    }

    return global.CAT;
}();