var _catglobal = catrequire("cat.global"),
    _log = _catglobal.log(),
    _utils = catrequire("cat.utils"),
    _sysutils = catrequire("cat.sys.utils"),
    _path = require("path"),
    _fs = require("fs.extra"),
    _jsutils = require("js.utils");

module.exports = function () {

    // supported types = ["cat", "example", "server"]
    
    var workpath = _catglobal.get("home").working.path,
        currentpath = _path.resolve(_path.join(cathome, "src/module/project/init/projects"));

    
    function isCatProjectFolder() {
        var targetpath = _path.join(workpath, "cat-project");
        if (!_fs.existsSync(targetpath)) {
            return targetpath;
        }
        
        return undefined;
    }
    
    function _createCatProject(projectSkeletonarg, targetpath, data) {
        
        var catprojeccontent,
            content;
        
        // create cat-project
        _fs.mkdirpSync(targetpath, {mode: 0777});
        _sysutils.chmodSyncOffset(targetpath, 0777, 1);

        // prepare catproject.json content
        catprojeccontent = _path.resolve(_path.join(projectSkeletonarg, "catproject.json"));
        content = _fs.readFileSync(catprojeccontent, "utf8");
        _jsutils.Template.setMustache(true);
        content = _jsutils.Template.template({
            content: content,
            data: (data || {})
        });

        // creating cat project file
        _fs.writeFileSync(_path.join(targetpath, "catproject.json"), content, {mode: 0777});

    }
    
    function _createProject(config) {

        var name = (("name" in config && config.projectname) ? config.projectname : undefined),
            projectSkeleton,
            args;

        function _generate(projectSkeletonarg, data) {

            var targetpath,
                appfolder;

            if (projectSkeletonarg) {

                targetpath = isCatProjectFolder();
                if (targetpath) {

                    // create cat-project
                    _createCatProject(projectSkeletonarg, targetpath, data);
    
                    // copy additional resources to the initial target project folder
                    _fs.copyRecursive(_path.resolve(_path.join(currentpath, "base")), targetpath, function (err) {
                        if (err) {
                            _utils.log("[catjs init project] cat project creation aborted - cat-project already exists ");    
                        }

                        appfolder = _fs.existsSync(_path.join(projectSkeletonarg, "app"));
                        if (appfolder) {
                            // copy additional resources to the initial target project folder
                            _fs.copyRecursive(_path.resolve(_path.join(projectSkeletonarg, "app")), _path.resolve(_path.join(workpath, "app")), function (err) {
                                if (err) {
                                    _utils.log("[catjs init project] cat project creation aborted - cat-project already exists ");
    
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
                } else {
                    _utils.log("[catjs init project] cat project creation aborted - cat-project already exists, run init from other location or modify your project ");
                }
            }
        }

        projectSkeleton = _path.resolve(_path.join(currentpath, (name || "undefined")));
        if (_fs.existsSync(projectSkeleton)) {
            
            projectSkeleton = _path.resolve(_path.join(currentpath, name));                
            args = {
                "name": config.name,

                "source": config.source,
                "target": config.target,
                "cattarget": "./",
                "analytics": config.analytics,
                "server": {
                    "host": ( config.serverhost),
                    "port": (config.serverport),
                    "protocol": ( config.serverprotocol)
                },
                "appath": config.appath

            };

            _generate(projectSkeleton, args);
            
        } else {
            _utils.log("[catjs init project] cat project creation aborted, no valid project type (e.g. cat | example | server) was found");
        }
    } 
    
    return {

        create: function (config) {
           
            _createProject(config);

        }

    };

}();