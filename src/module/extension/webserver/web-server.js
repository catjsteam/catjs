var _http = require("http"),
    _url = require("url"),
    _path = require("path"),
    _fs = require("fs"),
    _express = require('express'),
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _props = catrequire("cat.props"),
    _server;

var _assert = require('./CatObjects/assert');

/**
 * Web Server support mainly for serving static pages
 * for testing client application with mock data
 *
 * Note: Limited for running one server
 *
 * @type {module.exports}
 */
module.exports = function() {

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

            //var filename = path.join(process.cwd(), uri);

            var allowCrossDomain = function(req, res, next) {
                res.header('Access-Control-Allow-Origin', req.headers.origin)
                res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                next();

            }
            var indexPath = _path.join(process.cwd(), '/target/test-1');

            var app = _express();

            app.configure(function () {
                app.set('port', process.env.PORT || 8089);
                app.use(_express.logger('dev')),  /* 'default', 'short', 'tiny', 'dev' */
                app.use(_express.bodyParser()),
                app.use(allowCrossDomain),
                app.use(_express.bodyParser()),
                app.use(_express.static(indexPath));
            });

            app.get('/assert', _assert.result);


            app.listen(8089);

            console.log('Listening on port 8089...');


//
//            if (!config) {
//                return undefined;
//            }
//
//            var path = config.path,
//                port = (config.port || "8089");
//
//            if (!path || (path && !_fs.existsSync(path))) {
//                return undefined;
//            }
//
//            _server = _http.createServer(function(request, response) {
//
//                var uri = _url.parse(request.url).pathname
//                    , filename = _path.join(path, uri);
//
//                var contentTypesByExtension = {
//                    '.html': "text/html",
//                    '.css':  "text/css",
//                    '.js':   "text/javascript"
//                };
//
//                _path.exists(filename, function(exists) {
//                    console.log(filename);
//                    if(!exists) {
//                        response.writeHead(404, {"Content-Type": "text/plain"});
//                        response.write("404 Not Found\n");
//                        response.end();
//                        return;
//                    }
//
//                    if (_fs.statSync(filename).isDirectory()) filename += '/index.html';
//
//                    _fs.readFile(filename, "binary", function(err, file) {
//                        if(err) {
//                            response.writeHead(500, {"Content-Type": "text/plain"});
//                            response.write(err + "\n");
//                            response.end();
//                            return;
//                        }
//
//                        var headers = {};
//                        var contentType = contentTypesByExtension[_path.extname(filename)];
//                        if (contentType) headers["Content-Type"] = contentType;
//                        response.writeHead(200, headers);
//                        response.write(file, "binary");
//                        response.end();
//                    });
//                });
//            });
//
//            _server.on("clientError", function() {console.log("closed");});
//
//            _server.listen(port, function() {
//                _log.info(_props.get("cat.ext.webserver.start").format("[webserver ext]"));
//                if (callback) {
//                    callback.call(this);
//                }
//            });



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