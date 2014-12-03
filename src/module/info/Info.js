var _BaseInfo = require("./Base.js"),
    _baseinfo = new _BaseInfo(),
    _utils = catrequire("cat.utils");

module.exports = function () {

    return {

        /**
         * Set the incoming data to the proper report file by its entity
         * 
         * @param config
         *          id {String} The test id
         *          device {String} The target device ["device" | "browser"]
         *          type {String} The device type e.g. android, ios, chrome, etc...
         *          entity {String} The test entity ["info" | "test" | "junit"]
         *          data {Object} The data to be saved in the target report file
         */
        set: function (config) {
                        
                
            if (!config) {
                return undefined;
            }
            
            _utils.prepareProps({
                global: {obj: config},
                props: [
                    {key: "id", require: true},
                    {key: "device", require: true},
                    {key: "type", require: true},
                    {key: "entity", require: true},
                    {key: "model"},
                    {key: "data"}
                ]
            });

            _baseinfo.updateFS({
                id: config.id,
                device: config.device,
                type: config.type,
                entity: config.entity,
                data: config.data,
                model : config.model
            });
          
            
        }
        
    };

}();