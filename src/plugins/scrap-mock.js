var _Scrap = catrequire("cat.common.scrap"),
    _codeutils = catrequire("cat.code.utils"),
    _scraputils = require("./utils/Utils"),
    _Faker = require('Faker');


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

                    mockRows = this.get("mock");

                    if (mockRows) {
                        mockRows = _codeutils.prepareCode(mockRows);
                        mock = mockRows.join("\n");


                        if (mock) {

                            var args, mockCode = (mock).match(/equal\((.*)\);/);

                            if (mockCode) {

                                // split the args, parseInt the args that are numbers
                                mockCode[1] = mockCode[1].replace(/ /g,"");
                                args = mockCode[1].split(",");

                                me.print("if (" + args[0] + "===" + args[1] + ") { console.log(" + args[2] + "); } else { console.log(" + args[3] + "); }");

                                me.print("console.log(tests_db);");


                            } else {
                                mockCode = (mock).match(/set\((.*)\);/);

                                if (mockCode) {

                                    mockCode[1] = mockCode[1].replace(/ /g,"");
                                    args = mockCode[1].split(",");

                                    me.print(args[0] + "=" + args[1] + ";");

                                } else {

                                    mockCode = (mock).match(/get\((.*)\);/);

                                    if (mockCode) {

                                        mockCode[1] = mockCode[1].replace(/ /g,"");
                                        args = mockCode[1].split(",");

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
    };

};