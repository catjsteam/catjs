var _ = require("underscore");
    

module.exports = function() {

    var _Printer = function() {
        this.scrap = {};
        this.output = {};
        this.enum = {
            GENERAL: "_general",
            ORDER: "_order"
        };

        this.generate = function () {
            var output = (this.enum.GENERAL in this.output ? this.output[this.enum.GENERAL] : undefined),
                order =  (this.enum.ORDER in this.output ? this.output[this.enum.ORDER] : undefined),
                me =  this;

            if (order) {
                order.forEach(function(item) {
                    var cell, key, out;

                    if (item) {
                        cell = item.cell;
                        key = item.key;
                        out = (key in me.output ? me.output[key] : undefined);
                        if (out) {
                            out = out[cell];
                            if (out) {
                                output.push(out);
                            }
                        }
                    }

                });
            }

            return ( output ? output.join(" \n ") : "" );
        };

        this.print = function (config) {

            var scraptype,
                scrap = ("scrap" in config ? config.scrap : {}), scrapi,
                line,
                me = this;

            function _set(key, line) {
                if (!me.output[key]) {
                    me.output[key] = [];
                }
                if (_.isArray(line)) {
                    me.output[key] = me.output[key].concat(line);
                } else {
                    me.output[key].push(line);
                }

            }

            scraptype = scrap.type;
            scrapi = scrap.scrap;
            line = config.line;
            if (line) {
                if (!this.output[this.enum.GENERAL]) {
                    this.output[this.enum.GENERAL] = [];
                    if (scrapi) {
                        if (!this.scrap.impl) {
                            this.scrap.impl = scrapi;
                        }
                        this.output[this.enum.ORDER] = (scrapi.config ? scrapi.getStack() : scrapi.stack);
                    }
                }

                if (!scraptype) {
                    _set(this.enum.GENERAL, line);

                } else {
                    _set(scraptype, line);
                }
            }
        };

    };

    
    
    return _Printer;

}();