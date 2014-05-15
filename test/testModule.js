function test(config, callback) {

    var currentpath,
        catjsmain;

    if (config && config.dir) {
        process.chdir(config.dir);
    }

    currentpath = require("path").resolve(".");
    console.log(config.name + " directory: ", currentpath);

    if (!config.init) {
        // clean the project
        require("wrench").rmdirSyncRecursive('./cat-project',{ forceDelete: true});
        process.send({status: "done"});
    }

    catjsmain = require(require("path").join(currentpath, "/../../src/module/CATCli.js"));

    catjsmain.init({
        init: "cat",
        schema: {
            properties: {
                name: config.testname,
                host: "localhost",
                port: config.port,
                protocol: "http",
                appath: "./../cat-test-app"
            }
        },
        callback: function () {

            var catjs = require(require("path").join(currentpath, "/../../src/module/CATCli.js"));

            // TODO add copy resources module
            if (config.name === "enyo") {

                require("fs.extra").mkdirpSync('./cat-project/src/config');
                require("fs").writeFileSync("./cat-project/src/config/cat.json", require("fs").readFileSync("./cat.json", "utf8"));
            }

            if (require("fs").existsSync('./cat-project')) {

                process.chdir('./cat-project');
                catjs.init({
                    task: config.tasks,
                    taskcb: function (task) {
                        if (task && task === "t@runner.start") {

                            console.log("[CAT build] waiting 30 seconds");
                            setTimeout(function () {

//                                process.chdir('./..');
//                                require("fs.extra").rmrf('./cat-project', function (err) {
//                                    if (err) {
//                                        console.error(err);
//                                    }


                                if (callback) {
                                    callback.call();
                                }

                                process.send({status: "done"});

//                                });


                            }, 30000);
                        }
                    },
                    callback: function () {

                    }});
            }

        }
    });
}

module.exports = function () {
    return {
        test: function () {

            process.on('message', function (args) {
                console.log("Arguments: ", args);
                test(args);
            });

        },
        run: function (entity) {
            var testmodule = require("./test.js");

            testmodule.run(entity);
        }
    };
}();

