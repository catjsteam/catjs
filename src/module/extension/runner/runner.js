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
            console.log("mobilerunner");
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
                            "disable": "false",
                            "type": "android",
                            "id": "all",
                            "runner": {
                                "name": "apk"
                            }
                        },
                        {
                            "disable": "true",
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
            };
            _mobilerunner.run(runnerConfig);
        },

        stop: function (callback) {
        }

    };

}();

module.exports = runner;