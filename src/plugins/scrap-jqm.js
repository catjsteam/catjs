var _Scrap = catrequire("cat.common.scrap"),
    _utils = catrequire("cat.utils"),
    _scraputils = require("./Utils");

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
                        jqm,
                        me = this,
                        validcode = false;

                    jqmRows = this.get("jqm");

                    if (jqmRows) {
                        _utils.prepareCode(jqmRows);
                        jqm = jqmRows.join("\n");


                        if (jqm) {

                            var match = _scraputils.generate({
                                api: "scrollTo",
                                apiname: "scrollTo",
                                exp: jqm
                            });

                            if (!match) {
                                match = _scraputils.generate({
                                    api: "clickRef",
                                    apiname: "clickRef",
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



                            if (match) {
                                me.print("_cat.core.plugin('jqm').actions."+ match);
                            }

                        }
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
    }

};