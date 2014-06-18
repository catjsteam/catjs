module.exports = function (config) {

    function DelayManager(config) {

        var _commandsCode = [],
            _config = config;

        return {

            add: function(config, process, print) {

                var rows = config.rows, scrap = _config.scrap,
                    scrapconfig = scrap.config, counter,
                    args = (config.args || []);

                //args =  JSON.parse(JSON.stringify(args));

                rows.forEach(function (row) {

                    if (row) {
                        _commandsCode.push((process ? process.call(scrap, row) : row));

                        if (scrapconfig.numCommands) {
                            scrapconfig.numCommands += _commandsCode.length;
                        } else {
                            scrapconfig.numCommands = _commandsCode.length;
                        }

                       // { code:JSON.stringify(["assert", codeSnippetObject].join(".")), fail:true, scrap:_cat.core.getVar(pkgName).scrap, args:_args }

                        args.push("'scrap' : _cat.core.getVar(pkgName).scrap");
                        args.push("'args'  : _args");

                        if (!print) {
                            scrap.print(["_cat.core.clientmanager.delayManager([", JSON.stringify(_commandsCode), "], {",
                                    args.join(","),
                                "});"].join(""));
                        } else {
                            print.call(scrap, rows, counter);
                        }

                    }

                    counter++;
                });

            }

        };

    }

    var _delayManager = new DelayManager(config);

    return {

        add: function (config, action, print) {
            if (_delayManager) {
                _delayManager.add(config, action);
            }
        },

        dispose: function () {
            _delayManager = null;
        }

    };

};