// TODO When CAT will go as library change the path
var _Scrap = require("./../../../src/module/common/plugin/scrap/Scrap.js"),
    _utils = catrequire("cat.utils");

module.exports = function () {

    var funcSnippetTpl = _utils.readTemplateFile("_func", "scrap");

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