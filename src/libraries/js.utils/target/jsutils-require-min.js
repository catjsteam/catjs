/**
 * @license RequireJS domReady 2.0.1 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/domReady for details
 */
/*jslint */
/*global require: false, define: false, requirejs: false,
 window: false, clearInterval: false, document: false,
 self: false, setInterval: false */


define('libDomReady',[],function () {
    

    var isTop, testDiv, scrollIntervalId,
        isBrowser = typeof window !== "undefined" && window.document,
        isPageLoaded = !isBrowser,
        doc = isBrowser ? document : null,
        readyCalls = [];

    function runCallbacks(callbacks) {
        var i;
        for (i = 0; i < callbacks.length; i += 1) {
            callbacks[i](doc);
        }
    }

    function callReady() {
        var callbacks = readyCalls;

        if (isPageLoaded) {
            //Call the DOM ready callbacks
            if (callbacks.length) {
                readyCalls = [];
                runCallbacks(callbacks);
            }
        }
    }

    /**
     * Sets the page as loaded.
     */
    function pageLoaded() {
        if (!isPageLoaded) {
            isPageLoaded = true;
            if (scrollIntervalId) {
                clearInterval(scrollIntervalId);
            }

            callReady();
        }
    }

    if (isBrowser) {
        if (document.addEventListener) {
            //Standards. Hooray! Assumption here that if standards based,
            //it knows about DOMContentLoaded.
            document.addEventListener("DOMContentLoaded", pageLoaded, false);
            window.addEventListener("load", pageLoaded, false);
        } else if (window.attachEvent) {
            window.attachEvent("onload", pageLoaded);

            testDiv = document.createElement('div');
            try {
                isTop = window.frameElement === null;
            } catch (e) {}

            //DOMContentLoaded approximation that uses a doScroll, as found by
            //Diego Perini: http://javascript.nwbox.com/IEContentLoaded/,
            //but modified by other contributors, including jdalton
            if (testDiv.doScroll && isTop && window.external) {
                scrollIntervalId = setInterval(function () {
                    try {
                        testDiv.doScroll();
                        pageLoaded();
                    } catch (e) {}
                }, 30);
            }
        }

        //Check if document already complete, and if so, just trigger page load
        //listeners. Latest webkit browsers also use "interactive", and
        //will fire the onDOMContentLoaded before "interactive" but not after
        //entering "interactive" or "complete". More details:
        //http://dev.w3.org/html5/spec/the-end.html#the-end
        //http://stackoverflow.com/questions/3665561/document-readystate-of-interactive-vs-ondomcontentloaded
        //Hmm, this is more complicated on further use, see "firing too early"
        //bug: https://github.com/requirejs/domReady/issues/1
        //so removing the || document.readyState === "interactive" test.
        //There is still a window.onload binding that should get fired if
        //DOMContentLoaded is missed.
        if (document.readyState === "complete") {
            pageLoaded();
        }
    }

    /** START OF PUBLIC API **/

    /**
     * Registers a callback for DOM ready. If DOM is already ready, the
     * callback is called immediately.
     * @param {Function} callback
     */
    function domReady(callback) {
        if (isPageLoaded) {
            callback(doc);
        } else {
            readyCalls.push(callback);
        }
        return domReady;
    }

    domReady.version = '2.0.1';

    /**
     * Loader Plugin API method
     */
    domReady.load = function (name, req, onLoad, config) {
        if (config.isBuild) {
            onLoad(null);
        } else {
            domReady(onLoad);
        }
    };

    /** END OF PUBLIC API **/

    return domReady;
});
var _jsutilsModuleArray = function () {

    var _vars = {};

    return {

        internal: function(refs) {
            _vars = refs;

        },

        /**
         * Clean empty entries out of an existing array
         *
         * @param arr {Array} The array to be cleaned
         * @returns {Array} The new cleaned Array
         */
        cleanupArray: function (arr) {
            var newArr = [];

            if (arr && _vars._.isArray(arr)) {
                arr.forEach(function (item) {
                    if (item !== null && item !== undefined) {
                        newArr.push(item)
                    }
                });
            }

            return newArr;
        },


        /**
         * Remove Array's item
         *
         * @param arr {Array} The given array
         * @param value {Object} The value to be removed
         * @returns {Array} The new Array
         */
        removeArrayItemByValue: function (arr, value) {
            var newArr = [],
                counter = 0;

            if (arr && _vars._.isArray(arr)) {

                arr.forEach(function (item) {
                    if (item !== value && item !== null && item !== undefined) {
                        newArr.push(item);
                    }
                    counter++;
                });
            }

            return newArr;
        }
    };
}();

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        // nodejs support
        _jsutilsModuleArray.internal({_: require("underscore")});
        module.exports = _jsutilsModuleArray;

    }
} else {
    define('jsutilsArrayModule',["underscore"], function () {
        // browser support
        _jsutilsModuleArray.internal({_: _});
        return _jsutilsModuleArray;
    });
};
var _jsutilsModuleObject = function () {

    var _vars = {};

    return {

        internal: function(refs) {
            _vars = refs;

        },

        /**
         *  Check if a given object contains a value
         *
         * @param obj The referenced object
         * @param value The value to be searched
         *
         * @returns {boolean} If the value contains in the obj return true else return false
         */
        contains: function (obj, value) {
            var key;

            if (obj) {
                for (key in obj) {
                    if (_vars._.isObject(value) || _vars._.isArray(value)) {
                        if (JSON.stringify(obj[key]) === JSON.stringify(value)) {
                            return true;
                        }

                    } else {
                        if (obj[key] === value) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },

        /**
         * Copy the source object's properties to the destination object.
         * TODO TBD make it more robust, recursion and function support
         *
         * @param srcobj The source object
         * @param destobj The destination object
         * @param override Override existing property [false as default]
         */
        copy: function (srcobj, destobj, override) {

            var name, obj,
                me = this,
                idx = 0, size = 0, item;

            override = (override || false);

            if (srcobj && destobj) {
                for (name in srcobj) {

                    if (srcobj.hasOwnProperty(name)) {

                        obj = destobj[name];

                        if (_vars._.isArray(srcobj[name])) {

                            if (!obj) {
                                destobj[name] = srcobj[name];

                            } else if (_vars._.isArray(obj)) {

                                _vars.arrayutils.cleanupArray(srcobj[name]);
                                if (override) {
                                    destobj[name] = srcobj[name];

                                } else {
                                    size = destobj[name].length;
                                    for (idx = 0; idx < size; idx++) {
                                        item = obj[idx];
                                        srcobj[name] = _vars.arrayutils.removeArrayItemByValue(srcobj[name], item);
                                    }
                                    destobj[name] = destobj[name].concat(srcobj[name]);
                                }
                            }

                        } else if (_vars._.isObject(srcobj[name])) {
                            if (!destobj[name]) {
                                destobj[name] = {};
                            }
                            arguments.callee.call(me, srcobj[name], destobj[name], override);

                        } else {
                            if (override || obj === undefined) {
                                if (!destobj[name] || (destobj[name] && override)) {
                                    destobj[name] = srcobj[name];
                                }
                            }
                        } 

                    }
                }
            }
        },

        /**
         * Is the object empty ?
         *
         * @param srcobj {Object} The object reference
         * @returns {boolean} If the object is null || undefined || has no values {} return true or else false
         */
        empty: function(srcobj) {

            var key,
                n= 0,
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
         * Inspect a given string and try to resolve its object
         *
         * @param obj The reference object
         * @param query The query to apply over the referenced object
         */
        resolve: function (obj, query) {

            if (!obj || !query) {
                return obj;
            }

            var keys = query.split("."),
                size = keys.length,
                counter = 0,
                key;

            while (counter < size) {
                key = keys[counter];
                if (key && obj[key]) {
                    obj = obj[key];
                    counter++;
                } else {
                    counter = size;
                    console.warn("[js.utils Object] resolve failed: ", query);
                    return null;
                }
            }

            return obj;
        }

    };
}();


if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        // nodejs support
        _jsutilsModuleObject.internal({
            _: require("underscore"),
            arrayutils: require("./Array.js")
        });
        module.exports = _jsutilsModuleObject;

    }
} else {
    define('jsutilsObjectModule',["underscore", "jsutilsArrayModule"], function(underscoreref, arrayref) {

        _jsutilsModuleObject.internal({_: _, arrayutils: arrayref});
        return _jsutilsModuleObject;
    });
}

;
var _jsutilsUnderscore ,
    _jsutilsModuleTemplate = function () {

        var _cache = {},
            _vars = {},
            _defaultUnderscoreSettings,
            _isMustache = false;


        return {

            setMustache: function (bool) {
                _isMustache = bool;

                if (_isMustache) {
                    // underscore settings for like mustache parametrization style {{foo}}
                    _vars._.templateSettings = {
                        interpolate: /\{\{(.+?)\}\}/g
                    };

                } else {
                    _vars._.templateSettings = _defaultUnderscoreSettings;
                }
            },

            isMustache: function () {
                return _isMustache;
            },

            internal: function (refs) {
                _vars = refs;
                _defaultUnderscoreSettings = _vars._.templateSettings;
            },

            underscore: _vars._,

            /**
             * Load template file content of tpl type
             * Note: No need for the extension on the file name
             *
             * @param name The name of the template e.g. /scraps/test
             * @param path The full path where the templates exists (optional) e.g. /home/../test
             * @returns {*}
             */
            readTemplateFile: function (name, path) {
                if (!path) {
                    _vars.log.error("[js.utils Template.readTemplateFile] 'path' argument is no valid ");
                }

                var content,
                    file = [path, name].join("/");

                file = _vars.path.normalize(file);

                try {
                    file = [file, "tpl"].join(".");
                    content = _cache[file];
                    if (!content) {
                        content = _vars.fs.readFileSync(file, "utf8");
                    }

                    // cache the file content
                    _cache[file] = content;

                } catch (e) {
                    _vars.log.warn("[js.utils Template.readTemplateFile] File failed to load ", file, e);
                }

                return content;
            },

            /**
             * Load and compile template with underscore
             *
             * @param config The params:
             *      name The name of the template e.g. /scraps/test (optional in case content exists)
             *      path The full path where the templates exists (optional) e.g. /home/../test.tpl
             *      content The string content instead of the file content (optional in case name exists & overrides the file content)
             *      data The data object properties (see underscore template)
             */
            template: function (config) {
                if (!config) {
                    return undefined;
                }
                var name = config.name,
                    path = config.path,
                    data = config.data,
                    content = config.content,
                    funcTpl = (content || this.readTemplateFile(name, path)),
                    template;

                if (funcTpl) {
                    template = _vars._.template(funcTpl);

                } else {
                    _vars.log.warn("[js.utils Template.template] Failed to process template ");
                    return undefined;
                }

                if (template) {
                    return template(data);
                }
            }
        }

    }();

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        // nodejs support

        _jsutilsUnderscore = require("underscore");

        _jsutilsModuleTemplate.internal({
            fs: require("fs"),
            log: require("./Logger.js"),
            path: require("path"),
            _: _jsutilsUnderscore
        });
        module.exports = _jsutilsModuleTemplate;

    }
} else {
    define('jsutilsTemplateModule',["underscore"], function (underscore) {
        // browser support
        _jsutilsModuleTemplate = function () {

            var _defaultUnderscoreSettings = _.templateSettings,
                _isMustache = false;


            return {

                setMustache: function (bool) {
                    _isMustache = bool;

                    if (_isMustache) {
                        // underscore settings for like mustache parametrization style {{foo}}
                        _.templateSettings = {
                            interpolate: /\{\{(.+?)\}\}/g
                        };

                    } else {
                        _.templateSettings = _defaultUnderscoreSettings;
                    }
                },

                isMustache: function () {
                    return _isMustache;
                },

                /**
                 * Load and compile template with underscore
                 *
                 * @param config The params:
                 *      name The name of the template e.g. /scraps/test (optional in case content exists)
                 *      path The full path where the templates exists (optional) e.g. /home/../test.tpl
                 *      content The string content instead of the file content (optional in case name exists & overrides the file content)
                 *      data The data object properties (see underscore template)
                 */
                template: function (config) {
                    if (!config) {
                        return undefined;
                    }
                    var data = config.data,
                        content = config.content,
                        template;

                    if (content) {
                        template = _.template(content);

                    } else {
                        console.warn("[js.utils Template.template] Failed to process template ");
                        return undefined;
                    }

                    if (template) {
                        return template(data);
                    }
                }
            }
        }();
        return _jsutilsModuleTemplate;
    });
};

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        // nodejs support

        var _global = require("./utils/Global.js");

        module.exports = function () {

            var _module = {

                Object: require("./utils/Object.js"),
                Array: require("./utils/Array.js"),
                Template: require("./utils/Template.js"),
                NPM: require("./utils/NPM.js"),
                Task: require("./utils/Task.js"),

                // require libxmljs in case of enable
                // XML: require("./utils/XML.js"),

                init: function (config) {
                    if (config) {
                        if ('log' in config) {
                            _global.set("log", config.log);
                        }
                    }
                },

                testlog: function () {
                    require("./utils/Logger.js").log(".... testing the log... ");
                }

            };

            return _module;

        }();

    }

} else {

    define('jsutils',["jsutilsObjectModule", "jsutilsArrayModule", "jsutilsTemplateModule"], function (obj, arr, tpl) {

        var _jsutils = function() {
            
            var __jsutils = {};
                
            return {
                
                init: function(obj, arr, tpl) {

                    __jsutils.jsutilsObject = obj;
                    __jsutils.jsutilsArray = arr;
                    __jsutils.jsutilsTemplate = tpl; 
                    __jsutils.listen = function(jsutilsOnReady) {

                        var jsutilsOnReadyListener,
                            jsutilsOnReadyDefaultListener = function () {
                                console.log("js.utils is ready (jsutilsReady callback can be overriden [e.g. jsutilsOnReady=function(obj, arr, tpl){}]");
                            };

                        if (typeof jsutilsOnReady !== "undefined") {
                            jsutilsOnReadyListener = jsutilsOnReady;
                        } else {
                            jsutilsOnReadyListener = jsutilsOnReadyDefaultListener;
                        }
                        jsutilsOnReadyListener.call(jsutils, obj, arr, tpl);
                    }; 
                    
                },
                
                getJSUtils: function() {
                    return __jsutils;
                }                               
            }
            
        },
        
        jsutilsh = new _jsutils();

        jsutilsh.init(obj, arr, tpl);
        
        return jsutilsh; 
            
    });


};
var jsutils = {};

jsutils.jsutilsObject = {};
jsutils.jsutilsArray = {};
jsutils.jsutilsTemplate = {};

/**
 * RequireJS Main Configuration
 */
require.config({

    baseUrl: ".",

    paths: {
        "underscore": "node_modules/underscore/underscore-min",
        "jsutilsObjectModule": "utils/Object",
        "jsutilsArrayModule": "utils/Array",
        "jsutilsTemplateModule": "utils/Template",
        "libDomReady": "lib/domReady"
    },

    shim: {
        'underscore': {
            exports: "_"
        },
        'jsutilsObjectModule': {
            deps: ['underscore']          
        }, 
        'jsutilsArrayModule': {
            deps: ['underscore']          
        },
        'jsutilsTemplateModule': {
            deps: ['underscore']          
        }
    },
    
    out: "jsutils-min.js",
    name: "jsutils"

});


require(["libDomReady", "jsutils"], function (domReady, jsutilsref) {
    domReady(function () {
        
        jsutils = jsutilsref.getJSUtils();
               
    });
});

//require(["libDomReady", "jsutilsObjectModule", "jsutilsArrayModule", "jsutilsTemplateModule"], function (domReady, obj, arr, tpl) {
//    domReady(function () {
//
//        var jsutilsOnReadyListener,
//            jsutilsOnReadyDefaultListener = function() {
//                console.log("js.utils is ready (jsutilsReady callback can be overriden [e.g. jsutilsOnReady=function(obj, arr, tpl){}]");
//            };
//
//        jsutils.jsutilsObject = obj;
//        jsutils.jsutilsArray =  arr;
//        jsutils.jsutilsTemplate =  tpl;
//
//        if (typeof jsutilsOnReady !== "undefined") {
//            jsutilsOnReadyListener = jsutilsOnReady;
//        } else {
//            jsutilsOnReadyListener = jsutilsOnReadyDefaultListener;
//        }
//        jsutilsOnReadyListener.call(jsutils, obj, arr, tpl);
//    });
//});

define("jsutilswebRequire", function(){});

