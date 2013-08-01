// TODO When CAT will go as library change the path
var _Scrap = catrequire("cat.common.scrap"),
    _tplutils = catrequire("cat.tpl.utils"),
    _utils = catrequire("cat.utils");

module.exports = function () {

    var funcSnippetTpl = _tplutils.readTemplateFile("scrap/_func_snippet");

    return {

        init: function () {


            _Scrap.add({name: "code", func: function (config) {
                var codeRows = this.get("code"),
                    code,
                    me = this;

                if (codeRows) {
                    _utils.prepareCode(codeRows);
                    code = codeRows.join("\n");
                    me.print(_tplutils.template({
                        content: funcSnippetTpl,
                        data: {
                            comment:" Generated code according to the scrap comment (see @@code)",
                            code:code
                        }
                    }));
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