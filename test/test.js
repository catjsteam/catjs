
// get the request-progress module
var autonpm = require("autonpm", {}),
    _requestprogress,
    _request,
    _path = require("path"),
    _fs = require("fs"),
    path = _path.resolve("./node_modules");

autonpm("request-progress", {where: path}).then(
    function (mod) {

    }).fail(
    function (error) {
        console.error("Fail to load request-progress module ", error);
    })
    .done(
    function () {
        autonpm("request", {where: path}).fail(
            function (error) {
                console.error("Fail to load request module ", error);
            })
            .done(
                function() {

                    _request = require("request");
                    _requestprogress = require("request-progress");

                    // Note that the options argument is optional
                    _requestprogress(_request('http://google.com/doodle.png'), {
                        delay: 1000
                    })
                        .on('progress', function (state) {
                            process.stdout.write(".");
                        })
                        .on('error', function (err) {
                            console.error("error", err);
                        })
                        .pipe(_fs.createWriteStream('doodle.png'))
                        .on('error', function (err) {
                            console.error("error", err);
                        })
                        .on('close', function (err) {
                            process.stdout.write(" done downloading test apps.");

                            process.stdout.write("\n Start testing CatJS Apps");


                        });

                }
            );
    });

