var _Scrap = catrequire("cat.common.scrap"),
    _utils = catrequire("cat.utils"),
    _scraputils = require("./Utils");

module.exports = function () {

    return {

        init: function (config) {

            /**
             * Annotation for enyo library
             *
             *  properties:
             *  name    - enyo
             *  single  - false
             *  singleton - 1[default -1]
             *  $type   - js
             */
            _Scrap.add({name: "enyo",
                single: false,

                func: function (config) {
                    var enyoRows,
                        enyo,
                        me = this,
                        validcode = false;

                    enyoRows = this.get("enyo");

                    if (enyoRows) {
                        _utils.prepareCode(enyoRows);
                        enyo = enyoRows.join("\n");

                        if (enyo) {

                            var match,
                                prefix;

                            var match = _scraputils.generate({
                                api: "waterfall",
                                exp: enyo
                            });

                            if (!match) {
                                match = _scraputils.generate({
                                    api: "next",
                                    exp: enyo
                                });
                            }

                            if (!match) {
                                match = _scraputils.generate({
                                    api: "tap",
                                    exp: enyo
                                });
                            }

                            if (match) {
                                me.print("_cat.core.plugin('enyo').actions."+ match);
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
            return "scrap-enyo";
        }
    }

};