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
         * @param config The passed configuration
         *      path - The path of the application
         *      port - The port of the server (optional, default: 8089)
         *
         * @returns {undefined}
         */
        start: function (config, callback) {
            console.log("mobilerunner");
            var runnerConfig = {
                "run": {
                    "devices": [
                        {
                            "disable": false,
                            "type": "localpc",
                            "runner": {
                                "name": "chrome",
                                "address": "/index.html"
                            }
                        },
                        {
                            "disable": false,
                            "type": "localpc",
                            "runner": {
                                "name": "firefox",
                                "address": "/index.html"
                            }
                        },
                        {
                            "disable": false,
                            "type": "android",
                            "id": "all",
                            "runner": {
                                "name": "apk"
                            }
                        }

                    ]
                },

                "server": {
                    "host": "auto",
                    "port": "8089"
                }
            };
            _mobilerunner.run(runnerConfig);
        },

        stop: function (callback) {
        }

    };

}();

module.exports = runner;