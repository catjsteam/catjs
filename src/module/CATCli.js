var _nopt = require("nopt"),
    _path = require("path"),
    _parsed = _nopt({
    "task":[String, null],
    "project" : [String, null]
}, {
    "s" : ["--task", "scan"],
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
            console.log("[CAT] loading module: " + moduleName);
            _parsed.home = {
                path: home,
                working: {path:workingPath}
            };

            require(moduleName).init(_parsed);

        }
    };

}();
