var _Scrap = catrequire("cat.common.scrap"),
    _codeutils = catrequire("cat.code.utils"),
    _scraputils = require("./utils/Utils"),
    _delayManagerUtils =  require("./utils/DelayManagerUtils");

var tipNum = 1;
module.exports = function () {

    return {

        init: function (config) {

            /**
             * Annotation for jquery library
             *
             *  properties:
             *  name    - jquery
             *  single  - false
             *  singleton - 1[default -1]
             *  $type   - js
             */
            _Scrap.add({name: "jquery",
                single: false,

                func: function (config) {

                    var jqueryRows,
                        me = this,
                        tempCommand,

                        generate = function (jqueryRow) {

                            var jquery;

                            jqueryRow = _codeutils.prepareCode(jqueryRow);

                            if (jqueryRow && jqueryRow.join) {
                                jquery = jqueryRow.join("\n");
                            } else {
                                jquery = jqueryRow;
                            }

                            if (jquery) {
                                var match = _scraputils.generate({
                                    api: "scrollTo",
                                    apiname: "scrollTo",
                                    exp: jquery
                                });


                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "scrollToWithRapper",
                                        apiname: "scrollToWithRapper",
                                        exp: jquery
                                    });
                                }
                             
                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "clickRef",
                                        apiname: "clickRef",
                                        exp: jquery
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "click",
                                        apiname: "click",
                                        exp: jquery
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "clickButton",
                                        apiname: "clickButton",
                                        exp: jquery
                                    });
                                }


                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "setCheck",
                                        apiname: "setCheck",
                                        exp: jquery
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "setText",
                                        apiname: "setText",
                                        exp: jquery
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "checkRadio",
                                        apiname: "checkRadio",
                                        exp: jquery
                                    });
                                }


                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "scrollTop",
                                        apiname: "scrollTop",
                                        exp: jquery
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "collapsible",
                                        apiname: "collapsible",
                                        exp: jquery
                                    });
                                }                               

                                if (match) {

                                    tempCommand = [
                                        '_cat.core.plugin("jquery").actions.',
                                        match
                                    ];

                                    return tempCommand.join("");
                                }
                            }

                            return undefined;
                        },
                        scrapConf = me.config,
                        scrap = scrapConf,
                        dm;

                    jqueryRows = this.get("jquery");
                    
                    dm = new _delayManagerUtils({
                        scrap: me
                    });

                    if (jqueryRows) {

                        dm.add({
                            rows:jqueryRows,
                            args: [
                                "scrapName: 'jquery'"
                            ],
                            type: "jquery"

                        }, function(row) {
                            return generate(row);
                        });
                    }

                    dm.dispose();
                }
            });

            config.emitter.emit("job.done", {status: "done"});

        },

        apply: function () {

        },

        getType: function () {
            return "scrap-jquery";
        }
    };

};