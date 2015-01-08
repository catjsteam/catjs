var _url = require("url"),
    _path = require("path"),
    _fs = require("fs"),
    _express = require('express'),
    _global = catrequire("cat.global"),
    _log = _global.log(),   
    _server,
    _utils  = catrequire("cat.utils"),
     _winston = require('winston'),
    _projectmanager = require('../projectmanager/action'),
    _assert = require('./CatObjects/assert'),
    _runner = require('./CatObjects/runner'),
    _screenshot = require('./CatObjects/screenshot'),
    _deviceinfo = require('./CatObjects/deviceinfo');

/**
 * Web Server support mainly for serving static pages
 * for testing client application with mock data
 *
 * Note: Limited for running one server
 *
 * @type {module.exports}
 */


var webserver  = function() {

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
        start: function(config, callback) {

            var path = config.path,
                port = (config.port || "80"),
                set = config.set;

            var allowCrossDomain = function(req, res, next) {
                res.header('Access-Control-Allow-Origin', "*");
                res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                next();

            };

            if (!path || (path && !_fs.existsSync(path))) {
                _utils.log("warning", "[catjs server] not valid location: " + path);
                return undefined;
            }

            _server = _express();

            var logger = new (_winston.Logger)({
                transports: [
                    new (_winston.transports.File)({ filename: 'logs/express_server.log',  level: 'info', json: false })
                ]
            });

            var winstonStream = {
                write: function(message, encoding){
                    logger.info(message);
                }
            };

            _server.configure(function () {
                _server.set('port', process.env.PORT || port);
                _server.use(_express.logger({stream: winstonStream, format: 'dev'}));
                _server.use(_express.json());
                _server.use(_express.urlencoded());
                _server.use(allowCrossDomain);
                _server.use(_server.router);
                _server.use(_express.static(path));                                                   
            });

           
            _server.get('/assert', _assert.get);
            _server.get('/runner', _runner.get);
                          

            _server.get('/*', function(req, res, next){
                res.setHeader('Last-Modified', (new Date()).toUTCString());
                next();
            });

            // kill the server with get request
            _server.get('/exit', function(req, res) {
                res.setHeader('Content-Type', 'text/javascript;charset=UTF-8');
                res.send('{"exit": 1}');
                process.exit(1);
            });

            _server.get('/scraps', function(req, res){
                if (req.query && req.query.scrap
                        && req.query.testId) {
                    _projectmanager.checkScrap(req,res);
                }
            });

            _server.post('/screenshot', _screenshot.post);

            _server.post('/deviceinfo', _deviceinfo.post);


            _server.listen(port, function() {
                _utils.log("info", ("[catjs server] Server Started, listening to port:" + port));
                if (callback) {
                    callback.call(this);
                }
            });
        },

        stop: function(callback) {
            if (_server) {
                _utils.log("info", ("[catjs server] Server Stopped "));
                if (callback) {
                    callback.call(this);
                }
                _server.close(function() {

                });
            }
        }

    };

}();

module.exports = webserver;