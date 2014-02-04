var _watch = require("watch"),
    _cat = catrequire("cat"),
    _fs = require("fs");

module.exports = function () {

    var _apply = function(config) {
        _cat.watch(config);
    };

    return {

        init: function (path) {

            var me = this;
            path = (path || "/home/arik/dev/projects/cat/test/test-project");

            if (path) {
                _watch.createMonitor(path, function (monitor) {

                    console.log(" -- > " + process.getuid());

                    // monitor.files['./**/*.js'];

                    monitor.on("created", function (f, stat) {
                        // Handle new files
                        if (f && !_fs.existsSync(f)){
                            _apply({impl: new me.createWatch({file: f, stat: stat, "crud": "c"})});
                        }
                    });

                    monitor.on("changed", function (f, curr, prev) {
                        // Handle file changes
                        if (curr.mtime - prev.mtime) {
                            _apply({impl: new me.createWatch({file: f, "crud": "u"})});
                        }
                    });

                    monitor.on("removed", function (f, stat) {
                        // Handle removed files
                        if (f && _fs.existsSync(f)){
                            _apply({impl: new me.createWatch({file: f, stat: stat, "crud": "d"})});
                        }
                    });

                });
            }
        },

        /**
         * Create a Watch class
         *
         * @param config The initial configuration
         */
        createWatch: function(config) {

            this.config = config;

            if (config) {
                this.file = config.file;
                this.stat = config.stat;
                this.crud = config.crud;
            }

            this.get = function(key) {
                return (key ? this[key] : undefined);
            };

            this.getConfig = function() {
                return this.config;
            };
        }
    };

}();