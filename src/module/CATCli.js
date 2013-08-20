var _nopt = require("nopt"),
    _path = require("path"),
    _fs = require("fs"),
    _parsed = _nopt({
    "kill": [String, Number],
    "task":[String, Array],
    "watch": [Boolean, false],
    "project" : [String, null]
}, {
    "w" : ["--watch", "true"],
    "k" : ["--kill", 0],
    "s" : ["--task", "scrap"],
    "i" : ["--task", "init"],
    "j" : ["--task", "inject"],
    "t" : ["--task", "test"],
    "c" : ["--task", "clean"],
    "p" : ["--project" , "."]
});


module.exports = function() {

    return {

        init: function(dirname) {
            var moduleName,
                home = (dirname || _path.resolve(__dirname + "../../../")),
                workingPath = _path.resolve(".");

            (function() {
                // Map index for CAT modules
                global["cat.config.module"] = {
                    "cat": "src/module/CAT.js",
                    "cat.config": "src/module/config/CATConfig.js",
                    "cat.global": "src/module/CATGlob.js",
                    "cat.utils": "src/module/utils/Utils.js",
                    "cat.ext.utils": "src/module/utils/ExtUtils.js",
                    "cat.tpl.utils": "src/module/utils/TemplateUtils.js",
                    "cat.project": "src/module/Project.js",
                    "cat.props": "src/module/Properties.js",
                    "cat.mdata": "src/module/fs/MetaData.js",
                    "cat.watch": "src/module/Watch.js",
                    "cat.cache": "src/module/Cache.js",
                    "cat.plugin.base": "src/module/plugin/Base.js",
                    "cat.plugin.spawn": "src/module/plugin/spawn.js",
                    "cat.common.scrap": "src/module/plugin/scrap/Scrap.js",
                    "cat.common.parser": "src/module/common/parser/Parser.js",
                    "cat.flow": "src/module/Flow.js"
                };

                global.catmodule = function (module) {
                    var catconfig = global["cat.config.module"],
                        modulepath;
                    if (catconfig) {
                        modulepath = ( catconfig[module] || module );
                        modulepath = _path.normalize([home, modulepath].join("/"));
                    }
                    return modulepath;
                };

                /**
                 * CAT require implementation
                 *
                 * @param module The module key
                 * @returns {*}
                 */
                global.catrequire = function (module) {

                    return require(global.catmodule(module));
                };

                global.cathome = home;
                global.catlibs = _path.normalize([home, "src/template/libraries/"].join("/"));


            })();

            // Everything looks good. Require local grunt and run it.
            moduleName = [home, "src/module/CAT.js"].join("/");
            _parsed.home = {
                path: home,
                working: {path:workingPath}
            };

            // CAT Module Initialization
            require(moduleName).init(_parsed);

        }
    };

}();
