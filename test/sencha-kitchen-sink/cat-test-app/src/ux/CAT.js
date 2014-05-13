
Ext.define('Ext.ux.CAT', {
    extend: 'Ext.Component',
    alias: 'cat',



    /**
     * Plugin initialization
     * @private
     */
    init: function(cmp) {

        cmp.addListener('painted',function(scraps) {
            //debugger;
        });
    }

});