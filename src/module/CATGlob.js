var _fs = require('fs'),
    _Log = require('log'),
    _date = require("date-format-lite");

module.exports = function () {

    if (!global.CAT) {
        global.CAT = {
            _log: null,
            log: function () {

                var log,
                    logfile = 'CAT.log',
                    logstat;

                if (!global.CAT._log) {

                    // split log file if it's too long
                    if (_fs.existsSync(logfile)) {
                        logstat = _fs.statSync(logfile);
                        if (logstat.size && logstat.size > 100000) {
                            _fs.renameSync(logfile, ["CAT_", (new Date()).format("YYYY_MM_DD_mm_ss"), ".log"].join(""));
                        }
                    }

                    log = new _Log('debug', _fs.createWriteStream(logfile, { flags: 'a',
                        encoding: null}));

                    log.info("\n\n[CAT] Initial LOG -----------------------------------------------------------------------");
                    log.info("[CAT] Initial CAT process: " + process.pid);
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