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

    return {

        actions: {


            scrollTo: function (idName) {

                $(document).ready(function(){
                    var stop = $('#' + idName).offset().top;
                    var delay = 1000;
                    $('body,html').animate({scrollTop: stop}, delay);

                    setBoarder( $('#' + idName).eq(0)[0]);
                });

            },



            scrollTop: function () {

                $(document).ready(function(){



                    $('html, body').animate({scrollTop : 0},1000);
                });

            },

            scrollToWithRapper : function (idName, rapperId) {

                $(document).ready(function(){
                    var stop = $('#' + idName).offset().top;
                    var delay = 1000;
                    $('#' + rapperId).animate({scrollTop: stop}, delay);
                    setBoarder( $('#' + idName).eq(0)[0]);
                });

            },

            clickRef: function (idName) {
                $(document).ready(function(){
                    $('#' + idName).trigger('click');
                    window.location = $('#' + idName).attr('href');

                    setBoarder( $('#' + idName).eq(0)[0]);
                });

            },


            clickButton: function (idName) {
                $(document).ready(function(){
                    $('.ui-btn').removeClass('ui-focus');
                    $('#' + idName).trigger('click');
                    $('#' + idName).closest('.ui-btn').addClass('ui-focus');

                    setBoarder( $('#' + idName).eq(0)[0]);
                });

            },

            selectTab: function (idName) {
                $(document).ready(function(){
                    $('#' + idName).trigger('click');

                    setBoarder( $('#' + idName).eq(0)[0]);
                });

            },



            selectMenu : function (selectId, value) {
                $(document).ready(function(){
                    if (typeof value === 'number') {
                        $("#" + selectId + " option[value=" + value + "]").attr('selected','selected');
                    } else if (typeof value === 'string') {
                        $("#" + selectId + " option[id=" + value + "]").attr('selected','selected');
                    }
                    $( "#" + selectId).selectmenu("refresh", true);

                    setBoarder( $('#' + selectId).eq(0)[0]);
                });

            },



            swipeItemLeft : function(idName) {
                $(document).ready(function(){
                    $("#" + idName).swipeleft();

                    setBoarder( $('#' + idName).eq(0)[0]);
                });
            },


            swipeItemRight : function(idName) {
                $(document).ready(function(){
                    $("#" + idName).swiperight();

                    setBoarder( $('#' + idName).eq(0)[0]);
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
                    $('#' + idName).trigger('click');

                    setBoarder( $('#' + idName).eq(0)[0]);
                });

            },

            setCheck: function (idName) {
                $(document).ready(function(){
                    $("#"+ idName).prop("checked",true).checkboxradio("refresh");

                    setBoarder( $('#' + idName).eq(0)[0]);
                });

            },

            slide : function (idName, value) {
                $(document).ready(function(){
                    $("#"+ idName).val(value).slider("refresh");

                    setBoarder( $('#' + idName).eq(0)[0]);
                });
            },

            setText : function (idName, value) {
                $(document).ready(function(){
                    $("#"+ idName).focus();
                    $("#"+ idName).val(value);
                    $("#"+ idName).trigger( 'change' );
                    $("#"+ idName).blur();

                    setBoarder( $('#' + idName).eq(0)[0]);
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
                    $('#' + idName).children( ".ui-collapsible-heading" ).children(".ui-collapsible-heading-toggle").click();

                    setBoarder( $('#' + idName).eq(0)[0]);
                });

            }

        }


    };

}();
