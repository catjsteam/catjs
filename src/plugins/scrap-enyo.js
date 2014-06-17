var _Scrap = catrequire("cat.common.scrap"),
    _utils = catrequire("cat.utils"),
    _tplutils = catrequire("cat.tpl.utils"),
    _scraputils = require("./utils/Utils");

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
                                        me.print(_tplutils.template({
                                            content: funcSnippetTpl,
                                            data: {
                                                comment: " Generated code according to the enyo scrap comment (see @@enyo)",
                                                code: ("_cat.core.plugin('enyo').actions."+ match)
                                            }
                                        }));
                                    }
                                }
                            }
                        };


                    enyoRows = this.get("enyo");
                    var scrapConf = me.config,
                        scrap = scrapConf,
                        scrapName;

                    if (enyoRows) {
                        scrap = scrapConf;
                        scrapName = (scrap.name ? scrap.name[0] : undefined);

                        if (enyoRows && enyoRows.join) {
                            me.print("_cat.core.ui.setContent({style: 'color:#0080FF', header: '" + scrapName + "', desc: '" + enyoRows + "',tips: ''});");
                        }

                        enyoRows.forEach(function (enyoRow) {
                            if (enyoRow) {
                                generate(enyoRow);
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
            return "scrap-enyo";
        }
    };

};