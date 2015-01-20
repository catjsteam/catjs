var Printer = require("./Printer"),
    _ = require("underscore"),
    _entityutils = catrequire("cat.entity"),
    _jsutils = require("js.utils");


module.exports = function () {


    var _Printer = function () {
        var key;
        
        this._printer = new Printer();
        
        for (key in this._printer) {
            if (this._printer.hasOwnProperty(key)) {
                this[key] = this._printer[key];
            }
        }

        this.generate = function () {

            if (_jsutils.Object.empty(this.output)) {
                return undefined;
            }

            var order = (this.enum.ORDER in this.output ? this.output[this.enum.ORDER] : undefined),
                me = this,
                jasmine = _entityutils.getEntity("jasmine"), scrapName;

            if (order) {
                order.forEach(function (item) {
                    var cell, key, out;

                    function getScrapValue(key) {

                        var scrap = me.scrap.impl;
                        if (scrap) {
                            return (scrap.config ? scrap.get(key) : (_.isArray(scrap[key]) ? scrap[key][0] : scrap[key]));
                        }

                        return undefined;
                    }

                    if (item) {
                        cell = item.cell;
                        key = item.key;
                        if (key in me.spec) {
                            out = (key in me.output ? me.output[key] : undefined);
                            if (out) {
                                out = out[cell];
                                if (out) {
                                    scrapName = getScrapValue("name");
                                    if (scrapName) {
                                        jasmine.add({
                                            name: key,
                                            scrapname: getScrapValue("name"),
                                            data: out
                                        });
                                    }
                                }
                            }
                        }
                    }

                });

                //jasmine.flush();
            }
        };

        this.spec = {"describe": 1, "it": 1, "xdescribe": 1, "xit": 1};
        
    };
    
    
    return _Printer;


}();