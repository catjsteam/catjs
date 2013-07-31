// TODO When CAT will go as library change the path
var _Scrap = require("./../../../src/module/common/plugin/scrap/Scrap.js");

module.exports = function () {

    return {

        init: function () {

            _Scrap.add({name: "code", func: function (config) {
                var code = this.get("code"),
                    me = this;

                if (code) {
                    code.forEach(function() {
                        me.print(code);
                    });
                }
            }});

        },

        apply: function () {

        },

        getType: function () {
            return "scrapext";
        }
    }

}