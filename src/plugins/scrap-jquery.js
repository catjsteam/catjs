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

                            var jquery, api, match;

                            jqueryRow = _codeutils.prepareCode(jqueryRow);

                            if (jqueryRow && jqueryRow.join) {
                                jquery = jqueryRow.join("\n");
                                
                            } else {
                                jquery = jqueryRow;
                            }

                            if (jquery) {
                                
                                api = [
                                    {
                                        api: "trigger",
                                        apiname: "trigger"
                                    }, 
                                    {
                                        api: "scrollTo",
                                        apiname: "scrollTo"
                                    },
                                    {
                                            api: "scrollToWithRapper",
                                            apiname: "scrollToWithRapper"
                                    },
                                    {
                                            api: "clickRef",
                                            apiname: "clickRef"
                                    },
                                    {
                                            api: "click",
                                            apiname: "click"
                                    },
                                    {
                                            api: "clickButton",
                                            apiname: "clickButton"
                                    },
                                    {
                                            api: "setCheck",
                                            apiname: "setCheck"
                                    },
                                    {
                                            api: "setText",
                                            apiname: "setText"
                                    },
                                    {
                                            api: "checkRadio",
                                            apiname: "checkRadio"
                                    },
                                    {
                                            api: "scrollTop",
                                            apiname: "scrollTop"
                                    },
                                    {
                                            api: "collapsible",
                                            apiname: "collapsible"
                                    }
                                ];
                                
                                match = _scraputils.match(jquery, api);
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