var animation = false;


_cat.plugins.jqm = function () {

    var _module = {

        actions: {

            selectTab: function (idName) {
                _cat.plugins.jquery.utils.$()(document).ready(function(){
                    var elt =  _cat.plugins.jquery.utils.getElt(idName);
                    elt.trigger('click');

                    _cat.plugins.jquery.utils.setBoarder( elt.eq(0)[0]);
                });

            },

            selectMenu : function (selectId, value) {
                _cat.plugins.jquery.utils.$()(document).ready(function(){
                    var elt =  _cat.plugins.jquery.utils.getElt(selectId);
                    if (typeof value === 'number') {
                        elt.find(" option[value=" + value + "]").attr('selected','selected');
                    } else if (typeof value === 'string') {
                        elt.find(" option[id=" + value + "]").attr('selected','selected');
                    }
                    elt.selectmenu("refresh", true);

                    _cat.plugins.jquery.utils.setBoarder( elt.eq(0)[0]);
                });
            },

            swipeItemLeft : function(idName) {
                _cat.plugins.jquery.utils.$()(document).ready(function(){
                    var elt =  _cat.plugins.jquery.utils.getElt(idName);

                    elt.swipeleft();
                    _cat.plugins.jquery.utils.setBoarder( elt.eq(0)[0]);
                });
            },

            swipeItemRight : function(idName) {
                _cat.plugins.jquery.utils.$()(document).ready(function(){
                    var elt =  _cat.plugins.jquery.utils.getElt(idName);
                    elt.swiperight();

                    _cat.plugins.jquery.utils.setBoarder( elt.eq(0)[0]);
                });
            },

            swipePageLeft : function() {
                _cat.plugins.jquery.utils.$()(document).ready(function(){
                    _cat.plugins.jquery.utils.$()( ".ui-page-active" ).swipeleft();

                });
            },

            swipePageRight : function() {
                _cat.plugins.jquery.utils.$()(document).ready(function(){

                    var prev = _cat.plugins.jquery.utils.$()( ".ui-page-active" ).jqmData( "prev" );

                });
            },

            tap: function (idName) {
                _cat.plugins.jquery.utils.$()(document).ready(function(){
                    var elt =  _cat.plugins.jquery.utils.getElt(idName);
                    elt.trigger('tap');

                    _cat.plugins.jquery.utils.setBoarder( elt.eq(0)[0]);
                });
            },

            slide : function (idName, value) {
                _cat.plugins.jquery.utils.$()(document).ready(function(){
                    var elt =  _cat.plugins.jquery.utils.getElt(idName);

                    elt.val(value).slider("refresh");
                    _cat.plugins.jquery.utils.setBoarder( elt.eq(0)[0]);
                });
            },

            searchInListView : function (listViewId, newValue) {
                _cat.plugins.jquery.utils.$()(document).ready(function(){
                    var elt =  _cat.plugins.jquery.utils.getElt(listViewId),
                        listView = elt[0],
                        parentElements = listView.parentElement.children,
                        form = parentElements[_cat.plugins.jquery.utils.$().inArray( listView, parentElements ) - 1];

                    _cat.plugins.jquery.utils.$()( form ).find( "input" ).focus();
                    _cat.plugins.jquery.utils.$()( form ).find( "input" ).val(newValue);
                    _cat.plugins.jquery.utils.$()( form ).find( "input" ).trigger( 'change' );
                });
            }
        }
    };
    
    return _module;

}();
