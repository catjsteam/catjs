var _Scrap = catrequire("cat.common.scrap"),
    _utils = catrequire("cat.utils"),
    _scraputils = require("./Utils"),
    _Faker = require('Faker');
//var _tplutils = catrequire("cat.tpl.utils");
//var importJSTpl = _tplutils.readTemplateFile("scrap/_import_js");



module.exports = function () {

    return {

        init: function (config) {

            /**
             * Annotation for mock library
             *
             *  properties:
             *  name    - mock
             *  single  - false
             *  singleton - 1[default -1]
             *  $type   - js
             */
            _Scrap.add({name: "mock",
                single: false,

                func: function (config) {
                    var mockRows,
                        mock,
                        me = this,
                        validcode = false;
                    debugger;
                    mockRows = this.get("mock");

                    if (mockRows) {
                        _utils.prepareCode(mockRows);
                        mock = mockRows.join("\n");


                        if (mock) {

                            var mockCode = (mock).match(/equal\((.*)\);/);

                            if (mockCode) {

                                // split the args, parseInt the args that are numbers
                                mockCode[1] = mockCode[1].replace(/ /g,"");
                                var args = mockCode[1].split(",");

                                me.print("if (" + args[0] + "===" + args[1] + ") { console.log(" + args[2] + "); } else { console.log(" + args[3] + "); }")

                                me.print("console.log(tests_db);");


                            } else {
                                var mockCode = (mock).match(/set\((.*)\);/);

                                if (mockCode) {

                                    mockCode[1] = mockCode[1].replace(/ /g,"");
                                    var args = mockCode[1].split(",");

                                    me.print(args[0] + "=" + args[1] + ";");

                                } else {

                                    var mockCode = (mock).match(/get\((.*)\);/);

                                    if (mockCode) {

                                        mockCode[1] = mockCode[1].replace(/ /g,"");
                                        var args = mockCode[1].split(",");

                                        me.print(args[1] + "=" + args[0] + ";");


                                    }
                                }
                            }

                        }
                    }
                }
            });
            config.emitter.emit("job.done", {status: "done"});
        },

        apply: function () {

        },

        getType: function () {
            return "scrap-mock";
        }
    }

};