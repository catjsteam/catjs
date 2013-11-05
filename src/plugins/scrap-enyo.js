var _Scrap = catrequire("cat.common.scrap"),
    _utils = catrequire("cat.utils");

module.exports = function () {

    return {

        init: function (config) {

            /**
             * Annotation for enyo library
             *
             *  properties:
             *  name    - enyo
             *  single  - false
             *  singleton - 1[default -1]
             *  $type   - js
             */
            _Scrap.add({name: "enyo",
                single: false,

                func: function (config) {
                    var enyoRows,
                        enyo,
                        me = this,
                        validcode = false;

                    enyoRows = this.get("enyo");

                    if (enyoRows) {
                        _utils.prepareCode(enyoRows);
                        enyo = enyoRows.join("\n");

                        if (enyo) {

                            var str = (enyo).match(/tap\((.*)\);/);
                            if (str) {

                                // split the args, parseInt the args that are numbers
                                str[1] = str[1].replace(/ /g, "");
                                var args = str[1].split(",");
                                var functionArg = "";
                                for (var i = 0; i < args.length; i++) {
                                    if (/^\d+$/.test(args[i])) {
                                        args[i] = parseInt(args[i]);
                                    }
                                    functionArg += args[i] + ",";
                                }

                                functionArg = functionArg.substring(0, functionArg.length - 1);


                                me.print("_cat.core.plugin('sencha').actions.fireTap(" + functionArg + ");");


                            } else {

                                str = (enyo).match(/setText\((.*)\);/);
                                if (str) {

                                    // split the args, parseInt the args that are numbers
                                    str[1] = str[1].replace(/ /g, "");
                                    var args = str[1].split(",");
                                    var functionArg = "";
                                    for (var i = 0; i < args.length; i++) {
                                        if (/^\d+$/.test(args[i])) {
                                            args[i] = parseInt(args[i]);
                                        }
                                        functionArg += args[i] + ",";
                                    }

                                    functionArg = functionArg.substring(0, functionArg.length - 1);

                                    me.print("_cat.core.plugin('sencha').actions.setText(" + functionArg + ");");
                                }
                            }


                        }
                    }
                }
            });


        },

        apply: function () {

        },

        getType: function () {
            return "scrap-enyo";
        }
    }

};