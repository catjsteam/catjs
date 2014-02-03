Ext.define('Kitchensink.view.tablet.NestedList', {
    extend: 'Ext.NestedList',
    xtype: 'tabletnestedlist',

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
