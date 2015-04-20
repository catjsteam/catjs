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
                
                var delay, steps, wait2object;
                
                if (!out) {
                    return out;
                }
                wait2object = ((ref && ("wait2object" in ref)) ? ( ref.wait2object ) : undefined);
                delay = ((ref && ("delay" in ref)) ? ref.delay : undefined);
                steps = ((ref && ("steps" in ref)) ? ref.steps : 0);
                
                return [(first ? "_cat.core.manager.controller.state().wait({delay: _supportedDelay('" + cell + "', "+ delay +"), steps: " + steps +", match: " + wait2object + ",callback:" : ".wait({delay: _supportedDelay('" + cell + "', "+ delay +"), steps: " + steps + ", match: " + wait2object + ", callback:"), " function(){ return ", out, "}  })"].join("");
            }
            
            if (order) {
                order.lines.forEach(function(item) {
                    var cell, key, out, delay, wait2object, steps;

                    if (item) {
                        cell = item.cell;
                        key = item.key;
                        out = (key in me.output ? me.output[key].lines : undefined);                       
                        delay = (key in me.output ? me.output[key].delay : undefined);  
                        steps = (key in me.output ? me.output[key].steps : undefined);  
                        wait2object = (key in me.output ? me.output[key].wait2object : undefined);  
                        
                        if (out) {
                            out = out[cell];
                            if (out) {                                
                                out = addQ(out, (counter === 0 ? true : false), key, me.output[key]);
                                output.lines.push(out);
                            }
                            counter++;
                            
                        }  else if (wait2object) {
                            out = " undefined;";
                            out = addQ(out, (counter === 0 ? true : false), key, me.output[key]);
                            output.lines.push(out);
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
                steps,
                wait2object,
                me = this;

            function _set(key, line, delay, steps, wait2object) {
                if (!me.output[key]) {
                    me.output[key] = {lines:[], delay: undefined, wait2object: undefined};
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
                if (wait2object !== undefined) {
                    me.output[key].wait2object = wait2object;
                }
                if (steps !== undefined) {
                    me.output[key].steps = steps;
                }

            }

            scraptype = scrap.type;
            scrapi = scrap.scrap;
            line = config.line;
            delay = config.delay;
            steps = config.steps;
            wait2object = config.wait2object;
            
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
                    _set(this.enum.GENERAL, line, delay, steps, wait2object);

                } else {
                    _set(scraptype, line, delay, steps, wait2object);
                }
            }
        };

    };

    
    
    return _Printer;

}();