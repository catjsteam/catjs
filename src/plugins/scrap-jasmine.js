var _Scrap = catrequire("cat.common.scrap"),
    _utils = catrequire("cat.utils"),
    _scraputils = require("./utils/Utils"),
    _Jasmine = require("./jasmine/Jasmine.js");

module.exports = function () {

    return {

        init: function (config) {

            /*
                scrap entity
                "inject" process will evaluate all of the entities
                a user printer defined
            */
            var _jasmine = _Scrap.entity({
                name: "jasmine", 
                fn: _Jasmine,
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
                single: true,
                singleton: -1,
                func: function (config) {

                    var describeRow,
                        me = this,
                        scrapConf = me.config,
                        scrap = scrapConf,
                        dm;

                    me.set("auto", false);
                    describeRow = this.get("describe");
                    if (describeRow) {

                        _jasmine.add({
                            name: "describe",
                            scrapname: me.get("name"),
                            data: describeRow
                        });
                        
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
                singleton: 1,
                func: function (config) {

                    var itRow,
                        me = this,
                        scrapConf = me.config;

                    itRow = this.get("it");
                    if (itRow) {

                        _jasmine.add({
                            name: "it",
                            scrapname: me.get("name"),
                            data: itRow
                        });
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