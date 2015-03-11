if (typeof(_cat) !== "undefined") {

    _cat.utils.Utils = function () {

        var _module = {

            /**
             * check if the path argument exists in the current location  
             *
             * @param path {*} a given path list of type Array or String
             * @returns {boolean} whether one of the path exists
             */
            pathMatch: function (path) {
                var location = window.location.href,
                    type, n=0;

                if (path) {
                    type = _cat.utils.Utils.getType(path);
                    if (type === "string") {
                        path = [path];
                    }

                    path.forEach(function (item) {
                        if (item) {
                            if (location.indexOf(path) !== -1) {
                                n++;
                            }
                        }
                    });
                } else {
                    return true;
                }

                return (n > 0 ? true : false);
            },

            isEmpty: function (srcobj) {
                var key,
                    n = 0,
                    result = false;

                if (!srcobj) {
                    return true;
                }

                if (Object.keys) {
                    result = (Object.keys(srcobj).length === 0);

                } else {
                    for (key in srcobj) {
                        if (srcobj.hasOwnProperty(key)) {
                            n++;
                            break;
                        }
                    }

                    result = (n === 0);
                }

                return result;
            },

            /**
             * Setting the reference object with default values or undefined for unassigned properties
             * e.g. { global: {obj: obj}, props: [{key: "test", default: 1}] }
             *
             *
             * @param value {Object} props values
             *          global {Object} global references
             *               obj {Object} [optional] The object to be copied the property from
             *
             *          props {Array} prop value
             *              key {String} The property key
             *              obj {Object} [optional] The object to be copied the property from
             *              default {Object} [optional] A default value
             *              require {Boolean} Warning about undefined value, default set to false
             *
             */
            prepareProps: function (value) {

                var globalreference, refobj;

                if (value) {
                    if ("global" in value && value.global) {
                        globalreference = value.global.obj;
                    }
                    if ("props" in value && value.props && _module.getType(value.props) === "array") {
                        value.props.forEach(function (prop) {

                            var defaultval;

                            if (!("require" in prop)) {
                                prop.require = false;
                            }
                            if (!("key" in prop)) {
                                throw new Error("[catjs utils] 'key' is a required property for method 'getProps' ");
                            }

                            defaultval = ("default" in prop ? prop.default : undefined);
                            refobj = ("obj" in prop ? prop.obj : globalreference);

                            refobj[prop.key] = (prop.key in refobj ? refobj[prop.key] : defaultval);

                            if (prop.require && (refobj[prop.key] === undefined || refobj[prop.key] === null)) {
                                throw new Error("[catjs utils prepareProps] property '" + prop.key + "' is required ");
                            }


                        });
                    }
                }
            },

            getCatjsServerURL: function (url) {

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

            querystring: function (name, query) {
                var re, r = [], m;

                re = new RegExp('(?:\\?|&)' + name + '=(.*?)(?=&|$)', 'gi');
                while ((m = re.exec(query || document.location.search)) != null) {
                    r[r.length] = m[1];
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

        (function () {
            var types = ['Array', 'Function', 'Object', 'String', 'Number'],
                typesLength = types.length;

            function _getType(type) {
                return function (o) {
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
        utils: {
            Utils: {}
        }
    };

}
_cat.utils.Utils.generateGUID = function () {

    //GUID generator
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    function guid() {
        return [S4(), S4(), "-", S4(), "-", S4(), "-", S4(), "-", S4(), S4(), S4()].join("");
    }

    return guid();
};

_cat.utils.Utils.extExists = function (value) {
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

