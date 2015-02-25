var _Scrap = catrequire("cat.common.scrap"),
    _codeutils = catrequire("cat.code.utils"),
    _scraputils = require("./utils/Utils"),
    _delayManagerUtils =  require("./utils/DelayManagerUtils");

module.exports = function () {

    return {

        init: function (config) {

            /**
             * Annotation for jqm library
             *
             *  properties:
             *  name    - jqm
             *  single  - false
             *  singleton - 1[default -1]
             *  $type   - js
             */
            _Scrap.add({name: "dom",
                single: false,

                func: function (config) {
                    var domRows,
                        dom,
                        me = this,
                        dm,
                        tempCommand,
                        generate = function (domRow) {

                            var dom, api, match;

                            domRow = _codeutils.prepareCode(domRow);

                            if (domRow && domRow.join) {
                                dom = domRow.join("\n");

                            } else {
                                dom = domRow;
                            }

                            if (dom) {

                                api = [
                                    {
                                        api: "listen"
                                    },
                                    {
                                        api: "fire"
                                    },
                                    {
                                        api: "snapshot"
                                    }
                                ];

                                match = _scraputils.match(dom, api);
                                if (match) {

                                    tempCommand = [
                                        '_cat.core.plugin("dom").actions.',
                                        match
                                    ];

                                    return tempCommand.join("");
                                }

                            }

                            return undefined;
                        };

                    domRows = this.get("dom");

                    dm = new _delayManagerUtils({
                        scrap: me
                    });

                    if (domRows) {

                        dm.add({
                            rows:domRows,
                            args: [
                                "scrapName: 'dom'"
                            ],
                            type: "dom"

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
            return "scrap-dom";
        }
    };

};