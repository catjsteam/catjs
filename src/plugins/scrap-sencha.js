var _Scrap = catrequire("cat.common.scrap"),
    _utils = catrequire("cat.utils"),
    _scraputils = require("./utils/Utils");

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
                        generate = function (senchaRow) {

                            var sencha;
                            senchaRow = _utils.prepareCode(senchaRow);

                            if (senchaRow && senchaRow.join) {
                                sencha = senchaRow.join("\n");
                            } else {
                                sencha = senchaRow;
                            }


                            if (sencha) {

                                var match = _scraputils.generate({
                                    api: "tap",
                                    apiname: "fireTap",
                                    exp: sencha
                                });

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "setText",
                                        exp: sencha
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "tapButton",
                                        apiname: "tapButton",
                                        exp: sencha
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "setTextValue",
                                        apiname: "setTextValue",
                                        exp: sencha
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "setChecked",
                                        apiname: "setChecked",
                                        exp: sencha
                                    });
                                }


                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "setUnchecked",
                                        apiname: "setUnchecked",
                                        exp: sencha
                                    });
                                }


                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "setDate",
                                        apiname: "setDate",
                                        exp: sencha
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "setSliderValue",
                                        apiname: "setSliderValue",
                                        exp: sencha
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "setSliderValues",
                                        apiname: "setSliderValues",
                                        exp: sencha
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "setToggle",
                                        apiname: "setToggle",
                                        exp: sencha
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "scrollBy",
                                        apiname: "scrollBy",
                                        exp: sencha
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "scrollToTop",
                                        apiname: "scrollToTop",
                                        exp: sencha
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "carouselNext",
                                        apiname: "carouselNext",
                                        exp: sencha
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "carouselPrevious",
                                        apiname: "carouselPrevious",
                                        exp: sencha
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "scrollToEnd",
                                        apiname: "scrollToEnd",
                                        exp: sencha
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "scrollToListIndex",
                                        apiname: "scrollToListIndex",
                                        exp: sencha
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "listSelectIndex",
                                        apiname: "listSelectIndex",
                                        exp: sencha
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "changeTab",
                                        apiname: "changeTab",
                                        exp: sencha
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "nestedlistSelect",
                                        apiname: "nestedlistSelect",
                                        exp: sencha
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "removePanel",
                                        apiname: "removePanel",
                                        exp: sencha
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "nestedlistBack",
                                        apiname: "nestedlistBack",
                                        exp: sencha
                                    });
                                }

                                if (match) {
                                    me.print("_cat.core.plugin('sencha').actions." + match);
                                }

                            }
                        };


                    senchaRows = this.get("sencha");
                    var scrapConf = me.config,
                        scrap = scrapConf,
                        scrapName;

                    if (senchaRows) {
                        scrap = scrapConf;
                        scrapName = (scrap.name ? scrap.name[0] : undefined);

                        if (senchaRows && senchaRows.join) {
                            me.print("_cat.core.ui.setContent({style: 'color:#0080FF', header: '" + scrapName + "', desc: '" + (senchaRows.split ? senchaRows.split("\n").join("") : senchaRows) + "',tips: ''});");
                        }

                        senchaRows.forEach(function (senchaRow) {
                            if (senchaRow) {
                                generate(senchaRow);
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
            return "scrap-sencha";
        }
    };

};