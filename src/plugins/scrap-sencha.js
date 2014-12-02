var _Scrap = catrequire("cat.common.scrap"),
    _utils = catrequire("cat.utils"),
    _scraputils = require("./utils/Utils"),
    _delayManagerUtils = require("./utils/DelayManagerUtils"),
    _elutils = require("./utils/ExpressionUtils");

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
                                tempCommand;
                            
                            
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
                            scrap = scrapConf;

                            if (senchaRows && senchaRows.join) {

                                senchaRows.add(_elutils.uicontent({ rows: senchaRows, scrap: scrap}));
                            }

                            dm.add({
                                rows:senchaRows

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