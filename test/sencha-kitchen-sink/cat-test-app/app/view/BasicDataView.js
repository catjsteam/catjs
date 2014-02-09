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
                     @@sencha scrollBy("basicDataView", 500);
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
