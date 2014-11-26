var  _utils = catrequire("cat.utils"),
    _JSONUtils = catrequire("cat.jsonutils");

module.exports = function() {
  
    function _Record(config) {
        
        if (!config) {
            return undefined;
        }
        
        var me = this;
        
        this.filename = _utils.getProp({key: "filename", obj: config}); 
        this.data = [];
      
    }
    
    _Record.prototype.add = function(record) {
        this.data.push(record);
    };
    
    _Record.prototype.write = function() {
        
        _JSONUtils.write({
            filename: this.filename,
            content: JSON.stringify(this.data)
        });
        
    };
    
    return {
        
        create: function(filename, write) {
            
            var record = new _Record({filename: filename});
            
            write (write === undefined ? true : write);
            if (write) {
                record.write();
            }
                        
        },
        
        update: function(config) {
         
            var data, record;

            data = _utils.getProp({key: "data", obj: config});   
            record = _utils.getProp({key: "record", obj: config});
            
            if (record && data) {
                record.add(data);
            }
        }
        
    };
}();