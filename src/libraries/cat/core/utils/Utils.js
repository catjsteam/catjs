if (typeof(_cat) !== "undefined") {

    _cat.utils.Utils = function () {

        var _module = {

            getCatjsServerURL: function(url) {

                var catConfig = _cat.core.getConfig(),
                    port = catConfig.getPort(),
                    host = catConfig.getIp(),
                    method = catConfig.getMethod(),
                    slashPos = -1;

                if (url) {
                    slashPos = url.indexOf("/");
                    if (slashPos !== 0) {
                        url = "/" + url;
                    }
                } else {
                    url = "/";
                }
                
                return [method, "://", host, ":", port, url].join("");
                
            },
            
            querystring: function(name, query){
                var re, r=[], m;

                re = new RegExp('(?:\\?|&)' + name + '=(.*?)(?=&|$)','gi');
                while ((m=re.exec(query  || document.location.search)) != null) {
                    r[r.length]=m[1];
                }
                return (r && r[0] ? r[0] : undefined);
            },

            getType: function (obj) {
                if (!obj) {
                    return undefined;
                }
                return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();

            },

            getMatchValue: function (pattern, text) {

                var regexp = new RegExp(pattern),
                    results;

                if (regexp) {
                    results = regexp.exec(text);
                    if (results &&
                        results.length > 1) {
                        return results[1];
                    }
                }

                return results;

            },

            /**
             * Validates an object and availability of its properties
             *
             */
            validate: function (obj, key, val) {
                if (obj) {

                    // if key is available
                    if (key !== undefined) {

                        if (key in obj) {

                            if (obj[key] !== undefined) {

                                if (val !== undefined) {
                                    if (obj[key] !== val) {
                                        return false;
                                    }
                                }

                                return true;
                            }

                        }

                        return false;


                    } else {

                        return true;
                    }

                }

                return false;
            }
        };

        (function(){
            var types = ['Array','Function','Object','String','Number'],
                typesLength = types.length;

            function _getType(type){
                return function(o) {
                    return !!o && ( Object.prototype.toString.call(o) === '[object ' + type + ']' );
                };
            }
            
            while (typesLength--) {
                                
                _module['is' + types[typesLength]] = _getType(types[typesLength]);
            }
        })();
        
        return _module;

    }();


} else {

    var _cat = {
        utils:{
            Utils:{}
        }
    };

}
_cat.utils.Utils.generateGUID = function () {

    //GUID generator
    function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    function guid() {
        return [S4(),S4(),"-",S4(),"-",S4(),"-",S4(),"-",S4(),S4(),S4()].join("");
    }

    return guid();
};

_cat.utils.Utils.extExists = function(value) {
    var pos;
    if (value) {
        pos = value.lastIndexOf(".");
        if (pos !== -1) {
            if (value.lastIndexOf(".js") !== -1 || value.lastIndexOf(".css") !== -1) {
                return true;
            }
        }
    }
    return false;
};

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        // nodejs support

        module.exports.generateGUID = _cat.utils.Utils.generateGUID;
        module.exports.extExists = _cat.utils.Utils.extExists;

    }
}

