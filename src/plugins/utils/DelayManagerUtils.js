module.exports = function (config) {

    function DelayManager(config) {

        var _commandsCode = [],
            _config = config;

        return {

            add: function(config, process, print) {

                var rows = config.rows, scrap = _config.scrap,
                    scrapconfig = scrap.config, counter;

                rows.forEach(function (row) {

                    if (row) {
                        _commandsCode.push(process.call(scrap, row));

                        if (scrapconfig.numCommands) {
                            scrapconfig.numCommands += _commandsCode.length;
                        } else {
                            scrapconfig.numCommands = _commandsCode.length;
                        }

                        if (!print) {
                            scrap.print("_cat.core.clientmanager.delayManager([" + _commandsCode +"], {'scrap' : " + JSON.stringify({"config" : scrap}) + "});");
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