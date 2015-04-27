var _Scrap = catrequire("cat.common.scrap"),
    _codeutils = catrequire("cat.code.utils"),
    _scraputils = require("./utils/Utils"),
    _delayManagerUtils =  require("./utils/DelayManagerUtils");

var tipNum = 1;
module.exports = function () {

    return {

        init: function (config) {

            /**
             * Annotation for wait functionality
             *
             *  properties:
             *  name    - wait
             *  single  - false
             *  singleton - 1[default -1]
             *  $type   - js
             */
            _Scrap.add({name: "wait",
                single: false,

                func: function (config) {

                    var waitRows,
                        me = this,

                        generate = function (waitRow) {

                            var wait, api, match;

                            waitRow = _codeutils.prepareCode(waitRow);

                            if (waitRow && waitRow.join) {
                                wait = waitRow.join("\n");

                            } else {
                                wait = waitRow;
                            }

                            if (wait) {

                                api = [
                                    {
                                        api: "object",
                                        apiname: "object"
                                    },
                                    {
                                        api: "delay",
                                        apiname: "delay"
                                    }
                                ];

                                match = _scraputils.matchinfo(wait, api);
                            }

                            return match;
                        };

                    waitRows = this.get("wait");                  

                    if (waitRows) {

                        waitRows.forEach(function(row) {
                            var match, args, wait;
                            
                            if (row) {
                                match = generate(row);
                                if (match) {                                   

                                    if (match.api === "delay") {
                                        args = match.args;
                                        me.print({
                                            scrap: {type: "wait", scrap: me},
                                            line: [],
                                            delay: ((args && args[0]) ? args[0] : 0),
                                            steps: 0
                                        })
                                    } else if (match.api === "object") {
                                        args = match.args,
                                        wait = ((args && args[0]) ? args[0] : undefined);                

                                        if (wait) {
                                            me.print({
                                                scrap: {type: "wait", scrap: me},
                                                line: [],
                                                wait2object: wait,
                                                delay: ((args && args[1]) ? args[1] : 10000),
                                                steps: 10
                                            });
                                        }
                                    }
                                }
                                                                
                            }
                        });                                      
                    }
                }
            });

            config.emitter.emit("job.done", {status: "done"});

        },

        apply: function () {

        },

        getType: function () {
            return "scrap-wait";
        }
    };

};