var _Scrap = catrequire("cat.common.scrap"),
    _codeutils = catrequire("cat.code.utils"),
    _scraputils = require("./utils/Utils"),
    _delayManagerUtils = require("./utils/DelayManagerUtils");

var tipNum = 1;
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
            _Scrap.add({name: "jqm",
                single: false,

                func: function (config) {

                    var jqmRows,
                        me = this,
                        tempCommand,

                        generate = function (jqmRow) {

                            var jqm, api, match;

                            jqmRow = _codeutils.prepareCode(jqmRow);

                            if (jqmRow && jqmRow.join) {
                                jqm = jqmRow.join("\n");
                            } else {
                                jqm = jqmRow;
                            }

                            if (jqm) {

                                api = [
                                    {
                                        api: "trigger",
                                        apiname: "trigger"
                                    },
                                    {
                                        api: "scrollTo",
                                        apiname: "scrollTo"
                                    },
                                    {
                                        api: "scrollToWithRapper",
                                        apiname: "scrollToWithRapper"
                                    },
                                    {
                                        api: "tap",
                                        apiname: "tap"
                                    },
                                    {
                                        api: "clickRef",
                                        apiname: "clickRef"
                                    },
                                    {
                                        api: "click",
                                        apiname: "click"
                                    },
                                    {
                                        api: "clickButton",
                                        apiname: "clickButton"
                                    },
                                    {
                                        api: "setCheck",
                                        apiname: "setCheck"
                                    },
                                    {
                                        api: "slide",
                                        apiname: "slide"
                                    },
                                    {
                                        api: "setText",
                                        apiname: "setText"
                                    },
                                    {
                                        api: "checkRadio",
                                        apiname: "checkRadio"
                                    },
                                    {
                                        api: "scrollTop",
                                        apiname: "scrollTop"
                                    },
                                    {
                                        api: "collapsible",
                                        apiname: "collapsible"
                                    },
                                    {
                                        api: "selectMenu",
                                        apiname: "selectMenu"
                                    },
                                    {
                                        api: "selectTab",
                                        apiname: "selectTab"
                                    },
                                    {
                                        api: "swipeItemRight",
                                        apiname: "swipeItemRight"
                                    },
                                    {
                                        api: "swipeItemLeft",
                                        apiname: "swipeItemLeft"
                                    },
                                    {
                                        api: "swipePageRight",
                                        apiname: "swipePageRight"
                                    },
                                    {
                                        api: "swipePageLeft",
                                        apiname: "swipePageLeft"
                                    },
                                    {
                                        api: "backClick",
                                        apiname: "backClick"
                                    },
                                    {
                                        api: "searchInListView",
                                        apiname: "searchInListView"
                                    }
                                ];

                                match = _scraputils.match(jqm, api);
                                
                                if (match) {

                                    tempCommand = [
                                        '_cat.core.plugin("jqm").actions.',
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

                    jqmRows = this.get("jqm");

                    dm = new _delayManagerUtils({
                        scrap: me
                    });

                    if (jqmRows) {

                        dm.add({
                            rows: jqmRows,
                            args: [
                                "scrapName: 'jqm'"
                            ],
                            type: "jqm"

                        }, function (row) {
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
            return "scrap-jqm";
        }
    };

};