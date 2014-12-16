var _Scrap = catrequire("cat.common.scrap"),
    _utils = catrequire("cat.utils"),
    _scraputils = require("./utils/Utils"),
    _delayManagerUtils =  require("./utils/DelayManagerUtils");

var tipNum = 1;
module.exports = function () {

    return {

        init: function (config) {

            /**
             * Annotation for vnc library
             *
             *  properties:
             *  name    - vnc
             *  single  - false
             *  singleton - 1[default -1]
             *  $type   - js
             */
            _Scrap.add({name: "vnc",
                single: false,

                func: function (config) {

                    var vncRows,
                        me = this,
                        tempCommand,

                        generate = function (vncRow) {

                            var vnc;

                            vncRow = _utils.prepareCode(vncRow);

                            if (vncRow && vncRow.join) {
                                vnc = vncRow.join("\n");
                            } else {
                                vnc = vncRow;
                            }

                            if (vnc) {
                                var match = _scraputils.generate({
                                    api: "mouseClick",
                                    apiname: "mouseClick",
                                    exp: vnc
                                });

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "mouseScrollVer",
                                        apiname: "mouseScrollVer",
                                        exp: vnc
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "mouseSlide",
                                        apiname: "mouseSlide",
                                        exp: vnc
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "mouseLongClick",
                                        apiname: "mouseLongClick",
                                        exp: vnc
                                    });
                                }


                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "swipeLeft",
                                        apiname: "swipeLeft",
                                        exp: vnc
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "swipeRight",
                                        apiname: "swipeRight",
                                        exp: vnc
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "back",
                                        apiname: "back",
                                        exp: vnc
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "setText",
                                        apiname: "setText",
                                        exp: vnc
                                    });
                                }

                                if (!match) {
                                    match = _scraputils.generate({
                                        api: "home",
                                        apiname: "home",
                                        exp: vnc
                                    });
                                }

                                if (match) {

                                    tempCommand = [
                                        '_cat.core.plugin("vnc").actions.',
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

                    vncRows = this.get("vnc");

                    dm = new _delayManagerUtils({
                        scrap: me
                    });

                    if (vncRows) {

                        dm.add({
                            rows:vncRows,
                            args: [
                                "scrapName: 'vnc'"
                            ]

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
            return "scrap-vnc";
        }
    };

};