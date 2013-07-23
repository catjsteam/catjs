var _watch = require("watch");

module.exports = function () {

    return {
        init: function () {
            _watch.createMonitor("/home/arik/dev/projects/cat/test/test-project", function (monitor) {

                console.log(" -- > " + process.getuid());

                monitor.files['./**/*.js'];

                monitor.on("created", function (f, stat) {
                    // Handle new files
                    debugger;
                });

                monitor.on("changed", function (f, curr, prev) {
                    // Handle file changes
                    debugger;
                });

                monitor.on("removed", function (f, stat) {
                    // Handle removed files
                    debugger;
                });

            });
        }
    };

}();