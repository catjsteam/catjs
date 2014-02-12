Ext.define('Kitchensink.view.BasicDataView', {
    extend: 'Ext.Container',
    requires: ['Kitchensink.model.Speaker'],
    config: {
        layout: 'fit',
        cls: 'ks-basic',
        itemId : 'basicDataViewLayout',
        items: [{
            xtype: 'dataview',
            itemId : 'basicDataView',
            scrollable: {
                direction: 'vertical'
            },
            listeners : {
                painted: function (element, options) {
                    /*
                     @[scrap
                     @@name scrollBy500
                     @@run@ basicDataViewManager
                     @@sencha scrollBy("basicDataView", 0, 500);
                     ]@
                     */

                    /*
                     @[scrap
                     @@name scrollBy1200
                     @@run@ basicDataViewManager
                     @@sencha scrollBy("basicDataView", 0, 1200);
                     ]@
                     */

                    /*
                     @[scrap
                     @@name scrollToEndBasic
                     @@run@ basicDataViewManager
                     @@sencha scrollToEnd("basicDataView");
                     ]@
                     */


                    /*
                     @[scrap
                     @@name scrollToTopBasic
                     @@run@ basicDataViewManager
                     @@sencha scrollToTop("basicDataView");
                     ]@
                     */

                    /*
                     @[scrap
                     @@name GoToDataViewsHorizontal
                     @@run@ basicDataViewManager
                     @@sencha nestedlistSelect("mainNestedList", 1);
                     ]@
                     */

                    /*
                     @[scrap
                     @@name basicDataViewManager
                     @@perform[
                     @@scrollBy500 repeat(1)
                     @@scrollToEndBasic repeat(1)
                     @@scrollBy1200 repeat(1)
                     @@scrollToTopBasic repeat(1)
                     @@GoToDataViewsHorizontal repeat(1)
                     ]
                     @@catui on
                     @@manager true
                     @@signal TESTEND
                     ]@
                     */
                }


            },
            cls: 'dataview-basic',
            itemTpl: '<div class="img" style="background-image: url({photo});"></div><div class="content"><div class="name">{first_name} {last_name}</div><div class="affiliation">{affiliation}</div></div>',
            store: 'Speakers'
        }]
    }
});
