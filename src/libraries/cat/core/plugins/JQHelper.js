/**
 * JQuery / JQlite (Angular) helper 
 * 
 * Common layer to make a smooth bridge between the functionality
 * 
 * @type {_cat.utils.plugins.jqhelper}
 */
_cat.utils.plugins.jqhelper = function() {
    
    var _module = {

        isjquery: function() {
            if (typeof $ !== "undefined") {
                return true;
            }
            return false;
        },
        
        isangular: function() {
            if (typeof angular !== "undefined") {
                return true;
            }
            return false;
        },
        
        /**
         * Get the jquery or jqlite handle
         * 
         * @param autodetect {String} if "*" auto detect the returned handle or else specify [jqlite | jquery]
         * @returns {*}
         */
        $: function(autodetect) {
            
            var _methods = {},
                    _map = {};
            
            autodetect = (autodetect || "*");

            _methods._empty = function() {
                return function(element){
                    var elt;
                    
                    if (element) {
                        
                        if (typeof element === "object") {
                            return element;
                            
                        } else if (typeof element === "string") {
                            elt = document.getElementById(element);
                            
                            if (!elt) {
                                elt = document.querySelector(element);
                            }                                                        
                        }
                    }
                    
                    return elt;                                        
                };
            };

            _methods._jqlite = function() {
                if (_module.isangular()) {
                    return angular.element;
                }
                return undefined;
            };
            
            _methods._jquery = function() {
                if (_module.isjquery()) {
                    return $;
                }
                return undefined;
            };
            
            _map["angular"] = function() {
                return (_methods._jqlite() || _methods._empty());
            };
            
            _map["jquery"] = function() {
                return (_methods._jquery() || _methods._empty());
            };
            
            _map["*"] = function() {
                var _$ =  (_methods._jquery() || _methods._jqlite());
                return (_$ || _methods._empty());
            };
            
            if (!(autodetect in _map)) {
                _cat.core.log.warn("[catjs jqhelper plugin] no valid functionality for :", autodetect);
            }
            return _map[autodetect].call(this);
        },

        /**
         * Get a generic element depends on the autodetect argument 
         * 
         * @param val {*} an element reference or a string DOM query
         * @param autodetect {String} if "*" auto detect the returned handle or else specify [jqlite | jquery]
         * @returns {*}
         */
        getElt: function (val, autodetect) {
            var sign,
                _$ = _module.$(autodetect);
            
            if ( typeof val === "string") {
                val = val.trim();
                sign = val.charAt(0);

                return (_$ ? _$(val) : undefined);

            } else if (typeof val === "object") {
                return _$(val);
            }
        },

        /**
         * Trigger an event with a given object
         *
         * @param element {Object} The element to trigger from (The element JQuery representation id/class or the object itself)
         * @param eventType {String} The event type name
         * @param autodetect {String} if "*" auto detect the returned handle or else specify [jqlite | jquery]
         *
         * @private
         */
        trigger: function () {
            
            // args[0] element | args[1] eventType | args[2] autodetect
            var e, newEvent, newEventOpt, idx = 0, size,
                args = arguments,
                autodetect = args[2],
                elt = (args ? _module.getElt( args[0], autodetect) : undefined),
                eventType = (args ? args[1] : undefined),
                typeOfEventArgument = _cat.utils.Utils.getType(eventType),
                typeOfEventArrayItem,
                _$ = _module.$(autodetect),
                isAngular = ( autodetect && autodetect === "angular" ),
                triggerFn = (isAngular ? "triggerHandler" : "trigger"),
                eventFn;

            function getOpt(opt) {
                var key, newOpt = {};
                if (opt) {
                    for (key in opt) {
                        if (opt.hasOwnProperty(key)) {
                            newOpt[key] = opt[key];
                        }
                    }
                    if ("keyCode" in newOpt) {
                        newOpt.which = newOpt.keyCode;

                    } else if ("which" in newOpt) {
                        newOpt.keyCode = newOpt.which;
                    }
                }

                return newOpt;
            }

            function createNewEvent(eventType) {
                var newEventOpt = getOpt(eventType.opt),
                newEvent = _$.Event(eventType.type, newEventOpt);
                
                return newEvent; 
            }
            
            eventFn = function(elt, triggerFn, event, eventType) {
                var opt;
                
                if (!isAngular) {
                    elt[triggerFn](event);
                    
                } else {
                    if (eventType) {
                        if ("opt" in eventType) {
                            opt = getOpt(eventType.opt);
                        }
                        elt[triggerFn](eventType.type, opt);
                        
                    } else {
                        elt[triggerFn](event);
                    }
                }
            };
            
            if (elt && eventType) {
                if (typeOfEventArgument === "string") {
                    eventFn(elt, triggerFn, eventType);

                } else if (typeOfEventArgument === "object") {            
                    newEvent = createNewEvent(eventType);
                    eventFn(elt, triggerFn, newEvent, eventType);

                } else if (typeOfEventArgument === "array" && eventType.length > 0) {
                    size = typeOfEventArgument.length;
                   
                    for (idx = 0; idx < size; idx++) {
                        e = eventType[idx];
                        if (e) {
                            typeOfEventArrayItem = _cat.utils.Utils.getType(eventType);
                            if (typeOfEventArrayItem === "string") {
                                eventFn(elt, triggerFn, e);
                            } else {
                                newEvent = createNewEvent(eventType);
                                eventFn(elt, triggerFn, newEvent, eventType);
                            }

                        }
                    }
                }
            }
        },

        setText: function (idName, value, usevents, callback, autodetect) {
            var _$ = _module.$(autodetect);
            
            if (usevents === undefined) {
                usevents = true;
            }
            
            _$(document).ready(function () {
                var elt = _module.getElt(idName, autodetect);

                if (usevents) {
                    _module.trigger(elt, "mouseenter", autodetect);
                    _module.trigger(elt, "mouseover", autodetect);
                    _module.trigger(elt, "mousemove", autodetect);
                    _module.trigger(elt, "focus", autodetect);
                    _module.trigger(elt, "mousedown", autodetect);
                    _module.trigger(elt, "mouseup", autodetect);
                    _module.trigger(elt, "click", autodetect);
                }

                elt.val(value);

                if (usevents) {
                    _module.trigger(elt, "keydown", autodetect);
                    _module.trigger(elt, "keypress", autodetect);
                    _module.trigger(elt, "keyup", autodetect);
                    _module.trigger(elt, "mousemove", autodetect);
                    _module.trigger(elt, "mouseleave", autodetect);
                    _module.trigger(elt, "mouseout", autodetect);
                    _module.trigger(elt, "blur", autodetect);
                }

                _module.trigger(elt, "input", autodetect);


                if (callback) {
                    return callback.call(this, elt);
                }
            });
        },

        getValue: function(idName, callback, autodetect) {
            _module.$(autodetect)(document).ready(function () {
                var elt = _module.getElt(idName, autodetect);
                elt.val();

                if (callback) {
                    return callback.call(this, elt);
                }
            });
        }
        
    };
    
    return _module;
    
}();