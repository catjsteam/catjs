var  _utils = catrequire("cat.utils"),
    _JSONUtils = catrequire("cat.jsonutils"),
    _ = require("underscore"),
    _fs = require("fs");

module.exports = function() {

    function _Record(config) {

        if (!config) {
            return undefined;
        }

        var me = this;

        this.filename = _utils.getProp({key: "filename", obj: config});
        this.data  = (config.data || {});

        this.init();

    }

    _Record.prototype.init = function() {
  
    };
    
    _Record.prototype.add = function(record) {
        if (_.isArray(record) && _.isArray(this.data)) {
            this.data = this.data.concat(record);
        } else {
            this.data = record;
        }
    };

    _Record.prototype.put = function(key, record) {
        if (_.isObject(this.data)) {
            this.data[key] = record;
        }
    };

    _Record.prototype.set = function(record) {
        this.data = record;
    };

    _Record.prototype.read = function() {

        var content = _JSONUtils.read({
            filename: this.filename
        });

        if (content) {
            content = JSON.parse(content);
            this.add(content);
        }
    };

    _Record.prototype.write = function() {

        var content = (_.isString(this.data) ? this.data : JSON.stringify(this.data));
        
        _JSONUtils.write({
            filename: this.filename,
            content: content,
            opt: {mode: 0777}
        });

    };

    return {

        setProto: function(key, value) {
            _Record.prototype[key] = value;
        },
        
        /**
         * If the file does not exists it will be created
         * The data will append to the array data object
         *
         * @param filename
         * @param data
         * @param write
         */
        update: function(filename, data, write) {

            var record;

            record = new _Record({
                filename: filename
            });

            write = (write === undefined ? true : write);
            if (data) {
                record.add(data);
            }
            if (write) {
                record.write();
            }

            return record;
        }

    };
};