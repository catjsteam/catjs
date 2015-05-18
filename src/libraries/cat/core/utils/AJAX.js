_cat.utils.AJAX = function () {

    function _validate() {
        if (typeof XMLHttpRequest !== "undefined") {
            return true;
        }
        return false;
    }

    if (!_validate()) {
        _cat.utils.log.info("[catjs ajax] Not valid AJAX handle was found");
        return {};
    }

    var _queue = [],
        _running = 0;
    
    
    function _execAsync() {
        var currentxmlhttp,
            requestHeaderList,
            data, type,
            config,
            xmlhttp;
        
        if (_running === 0 && _queue.length > 0) {
            currentxmlhttp = _queue.shift();
            config = currentxmlhttp.config;
            xmlhttp = currentxmlhttp.xmlhttp;
            
            xmlhttp.open(config.method, config.url, config.async);

            requestHeaderList = config.headers;
            if (requestHeaderList) {
                requestHeaderList.forEach(function(header) {
                    
                    if (header) {
                        xmlhttp.setRequestHeader(header.name, header.value);
                    }
                });
            }
            
            data = config.data;
            type = _cat.utils.Utils.getType(data);
            if (type !== "string") {
                try {
                    data = JSON.stringify(data);
                } catch (e) {
                    _cat.utils.log.warn("[catjs ajax] failed to serialize the post request data ");
                }
            }

            xmlhttp.send(data);
            _running++;
        }
    }
    
    return {

        /**
         * @deprecated use sendRequestAsync
         *
         * @param config
         *      url - The url to send
         *      method - The request method
         *     
         */     
        sendRequestSync: function (config) {

            _cat.core.log.error("[CAT AJAX] AJAX Sync call functionality is deprecated, use sendRequestAsync method instead \n");
            return undefined;
            
            
            /*
            var xmlhttp = new XMLHttpRequest();
           
            // config.url = encodeURI(config.url);
            _cat.core.log.info("[catjs AJAX] Sending REST request: " + config.url);

            try {
                xmlhttp.open((config.method || "GET"), config.url, false);
                xmlhttp.send();
                
            } catch (err) {
                _cat.core.log.warn("[CAT AJAX] error occurred: ", err, "\n");

            }
            
            return xmlhttp;
            */

        },

        /**
         * TODO Not tested.. need to be checked
         * TODO pass arguments on post
         *
         * @param config
         *      url {String} The url to send
         *      header {Array} The request header objects
         *          object: header {String} The header name 
         *                  value {String} The header value
         *      method {String} The request method
         *      data {*} The data to be passed in case of post method is being used
         *      onerror {Function} [optional] error listener
         *      onreadystatechange {Function} [optional] ready listener
         *      callback {Function} [optional] instead of using onreadystatechange this callback will occur when the call is ready
         */
        sendRequestAsync: function(config) {
            
            var xmlhttp = new XMLHttpRequest(),
                data = ("data" in config ? config.data : undefined),
                requestHeader, requestHeaderType, requestHeaderList,
                onerror = function (e) {
                    _cat.core.log.error("[catjs AJAX Util] failed to process request:", ( config || " undefined "), " \ncheck catjs server configuration  \nError: ", e, "\n");
                },
                onreadystatechange = function () {
                    
                    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                        // _cat.core.log("completed\n" + xmlhttp.responseText);
                        if ("callback" in config && config.callback) {
                            config.callback.call(this, xmlhttp);
                        }

                        _running--;
                        _execAsync();
                    }
                };


            requestHeader = ("header" in config ? config.header : undefined);
            if (requestHeader) {
                requestHeaderType = _cat.utils.Utils.getType(requestHeader);
                
                if (requestHeaderType === "object") {
                    requestHeaderList = [requestHeader];
                    
                } else if (requestHeaderType === "array") {
                    requestHeaderList = requestHeader;
                }
                
               
            }
            
            xmlhttp.onreadystatechange = (("onreadystatechange" in config) ? config.onreadystatechange : onreadystatechange);
            xmlhttp.onerror = (("onerror" in config) ? config.onerror : onerror);

            _queue.push({xmlhttp: xmlhttp, config:{data: data, headers: requestHeaderList, method: (config.method || "GET"), url: config.url, async: true}});

            _execAsync();
           
        }

    };

}();