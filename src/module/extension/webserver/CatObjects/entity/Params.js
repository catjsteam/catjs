

module.exports = function(config) {

    var me = this;
    
    function _init(params) {
        var key;

        for (key in params) {
            if (params.hasOwnProperty(key)) {
                me[key] = params[key];
            }
        }
    }
    
    if (!config) {
        return undefined;
    }

    if ("params" in config && config.params) {
        _init(config.params);
    }

};