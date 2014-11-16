// get args
var args = process.argv.slice(2),
    autonpm = require("autonpm", {}),
    _requestprogress,
    _request,
    _admzip,
    _os = require("os"),
    _platform = _os.platform(),
    _path = require("path"),
    _fs = require("fs"),
    basedir = "./",
    _nodeModulesPath = (_platform === "win32" ? basedir : _path.join(basedir, "node_modules")),
    path = _path.resolve(_nodeModulesPath),
    _extractFolder = "test-apps-master",
    _zipfolder = _path.join(basedir, "test/catjs-test-apps"),
    _zipfile = _zipfolder + ".zip",
    _spawn = require('child_process');


function _call(command, args, callback) {
    var ls = _spawn.spawn(command, args);

    function printBuffer(data) {
        var util = require('util'),
            nocolor = require("stripcolorcodes"),
            buff, string;

        if (data) {
            buff = new Buffer(data);
            if (buff) {

                string = buff.toString('utf8');
                string = nocolor(string);
                string = string.split("\n").join("").split("\r").join("").split("\'").join("");
                
                console.log(util.inspect(string));
            }
        }
    }

    console.log("CatJS command:", command, " ", args);

    ls.stdout.on('data', function (data) {
        printBuffer(data);
    });

    ls.stderr.on('data', function (data) {
        printBuffer(data);
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
        _admzip = (global["$adm-zip"] || require("adm-zip"));

        zip = new _admzip(_zipfile);
        zip.extractAllTo(_path.join(basedir, "test"), true);
    }

    console.log("CatJS running tests from directory: ", process.cwd());

    // activate catjs core tests
    _call("node", [_path.join("test/" + _path.join(_extractFolder, "test.js"))]);
}

function _install(build, proxy) {

    function _downloadTestApps(callback) {

        var requestConfig = {
            url: 'http://github.com/catjsteam/test-apps/archive/master.zip'
        };

        if (proxy) {
            requestConfig.proxy = proxy;
        }

        try {

            _request = (global["$request"] || require("request"));
            _requestprogress = (global["$request-progress"] || require("request-progress"));

        } finally {
            if (!_request || !_requestprogress) {
                console.log("\n npm modules are missing (request, requestprogress and amd-zip), install them manually under catjs node_modules...", cathome);
            }
        }

        process.stdout.write("\n CatJS test-apps download (Please wait...) ");

        _requestprogress(_request(requestConfig), {
            "throttle": 2000
        })
            .on('progress', function (state) {
                process.stdout.write(".");
            })
            .on('error', function (err) {
                console.error("error", err);
            })
            .pipe(_fs.createWriteStream(_zipfile, {flags: "w+", mode: "0777"}))
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

    }

    if (build) {
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
                                _downloadTestApps(function () {
                                    _testBegin();

                                });

                            }
                        );
                    }
                );
            });
    } else {
        // download test-apps zip file
        _downloadTestApps(function () {
            _testBegin();

        });
    }
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
    if (_fs.existsSync(_path.join("test/" + _extractFolder))) {
        _deleteFolderRecursive(_path.join("test/" + _extractFolder));
    }
}

if (require.main === module) {

    // command line support
    if (args && args[0]) {
        if (args[0] === "clean") {
            _clean();

        } else if (args[0] === "buildall") {
            console.log("...", args);
            _install(true, args[1]);

        } else if (args[0] === "build") {
            console.log("...", args);
            _install(false, args[1]);
        }
    } else {
        _install(true);
    }

} else if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {

        // nodejs support
        module.exports = function () {

            return {

                init: function () {

                },

                /**
                 * Manually run catjs build
                 *
                 * @param proxy The proxy server
                 */
                build: function (proxy) {
                    _install(false, proxy);
                },

                buildall: function (proxy) {
                    _install(true, proxy);
                },

                clean: function () {
                    _clean();
                }
            };

        }();

    }
} 



