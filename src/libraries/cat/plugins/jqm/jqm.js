var animation = false;


_cat.plugins.jqm = function () {

    var oldElement = "";
    var setBoarder = function(element) {
        if (oldElement) {

            oldElement.classList.remove("markedElement");
        }
        element.className = element.className + " markedElement";
        oldElement = element;
        
    };

    function _getElt(val) {
        var sign;
        if (_cat.utils.Utils.getType(val) === "string") {
            val = val.trim();
            sign = val.charAt(0);

            return ($ ? $(val) : undefined);

        } else if (_cat.utils.Utils.getType(val) === "object") {
            return val;
        }
    }

    /**
     * Trigger an event with a given object
     *
     * @param element {Object} The element to trigger from (The element JQuery representation id/class or the object itself)
     * @param eventType {String} The event type name
     *
     * @private
     */
    function _trigger() {
        var e, idx= 0, size,
            args = arguments,
            elt = (args ? _getElt(args[0]) : undefined),
            eventType = (args ? args[1] : undefined),
            typeOfEventArgument = _cat.utils.Utils.getType(eventType);

        if (elt && eventType) {
            if (typeOfEventArgument === "string") {
                elt.trigger(eventType);

            } else  if (typeOfEventArgument === "array" && typeOfEventArgument.length > 0) {
                size = typeOfEventArgument.length;
                for (idx=0; idx<size; idx++) {
                    e = eventType[idx];
                    if (e) {
                        elt.trigger(e);
                    }
                }
            }
        }
    }

    return {

        actions: {


            scrollTo: function (idName) {

                $(document).ready(function(){
                    var elt = _getElt(idName),
                        stop = elt.offset().top,
                        delay = 1000;

                    $('body,html').animate({scrollTop: stop}, delay);

                    setBoarder( elt.eq(0)[0]);
                });

            },



            scrollTop: function () {

                $(document).ready(function(){
                    $('html, body').animate({scrollTop : 0},1000);
                });

            },

            scrollToWithRapper : function (idName, rapperId) {

                $(document).ready(function(){
                    var elt = _getElt(idName),
                        stop = elt.offset().top,
                        delay = 1000;

                    _getElt(rapperId).animate({scrollTop: stop}, delay);
                    setBoarder( _getElt(idName).eq(0)[0]);
                });

            },

            clickRef: function (idName) {
                $(document).ready(function(){
                    var elt = _getElt(idName);

                    elt.trigger('click');
                    window.location = elt.attr('href');

                    setBoarder( elt.eq(0)[0]);
                });

            },


            clickButton: function (idName) {
                $(document).ready(function(){
                    var elt = _getElt(idName);

                    $('.ui-btn').removeClass('ui-focus');
                    elt.trigger('click');
                    elt.closest('.ui-btn').addClass('ui-focus');

                    setBoarder( elt.eq(0)[0]);
                });

            },

            selectTab: function (idName) {
                $(document).ready(function(){
                    var elt = _getElt(idName);
                    elt.trigger('click');

                    setBoarder( elt.eq(0)[0]);
                });

            },



            selectMenu : function (selectId, value) {
                $(document).ready(function(){
                    var elt = _getElt(selectId);
                    if (typeof value === 'number') {
                        elt.find(" option[value=" + value + "]").attr('selected','selected');
                    } else if (typeof value === 'string') {
                        elt.find(" option[id=" + value + "]").attr('selected','selected');
                    }
                    elt.selectmenu("refresh", true);

                    setBoarder( elt.eq(0)[0]);
                });

            },


            swipeItemLeft : function(idName) {
                $(document).ready(function(){
                    var elt = _getElt(idName);

                    elt.swipeleft();
                    setBoarder( elt.eq(0)[0]);
                });
            },


            swipeItemRight : function(idName) {
                $(document).ready(function(){
                    var elt = _getElt(idName);
                    elt.swiperight();

                    setBoarder( elt.eq(0)[0]);
                });
            },


            swipePageLeft : function() {
                $(document).ready(function(){
                    $( ".ui-page-active" ).swipeleft();

                });


            },


            swipePageRight : function() {
                $(document).ready(function(){

                    var prev = $( ".ui-page-active" ).jqmData( "prev" );

                });
            },


            click: function (idName) {
                $(document).ready(function(){
                    var elt = _getElt(idName);
                    elt.trigger('click');

                    setBoarder( elt.eq(0)[0]);
                });

            },

            setCheck: function (idName) {
                $(document).ready(function(){
                    var elt = _getElt(idName);

                    elt.prop("checked",true).checkboxradio("refresh");
                    setBoarder( elt.eq(0)[0]);
                });

            },

            slide : function (idName, value) {
                $(document).ready(function(){
                    var elt = _getElt(idName);

                    elt.val(value).slider("refresh");
                    setBoarder( elt.eq(0)[0]);
                });
            },

            setText : function (idName, value) {
                $(document).ready(function(){
                    var elt = _getElt(idName);

                    _trigger(elt, "mouseenter");
                    _trigger(elt, "mouseover");
                    _trigger(elt, "mousemove");
                    _trigger(elt, "focus");
                    _trigger(elt, "mousedown");
                    _trigger(elt, "mouseup");
                    _trigger(elt, "click");
                    elt.val(value);
                    _trigger(elt, "keydown");
                    _trigger(elt, "keypress");
                    _trigger(elt, "input");
                    _trigger(elt, "keyup");
                    _trigger(elt, "mousemove");
                    _trigger(elt, "mouseleave");
                    _trigger(elt, "mouseout");
                    _trigger(elt, "blur");



                    setBoarder( elt.eq(0)[0]);
                });
            },


            checkRadio: function (className, idName) {
                $(document).ready(function(){
                    $( "." + className ).prop( "checked", false ).checkboxradio( "refresh" );
                    $( "#" + idName ).prop( "checked", true ).checkboxradio( "refresh" );


                    setBoarder($("label[for='" + idName + "']").eq(0)[0]);

                });

            },

            collapsible : function(idName) {
                $(document).ready(function(){
                    var elt = _getElt(idName);

                    elt.children( ".ui-collapsible-heading" ).children(".ui-collapsible-heading-toggle").click();
                    setBoarder( elt.eq(0)[0]);
                });

            },

            backClick : function () {
                $(document).ready(function(){
                    $('[data-rel="back"]')[0].click();
                });
            },

            searchInListView : function (listViewId, newValue) {
                $(document).ready(function(){
                    var elt = _getElt(listViewId),
                        listView = elt[0],
                        parentElements = listView.parentElement.children,
                        form = parentElements[$.inArray( listView, parentElements ) - 1];

                    $( form ).find( "input" ).focus();
                    $( form ).find( "input" ).val(newValue);
                    $( form ).find( "input" ).trigger( 'change' );
                });
            }


        }


    };

}();
