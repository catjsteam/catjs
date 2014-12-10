var _fs = require('fs'),
    _Log = require('log'),
    _path = require('path'),
    _date = require("date-format-lite"),
    _sysutils = catrequire("cat.sys.utils"),
    _logsfolder;

(function() {

    if (!global.CAT) {
        global.CAT = {
            _log: null,
            log: function () {

                var log,
                    logfile = 'CAT.log',
                    logfilepath,
                    logstat;

                if (!global.CAT._log) {

                    if (!_logsfolder) {
                        global.CAT.init();
                    }
                    
                    // split log file if it's too long
                    logfilepath = _path.join(_logsfolder, logfile);
                    if (_fs.existsSync(logfilepath)) {
                        logstat = _fs.statSync(logfilepath);
                        if (logstat.size && logstat.size > 100000) {
                            _fs.renameSync(logfilepath, [_logsfolder, "/CAT_", (new Date()).format("YYYY_MM_DD_mm_ss"), ".log"].join(""));
                        }
                    }

                    log = new _Log('debug', _fs.createWriteStream(logfilepath, {
                        flags: 'a',
                        encoding: null,
                        mode: 0777
                    }));

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
            },
             
            init: function() {
                _logsfolder = _sysutils.createSystemFolder("logs");
            }
        };

    }    
})();

module.exports =  global.CAT;
