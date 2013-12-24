var childProcess,
    settingConfig,
    settingFailed = false,
    connectionFailed = false,
    os = require("os");

function _processIt(command, args, opt, callback) {

    var childProcess = require("child_process"),
        process;

    if (childProcess) {
        if (os.platform() === "win32") {
            args.unshift(command);
            args.unshift("/c");
            command = "cmd";
        }
        process = childProcess.spawn(command, args, opt);

        process.stderr.on('data', function (err) {
            console.log('child process exited with errors, ' + err);
        });

        process.on('close', function (code) {
            if (code !== 0) {
                console.log('child process exited with code ' + code);
            } else {
                if (callback) {
                    callback.call(this);
                }

            }
        });
    }
}

function _testConnection(host, callback) {
    require('dns').resolve(host, function (err) {
        if (err) {
            // failed to connect
            connectionFailed = true;
            console.error("Test connection to: ", host ,"failed with errors. Check your cable and your proxy settings", err);
        }
        else {
            //connected

        }

        if (callback) {
            callback.call(this, err);
        }
    });
}

function _isProxy() {
    return settingConfig.proxy.enable;
}

function _getProxyURL() {
    var host  = settingConfig.proxy.base.host,
        port  = settingConfig.proxy.base.port;

    return (_isProxy() ? ['"',"http://", host, ":", port, '"'].join("") : undefined);
}

settingConfig = require('fs').readFileSync("settings.json");
if (settingConfig) {
    try {
        settingConfig = JSON.parse(settingConfig);
    } catch (e) {
        console.error("Failed to parse setting.json content. ", e);
        settingFailed = true;
    }
}

function _process() {

    _testConnection("www.google.com", function() {
        _testConnection("www.npmjs.org", function() {

        });
    });


}

if (!settingFailed) {

    if (_isProxy()) {
        _processIt("npm", ["config", "set", "proxy", _getProxyURL()], undefined, function() {
            _processIt("npm", ["config", "set", "https-proxy", _getProxyURL()], undefined, function() {
                _processIt("git", ["config", "http.proxy", _getProxyURL()], undefined, function() {
                    _process();
                });
            });
        });

    } else {
        _processIt("npm", ["config", "delete", "proxy"], undefined, function() {
            _processIt("npm", ["config", "delete", "https-proxy"], undefined, function() {
                _processIt("git", ["config", "--unset", "http.proxy"], undefined, function() {
                    _process();
                });
            });
        });


    }
}
