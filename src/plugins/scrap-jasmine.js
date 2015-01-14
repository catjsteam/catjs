var _JasmineCollector = catrequire("cat.entity.jasmine"),
    _Entity = catrequire("cat.entity"),
    _jasmine,
    _Scrap = catrequire("cat.common.scrap"),
    _utils = catrequire("cat.utils"),
    _scraputils = require("./utils/Utils");

module.exports = function () {

    return {

        init: function (config) {

            _jasmine = _Entity.entity({
                name: "jasmine",
                fn: _JasmineCollector,
                printer: "user"
            });

            /**
             * Annotation for Jasmine describe
             *
             *  properties:
             *  name    - describe
             *  single  - true
             *  singleton - 1[default -1]
             *  $type   - js
             */
            _Scrap.add({name: "describe",
                single: false,
                singleton: -1,
                func: function (config) {

                    // exclude from auto test
                    this.set("auto", false);
                    
                    var describeRow,
                        me = this,
                        scrap = me.config;
                    
                    describeRow = this.get("describe");
                    if (describeRow) {
                        me.jasminePrint({scrap: {scrap: scrap, type: "describe"}, line: describeRow});
                    }

                }
            });

            /**
             * Annotation for Jasmine describe
             *
             *  properties:
             *  name    - describe
             *  single  - true
             *  singleton - 1[default -1]
             *  $type   - js
             */
            _Scrap.add({name: "it",
                single: false,
                singleton: -1,
                func: function (config) {

                    // exclude from auto test
                    this.set("auto", false);
                    
                    var itRow,
                        me = this,
                        scrap = me.config;
                    
                    itRow = this.get("it");
                    if (itRow) {

                        me.jasminePrint({scrap: {scrap: scrap, type: "it"}, line: itRow});
                    }

                }
            });

            config.emitter.emit("job.done", {status: "done"});

        },

        apply: function () {

        },

        getType: function () {
            return "scrap-jasmine";
        }
    };

};