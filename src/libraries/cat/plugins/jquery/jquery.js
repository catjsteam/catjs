var animation = false;


_cat.plugins.jquery = function () {

    var _module = {

        utils: function () {

            var oldElement = "";

            return {                              
                
                $: function() {
                    if (typeof $ !== "undefined") {
                        return $;
                    } else  if (typeof angular !== "undefined") {
                        return angular.element;
                    }
                    
                    return function(){};
                },
                
                setBoarder: function (element) {
                    if (oldElement) {

                        oldElement.classList.remove("markedElement");
                    }

                    if (element) {
                        element.className = element.className + " markedElement";
                    }
                    oldElement = element;

                },

                getElt: function (val) {
                    var sign;
                    if (_cat.utils.Utils.getType(val) === "string") {
                        val = val.trim();
                        sign = val.charAt(0);

                        return (_cat.plugins.jquery.utils.$() ? _cat.plugins.jquery.utils.$()(val) : undefined);

                    } else if (_cat.utils.Utils.getType(val) === "object") {
                        return val;
                    }
                },

                /**
                 * Trigger an event with a given object
                 *
                 * @param element {Object} The element to trigger from (The element JQuery representation id/class or the object itself)
                 * @param eventType {String} The event type name
                 *
                 * @private
                 */
                trigger: function () {
                    var e, newEvent, newEventOpt, idx = 0, size,
                        args = arguments,
                        elt = (args ? _cat.plugins.jquery.utils.getElt(args[0]) : undefined),
                        eventType = (args ? args[1] : undefined),
                        typeOfEventArgument = _cat.utils.Utils.getType(eventType),
                        typeOfEventArrayItem;

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
                    
                    if (elt && eventType) {
                        if (typeOfEventArgument === "string") {
                            elt.trigger(eventType);

                        } else if (typeOfEventArgument === "object") {
                            newEventOpt = getOpt(eventType.opt);
                            newEvent = _cat.plugins.jquery.utils.$().Event(eventType.type, newEventOpt);
                            elt.trigger(newEvent);

                        } else if (typeOfEventArgument === "array" && typeOfEventArgument.length > 0) {
                            size = typeOfEventArgument.length;
                            for (idx = 0; idx < size; idx++) {
                                e = eventType[idx];
                                if (e) {
                                    typeOfEventArrayItem = _cat.utils.Utils.getType(eventType);
                                    if (typeOfEventArrayItem === "string") {
                                     elt.trigger(e);
                                    } else {
                                        newEventOpt = getOpt(eventType.opt);
                                        newEvent = _cat.plugins.jquery.utils.$().Event(eventType.type, newEventOpt);
                                        elt.trigger(newEvent);
                                    }
                                    
                                }
                            }
                        }
                    }
                }
            };

        }(),

        actions: {


            scrollTo: function (idName) {

                _cat.plugins.jquery.utils.$()(document).ready(function () {
                    var elt = _cat.plugins.jquery.utils.getElt(idName),
                        stop = elt.offset().top,
                        delay = 1000;

                    _cat.plugins.jquery.utils.$()('body,html').animate({scrollTop: stop}, delay);

                    _cat.plugins.jquery.utils.setBoarder(elt.eq(0)[0]);
                });

            },


            scrollTop: function () {

                _cat.plugins.jquery.utils.$()(document).ready(function () {
                    _cat.plugins.jquery.utils.$()('html, body').animate({scrollTop: 0}, 1000);
                });

            },

            scrollToWithRapper: function (idName, rapperId) {

                _cat.plugins.jquery.utils.$()(document).ready(function () {
                    var elt = _cat.plugins.jquery.utils.getElt(idName),
                        stop = elt.offset().top,
                        delay = 1000;

                    _cat.plugins.jquery.utils.getElt(rapperId).animate({scrollTop: stop}, delay);
                    _cat.plugins.jquery.utils.setBoarder(_cat.plugins.jquery.utils.getElt(idName).eq(0)[0]);
                });

            },

            clickRef: function (idName) {
                _cat.plugins.jquery.utils.$()(document).ready(function () {
                    var elt = _cat.plugins.jquery.utils.getElt(idName);

                    elt.trigger('click');
                    window.location = elt.attr('href');

                    _cat.plugins.jquery.utils.setBoarder(elt.eq(0)[0]);
                });

            },


            clickButton: function (idName) {
                _cat.plugins.jquery.utils.$()(document).ready(function () {
                    var elt = _cat.plugins.jquery.utils.getElt(idName);

                    _cat.plugins.jquery.utils.$()('.ui-btn').removeClass('ui-focus');
                    elt.trigger('click');
                    elt.closest('.ui-btn').addClass('ui-focus');

                    _cat.plugins.jquery.utils.setBoarder(elt.eq(0)[0]);
                });

            },


            click: function (idName) {
                _cat.plugins.jquery.utils.$()(document).ready(function () {
                    var elt = _cat.plugins.jquery.utils.getElt(idName);
                    elt.trigger('click');

                    _cat.plugins.jquery.utils.setBoarder(elt.eq(0)[0]);
                });
            },


            setCheck: function (idName) {
                _cat.plugins.jquery.utils.$()(document).ready(function () {
                    var elt = _cat.plugins.jquery.utils.getElt(idName);

                    elt.prop("checked", true).checkboxradio("refresh");
                    _cat.plugins.jquery.utils.setBoarder(elt.eq(0)[0]);
                });

            },


            setText: function (idName, value) {
                _cat.plugins.jquery.utils.$()(document).ready(function () {
                    var elt = _cat.plugins.jquery.utils.getElt(idName);

                    _cat.plugins.jquery.utils.trigger(elt, "mouseenter");
                    _cat.plugins.jquery.utils.trigger(elt, "mouseover");
                    _cat.plugins.jquery.utils.trigger(elt, "mousemove");
                    _cat.plugins.jquery.utils.trigger(elt, "focus");
                    _cat.plugins.jquery.utils.trigger(elt, "mousedown");
                    _cat.plugins.jquery.utils.trigger(elt, "mouseup");
                    _cat.plugins.jquery.utils.trigger(elt, "click");
                    elt.val(value);
                    _cat.plugins.jquery.utils.trigger(elt, "keydown");
                    _cat.plugins.jquery.utils.trigger(elt, "keypress");
                    _cat.plugins.jquery.utils.trigger(elt, "input");
                    _cat.plugins.jquery.utils.trigger(elt, "keyup");
                    _cat.plugins.jquery.utils.trigger(elt, "mousemove");
                    _cat.plugins.jquery.utils.trigger(elt, "mouseleave");
                    _cat.plugins.jquery.utils.trigger(elt, "mouseout");
                    _cat.plugins.jquery.utils.trigger(elt, "blur");


                    _cat.plugins.jquery.utils.setBoarder(elt.eq(0)[0]);
                });
            },
            
            getValue: function(idName) {
                _cat.plugins.jquery.utils.$()(document).ready(function () {
                    var elt = _cat.plugins.jquery.utils.getElt(idName);
                    elt.val();
                });                
            },

            checkRadio: function (className, idName) {
                _cat.plugins.jquery.utils.$()(document).ready(function () {
                    _cat.plugins.jquery.utils.$()("." + className).prop("checked", false).checkboxradio("refresh");
                    _cat.plugins.jquery.utils.$()("#" + idName).prop("checked", true).checkboxradio("refresh");


                    _cat.plugins.jquery.utils.setBoarder(_cat.plugins.jquery.utils.$()("label[for='" + idName + "']").eq(0)[0]);

                });

            },

            collapsible: function (idName) {
                _cat.plugins.jquery.utils.$()(document).ready(function () {
                    var elt = _cat.plugins.jquery.utils.getElt(idName);

                    elt.children(".ui-collapsible-heading").children(".ui-collapsible-heading-toggle").click();
                    _cat.plugins.jquery.utils.setBoarder(elt.eq(0)[0]);
                });

            },

            backClick: function () {
                _cat.plugins.jquery.utils.$()(document).ready(function () {
                    _cat.plugins.jquery.utils.$()('[data-rel="back"]')[0].click();
                });
            }
        }
    };

    return _module;

}();
