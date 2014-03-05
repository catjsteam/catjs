//remove manager
var getScrap = function (idName) {
    //var finalEditText = $('#example2')[0].outerHTML.replace(/<script>_cat.core.action(.*)<\/script>/g,"");
    var finalEditText = $('#' + idName)[0].outerHTML.replace(/<script>_cat.core.action(.*)<\/script>/g,"");
    finalEditText = finalEditText.replace(/\s*@@run@(.*)Manager/g,"");
    return finalEditText;
}

var setEditor = function(editorId, codeId ) {

    var editor = ace.edit(editorId);
    editor.setReadOnly(true);
    editor.setTheme("ace/theme/dreamweaver");
    editor.getSession().setMode("ace/mode/html");
    editor.getSession().setValue(getScrap(codeId));

}



$('#managerPage').ready(function(){

    setEditor("managerEditor", 'managerExample' );

    $('#tryManager').click(function() {
        location.reload();
    });


});


