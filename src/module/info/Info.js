var _JSONUtils = catrequire("cat.jsonutils"),
    _wrench = require("wrench"),
    _BaseInfo = require("./Base.js"),
    _baseinfo = new _BaseInfo();

module.exports = function () {

    return {

        /**
         * set info to a test entry
         * 
         * @param config
         */
        set: function (config) {
                        
                
            if (!config) {
                return undefined;
            }

            /**
             * TODO switch case for creating or updating the FS 
             
            _baseinfo.createFS({
                id: "t-b-b",
                device: "device",
                type: "android",
                entity: "info",
                data: {}
            });
            */
            
        }
        
    };

}();