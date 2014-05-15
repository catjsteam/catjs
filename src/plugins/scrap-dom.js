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
            _Scrap.add({name: "dom",
                single: false,

                func: function (config) {
                    var domRows,
                        dom,
                        me = this,
                        validcode = false;

                    domRows = this.get("dom");
                    var scrapConf = me.config;

                    if (domRows) {
                        domRows = _utils.prepareCode(domRows);
                        dom = domRows.join("\n");
                        var scrap = scrapConf,
                            scrapName = (scrap.name ? scrap.name[0] : undefined);

                        if (dom) {

                            var match = _scraputils.generate({
                                api: "listen",
                                apiname: "listen",
                                exp: dom
                            });

                            match = _scraputils.generate({
                                api: "listen",
                                apiname: "listen",
                                exp: dom
                            });

                            if (match) {
                                me.print("_cat.core.plugin('dom').actions."+ match);
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
            return "scrap-dom";
        }
    };

};