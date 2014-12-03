var _Scrap = catrequire("cat.common.scrap"),
    _utils = catrequire("cat.utils"),
    _tplutils = catrequire("cat.tpl.utils"),
    _scraputils = require("./utils/Utils"),
    _elutils = require("./utils/ExpressionUtils"),
    _delayManagerUtils =  require("./utils/DelayManagerUtils");

module.exports = function () {

    var funcSnippetTpl = _tplutils.readTemplateFile("scrap/_func_snippet");

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
                        tempCommand,
                        
                        generate = function (enyoRow) {


                            if (enyoRows) {
                                var enyo;

                                enyoRow = _utils.prepareCode(enyoRow);

                                if (enyoRow && enyoRow.join) {
                                    enyo = enyoRow.join("\n");
                                } else {
                                    enyo = enyoRow;
                                }

                                if (enyo) {

                                    var match;

                                    match = _scraputils.generate({
                                        api: "waterfall",
                                        exp: enyo
                                    });

                                    if (!match) {
                                        match = _scraputils.generate({
                                            api: "next",
                                            exp: enyo
                                        });
                                    }

                                    if (!match) {
                                        match = _scraputils.generate({
                                            api: "setSelected",
                                            exp: enyo
                                        });
                                    }


                                    if (match) {

                                        tempCommand = [
                                            '_cat.core.plugin("enyo").actions.',
                                            match
                                        ];

                                        return tempCommand.join("");
                                    }
                                }
                            }
                        },
                        scrapConf = me.config,
                        scrap = scrapConf,
                        dm;



                    enyoRows = this.get("enyo");
                    
                    dm = new _delayManagerUtils({
                        scrap: me
                    });

                    if (enyoRows) {
                        scrap = scrapConf;

                        if (enyoRows && enyoRows.join) {

                            dm.add({
                                rows:[_elutils.uicontent({ rows: enyoRows, scrap: scrap})]

                            }, function(row) {
                                return row;
                            });
                        }


                        dm.add({
                            rows:enyoRows

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
            return "scrap-enyo";
        }
    };

};