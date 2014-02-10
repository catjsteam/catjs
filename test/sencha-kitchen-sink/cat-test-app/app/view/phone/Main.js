Ext.define('Kitchensink.view.phone.Main', {
    extend: 'Ext.dataview.NestedList',
    requires: ['Ext.TitleBar'],

    id: 'mainNestedList',

    config: {
        fullscreen: true,
        title: 'Hello2 Kitchen Sink',
        useTitleAsBackText: false,
        layout: {
            animation: {
                duration: 250,
                easing: 'ease-in-out'
            }
        },

        store: 'Demos',
        itemId : 'kitchenSinkMenu',
        listeners : {
            painted: function (element, options) {
                /*
                 @[scrap
                 @@name nestedlistSelect
                 @@sencha nestedlistSelect("kitchenSinkMenu", 0);
                 ]@
                 */
            }
        },
        toolbar: {
            id: 'mainNavigationBar',
            xtype: 'titlebar',
            docked: 'top',
            title: 'Hello Kitchen Sink',

            items: {
                xtype: 'button',
                id: 'viewSourceButton',
                hidden: true,
                align: 'right',
                ui: 'action',
                action: 'viewSource',
                text: 'Source'
            }
        }
    }
});
