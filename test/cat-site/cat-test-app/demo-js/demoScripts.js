$(document).ready(function(){

    //update editors
    var getScrap = function (idName) {
        //var finalEditText = $('#example2')[0].outerHTML.replace(/<script>_cat.core.action(.*)<\/script>/g,"");
        var finalEditText = $('#' + idName)[0].outerHTML.replace(/<script>_cat.core.action(.*)<\/script>/g,"");
        finalEditText = finalEditText.replace(/\s*@@run@(.*)Manager/g,"");
        return finalEditText;
    }

    var setEditor = function(editorId, codeId ) {

        var editor = ace.edit(editorId);
        editor.setReadOnly(true);
        editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/html");
        editor.getSession().setValue(getScrap(codeId));

    }

    setEditor("editor", 'example1' );
    setEditor("editor2", 'example2' );
    setEditor("editor3", 'example3' );
    setEditor("editor4", 'example4' );
    setEditor("editor5", 'example5' );
    setEditor("editor6", 'example6' );
    setEditor("editor7", 'example7' );
    setEditor("editor8", 'example8' );
    setEditor("editor9", 'example9' );
    setEditor("editor10", 'example10' );
    setEditor("editor11", 'example11' );
    setEditor("editor12", 'example12' );




    $(document).on('click', '#tryExample1', function () {



        /*
         @[scrap
         @@name scrollManager
         @@perform[
         @@scrollToButtons repeat(1)
         ]
         @@manager true
         @@signal TESTEND
         ]@
         */

    });

    $('#tryExample2').click(function() {

        /*
         @[scrap
         @@name setAsCheck2
         @@run@ checkManager

         @@jqm checkRadio("hRadio" , "radio-choice-c" );
         ]@
         */

        /*
         @[scrap
         @@name checkManager
         @@perform[
         @@setAsCheck repeat(1)
         @@setAsCheck2 repeat(1)
         ]
         @@manager true
         @@signal TESTEND
         ]@
         */


    });

    $('#tryExample3').click(function() {


        /*
         @[scrap
         @@name textManager
         @@perform[
         @@setText repeat(1)
         ]
         @@manager true
         @@signal TESTEND
         ]@
         */
    });

    $('#tryExample4').click(function() {



        /*
         @[scrap
         @@name buttonManager
         @@perform[
         @@BtnClick repeat(1)
         ]
         @@manager true
         @@signal TESTEND
         ]@
         */

    });

    $('#tryExample5').click(function() {



        /*
         @[scrap
         @@name collapsibleManager
         @@perform[
         @@collapsibleClick repeat(1)
         ]
         @@manager true
         @@signal TESTEND
         ]@
         */

    });

    $('#tryExample6').click(function() {


        /*
         @[scrap
         @@name checkboxManager
         @@perform[
         @@setCheckB repeat(1)
         ]
         @@manager true
         @@signal TESTEND
         ]@
         */

    });

    $('#tryExample7').click(function() {
        /*
         @[scrap
         @@name tabsManager
         @@perform[
         @@navTabSelect2 repeat(1)
         ]
         @@manager true
         @@signal TESTEND
         ]@
         */
    });

    $('#tryExample8').click(function() {
        /*
         @[scrap
         @@name sliderManager
         @@perform[
         @@slider25 repeat(1)
         ]
         @@manager true
         @@signal TESTEND
         ]@
         */
    });

    $('#tryExample9').click(function() {
        /*
         @[scrap
         @@name selectMenuManager
         @@perform[
         @@selectMenu2 repeat(1)
         ]
         @@manager true
         @@signal TESTEND
         ]@
         */
    });


    $('#tryExample10').click(function() {
        /*
         @[scrap
         @@name     swipeLeftManager
         @@perform[
         @@swipeMeLeft repeat(1)
         ]
         @@manager true
         @@signal TESTEND
         ]@
         */
    });


    $('#tryExample11').click(function() {
        /*
         @[scrap
         @@name     swipeRightManager
         @@perform[
         @@swipeMeRight repeat(1)
         ]
         @@manager true
         @@signal TESTEND
         ]@
         */
    });

    $('#tryExample12').click(function() {
        /*
         @[scrap
         @@name     radioManager
         @@perform[
         @@selectRadioOption3 repeat(1)
         ]
         @@manager true
         @@signal TESTEND
         ]@
         */
    });



});