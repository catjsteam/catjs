var _Scrap = catrequire("cat.common.scrap"),
    _utils = catrequire("cat.utils"),
    _scraputils = require("./Utils");

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
                        validcode = false;

                    senchaRows = this.get("sencha");

                    if (senchaRows) {
                        _utils.prepareCode(senchaRows);
                        sencha = senchaRows.join("\n");


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

                            if (match) {
                                me.print("_cat.core.plugin('sencha').actions."+ match);
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
            return "scrap-sencha";
        }
    }

};