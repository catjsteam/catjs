/**
 * Created by retyk on 27/03/14.
 */
var _url = require("url"),
    _path = require("path"),
    _fs = require("fs"),
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _props = catrequire("cat.props"),

    _utils = catrequire("cat.utils"),
    _winston = require('winston'),
    _mobilerunner = require('mobilerunner');

/**
 * Web Server support mainly for serving static pages
 * for testing client application with mock data
 *
 * Note: Limited for running one server
 *
 * @type {module.exports}
 */


var runner = function () {

    return {

        /**
         * Start a local web server for running an application
         *
         * @param {}
         *
         * @returns {undefined}
         */
        start: function (config, callback) {

            var runnerConfig = {
                "run": {
                    "devices": [
                        {
                            "type": "localpc",
                            "runner": {
                                "name": "chrome",
                                "address": "/index.html"
                            }
                        },
                        {
                            "type": "localpc",
                            "runner": {
                                "name": "firefox",
                                "address": "/index.html"
                            }
                        },
                        {
                            "type": "android",
                            "id": "all",
                            "runner": {
                                "name": "apk"
                            }
                        },
                        {
                            "type": "iphone",
                            "id": "all",
                            "runner": {
                                "name": "agent",
                                "options": {"ip": "192.168.2.112", "port": "54321", "path": "/cat"}
                            }
                        }

                    ]
                },

                "server": {
                    "host": "auto",
                    "port": config.port
                }
            }, origcallback;

            if (config && config.runnerconfig) {
                runnerConfig = config.runnerconfig;
                if (runnerConfig.run) {
                    if (!runnerConfig.server) {
                        runnerConfig.server = {
                            "host": "auto",
                            "port": config.port
                        }
                    }
                }
            }

            if (runnerConfig.callback) {
                origcallback = runnerConfig.callback;
            }
            runnerConfig.callback = function (info) {

                var runinfo,
                    errors;

                if (info) {
                    if (!info.test())
                    
                        errors = info.errors();
                        if (errors) {
                            _utils.error(("[Mobile Runner] Error messages: " + (errors ? errors.print() : "General error occured")) );
                        }

                    runinfo = info.getRunnableInfo();
                    if (runinfo) {
                        _utils.error("[Mobile Runner] Failed to run all of the requested devices or browsers. Planned: " + info.size() + " actual: " + runinfo.size());
                    }

                }

                if (origcallback) {
                    origcallback.call(this, info);
                }
            };

            _mobilerunner.run(runnerConfig);
        },

        stop: function (callback) {
        }

    };

}();

module.exports = runner;