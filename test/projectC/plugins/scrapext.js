// TODO When CAT will go as library change the path
var _Scrap = catrequire("cat.common.scrap"),
    _tplutils = catrequire("cat.tpl.utils"),
    _utils = catrequire("cat.utils");

module.exports = function () {

    var funcSnippetTpl = _tplutils.readTemplateFile("scrap/_func_snippet"),
        importJSTpl = _tplutils.readTemplateFile("scrap/_import_js");

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

            _Scrap.add({name: "import", func: function (config) {
                var importRows = this.get("import"),
                    item,
                    me = this;

                me.$setType("html");
                if (importRows) {
                    item = importRows.join("\n");
                    me.print(_tplutils.template({
                        content: importJSTpl,
                        data: {
                            src:item
                        }
                    }));
                }
            }});

            _Scrap.add({name: "embed", func: function (config) {
                this.$setType("html");
            }});

        },

        apply: function () {

        },

        getType: function () {
            return "scrapext";
        }
    }

}