Ext.define('Kitchensink.view.HorizontalDataView', {
    extend: 'Ext.Container',
    requires: ['Kitchensink.model.Speaker'],
    config: {
        layout: 'fit',
        cls: 'ks-basic',
        items: [{
            xtype: 'dataview',
            scrollable: 'horizontal',
            itemId : 'horizontalDataView',
            cls: 'dataview-horizontal',
            listeners : {
                painted: function (element, options) {
                    /*
                     @[scrap
                     @@name scrollByHorizontal500
                     @@run@ horizontalDataViewManager
                     @@sencha scrollBy("horizontalDataView", 500, 0);
                     ]@
                     */

                    /*
                     @[scrap
                     @@name scrollByHorizontal1200
                     @@run@ horizontalDataViewManager
                     @@sencha scrollBy("horizontalDataView", 1200, 0);
                     ]@
                     */

                    /*
                     @[scrap
                     @@name scrollToEndHorizontal
                     @@run@ horizontalDataViewManager
                     @@sencha scrollToEnd("horizontalDataView");
                     ]@
                     */


                    /*
                     @[scrap
                     @@name scrollToTopHorizontal
                     @@run@ horizontalDataViewManager
                     @@sencha scrollToTop("horizontalDataView");
                     ]@
                     */

                    /*
                     @[scrap
                     @@name GoBack_HorizontalDataView
                     @@run@ horizontalDataViewManager
                     @@sencha nestedlistBack("mainNestedList");
                     ]@
                     */


                    /*
                     @[scrap
                     @@name GoToCarousel
                     @@run@ horizontalDataViewManager
                     @@sencha nestedlistSelect("mainNestedList", 7);
                     ]@
                     */


                    /*
                     @[scrap
                     @@name horizontalDataViewManager
                     @@perform[
                     @@scrollByHorizontal500 repeat(1)
                     @@scrollToEndHorizontal repeat(1)
                     @@scrollByHorizontal1200 repeat(1)
                     @@scrollToTopHorizontal repeat(1)
                     @@GoBack_HorizontalDataView repeat(1)
                     @@GoToCarousel repeat(1)
                     ]
                     @@catui on
                     @@manager true
                     @@signal TESTEND
                     ]@
                     */
                }
            },
            inline: {
                wrap: false
            },
            itemTpl: '<div class="img" style="background-image: url({photo});"></div><div class="name">{first_name}<br/>{last_name}</div>',
            store: 'Speakers'
        }]
    }
});
