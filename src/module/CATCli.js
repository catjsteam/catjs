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
    "c" : ["--task", "clean"],
    "p" : ["--project" , "."]
});

module.exports = function() {

    return {

        init: function(dirname) {
            var moduleName,
                home = (dirname || _path.resolve(__dirname + "../../../")),
                workingPath = _path.resolve(".");


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
