
_cat.utils.TestsDB = function() {

    var _data,
        _testnextcache = {},
        _variableNameMap = {},
        TestDB,
        _module;

    function _TestsDB() {

        this._DB = undefined;
        var me = this;

        _cat.utils.AJAX.sendRequestAsync({url : "tests_db.json", callback : {call : function(check) {
            me._DB = JSON.parse(check.response);
        }}});

        this.getDB = function() { return this._DB; };

        var getProp = function (propString, obj) {
            var current = obj;
            var split = propString.split('.');

            for (var i = 0; i < split.length; i++) {
                if (current.hasOwnProperty(split[i])) {
                    current = current[split[i]];
                }
            }

            return current;
        };

        var setProp = function (propString, value, obj) {
            var current = obj;
            var split = propString.split('.');

            for (var i = 0; i < split.length - 1; i++) {
                if (current.hasOwnProperty(split[i])) {
                    current = current[split[i]];
                }
            }

            current[split[split.length - 1]] = value;
            return current[split[split.length - 1]];
        };

        this.get = function(field) { return getProp(field, this._DB); };
        this.set = function(field, value) { return setProp(field, value, this._DB); };


    }


    _module = {

        counter: function(variableName) {
            if (!(variableName in _variableNameMap)) {
                _variableNameMap[variableName] = {counter: -1};
            }
            _variableNameMap[variableName].counter++;
            
            return _variableNameMap[variableName].counter;
        },
        
        getData : function() {
            return _data;
        },

        init : function(data) {
            
            if (data) {
                _data = data;
                return undefined;
            }
            
            _cat.utils.AJAX.sendRequestAsync({
                url :  _cat.core.getBaseUrl("cat/config/testdata.json"),
                callback : {
                    call : function(check) {
                        var incomingdata = check.response,
                            type, validata = false, errors;
                        
                        if (incomingdata) {
                            type = _cat.utils.Utils.getType(incomingdata);
                            if (type === "string") {
                                try {
                                    _data = JSON.parse(incomingdata);
                                    validata = true;
                                } catch(e) {
                                    errors = e;
                                }
                            }
                        }

                        if (!validata) {
                            _cat.core.log.warn("[catjs testdb] No valid test data was found, any '@d' API usage related will be skipped (see src/config/testdata.json), errors:", (errors ? errors : " NA"));
                        }

                    }
                }
            });
        },

        getDB : function() {
            return TestDB.getDB();
        },

        get : function(field) {
            var temp = " _data" + field;
            return eval(temp);
        },

        set : function(field, value) {
            return TestDB.set(field, value);
        },
        
        find : function(query) {
            var code = "JSPath.apply('" + query + "', _data);";

            return (new Function("JSPath", "_data", "if (JSPath) { return " + code + "} else { console.log('Missing dependency : JSPath');  }").apply(this, [(typeof JSPath !== "undefined" ? JSPath : undefined), _data]) || "");
        },
        
        findFirst: function(query) {
            var result = this.find(query);
            if (typeof result !== "string" && result.length && result.length > 0) {
                result = result[0];               
            } 
            
            return result;
        },
        
        random: function(query) {

            function _random(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }

            var result = this.find(query),
                cell=0;

            if (result && result.length) {
                cell = _random(0, result.length-1);
                return result[cell];
            }

            return result;
        },
               
        currentIndex: function(query, name) {
            var key = (query + (name || ""));
            return  _testnextcache[key];
        },
        
        current: function(query, name) {            
            _module.next(query, name, {"pause": true});
        },
        
        hasnext: function(query, name) {
            var idx = _module.currentIndex(query, name),            
                result = this.find(query);
            
            idx++;
            if (result && result.length && idx < result.length) {
                return true; 
            }
            
            return false;
        },
        
        next: function(query, name, opt) {
            
            var result = this.find(query),
                value, idx, bounds,
                pause, repeat, key = query + (name || "");

            function _getOpt(key) {
                if (key && opt) {
                    if (typeof(opt) !== "object") {
                        _cat.core.log.warn("[catjs testdb next] expects an object {repeat:[boolean], pause:[boolean]} but found an opt argument of type: ", typeof(opt));
                        return undefined;
                    }        
                    if (key in opt) {
                        return opt[key];
                    }
                }
                return undefined;
            }
            
            function _updateIndex() {
                if (idx !== undefined && idx != null) {
                    if (!pause) {
                        _testnextcache[key]++;
                    }
                    if (_testnextcache[key] >= result.length && repeat) {
                        _testnextcache[key] = 0;
                    }
                    
                } else {
                    _testnextcache[key] = 0;
                }                
            } 
            
            pause = _getOpt("pause");
            repeat =  _getOpt("repeat");
            
            if (result && result.length) {

                bounds = result.length-1;
                idx = _testnextcache[key];

                _updateIndex();

                idx = _testnextcache[key];
                if (idx < result.length) {
                    value = result[idx];
                    if (!value) {
                        throw new Error("[catjs testdb next] Failed to resolve array index:  (" + idx + ") out of bounds (" + bounds + ")"); 
                    }
                } else {
                    throw new Error("[catjs testdb next] Array index (" + idx + ") out of bounds (0 - " + bounds + ")");
                }
            } 
            
            if (!value) {
                throw new Error("[catjs testdb next] Failed to resolve the data according the following query :  (" + key + ")");
            }

            return value;
        }
    };
    
    return _module;
}();