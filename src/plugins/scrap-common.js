var _Scrap = catrequire("cat.common.scrap"),
    _tplutils = catrequire("cat.tpl.utils"),
    _utils = catrequire("cat.utils"),
    _uglifyutils = catrequire("cat.uglify.utils"),
    _jshint = require("jshint").JSHINT;


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
             *  name    - sencha
             *  single  - false
             *  singleton - 1[default -1]
             *  $type   - js
             */
            _Scrap.add({name: "sencha",
                single: false,

                func: function (config) {
                    var senchaRows,
                        sencha,
                        me = this,
                        validcode = false;

                    senchaRows = this.get("sencha");

                    if (senchaRows) {
                        _utils.prepareCode(senchaRows);
                        sencha = senchaRows.join("\n");

                        if (sencha) {

                            var str = (sencha).match(/tap\((.*)\);/);
                            if (str) {

                                // split the args, parseInt the args that are numbers
                                str[1] = str[1].replace(/ /g,"");
                                var args = str[1].split(",");
                                var functionArg = "";
                                for (var i = 0; i < args.length; i++) {
                                    if (/^\d+$/.test(args[i])) {
                                        args[i] = parseInt(args[i]);
                                    }
                                    functionArg += args[i] + ",";
                                }

                                functionArg = functionArg.substring(0, functionArg.length - 1);


                                me.print("_extjs.actions.fireTap(" + functionArg + ");");


                            } else {

                                str = (sencha).match(/setText\((.*)\);/);
                                if (str) {

                                    // split the args, parseInt the args that are numbers
                                    str[1] = str[1].replace(/ /g,"");
                                    var args = str[1].split(",");
                                    var functionArg = "";
                                    for (var i = 0; i < args.length; i++) {
                                        if (/^\d+$/.test(args[i])) {
                                            args[i] = parseInt(args[i]);
                                        }
                                        functionArg += args[i] + ",";
                                    }

                                    functionArg = functionArg.substring(0, functionArg.length - 1);

                                    me.print("_extjs.actions.setText(" + functionArg + ");");
                                }
                            }


                        }
                    }
                }
            });





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