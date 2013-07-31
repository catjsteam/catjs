
// TODO When CAT will go as library change the path
var _Scrap = require("./../../../src/module/common/plugin/scrap/Scrap.js");

module.exports = function() {

    return {

        init: function() {

             _Scrap.add({name: "code", func: function(config) {
                 console.log(this.print(this.get("code")));
                 console.log(this.generate());
             }});

             _Scrap.add({name: "name", func: function(config) {

             }});

//             var scrap = new _Scrap.clazz({id: "testScrap", code: "console.log(':)');"});
//             scrap.codeApply();
        },

        apply: function() {

        },

        getType: function() {
            return "scrapext";
        }
    }

}