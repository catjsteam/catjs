var _Scrap = catrequire("cat.common.scrap"),
    _codeutils = catrequire("cat.code.utils"),
    _scraputils = require("./utils/Utils"),
    _delayManagerUtils = require("./utils/DelayManagerUtils");

module.exports = function () {

    return {

        init: function (config) {

            /**
             * Annotation for sencha library
             *
             *  properties:
             *  name    - sencha
             *  single  - false
             *  singleton - 1[default -1]
             *  $type   - js
             */
            _Scrap.add({name: "sencha",
                single: false,

                func: function (config) {
                    var senchaRows,
                        sencha,
                        me = this,
                        scrapConf = me.config,
                        scrap = scrapConf,
                        dm,
                        
                        generate = function (senchaRow) {

                            var sencha,
                                tempCommand,
                                api, match;
                            
                            
                            senchaRow = _codeutils.prepareCode(senchaRow);

                            if (senchaRow && senchaRow.join) {
                                sencha = senchaRow.join("\n");
                            } else {
                                sencha = senchaRow;
                            }

                            if (sencha) {

                                api = [
                                    {
                                        api: "tap",
                                        apiname: "fireTap"
                                    },
                                    {
                                        api: "setText",
                                        apiname: "setText"
                                    },
                                    {
                                        api: "tapButton",
                                        apiname: "tapButton"
                                    },
                                    {
                                        api: "setTextValue",
                                        apiname: "setTextValue"
                                    },
                                    {
                                        api: "setChecked",
                                        apiname: "setChecked"
                                    },
                                    {
                                        api: "setUnchecked",
                                        apiname: "setUnchecked"
                                    },
                                    {
                                        api: "setDate",
                                        apiname: "setDate"
                                    },
                                    {
                                        api: "setSliderValue",
                                        apiname: "setSliderValue"
                                    },
                                    {
                                        api: "setSliderValues",
                                        apiname: "setSliderValues"
                                    },
                                    {
                                        api: "setToggle",
                                        apiname: "setToggle"
                                    },
                                    {
                                        api: "scrollBy",
                                        apiname: "scrollBy"
                                    },
                                    {
                                        api: "scrollToTop",
                                        apiname: "scrollToTop"
                                    },
                                    {
                                        api: "carouselNext",
                                        apiname: "carouselNext"
                                    },
                                    {
                                        api: "carouselPrevious",
                                        apiname: "carouselPrevious"
                                    },
                                    {
                                        api: "scrollToEnd",
                                        apiname: "scrollToEnd"
                                    },
                                    {
                                        api: "scrollToListIndex",
                                        apiname: "scrollToListIndex"
                                    },
                                    {
                                        api: "listSelectIndex",
                                        apiname: "listSelectIndex"
                                    },
                                    {
                                        api: "changeTab",
                                        apiname: "changeTab"
                                    },
                                    {
                                        api: "nestedlistSelect",
                                        apiname: "nestedlistSelect"
                                    },
                                    {
                                        api: "removePanel",
                                        apiname: "removePanel"
                                    },
                                    {
                                        api: "nestedlistBack",
                                        apiname: "nestedlistBack"
                                    }
                                ];

                                match = _scraputils.match(sencha, api);
                                if (match) {

                                    tempCommand = [
                                        '_cat.core.plugin("sencha").actions.',
                                        match
                                    ];

                                    return tempCommand.join("");
                                }

                            }
                        };


                    senchaRows = this.get("sencha");
                
                    if (senchaRows) {
                        scrap = scrapConf;

                        dm = new _delayManagerUtils({
                            scrap: me
                        });

                        if (senchaRows) {

                            dm.add({
                                rows:senchaRows,
                                args: [
                                    "scrapName: 'sencha'"
                                ],
                                type: "sencha"

                            }, function(row) {
                                return generate(row);
                            });
                        }

                        dm.dispose();
                    }
                }
            });

            config.emitter.emit("job.done", {status: "done"});

        },

        apply: function () {

        },

        getType: function () {
            return "scrap-sencha";
        }
    };

};