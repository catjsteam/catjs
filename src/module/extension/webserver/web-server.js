var _http = require("http"),
    _url = require("url"),
    _path = require("path"),
    _fs = require("fs"),
    _express = require('express'),
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _props = catrequire("cat.props"),
    _server,
    _utils  = catrequire("cat.utils"),
     _winston = require('winston'),
    _projectmanager = require('../projectmanager/action'),
    vars = {
        assert: require('./CatObjects/assert')
    };

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
                res.header('Access-Control-Allow-Origin', req.headers.origin);
                res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                next();

            };

            if (!path || (path && !_fs.existsSync(path))) {
                _utils.log("warning", "[CAT WebServer] not valid location: " + path);
                return undefined;
            }

            _server = _express();

            var logger = new (_winston.Logger)({
                transports: [
                   //new (_winston.transports.Console)({ level: 'verbose', json: false}),
                    new (_winston.transports.File)({ filename: 'express_server.log',  level: 'verbose', json: false })
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
                _server.use(_express.bodyParser());
                _server.use(allowCrossDomain);
                _server.use(_express.bodyParser());
                _server.use(_express.static(path));
            });

            if (set) {
                set.forEach(function(item) {
                    var value;
                    if (item) {
                        if ("var" in item) {
                            value = vars[item.var];
                            if (value !== undefined) {
                                if ("prop" in item) {
                                    value = value[item.prop];
                                    _server.get( ('/'+item.key), value);
                                }
                            }
                        }
                    }
                });
            }

            // kill the server with get request
            _server.get('/exit', function(req, res) {
                res.setHeader('Content-Type', 'text/javascript;charset=UTF-8');
                res.send('{"exit": 1}');
                process.exit(1);
            });

            _server.get('/scraps', function(req, res){
                if (req.query && req.query.scrap) {
                    _projectmanager.checkScrap(req,res);
                } else {
                    res.send({"error" : "invalid"} );
                }

            });

            _server.listen(port, function() {
                _log.info(_props.get("cat.ext.webserver.start").format("[webserver ext]"));
                if (callback) {
                    callback.call(this);
                }
            });
        },

        stop: function(callback) {
            if (_server) {
                _log.debug(_props.get("cat.ext.webserver.stop").format("[webserver ext]"));
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