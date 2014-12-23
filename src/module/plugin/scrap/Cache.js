var  _global = catrequire("cat.global");


module.exports = function() {        
    
    var _module = {
      
        set: function(key, value) {
               
            var cache;
            if (_global.get("scraps") === undefined) {
                cache = {};
                _global.set("scraps", cache);
            } else {
                cache = _global.get("scraps");
            }

            cache[key] = value;
            _global.set("scraps", cache);
        },
        
        get: function(key) {
            var cache = _global.get("scraps"),
                value;
            if (cache) {
                value = cache[key];
            }
            return value;
            
        },
        
        destroy: function() {
            _global.delete("scraps");
        }
        
    };
    
    return _module;
    
}();