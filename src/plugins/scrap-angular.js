var _Scrap = catrequire("cat.common.scrap"),
    _codeutils = catrequire("cat.code.utils"),
    _scraputils = require("./utils/Utils"),
    _delayManagerUtils =  require("./utils/DelayManagerUtils");

var tipNum = 1;
module.exports = function () {

    return {

        init: function (config) {

            /**
             * Annotation for jquery library
             *
             *  properties:
             *  name    - jquery
             *  single  - false
             *  singleton - 1[default -1]
             *  $type   - js
             */
            _Scrap.add({name: "angular",
                single: false,

                func: function (config) {

                    var angularRows,
                        me = this,
                        tempCommand,

                        generate = function (angularRow) {

                            var angularItem, api, match;

                            angularRow = _codeutils.prepareCode(angularRow);

                            if (angularRow && angularRow.join) {
                                angularItem = angularRow.join("\n");

                            } else {
                                angularItem = angularRow;
                            }

                            if (angularItem) {

                                api = [
                                    {
                                        api: "trigger"
                                    },
                                    {
                                        api: "setText"
                                    },
                                    {
                                        api: "require"
                                    }
                                ];

                                match = _scraputils.match(angularItem, api);
                                if (match) {

                                    tempCommand = [
                                        '_cat.core.plugin("angular").actions.',
                                        match
                                    ];

                                    return tempCommand.join("");
                                }

                            }

                            return undefined;
                        },
                        scrapConf = me.config,
                        scrap = scrapConf,
                        dm;

                    angularRows = this.get("angular");

                    dm = new _delayManagerUtils({
                        scrap: me
                    });

                    if (angularRows) {

                        dm.add({
                            rows:angularRows,
                            args: [
                                "scrapName: 'angular'"
                            ],
                            type: "angular"

                        }, function(row) {
                            return generate(row);
                        });
                    }

                    dm.dispose();
                
                }
                
            });

            config.emitter.emit("job.done", {status: "done"});

        },

        apply: function () {

        },

        getType: function () {
            return "scrap-angular";
        }
    };

};