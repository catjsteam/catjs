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
                msg = "[CAT init project] No valid project name was found, generating an base project",
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
                    targetpath;

                if (name && path) {

                    data = (data || {});

                    path = _path.resolve(_path.join(path, "catproject.json"));
                    content = _fs.readFileSync(path, "utf8");

                    content = _jsutils.Template.template({
                        content: content,
                        data: data
                    });

                    targetpath = _path.join(workpath, "cat-project");
                    if (!_fs.existsSync(targetpath)) {
                        _fs.mkdirpSync(targetpath);
                    }

                    _fs.writeFileSync(_path.join(targetpath, "catproject.json"), content);

                    _fs.copyRecursive(_path.resolve(_path.join(currentpath, "base")), targetpath, function (err) {
                        if (err) {
                            _utils.log("[CAT init project] resources copy failed with errors: ", err);

                        } else {
                            console.log("[CAT init project] project creation completed");
                        }
                    });
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
                "host": config.host,
                "port": config.port,
                "protocol": config.protocol,

                "appserver": {
                    "host": (config.appserverhost || config.host),
                    "port": (config.appserverport || config.port),
                    "protocol": (config.appserverprotocol || config.protocol)
                },
                "appath": config.appath

            };
            _generate(name, projectPath, args);


        }

    };

}();