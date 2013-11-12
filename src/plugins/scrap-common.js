var _Scrap = catrequire("cat.common.scrap"),
    _tplutils = catrequire("cat.tpl.utils"),
    _utils = catrequire("cat.utils"),
    _uglifyutils = catrequire("cat.uglify.utils"),
    _jshint = require("jshint").JSHINT,
    _scraputils = catrequire("cat.scrap.utils");


module.exports = function () {

    var funcSnippetTpl = _tplutils.readTemplateFile("scrap/_func_snippet"),
        assertCallTpl = _tplutils.readTemplateFile("scrap/_assert_call"),
        importJSTpl = _tplutils.readTemplateFile("scrap/_import_js");

    return {

        init: function (config) {

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
             *  name    - screenshot
             *  single  - false
             *  singleton - 1[default -1]
             *  $type   - js
             */
            _Scrap.add({name: "screenshot",
                single: false,
                singleton: 1,
                func: function (config) {
                    var me = this;


                    me.print("app.getScreenshot();");

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
                        me = this,
                        validcode = false;

                    codeRows = this.get("code");

                    if (codeRows) {
                        _utils.prepareCode(codeRows);
                        code = codeRows.join("\n");

                        if (code) {

                            /*  TODO make code validation
                                TODO Move that snippet to the end of the generated code (source project)
                                validcode = _jshint(code, {
                                    "strict": false,
                                    "curly": true,
                                    "eqeqeq": true,
                                    "immed": false,
                                    "latedef": true,
                                    "newcap": false,
                                    "noarg": true,
                                    "sub": true,
                                    "undef": true,
                                    "boss": true,
                                    "eqnull": true,
                                    "node": true,
                                    "es5": false
                                },
                                { assert:true });*/

                            //if (validcode) {
                                me.print(_tplutils.template({
                                    content: funcSnippetTpl,
                                    data: {
                                        comment: " Generated code according to the scrap comment (see @@code)",
                                        code: code
                                    }
                                }));
                            //} else {
                            //    console.log("The code is not valid: ", _jshint.errors);
                            //}
                        }
                    }
                }});

            /**
             * Annotation for javascript run@
             *
             *  properties:
             *  name    - run@
             *  runat  - true
             *  singleton - 1[default -1]
             *  $type   - js
             */
            _Scrap.add({name: "run@",
                func: function (config) {

                }});

            /**
             * Annotation for javascript manager
             *
             *  properties:
             *  name    - manager
             *  single  - false
             *  singleton - 1[default -1]
             *  $type   - js
             */
            _Scrap.add({name: "manager",
                single: false,
                singleton: 1,
                func: function (config) {

                    var me = this,
                        manager,
                        runat = me.get("name");

                    manager = me.get("manager");
                    if (manager) {
                        me.print(_tplutils.template({
                            content: funcSnippetTpl,
                            data: {
                                comment: " Manager call ",
                                code: "(function() {_cat.core.managerCall('" + runat + "'); })();"
                            }
                        }));
                    }


                }});

            /**
             * Annotation for javascript manager's scraps attributes
             *
             *  properties:
             *  name    - code
             *  single  - false
             *  $type   - js
             */
            _Scrap.add({name: "perform",
                single: false,
                func: function (config) {

                    var scrapsRows,
                        me = this,
                        scrapItemName, scrapItemValue,
                        scrapItem,
                        runat = me.get("name");

                    scrapsRows = me.get("perform");
                    if (scrapsRows) {

                        scrapsRows.forEach(function(item){
                            if (item) {
                                scrapItem = _scraputils.extractSingle(item);
                                if (scrapItem) {
                                    scrapItemName = scrapItem.key;
                                    scrapItemValue = scrapItem.value;

                                    me.print(_tplutils.template({
                                        content: funcSnippetTpl,
                                        data: {
                                            comment: " Add Manager behavior ",
                                            code: "_cat.core.setManagerBehavior('" + runat + "', '"+ scrapItemName +"', '" + scrapItemValue+ "');"
                                        }
                                    }));
                                }

                            }
                        });

                    }
                }});


            /**
             * Annotation for chai
             *
             *  properties:
             *  name    - chai
             *  single  - false
             *  $type   - js
             */
            _Scrap.add({name: "assert",
                single: false,
                func: function (config) {

                    var codeRows,
                        me = this,
                        codeSnippet,
                        codeSnippetObject;

                    codeRows = this.get("assert");

                    if (codeRows) {
                        codeSnippet = codeRows[0];
                        if (codeSnippet) {
                            try {
                                // try to understand the code
                                codeSnippetObject = _uglifyutils.getCodeSnippet({code: codeSnippet});

                            } catch (e) {
                                // TODO use uglifyjs to see if there was any error in the code.
                                // TODO throw a proper error
                            }
                        }

                        me.print(_tplutils.template({
                            content: assertCallTpl,
                            data: {
                                expression: JSON.stringify(["assert", codeSnippetObject].join(".")),
                                fail: true
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
                                src: importanno
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

            /**
             * Annotation for embed javascript block code within HTML page
             *
             *  properties:
             *  name    - inject
             *  single  - true
             *  $type   - html
             */
            _Scrap.add({name: "inject", func: function (config) {
                var injectanno = this.get("inject");

                this.setSingle("inject", true);
                this.$setType("*");

                this.print(injectanno);
            }});

            config.emitter.emit("job.done", {status: "done"});

        },

        apply: function () {

        },

        getType: function () {
            return "scrap-common";
        }
    }

};