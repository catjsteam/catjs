var animation = false;

_cat.plugins.jquery = function () {

    var _module = {

        utils: function () {

            var oldElement = "",
                _getargs = function(parentargs, autodetect) {
                    var args = [].slice.call(parentargs);
                    args.push(autodetect);

                    return args;
                };


            return {                              
                
                $: function() {
                    return _cat.utils.plugins.jqhelper.$();
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
                    var args = _getargs(arguments, "jquery");
                    return _cat.utils.plugins.jqhelper.getElt.apply(this, args);
                },
                
                trigger: function() {
                    var args = _getargs(arguments, "jquery");
                    return _cat.utils.plugins.jqhelper.trigger.apply(this, args);
                },
                
                setText: function() {
                    var args = _getargs(arguments, "jquery");
                    return _cat.utils.plugins.jqhelper.setText.apply(this, args);
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


            setText: function (idName, value, usevents) {
                _module.utils.setText(idName, value, usevents, function(elt) {
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
