var _Scrap = catrequire("cat.common.scrap"),
    _tplutils = catrequire("cat.tpl.utils"),
    _utils = catrequire("cat.utils");

module.exports = function () {

    var funcSnippetTpl = _tplutils.readTemplateFile("scrap/_func_snippet"),
        importJSTpl = _tplutils.readTemplateFile("scrap/_import_js");

    return {

        init: function () {


            /**
             * Annotation for javascript code
             *
             *  properties:
             *  name    - code
             *  single  - false
             *  singleton - 1[default -1]
             *  $type   - js
             */
            _Scrap.add({name: "context",
                single: false,
                singleton: 1,
                func: function (config) {
                    var ctx,
                        me = this;

                    ctx = this.get("context");

                    if (ctx) {
                        me.setCtxArguments(ctx);
                    }
            }});

            /**
             * Annotation for javascript code
             *
             *  properties:
             *  name    - code
             *  single  - false
             *  $type   - js
             */
            _Scrap.add({name: "code",
                single: false,
                func: function (config) {

                    var codeRows,
                        code,
                        me = this;

                    codeRows = this.get("code");

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

            /**
             * Annotation for importing javascript file within HTML page
             *
             *  properties:
             *  name    - import
             *  single  - true
             *  $type   - html
             */
            _Scrap.add({name: "import",
                func: function (config) {
                    var importanno = this.get("import"),
                        me = this;

                    me.$setType("html");
                    if (importanno) {
                        me.print(_tplutils.template({
                            content: importJSTpl,
                            data: {
                                src:importanno
                            }
                        }));
                    }
            }});

            /**
             * Annotation for embed javascript block code within HTML page
             *
             *  properties:
             *  name    - embed
             *  single  - false
             *  $type   - html
             */
            _Scrap.add({name: "embed", func: function (config) {
                this.$setType("html");
            }});

        },

        apply: function () {

        },

        getType: function () {
            return "scrap-common";
        }
    }

}