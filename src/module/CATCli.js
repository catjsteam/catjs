var _nopt = require("nopt"),
    _path = require("path"),
    _fs = require("fs"),
    _Mapper = require("require-mapper"),
    _mapper = new _Mapper(),
    _parsed;

_parsed = _nopt({
    "kill": [String, Number],
    "task": [String, Array],
    "init": String,
    "watch": [Boolean, false],
    "project": [String, null]
}, {
    "w": ["--watch", "true"],
    "k": ["--kill", 0],
    "i": ["--init", "cat"],
    "b": ["--task", "t@init", "--task", "t@scrap", "--task", "t@inject"],
    "t": ["--task", "t@test"],
    "c": ["--task", "t@clean"],
    "s": ["--task", "t@server.start"],
    "m": ["--task", "t@mtest"],
    "p": ["--project" , "."]
});


module.exports = function () {

    return {

        init: function (dirname) {
            var moduleName,
                home = (dirname || _path.resolve(__dirname + "../../../")),
                workingPath = _path.resolve(".");

            (function () {

                _mapper.init({
                    methodname: "catrequire",
                    basepath: home,
                    data: {
                        "cat.config": "src/module/config/CATConfig.js",

                        "cat": "src/module/CAT.js",
                        "cat.init": "src/module/project/init/init.js",

                        "cat.flow": "src/module/Flow.js",
                        "cat.global": "src/module/CATGlob.js",
                        "cat.project": "src/module/project/Project.js",
                        "cat.props": "src/module/Properties.js",
                        "cat.config.utils": "src/module/utils/fs/Config.js",
                        "cat.mdata": "src/module/utils/fs/MetaData.js",
                        "cat.watch": "src/module/Watch.js",
                        "cat.cache": "src/module/Cache.js",

                        "cat.utils": "src/module/utils/Utils.js",
                        "cat.ext.utils": "src/module/utils/ExtUtils.js",
                        "cat.tpl.utils": "src/module/utils/TemplateUtils.js",
                        "cat.regexp.utils": "src/module/utils/RegExp.js",
                        "cat.uglify.utils": "src/module/utils/Uglify.js",

                        "cat.plugin.base": "src/module/plugin/Base.js",
                        "cat.plugin.spawn": "src/module/plugin/spawn.js",
                        "cat.common.scrap": "src/module/plugin/scrap/Scrap.js",

                        "cat.common.config": "src/module/config/project/Config.js",
                        "cat.common.parser": "src/module/common/parser/Parser.js",

                        "cat.scrap.utils": "src/module/plugin/scrap/ScrapUtils.js"
                    }
                });

                global.cathome = home;
                global.catlibs = _path.join(home, "src/libraries/");


            })();

            // Everything looks good. Require local grunt and run it.
            moduleName = _path.join(home, "src/module/CAT.js");
            _parsed.home = {
                path: home,
                working: {path: workingPath}
            };

            // CAT Module Initialization
            require(moduleName).init(_parsed);

        }
    };

}();
