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
                counter = 0,
                me =  this;

            function addQ(out, first, cell, ref) {
                
                var delay;
                
                if (!out) {
                    return out;
                }
                delay = ((ref && ("delay" in ref)) ? ref.delay : undefined);
                
                return [(first ? "_cat.core.manager.controller.state().wait({delay: _supportedDelay('" + cell + "', "+ delay +"), steps: 0, callback:" : ".wait({delay: _supportedDelay('" + cell + "', "+ delay +"), steps: 0, callback:"), " function(){ return ", out, "}  })"].join("");
            }
            
            if (order) {
                order.lines.forEach(function(item) {
                    var cell, key, out, delay;

                    if (item) {
                        cell = item.cell;
                        key = item.key;
                        out = (key in me.output ? me.output[key].lines : undefined);                       
                        delay = (key in me.output ? me.output[key].delay : undefined);                       
                        if (out) {
                            out = out[cell];
                            if (out) {                                
                                out = addQ(out, (counter === 0 ? true : false), key, me.output[key]);
                                output.lines.push(out);
                            }
                            counter++;
                        } else if (delay) {
                            out = " undefined;";
                            out = addQ(out, (counter === 0 ? true : false), key, me.output[key]);
                            output.lines.push(out);
                            counter++;

                        }
                    }
                   
                });
                
                output.lines.push(";");
            }

            return ( output ? output.lines.join(" \n ") : "" );
        };

        this.print = function (config) {

            var scraptype,
                scrap = ("scrap" in config ? config.scrap : {}), scrapi,
                line,
                delay,
                me = this;

            function _set(key, line, delay) {
                if (!me.output[key]) {
                    me.output[key] = {lines:[], delay: undefined};
                } else {
                    if (!("lines" in me.output[key])) {
                        me.output[key].lines = [];
                    }
                }

                if (_.isArray(line)) {    
                    me.output[key] = me.output[key].lines.concat(line);
                } else {
                    me.output[key].lines.push(line);
                }

                if (delay !== undefined) {
                    me.output[key].delay = delay;
                }

            }

            scraptype = scrap.type;
            scrapi = scrap.scrap;
            line = config.line;
            delay = config.delay;
            
            if (line) {

                if (!this.output[this.enum.GENERAL]) {
                    this.output[this.enum.GENERAL] = {lines: []};
                    if (scrapi) {
                        if (!this.scrap.impl) {
                            this.scrap.impl = scrapi;
                        }
                        if (!this.output[this.enum.ORDER]) {
                            this.output[this.enum.ORDER] = {lines: []}    
                        }
                        this.output[this.enum.ORDER].lines = (scrapi.config ? scrapi.getStack() : scrapi.stack);
                    }
                }

                if (!scraptype) {
                    _set(this.enum.GENERAL, line, delay);

                } else {
                    _set(scraptype, line, delay);
                }
            }
        };

    };

    
    
    return _Printer;

}();