// get args
var args = process.argv.slice(2),
    autonpm = require("autonpm", {}),
    _requestprogress,
    _request,
    _admzip,
    _path = require("path"),
    _fs = require("fs"),
    path = _path.resolve("./node_modules"),
    _extractFolder = "test-apps-master"
_zipfolder = "./test/catjs-test-apps",
    _zipfile = _zipfolder + ".zip",
    _spawn = require('child_process');


function _call(command, args, callback) {
    var ls = _spawn.spawn(command, args);

    console.log("CatJS command:", command, " ", args);

    ls.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });

    ls.on('close', function (code) {
        console.log('child process exited with code ' + code);
        if (callback) {
            callback.call();
        }
    });
}

function _testBegin() {
    
    // extract zip file
    if (!_fs.existsSync(_zipfolder) && _fs.existsSync(_zipfile)) {
        _admzip = global["$adm-zip"];

        zip = new _admzip(_zipfile);
        zip.extractAllTo("./test", true);
    }

    console.log("CatJS running tests from directory: ", process.cwd());
    
    // activate catjs core tests
    _call("node", ["./test/" + _path.join(_extractFolder, "test.js")]);
}

function _install() {

    function _downloadTestApps(callback) {
        _request = global["$request"];
        _requestprogress = global["$request-progress"];

        // download the test apps if not exists
        if (!_fs.existsSync(_zipfile)) {

            process.stdout.write("\n CatJS test-apps download (Please wait...) ");
            // Note that the options argument is optional
            _requestprogress(_request('http://github.com/catjsteam/test-apps/archive/master.zip'), {
                "throttle": 2000
            })
                .on('progress', function (state) {
                    process.stdout.write(".");
                })
                .on('error', function (err) {
                    console.error("error", err);
                })
                .pipe(_fs.createWriteStream(_zipfile))
                .on('error', function (err) {
                    console.error("error", err);
                })
                .on('close', function (err) {

                    process.stdout.write("\n Test apps successfully downloaded. ");

                    process.stdout.write("\n Start testing CatJS Apps");
                    
                    if (callback) {
                        callback.call(this);
                    }
                });
        } else {
            if (callback) {
                callback.call(this);
            }
        }
    }

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
                function () {

                    autonpm("adm-zip", {where: path}).fail(
                        function (error) {
                            console.error("Fail to load request module ", error);
                        })
                        .done(
                        function () {

                            var zip;

                            // download test-apps zip file
                            _downloadTestApps(function() {
                                _testBegin();
                                                               
                            });
                         
                        }
                    );
                }
            );
        });
}

function _deleteFolderRecursive(path) {

    if (_fs.existsSync(path)) {

        _fs.readdirSync(path).forEach(function (file, index) {

            var curPath = path + "/" + file;
            if (_fs.lstatSync(curPath).isDirectory()) { // recurse

                _deleteFolderRecursive(curPath);
            } else { // delete file

                _fs.unlinkSync(curPath);
            }

        });

        _fs.rmdirSync(path);
    }


}


function _clean() {

    _call('npm', ['rm', 'request'], function () {
        _call('npm', ['rm', 'request-progress'], function () {
            process.stdout.write("\n\n CatJS cleanup done!")
        });
    });

    if (_fs.existsSync(_zipfile)) {
        _fs.unlinkSync(_zipfile);
    }
    if (_fs.existsSync("./test/" + _extractFolder)) {
        _deleteFolderRecursive("./test/" + _extractFolder);
    }
}

if (args && args[0] && args[0] === "clean") {
    _clean();
} else {
    _install();
}

