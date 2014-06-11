var _Scrap = catrequire("cat.common.scrap"),
    _utils = catrequire("cat.utils"),
    _scraputils = require("./Utils");

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
                        commandsCode = [],
                        tempCommand,
                        generate = function (jqmRow) {

                            var jqm;
                            jqmRow = _utils.prepareCode(jqmRow);

                            if (jqmRow && jqmRow.join) {
                                jqm = jqmRow.join("\n");
                            } else {
                                jqm = jqmRow;
                            }

                            if (jqm) {
                                var match = _scraputils.generate({
                                    api: "scrollTo",
                                    apiname: "scrollTo",
                                    exp: jqm
                                });


                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "scrollToWithRapper",
                                        apiname: "scrollToWithRapper",
                                        exp: jqm
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "tap",
                                        apiname: "tap",
                                        exp: jqm
                                    });
                                }


                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "clickRef",
                                        apiname: "clickRef",
                                        exp: jqm
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "click",
                                        apiname: "click",
                                        exp: jqm
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "clickButton",
                                        apiname: "clickButton",
                                        exp: jqm
                                    });
                                }


                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "setCheck",
                                        apiname: "setCheck",
                                        exp: jqm
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "slide",
                                        apiname: "slide",
                                        exp: jqm
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "setText",
                                        apiname: "setText",
                                        exp: jqm
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "checkRadio",
                                        apiname: "checkRadio",
                                        exp: jqm
                                    });
                                }


                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "scrollTop",
                                        apiname: "scrollTop",
                                        exp: jqm
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "collapsible",
                                        apiname: "collapsible",
                                        exp: jqm
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "selectMenu",
                                        apiname: "selectMenu",
                                        exp: jqm
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "selectTab",
                                        apiname: "selectTab",
                                        exp: jqm
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "swipeItemRight",
                                        apiname: "swipeItemRight",
                                        exp: jqm
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "swipeItemLeft",
                                        apiname: "swipeItemLeft",
                                        exp: jqm
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "swipePageRight",
                                        apiname: "swipePageRight",
                                        exp: jqm
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "swipePageLeft",
                                        apiname: "swipePageLeft",
                                        exp: jqm
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "backClick",
                                        apiname: "backClick",
                                        exp: jqm
                                    });
                                }
                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "searchInListView",
                                        apiname: "searchInListView",
                                        exp: jqm
                                    });
                                }


                                if (match) {

                                    tempCommand = {
                                        "command" : '_cat.core.plugin("jqm").actions.',
                                        "args" : match,
                                        "end" : ""
                                    };

                                    commandsCode.push(JSON.stringify(tempCommand));



                                }

                            }
                        };

                    jqmRows = this.get("jqm");
                    var scrapConf = me.config,
                        scrap = scrapConf,
                        scrapName;


                    if (jqmRows) {
                        scrap = scrapConf;
                        scrapName = (scrap.name ? scrap.name[0] : undefined);

                        if (jqmRows && jqmRows.join) {

                            tempCommand = {
                                "command" : "_cat.core.ui.setContent(",
                                "args" : "{style: 'color:#0080FF', header: '" + scrapName + "', desc: '" + jqmRows + "',tips: ''}",
                                "end" : ");"
                            };
                            commandsCode.push(JSON.stringify(tempCommand));
                        }

                        jqmRows.forEach(function (jqmRow) {
                            if (jqmRow) {
                                generate(jqmRow);
                                me.print("_cat.core.clientmanager.delayManager([" + commandsCode +"]);");
                                commandsCode = [];
                            }
                        });



                    }
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