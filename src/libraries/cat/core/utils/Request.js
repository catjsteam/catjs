_cat.utils.Request = function () {
   
    return {

        /**
         * Generates request for catjs monitoring server
         * 
         * @param config {Object} The main object
         *      service {String} The service url name
         *      params {Object} Request parameters
         *      cache {Boolean} Enable url cache
         *      
         * @returns {*}
         */
        generate: function(config) {

            var service = config.service, 
                paramsarg = config.params,
                params = [],
                key, param, counter= 0,
                uri;
            
            function getURI() {
                var catconfig,
                    method, ip, port,
                    uri;

                catconfig = _cat.core.getConfig();
                if (catconfig) {
                    method = catconfig.getMethod();
                    ip = catconfig.getIp();
                    port = catconfig.getPort();

                    uri = [method, "://", ip, ":", port, "/", service].join("");
                }
                
                return uri;
            }
            
            function _addKey(params, key, param) {
                params.push(key);
                params.push("=");
                params.push(param);
            }

            if ("cache" in config && params) {
                params.cache = (new Date()).toUTCString();
            }
            
            for (key in paramsarg) {
                if (paramsarg.hasOwnProperty(key)) {
                    param = paramsarg[key];
                    if (param) {
                        if (counter === 0) {
                            params.push("?");
                        } else {
                            params.push("&");
                        }
                        _addKey(params, key, param);
                        counter++;
                    }
                }
            }                        

            uri = getURI();
            if (!uri) {
                _cat.core.log.error("[catjs request] Failed to resolve catjs server address");
                
                return undefined;
            }
            
            return [uri, params.join("")].join("");
                          
        }    
        
    };

}();
