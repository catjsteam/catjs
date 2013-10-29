//var http = require("http"),
//    url = require("url"),
//    path = require("path"),
//    fs = require("fs");
//
//http.createServer(function(request, response) {
//
//    var uri = url.parse(request.url).pathname
//        , filename = path.join(process.cwd(), uri);
//
//    var contentTypesByExtension = {
//        '.html': "text/html",
//        '.css':  "text/css",
//        '.js':   "text/javascript"
//    };
//
//    path.exists(filename, function(exists) {
////        console.log(filename);
//        if(!exists) {
//            response.writeHead(404, {"Content-Type": "text/plain"});
//            response.write("404 Not Found\n");
//            response.end();
//            return;
//        }
//
//        if (fs.statSync(filename).isDirectory()) filename += '/index.html';
//
//        fs.readFile(filename, "binary", function(err, file) {
//            if(err) {
//                response.writeHead(500, {"Content-Type": "text/plain"});
//                response.write(err + "\n");
//                response.end();
//                return;
//            }
//
//            var headers = {};
//            var contentType = contentTypesByExtension[path.extname(filename)];
//            if (contentType) headers["Content-Type"] = contentType;
//            response.writeHead(200, headers);
//            response.write(file, "binary");
//            response.end();
//        });
//    });
//}).listen("8089");



express = require('express'),
    path = require('path'),
    fs = require('fs');

assert = require('./../../module/extension/webserver/CatObjects/assert');

//var filename = path.join(process.cwd(), uri);

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin)
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    next();

}

var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 8089);
    app.use(express.logger('dev')),  /* 'default', 'short', 'tiny', 'dev' */
        app.use(express.bodyParser()),
        app.use(allowCrossDomain),
        app.use(express.bodyParser());
        app.use(express.static(process.cwd()));
});

app.get('/assert', assert.result);


app.listen(8089);

console.log('Listening on port 8089...');









