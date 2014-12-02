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
             * Annotation for screenshot library
             *
             *  properties:
             *  name    - screenshot
             *  single  - false
             *  singleton - 1[default -1]
             *  $type   - js
             */
            _Scrap.add({name: "screenshot",
                single: false,

                func: function (config) {

                    var screenshotRows,
                        me = this,

                        scrapConf = me.config,
                        scrap = scrapConf,
                        dm;

                    screenshotRows = this.get("screenshot");
                    dm = new _delayManagerUtils({
                        scrap: me
                    });

                    if (screenshotRows) {
                        scrap = scrapConf;

                        if (screenshotRows && screenshotRows.join) {

                            screenshotRows.add(_elutils.uicontent({ rows: screenshotRows, scrap: scrap}));
                        }


                        dm.add({
                            rows:screenshotRows

                        }, function(row) {
                            var screenshotCommand = '_cat.core.plugin("screenshot").actions.screenshot("' + scrap.name[0] + '")';
                            return screenshotCommand;
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
            return "scrap-screenshot";
        }
    };

};