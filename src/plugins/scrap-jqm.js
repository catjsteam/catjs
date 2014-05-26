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
                        generate = function (jqmRow) {

                            var jqm;
                            jqmRow = _utils.prepareCode(jqmRow);

                            if (jqmRow && jqmRow.join) {
                                jqm = jqmRow.join("\n");
                            } else {
                                jqm = jqmRow;
                            }

                            if (jqm) {
                                var commandCode,
                                match = _scraputils.generate({
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
                                    commandCode = '_cat.core.plugin("jqm").actions.' + match;
                                   // me.print("_cat.core.plugin('jqm').actions." + match);
//                                    me.print("_cat.core.clientmanager.delayManager(" + commandCode + ")")
                                    me.print("_cat.core.clientmanager.delayManager('" + commandCode +"');");

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
                            me.print("_cat.core.ui.setContent({style: 'color:#0080FF', header: '" + scrapName + "', desc: '" + jqmRows + "',tips: ''});");
                        }

                        jqmRows.forEach(function (jqmRow) {
                            if (jqmRow) {
                                generate(jqmRow);
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