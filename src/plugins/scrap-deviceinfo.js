var _Scrap = catrequire("cat.common.scrap"),
    _utils = catrequire("cat.utils"),
    _scraputils = require("./utils/Utils"),
    _elutils = require("./utils/ExpressionUtils"),
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

                        scrapConf = me.config,
                        scrap = scrapConf,
                        dm;

                    deviceinfoRows = this.get("deviceinfo");
                    dm = new _delayManagerUtils({
                        scrap: me
                    });

                    if (deviceinfoRows) {
                        scrap = scrapConf;

                        if (deviceinfoRows && deviceinfoRows.join) {

                            dm.add({
                                rows:[_elutils.uicontent({ rows: deviceinfoRows, scrap: scrap})]

                            }, function(row) {
                                return row;
                            });
                        }


                        dm.add({
                            rows:deviceinfoRows

                        }, function(row) {
                            var deviceinfoCommand = '_cat.core.plugin("deviceinfo").actions.deviceinfo("' + scrap.name[0] + '")';
                            return deviceinfoCommand;
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