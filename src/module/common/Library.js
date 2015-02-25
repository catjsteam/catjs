/**
 * Library Class 
 * 
 * Represent the OOTB supported by catjs (underscore, js.utils, jspath, chaijs)
 * 
 */
var underscore = require("underscore"),
    _jsutils = require("js.utils"),
    _utils = catrequire("cat.utils"),
    _Library = function(config) {
        
        if (!config || !underscore.isObject(config)) {
            _utils.error("[catjs Library class] expects an Object but found: ", (config ? typeof(underscore) : "undefined"));   
        }
        
        _utils.prepareProps({ 
            global: {obj: config}, 
            props: [
                {key: "name", require: true},
                {key: "exclude", default: false}
            ] 
        });

        _jsutils.Object.copy(config , this);
        this._config = config;

    };

    _Library.prototype.exists = function(keyArg, valueArg){
        var key;
        if (keyArg && this._config.hasOwnProperty(keyArg)) {
            if (this._config[keyArg] === valueArg) {
                return true;
            }
        }
        
        return false;
    };

module.exports = function() {
   
    var _module = {

        /**
         * Instantiate a single object
         * 
         * @param config
         *          name {String} The library name
         *          exclude {Boolean} exclude the library loading in case of import or exclude the path in case of require
         *          
         * @returns {Library} new instance
         */
        get: function(config) {
            
            var clazz;
            try {
                clazz = new _Library(config);
                
            } catch (e) {
                
            }
            
            return clazz;
        },

        /**
         * Instantiate an array of library objects
         * 
         * @param configArray {Array} library config items
         */
        all: function(configArray) {
            var arr = [];
            if (underscore.isArray(configArray)) {
                configArray.forEach(function(config) {
                    var lib;
                    if (config) {
                        lib = _module.get(config);
                        if (lib) {
                            arr.push(lib);   
                        }                  
                    }
                });
            }
            return arr;
        },

        /**
         * Merge two library objects
         * 
         * @param source {Array} Source libraries
         * @param target {Array} Target library
         */
        merge: function(source, target) {
            
            var idx= 0, size= 0, item, targetItem,
                additional = [];            
            
            if (source && underscore.isArray(source) && target && underscore.isArray(target)) {
                
                size = source.length;
                for (idx = 0; idx<size; idx++) {
                    item = source[idx];
                    if (item) {
                        targetItem = _module.exists(target, item.name);
                        if (targetItem) {
                            if (!item.exclude) {
                                _jsutils.Object.copy(item, target[targetItem.idx], true);
                            } else {
                                target[targetItem.idx] = null;
                            }
                        } else {
                            if (!item.exclude) {
                                additional.push(item);
                            }
                        }
                    }  
                }

                additional.forEach(function(lib) {
                    if (lib) {
                        target.push(lib);
                    }
                });
                
                
                // clean all null || undefined cells
                size = target.length;
                for(idx = 0; idx < size; idx++ ) {
                    target[idx] && target.push(target[idx]);  
                }
                target.splice(0 , size);
            }
           
        },
        
        /**
         * Check if an object exists within Array of the Library objects
         * 
         * @param obj {Array} Array of Library objects
         * @param value {Object} Library object
         * @param prop {Object} property name, default set to "name" [optional]
         */
        exists: function(obj, value, prop) {

            var idx= 0, size = 0, lib;
            
            if (underscore.isObject(value)) {
                value = value.name;
            }
            
            if (!prop) {
                prop = "name";    
            }
            
            if (obj) {
                size = obj.length;
                for (idx=0; idx<size; idx++) {
                    lib = obj[idx];
                    if (lib && lib.exists && lib.exists(prop, value)) {
                        
                        return {lib:lib, idx:idx};
                    }
                }
            }
            
            return false;
        }
    }

    return _module;
    
}();