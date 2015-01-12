var _jsutils = require("js.utils"),
    _utils = catrequire("cat.utils");

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
                    scrapType = (config.type || undefined),
                    counter= 0, rowcounter=0;

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
                        rowcounter=0;
                        
                        // execute the commands separately
                        _commandsCode.forEach(function(command) {
                            if (command) {
                                
                                if (!scrapType) {
                                    _utils.log("warn", "[catjs DelayManagerUtils] Scrap type is not valid, skipping the scrap.print command. Make sure to check your plugins implementation");
                                }
                                
                                _scrap.print({
                                    scrap: {type: scrapType, scrap: _scrap},
                                    line: ["_cat.core.clientmanager.delayManager({" +
                                    "commands:[function(", scrapargsstr, ") { ", command, "}]," +
                                    "context:{", args.concat("scrapRowIdx:" + rowcounter), "}" +
                                    "});"].join("")
                                });
                                rowcounter++;

                            }
                        });
                    }
                
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