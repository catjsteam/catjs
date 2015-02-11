_cat.utils.AJAX = function () {

    function _validate() {
        if (typeof XMLHttpRequest !== "undefined") {
            return true;
        }
        return false;
    }

    if (!_validate()) {
        console.log("[CAT AJAX] Not valid AJAX handle was found");
        return {};
    }

    var _queue = [],
        _running = 0;
    
    
    function _execAsync() {
        var currentxmlhttp;
        
        if (_running === 0 && _queue.length > 0) {
            currentxmlhttp = _queue.shift();

            currentxmlhttp.xmlhttp.open(currentxmlhttp.config.method, currentxmlhttp.config.url, currentxmlhttp.config.async);
            currentxmlhttp.xmlhttp.send();
            _running++;
        }
    }
    
    return {

        /**
         * TODO pass arguments on post
         *
         * @param config
         *      url - The url to send
         *      method - The request method
         *      args - TODO
         */
        sendRequestSync: function (config) {

            var xmlhttp = new XMLHttpRequest();
            // TODO
            // config.url = encodeURI(config.url);
            _cat.core.log.info("[catjs ajax] sending REST request: " + config.url);

            try {
                xmlhttp.open(("GET" || config.method), config.url, false);
                xmlhttp.send();
                
            } catch (err) {
                _cat.core.log.warn("[CAT CHAI] error occurred: ", err, "\n");

            }
            
            return xmlhttp;

        },

        /**
         * TODO Not tested.. need to be checked
         * TODO pass arguments on post
         *
         * @param config
         *      url - The url to send
         *      method - The request method
         *      args - TODO
         *      onerror - [optional] error listener
         *      onreadystatechange - [optional] ready listener
         *      callback - [optional] instead of using onreadystatechange this callback will occur when the call is ready
         */
        sendRequestAsync: function(config) {
            
            var xmlhttp = new XMLHttpRequest(),
                onerror = function (e) {
                    _cat.core.log.error("[CAT CHAI] error occurred: ", e, "\n");
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


            xmlhttp.onreadystatechange = (("onreadystatechange" in config) ? config.onreadystatechange : onreadystatechange);
            xmlhttp.onerror = (("onerror" in config) ? config.onerror : onerror);

            _queue.push({xmlhttp: xmlhttp, config:{method: ("GET" || config.method), url: config.url, async: true}});

            _execAsync();
           
        }

    };

}();