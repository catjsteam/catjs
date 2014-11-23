var _date = require("date-format-lite"),
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _path = require("path"),
    _utils = catrequire("cat.utils"),
    _fs = require("fs"),
    _wrench = require("wrench"),
    _jsonutils = catrequire("cat.jsonutils"),
    _devicentity = require("./entity/Device.js");

module.exports = function() {

    var files = {};
    
    function _getTimeFolder() {
        return (new Date()).format("DD-MM-YYYY");
    }   
    
    function _getBasePath() {

        return _global.get("home").working.path;
    }

    function _getEntityRecord(entity) {
        var map = {
            device: _devicentity,
            browser: function() { console.log("[catjs browser info] Not implemented yet"); },
            runner: function() { console.log("[catjs runner info] Not implemented yet"); }
            
        };
        
        return (entity ? map[entity] : undefined);
    }
    
    function _createFS(config) {

        var name, path, filename,
            entity;
        
        if (!config) {
            return undefined;
        }

        name = _utils.getProp({key: "name", obj: config});
        path = _utils.getProp({key: "path", obj: config});
        entity = _utils.getProp({key: "entity", obj: config});
        
        if (!_fs.existsSync(path)) {
            _wrench.mkdirSyncRecursive(path, 0777);
        }

        entity = _getEntityRecord(entity);
        if (entity) { 
            filename = _path.join(path, name);
            if (!_fs.existsSync(filename) ) {
                files[filename] = entity.create(filename);
            }
        } else {
            _utils.error("[catjs info] 'entity' is not valid");
        }
    }
    
    function _getFileSystemInfo(config) {
        
        var id, type, device, entity, model, name,
            time, basepath, path;
        
        if (!config) {
            return undefined;
        }
        
        id = _utils.getProp({key: "id", obj: config});
        type = _utils.getProp({key: "type", obj: config});
        device = _utils.getProp({key: "device", obj: config});
        entity = _utils.getProp({key: "entity", obj: config});
        model = _utils.getProp({key: "model", obj: config});
        
        if (type && device && entity) {
            name = [entity, device, type];
            if (model) {
                name.push(model);
            }
            name = name.join("_") + ".json";
            
        } else {
            _utils.error("[catjs info] Failed to generate the file system path for the test report, some of the arguments are missing or not exists");
            return undefined;
        }

        time = _getTimeFolder();
        basepath = _getBasePath();
        
        if (id) {
            path = _path.join(basepath, "reports", time, id);
            
        } else {
            _utils.error("[catjs info] Failed to generate the file system path for the test report, 'id' argument is nod valid or not exists ");
            return undefined;
        }
             
        return {name: name, path: path};
    }
        
    return {
      
        createFS: function(config) {
            
                      
            if (!config) {
                return undefined;   
            }                     
         
            var fsinfo =  _getFileSystemInfo(config),
                device = _utils.getProp({key: "device", obj: config})
                ;
            if (fsinfo) {
                
                fsinfo.entity = device; 
                _createFS(
                    fsinfo
                );
            }
            
        }
        
    };
    
};