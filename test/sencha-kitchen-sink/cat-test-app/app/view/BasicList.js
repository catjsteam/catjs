/**
 * Demonstrates how to create a simple List based on inline data.
 * First we create a simple Contact model with first and last name fields, then we create a Store to contain
 * the data, finally we create the List itself, which gets its data out of the Store
 */

Ext.define('Kitchensink.view.BasicList', {
    extend: 'Ext.Container',
    requires: ['Kitchensink.model.Contact'],
    config: {
        layout: Ext.os.deviceType == 'Phone' ? 'fit' : {
            type: 'vbox',
            align: 'center',
            pack: 'center'
        },
        cls: 'demo-list',
        items: [{
            width: Ext.os.deviceType == 'Phone' ? null : '50%',
            height: Ext.os.deviceType == 'Phone' ? null : '80%',
            xtype: 'list',
            itemId : 'basicList',
            listeners : {

                painted : function (element, eOpts) {
                    /*
                     @[scrap
                     @@name basicListScrollIndex15
                     @@run@ basicListManager
                     @@sencha scrollToListIndex("basicList", 15);
                     ]@
                     */

                    /*
                     @[scrap
                     @@name basicListScrollIndex60
                     @@run@ basicListManager
                     @@sencha scrollToListIndex("basicList", 50);
                     ]@
                     */

                    /*
                     @[scrap
                     @@name basicListScrollIndex30
                     @@run@ basicListManager
                     @@sencha scrollToListIndex("basicList", 30);
                     ]@
                     */

                    /*
                     @[scrap
                     @@name basicListSelect30
                     @@run@ basicListManager
                     @@sencha listSelectIndex("basicList", 30);
                     ]@
                     */

                    /*
                     @[scrap
                     @@name basicListSelect35
                     @@run@ basicListManager
                     @@sencha listSelectIndex("basicList", 35);
                     ]@
                     */

                    /*
                     @[scrap
                     @@name basicListManager
                     @@perform[
                     @@basicListScrollIndex15 repeat(1)
                     @@basicListScrollIndex60 repeat(1)
                     @@basicListScrollIndex30 repeat(1)
                     @@basicListSelect30 repeat(1)
                     @@basicListSelect35 repeat(1)
                     ]
                     @@catui on
                     @@manager true
                     @@signal TESTEND
                     ]@
                     */
                }
            },
            store: 'List',
            itemTpl: '{firstName} {lastName}'
        }]
    }
});
