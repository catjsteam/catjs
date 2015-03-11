_cat.core.TestQueue = function() {

    var _Queue = function(key) {
        
        this.key = key;
        this.items = [];
    }, 
        _queue = {},
        _module;

    _Queue.prototype.empty = function() {
        return (this.key ? false : true);
    };
    
    _Queue.prototype.add = function(config) {
        this.items.push(config);
    };

    _Queue.prototype.all = function() {
        return this.items;
    };
    
    _Queue.prototype.first = function() {
        return (this.size() > 0 ? this.items[0] : undefined);
    };
    
   _Queue.prototype.deleteFirst = function() {
        if (this.size() > 0) {
            this.items.shift();   
        }
    };   
        
   _Queue.prototype.delete = function(idx) {
        if (this.size() > 0) {
            this.items.splice(idx, 1);   
        }
    };   
    
    _Queue.prototype.deleteAll = function() {
        if (this.size() > 0) {
            this.items = []; 
        }
    };
    
    _Queue.prototype.size = function() {
        return this.items.length;
    };

    _module = {
        
        isEmpty: function() {
            return _cat.utils.Utils.isEmpty(_queue);    
        },
                
        get: function(key) {
            var queue = _queue[key];
            return (queue ? queue : new _Queue());
        },
        
        add: function(key, config) {
            var queue = _module.get(key);
            if (queue.empty()) {
                queue = _queue[key] = new _Queue();
            }
            queue.add(config);
        }
    };
    
    return _module;
};