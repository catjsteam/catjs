var _childProcess = require('child_process'),
    _path = require('path'),
    _phantomjs = require('phantomjs'),
    _binPath = _phantomjs.path,
    _global = catrequire("cat.global"),
    _utils = catrequire("cat.utils"),
    _props = catrequire("cat.props"),
    _log = _global.log();

/**
 * A bridge between nodejs and phantomjs project
 * It executes a child process for running a phantomjs file with a given web server host address
 *
 * @type {{run: Function}}
 */
module.exports = function () {

    return {
        /**
         *  Running a lphantomjs project
         *
         * @param config
         *      file - The phantomjs project file
         *      host - The host address for the running web server
         *
         * @returns {undefined}
         */
        run: function (config, donecallback) {

            /**
             *   Configuration Sample
             *
             *   var childArgs = [
             *      _path.join("./", ('phantom-open.js')),
             *      'http://localhost:8089/'
             *   ];
             */

            var childArgs = [],
                validateArgs = 0,
                phantomProcess,
                options = {};

            if (!config) {
                return undefined;
            }

            // set the phantomjs file location
            if (config.file) {
                childArgs.push(config.file);
                validateArgs++;
                options.cwd = _path.dirname(config.file);
            }

            // set the host address for the web server
            if (config.host) {
                childArgs.push(config.host);
                validateArgs++;
            }

            // execute phantom process
            if (validateArgs === 2) {
                try {
                    phantomProcess = _childProcess.spawn(_binPath, childArgs, options);

                    phantomProcess.stdout.setEncoding('utf8');
                    phantomProcess.stdout.on('data', function (data) {
                        var buff = new Buffer(data);
                        _log.debug(_props.get("cat.ext.spawn.phantomjs.log").format("[phantomjs bridge]", "info", buff.toString('utf8')));
                    });

                    phantomProcess.stderr.on('data', function (data) {
                        data += '';
                        _log.debug(_props.get("cat.ext.spawn.phantomjs.log").format("[phantomjs bridge]", "error", data.replace("\n", "\nstderr: ")));
                    });

                    phantomProcess.on('exit', function (code) {
                        console.log('child process exited with code ' + code);
                        _log.debug(_props.get("cat.ext.spawn.phantomjs.log").format("[phantomjs bridge]", "exit", ('child process exited with code ' + code)));

                        process.exit(code);
                        if (donecallback) {
                            donecallback.call(this);
                        }
                    });

                } catch (e) {
                    _log.debug(_props.get("cat.error").format("[phantomjs bridge]", e));
                }
            }
        }
    };
}();