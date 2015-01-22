var animation = false;


_cat.plugins.jquery = function () {

    var _module = {

        utils: function () {

            var oldElement = "";

            return {
                
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

                        return ($ ? $(val) : undefined);

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
                    var e, idx = 0, size,
                        args = arguments,
                        elt = (args ? _cat.plugins.jquery.utils.getElt(args[0]) : undefined),
                        eventType = (args ? args[1] : undefined),
                        typeOfEventArgument = _cat.utils.Utils.getType(eventType);

                    if (elt && eventType) {
                        if (typeOfEventArgument === "string") {
                            elt.trigger(eventType);

                        } else if (typeOfEventArgument === "array" && typeOfEventArgument.length > 0) {
                            size = typeOfEventArgument.length;
                            for (idx = 0; idx < size; idx++) {
                                e = eventType[idx];
                                if (e) {
                                    elt.trigger(e);
                                }
                            }
                        }
                    }
                }
            };

        }(),

        actions: {


            scrollTo: function (idName) {

                $(document).ready(function () {
                    var elt = _cat.plugins.jquery.utils.getElt(idName),
                        stop = elt.offset().top,
                        delay = 1000;

                    $('body,html').animate({scrollTop: stop}, delay);

                    _cat.plugins.jquery.utils.setBoarder(elt.eq(0)[0]);
                });

            },


            scrollTop: function () {

                $(document).ready(function () {
                    $('html, body').animate({scrollTop: 0}, 1000);
                });

            },

            scrollToWithRapper: function (idName, rapperId) {

                $(document).ready(function () {
                    var elt = _cat.plugins.jquery.utils.getElt(idName),
                        stop = elt.offset().top,
                        delay = 1000;

                    _cat.plugins.jquery.utils.getElt(rapperId).animate({scrollTop: stop}, delay);
                    _cat.plugins.jquery.utils.setBoarder(_cat.plugins.jquery.utils.getElt(idName).eq(0)[0]);
                });

            },

            clickRef: function (idName) {
                $(document).ready(function () {
                    var elt = _cat.plugins.jquery.utils.getElt(idName);

                    elt.trigger('click');
                    window.location = elt.attr('href');

                    _cat.plugins.jquery.utils.setBoarder(elt.eq(0)[0]);
                });

            },


            clickButton: function (idName) {
                $(document).ready(function () {
                    var elt = _cat.plugins.jquery.utils.getElt(idName);

                    $('.ui-btn').removeClass('ui-focus');
                    elt.trigger('click');
                    elt.closest('.ui-btn').addClass('ui-focus');

                    _cat.plugins.jquery.utils.setBoarder(elt.eq(0)[0]);
                });

            },


            click: function (idName) {
                $(document).ready(function () {
                    var elt = _cat.plugins.jquery.utils.getElt(idName);
                    elt.trigger('click');

                    _cat.plugins.jquery.utils.setBoarder(elt.eq(0)[0]);
                });
            },


            setCheck: function (idName) {
                $(document).ready(function () {
                    var elt = _cat.plugins.jquery.utils.getElt(idName);

                    elt.prop("checked", true).checkboxradio("refresh");
                    _cat.plugins.jquery.utils.setBoarder(elt.eq(0)[0]);
                });

            },


            setText: function (idName, value) {
                $(document).ready(function () {
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


            checkRadio: function (className, idName) {
                $(document).ready(function () {
                    $("." + className).prop("checked", false).checkboxradio("refresh");
                    $("#" + idName).prop("checked", true).checkboxradio("refresh");


                    _cat.plugins.jquery.utils.setBoarder($("label[for='" + idName + "']").eq(0)[0]);

                });

            },

            collapsible: function (idName) {
                $(document).ready(function () {
                    var elt = _cat.plugins.jquery.utils.getElt(idName);

                    elt.children(".ui-collapsible-heading").children(".ui-collapsible-heading-toggle").click();
                    _cat.plugins.jquery.utils.setBoarder(elt.eq(0)[0]);
                });

            },

            backClick: function () {
                $(document).ready(function () {
                    $('[data-rel="back"]')[0].click();
                });
            }
        }
    };

    return _module;

}();
