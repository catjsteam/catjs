var _Scrap = catrequire("cat.common.scrap"),
    _codeutils = catrequire("cat.code.utils"),
    _scraputils = require("./utils/Utils"),
    _delayManagerUtils =  require("./utils/DelayManagerUtils");

var tipNum = 1;
module.exports = function () {

    return {

        init: function (config) {

            /**
             * Annotation for deviceinfo library
             *
             *  properties:
             *  name    - deviceinfo
             *  single  - false
             *  singleton - 1[default -1]
             *  $type   - js
             */
            _Scrap.add({name: "deviceinfo",
                single: false,

                func: function (config) {

                    var deviceinfoRows,
                        me = this,


                        generate = function (deviceinfoRow) {

                            var deviceinfo;

                            deviceinfoRow = _codeutils.prepareCode(deviceinfoRow);

                            if (deviceinfoRow && deviceinfoRow.join) {
                                deviceinfo = deviceinfoRow.join("\n");
                            } else {
                                deviceinfo = deviceinfoRow;
                            }

                            if (deviceinfo) {
                                var match = _scraputils.generate({
                                    api: "deviceinfo",
                                    apiname: "deviceinfo",
                                    exp: deviceinfo
                                });

                                if (match) {

                                    tempCommand = [
                                        '_cat.core.plugin("deviceinfo").actions.',
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

                    deviceinfoRows = this.get("deviceinfo");
                    dm = new _delayManagerUtils({
                        scrap: me
                    });

                    if (deviceinfoRows) {

                        dm.add({
                            rows:deviceinfoRows,
                            args: [
                                "scrapName: 'deviceinfo'"
                            ],
                            type:"deviceinfo"

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
            return "scrap-deviceinfo";
        }
    };

};