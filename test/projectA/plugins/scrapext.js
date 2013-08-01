// TODO When CAT will go as library change the path
var _Scrap = catrequire("cat.common.scrap"),
    _tplutils = catrequire("cat.tpl.utils");

module.exports = function () {

    var funcSnippetTpl = _tplutils.readTemplateFile("scrap/_func_snippet");

    return {

        init: function () {


            _Scrap.add({name: "code", func: function (config) {
                var codeRows = this.get("code"),
                    code,
                    me = this;

                function _prepare(codeRows) {
                    var row, rowTrimmed, size = (codeRows ? codeRows.length : 0), idx = 0;

                    for (; idx<size; idx++) {
                        row = codeRows[idx];
                        if (row) {
                            rowTrimmed = row.trim();
                            if (rowTrimmed.indexOf(";") !== rowTrimmed.length -1) {
                                codeRows[idx] += ";";
                            }
                        }
                    }
                }

                if (codeRows) {
                    _prepare(codeRows);
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