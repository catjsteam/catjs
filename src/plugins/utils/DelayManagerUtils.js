var _jsutils = require("js.utils");

module.exports = function (config) {

    function DelayManager(config) {

        var _commandsCode = [],
            _config = config,
            _scrap = _config.scrap,
            scrapargs = _scrap.getArgumentsNames(),
            scrapargsstr;

        scrapargsstr = "context" + (",") + scrapargs.join(",");

        return {

            add: function(config, process, print) {

                var rows = config.rows,
                    concatflag = ("concat" in config || false),
                    prepare = [],
                    args = (config.args || []),
                    counter=0;

                _commandsCode = [];
                args.push("scrap : _ipkg.scrap");
                args.push("args  : _args");

                rows.forEach(function (row) {

                    if (row) {
                        _commandsCode.push((process ? process.call(_scrap, row) : row));
                    }
                    counter++;
                });

                if (!print) {
 
                    if (concatflag) {
                        // concat all of the given commands
                        prepare.push(_commandsCode);

                    } else {
                        // execute the commands separately
                        _commandsCode.forEach(function(command) {
                            if (command) {
                                prepare.push(command);
                            }
                        });
                    }

                   _scrap.print(["_cat.core.clientmanager.delayManager({" +
                       "commands:[function(", scrapargsstr, ") { ", prepare.join(";"), "}]," +
                       "context:{", args, "}" +
                       "});"].join(""));
                    
                } else {
                    print.call(_scrap, rows, counter);
                }

            }

        };

    }

    var _delayManager = new DelayManager(config);

    return {

        /**
         * Add the commands to the delay manager & print them
         *
         * @param config
         *          - rows {Array} The command rows to be executed
         *          - concat {Boolean} Whether to execute all the commands at once or separately
         *
         * @param process {Function} The command functionality to be evaluated (optional)

         * @param print {Function} Override the delay manager print system (optinal)
         */
        add: function (config, action, print) {
            if (_delayManager) {
                _delayManager.add(config, action);
            }
        },

        /**
         * Dispose the delay manager object
         *
         */
        dispose: function () {
            _delayManager = null;
        }

    };

};