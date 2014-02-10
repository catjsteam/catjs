Ext.define('Kitchensink.view.tablet.NestedList', {
    extend: 'Ext.NestedList',
    xtype: 'tabletnestedlist',
    listeners : {
        activate : function( newActiveItem, oldActiveItem, eOpts ) {
            debugger;
        },
        activateitemchange : function( newActiveItem, oldActiveItem, eOpts ) {
            debugger;
        },
        add : function( newActiveItem, oldActiveItem, eOpts ) {
            debugger;
        },
        back : function( newActiveItem, oldActiveItem, eOpts ) {
            debugger;
        },
        beforeload : function( newActiveItem, oldActiveItem, eOpts ) {
            debugger;
        },
        fullscreen : function( newActiveItem, oldActiveItem, eOpts ) {
            debugger;
        },
        itemtap : function(list, index, target, record, e, eOpts ) {
            debugger;
        }


    },
    platformConfig: [{
        theme: ['Blackberry'],
        toolbar: {
            ui: 'dark'
        }
    },{
        theme: ['CupertinoClassic'],
        toolbar: {
            ui: 'dark'
        }
    }]
});
