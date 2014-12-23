var _Scrap = catrequire("cat.common.scrap"),
    _utils = catrequire("cat.utils"),
    _scraputils = require("./utils/Utils");

module.exports = function () {

    var _specs = {};
    
    function _addSpec(config) {
        var key = (config.name),
            data = config.data;
        
        function _get(key, itemKey) {
            return (_specs[key] && _specs[key][itemKey] ? _specs[key][itemKey] : undefined);
        }
        
        function _getLast(key, itemKey) {
            return (_specs[key] && _specs[key][itemKey] ? _specs[key][itemKey][_specs[key][itemKey].length-1] : undefined);
        }
        
        if (!_specs[key]) {
            _specs[key] = {
            }
        }
        data.forEach(function(item) {
            if (item) {
                if (!_specs[key][item.key]) {
                    _specs[key][item.key] = [];
                }
                _specs[key][item.key].push(item.value); 
            }
        });

    }
    
    return {

        init: function (config) {

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
                singleton: 1,
                func: function (config) {

                    var describeRow,
                        me = this,
                        scrapConf = me.config,
                        scrap = scrapConf,
                        dm;

                    describeRow = this.get("describe");
                    if (describeRow) {
                        _addSpec({
                            name: me.get("name"),
                            data: [
                                {
                                    key: "describe",
                                    value: describeRow
                                }
                            ]
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
                single: true,

                func: function (config) {

                    var itRow,
                        me = this,
                        scrapConf = me.config,
                        scrap = scrapConf,
                        dm;

                    itRow = this.get("it");
                    if (itRow) {
                        _addSpec({
                            name: me.get("name"),
                            data: [
                                {
                                    key: "it",
                                    value: itRow
                                }
                            ]
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