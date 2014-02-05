var _Scrap = catrequire("cat.common.scrap"),
    _utils = catrequire("cat.utils");

module.exports = function () {

    return {

        init: function () {


            // init scrap plugin code in here


            /**
             * Sample for custom annotation
             *
             *  properties:
             *  name    - sample
             *  single  - false
             *  singleton - 1[default -1]
             *  $type   - js
             */
            _Scrap.add({name: "sample",
                single: false,
                singleton: 1,
                func: function (config) {
                    var sample,
                        me = this;

                    sample = this.get("sample");
                    me.print("console.log('CAT... Custom annotation sample sample:', '" + sample + "');");
                }});

        },

        apply: function () {
            // apply scrap plugin code in here

        },

        getType: function () {
            return "custom-plugin";
        }
    };

};