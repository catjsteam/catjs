
_cat.utils.TestsDB = function() {

    var _data,
        _testnextcache = {},
        _variableNameMap = {};

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

    var TestDB;

    return {

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

        init : function() {
            _cat.utils.AJAX.sendRequestAsync({
                url :  _cat.core.getBaseUrl("cat/config/testdata.json"),
                callback : {
                    call : function(check) {
                        var incomingdata = check.response,
                            type, validata = false;
                        
                        if (!incomingdata) {
                            type = _cat.utils.Utils.getType();
                            if (type === "object" || type === "array") {
                                try {
                                    _data = JSON.parse(incomingdata);
                                    validata = true;
                                } catch(e) {
                                }
                            }
                        }

                        if (!validata) {
                            _cat.core.log.warn("[catjs testdb] No valid test data was found, any '@d' API usage related will be skipped (see src/config/testdata.json)");
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
        
        find : function(field) {
            var code = "JSPath.apply('" + field + "', _data);";

            return (new Function("JSPath", "_data", "if (JSPath) { return " + code + "} else { console.log('Missing dependency : JSPath');  }").apply(this, [(typeof JSPath !== "undefined" ? JSPath : undefined), _data]) || "");
        },
        random: function(field) {

            function _random(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }

            var result = this.find(field),
                cell=0;

            if (result && result.length) {
                cell = _random(0, result.length-1);
                return result[cell];
            }

            return result;
        },
        next: function(field) {

            var result = this.find(field),
                cell=0;

            if (result && result.length) {
                if (_testnextcache[field] !== undefined && _testnextcache[field] != null) {
                    _testnextcache[field]++;
                } else {
                    _testnextcache[field] = 0;
                }
                return result[_testnextcache[field]];
            }

            return result;
        }
    };
}();