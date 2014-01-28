var _Scrap = catrequire("cat.common.scrap"),
    _tplutils = catrequire("cat.tpl.utils"),
    _utils = catrequire("cat.utils"),
    _uglifyutils = catrequire("cat.uglify.utils"),
    _typedas = require("typedas"),
    _behavior = require("./Behavior.js"),
    _jshint = require("jshint").JSHINT,
    _scraputils = catrequire("cat.scrap.utils"),
    _path = require("path"),
    _global = catrequire("cat.global"),
    _log = _global.log();


module.exports = function () {

    var funcSnippetTpl = _tplutils.readTemplateFile("scrap/_func_snippet"),
        assertCallTpl = _tplutils.readTemplateFile("scrap/_assert_call"),
        importJSTpl = _tplutils.readTemplateFile("scrap/_import_js"),
        importCSSTpl = _tplutils.readTemplateFile("scrap/_import_css");

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
             * Annotation for javascript catui
             *
             *  properties:
             *  name    - catui
             *  singleton - 1[default -1]
             *  $type   - js
             */
            _Scrap.add({name: "catui",
                func: function (config) {

                    var me = this,
                        catui = me.get("catui");

                    if (catui) {
                        me.print(_tplutils.template({
                            content: funcSnippetTpl,
                            data: {
                                comment: " CAT UI call ",
                                code: ["_cat.core.ui.", catui, "();"].join("")
                            }
                        }));
                    }
                }});

            /**
             * Annotation for javascript signal
             *
             *  properties:
             *  name    - signal
             *  singleton - 1[default -1]
             *  $type   - js
             */
            _Scrap.add({name: "signal",
                func: function (config) {

                    var me = this,
                        signal = me.get("signal");


                    // TODO need to be refactored (see manager)
                    if (me.get("manager")) {
                        return undefined;
                    }
                    if (signal) {
                        me.print(_tplutils.template({
                            content: funcSnippetTpl,
                            data: {
                                comment: " Signal call ",
                                code: ["_cat.utils.Signal.send('", signal , "');"].join("")
                            }
                        }));
                    }
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
                        runat = me.get("name"),
                        signal;

                    manager = me.get("manager");
                    if (manager) {
                        // TODO need to be refactored (see signal)
                        signal = me.get("signal");
                        me.print(_tplutils.template({
                            content: funcSnippetTpl,
                            data: {
                                comment: " Manager call ",
                                code: "(function() {_cat.core.managerCall('" + runat + "', function(){_cat.utils.Signal.send('" + signal + "');}); })();"
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
                        runat = me.get("name"),
                        innerscraps;

                    scrapsRows = me.get("perform");
                    if (scrapsRows) {

                        innerscraps = me.extractAnnotations(scrapsRows);

                        // extract nested annotations
                        for (scrapItemName in innerscraps) {
                            scrapItemValue = innerscraps[scrapItemName];
                            me.print(_tplutils.template({
                                content: funcSnippetTpl,
                                data: {
                                    comment: " Add Manager behavior ",
                                    code: "_cat.core.setManagerBehavior('" + runat + "', '" + scrapItemName + "', '" + scrapItemValue + "');"
                                }
                            }));
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
                                fail: true,
                                scrap: JSON.stringify(me)
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
                single: false,
                func: function (config) {

                    /**
                     * TODO This is a lame impl that need to be replaced
                     * TODO for getting the type out of the import variable
                     *
                     */
                    function _getType(value) {

                        var values,
                            type;
                        if (value) {
                            values = value.split(".");
                            type = values[values.length - 1];
                        }

                        return type;
                    }

                    function _printByType(type, value) {

                        var contentByType,
                            contents = {
                                "js": importJSTpl,
                                "css": importCSSTpl
                            };
                        if (type) {
                            contentByType = contents[type];
                        }

                        if (contentByType && value) {
                            me.print(_tplutils.template({
                                content: contentByType,
                                data: {
                                    src: value
                                }
                            }));
                        }
                    }

                    var importannos = this.get("import"),
                        importType,
                        me = this;

                    me.$setType("html");
                    if (importannos) {
                        importannos.forEach(function (item) {
                            if (item) {
                                importType = _getType(item);
                                if (importType) {
                                    _printByType(importType, item);
                                }
                            }
                        });
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

            /**
             *
             *  properties:
             *  name    - inject
             *  single  - true
             *  $type   - html
             */
            _Scrap.add({name: "replace", func: function (config) {
                var me = this,
                    innerscraps,
                    scrapsRows = this.getContextItem("behavior"),
                    replace = this.get("replace"),
                    scrapName, scrapValue,
                    behave = {},
                    behaviorLoad,
                    requireName;

                //this.$setType("*");

                if (_typedas.isArray(scrapsRows)) {
                    // in case we have specified the behaviors within the annotation

                    // extract nested annotations
                    innerscraps = me.extractAnnotations(scrapsRows);
                    for (scrapName in innerscraps) {
                        if (scrapName) {
                            if (scrapName === "replace") {
                                scrapValue = innerscraps[scrapName];
                                scrapValue = scrapValue.trim();

                                // look inside the OOTB functionality
                                behaviorLoad = _utils.resolveObject(_behavior, scrapValue);
                                if (behaviorLoad) {
                                    behave.inject = behaviorLoad;

                                } else {
                                    // try resolving user's custom object
                                    try {
                                        requireName = _path.join(_path.resolve("."), scrapValue);
                                        behaviorLoad = require(requireName);
                                        if (behaviorLoad) {
                                            behave.inject = behaviorLoad[scrapName];
                                            _log.warn("[CAT scrap-common] Module load successfuly but with missing method for scrap behavior:  '" + scrapName + "'");
                                        }

                                    } catch (e) {
                                        // failed to load user behavior
                                    }
                                }
                            }
                        }
                    }
                } else if (_typedas.isString(scrapsRows)) {
                    // or else we supplied an object with the behaviors implemented as an object

                    scrapValue = scrapsRows;
                    behave.inject = scrapValue;

                }

                // insert the behavior
                this.$setBehavior(behave);

                // set the replace data info
                this.$setReplaceData({action: behave.inject});

            }});


            /**
             *
             *  properties:
             *  name    - inject
             *  single  - true
             *  $type   - html
             */
            _Scrap.add({name: "behavior",
                single: false,
                func: function (config) {
                    var me = this;


                }
            });


            config.emitter.emit("job.done", {status: "done"});


            /**
             * Annotations for single row purpose in here -------------------
             *
             */
        },

        apply: function () {

        },

        getType: function () {
            return "scrap-common";
        }
    }

};