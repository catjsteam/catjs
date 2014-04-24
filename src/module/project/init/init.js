var _catglobal = catrequire("cat.global"),
    _log = _catglobal.log(),
    _utils = catrequire("cat.utils"),

    _path = require("path"),
    _fs = require("fs.extra"),
    _jsutils = require("js.utils");

module.exports = function () {

    var workpath = _catglobal.get("home").working.path,
        currentpath = _path.resolve(_path.join(cathome, "src/module/project/init/projects"));

    return {

        create: function(config) {

           var name = (("name" in config && config.projectname)? config.projectname : undefined),
                msg = "[CAT init project] No valid project name was found, generating a base project",
                projectPath,
                args;

            function _validate() {
                if (!name) {
                    console.log(msg);
                    name = "cat";
                    return false;
                }
                return true;
            }

            function _generate(name, path, data) {

                var content,
                    targetpath,
                    catprojeccontent,
                    appfolder;

                if (name && path) {

                    data = (data || {});

                    catprojeccontent = _path.resolve(_path.join(path, "catproject.json"));
                    content = _fs.readFileSync(catprojeccontent, "utf8");

                    content = _jsutils.Template.template({
                        content: content,
                        data: data
                    });

                    targetpath = _path.join(workpath, "cat-project");
                    if (!_fs.existsSync(targetpath)) {

                        _fs.mkdirpSync(targetpath);
                    }

                        // creating cat project file
                        _fs.writeFileSync(_path.join(targetpath, "catproject.json"), content);

                        // copy additional resources to the initial target project folder
                        _fs.copyRecursive(_path.resolve(_path.join(currentpath, "base")), targetpath, function (err) {
                            if (err) {
                                _utils.log("[CAT init project] probably the files already exists, skipping... ");

                            }

                            appfolder = _fs.existsSync(_path.join(path, "app"));
                            if (appfolder) {
                                // copy additional resources to the initial target project folder
                                _fs.copyRecursive(_path.resolve(_path.join(path, "app")), _path.resolve(_path.join(workpath, "app")), function (err) {
                                    if (err) {
                                        _utils.log("[CAT init project] probably the files already exists, skipping... ");

                                    }
                                    if (config && config.callback) {
                                        config.callback.call();
                                    }
                                });
                            } else {
                                if (config && config.callback) {
                                    config.callback.call();
                                }

                            }

                        });
//                    } else {
//
//                        console.warn("[CAT init project] Project already exists (consider, delete the project first)");
//
//                        if (config && config.callback) {
//                            config.callback.call();
//                        }
//
//                        return undefined;
//                    }
                }
            }

            _validate();

            projectPath = _path.resolve(_path.join(currentpath, name));
            if (!_fs.existsSync(projectPath)) {
                if (!_validate()) {
                    projectPath = _path.resolve(_path.join(currentpath, name));
                }
            }
            args = {
                "name": config.name,

                "source": config.source,
                "target": config.target,
                "cattarget": "./",
                "host": config.host,
                "port": config.port,
                "protocol": config.protocol,
                "analytics" : config.analytics,
                "appserver": {
                    "host": ( config.host),
                    "port": (config.port),
                    "protocol": ( config.protocol)
                },
                "appath": config.appath

            };

            _generate(name, projectPath, args);


        }

    };

}();