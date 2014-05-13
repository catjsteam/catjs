/**
 * Demonstrates a very simple tab panel with 3 tabs
 */
Ext.define('Kitchensink.view.Tabs', {
    extend: 'Ext.tab.Panel',

    config: {
        ui: 'dark',
        itemId : "tabBar",
        tabBar: {
            ui: 'dark',
            layout: {
                pack: Ext.filterPlatform('ie10') ? 'start' : 'center'
            }
        },
        activeTab: 1,
        defaults: {
            scrollable: true
        },
        listeners : {
            painted: function (element, options) {
                /*
                 @[scrap
                 @@name setActiveTab3
                 @@run@ tabsManager
                 @@sencha changeTab("tabBar", 2);
                 ]@
                 */

                /*
                 @[scrap
                 @@name setActiveTab1
                 @@run@ tabsManager
                 @@sencha changeTab("tabBar", 0);
                 ]@
                 */

                /*
                 @[scrap
                 @@name setActiveTab2
                 @@run@ tabsManager
                 @@sencha changeTab("tabBar", 1);
                 ]@
                 */

                /*
                 @[scrap
                 @@name GoToDataViews
                 @@run@ tabsManager
                 @@sencha nestedlistSelect("mainNestedList", 2);
                 ]@
                 */

                /*
                 @[scrap
                 @@name GoToDataViewsBasic
                 @@run@ tabsManager
                 @@sencha nestedlistSelect("mainNestedList", 0);
                 ]@
                 */

                /*
                 @[scrap
                 @@name tabsManager
                 @@perform[
                 @@setActiveTab3 repeat(1)
                 @@setActiveTab1 repeat(1)
                 @@setActiveTab2 repeat(1)
                 @@GoToDataViews repeat(1)
                 @@GoToDataViewsBasic repeat(1)
                 ]
                 @@catui on
                 @@manager true
                 @@signal TESTEND
                 ]@
                 */
            }
        },
        items: [
            {
                title: 'Tab 1',
                html : 'By default, tabs are aligned to the top of a view.',
                cls: 'card dark',
                iconCls: Ext.theme.is.Blackberry || Ext.theme.is.CupertinoClassic || Ext.theme.is.Tizen ? 'home' : null
            },
            {
                title: 'Tab 2',
                html : 'A TabPanel can use different animations by setting <code>layout.animation.</code>',
                cls  : 'card',
                iconCls: Ext.theme.is.Blackberry || Ext.theme.is.CupertinoClassic|| Ext.theme.is.Tizen ? 'organize' : null
            },
            {
                title: 'Tab 3',
                html : '<span class="action">User tapped Tab 3</span>',
                cls  : 'card dark',
                iconCls: Ext.theme.is.Blackberry || Ext.theme.is.CupertinoClassic || Ext.theme.is.Tizen ? 'favorites' : null
            }
        ]
    }
});
