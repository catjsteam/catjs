var animation = false;


_cat.plugins.jqm = function () {

    return {

        actions: {


            scrollTo: function (idName) {

                $(document).ready(function(){
                    $(document.body).animate({
                        'scrollTop':   $('#' + idName).offset().top
                    }, 1000);
                });

            },

            scrollTop: function () {

                $(document).ready(function(){
                    $('html, body').animate({scrollTop : 0},1000);
                });

            },

            clickRef: function (idName) {
                $(document).ready(function(){

                    $('#' + idName).trigger('click');
                    $.mobile.activePage.find('#' + idName).click();
                    window.location = $('#' + idName).attr('href');
                });

            },


            click: function (idName) {
                $(document).ready(function(){

                    $('#' + idName).trigger('click');

                });

            },



            setCheck: function (idName) {
                $(document).ready(function(){
                    $("#"+ idName).prop("checked",true).checkboxradio("refresh");
                });

            },

            slide : function (idName, value) {
                $(document).ready(function(){
                    $("#"+ idName).val(value).slider("refresh");
                });
            },

            setText : function (idName, value) {
                $(document).ready(function(){
                    $("#"+ idName).val(value);
                });
            },


            checkRadio: function (className, idName) {
                $(document).ready(function(){
                    $( "." + className ).prop( "checked", false ).checkboxradio( "refresh" );
                    $( "#" + idName ).prop( "checked", true ).checkboxradio( "refresh" );
                });

            }

        }


    };

}();
