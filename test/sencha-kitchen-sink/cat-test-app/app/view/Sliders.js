/**
 * Demonstrates a tabbed form panel. This uses a tab panel with 3 tabs - Basic, Sliders and Toolbars - each of which is
 * defined below.
 *
 * See this in action at http://dev.sencha.com/deploy/sencha-touch-2-b3/examples/kitchensink/index.html#demo/forms
 */
Ext.define('Kitchensink.view.Sliders', {
    extend: 'Ext.form.Panel',

    requires: [
        'Ext.field.Slider',
        'Ext.field.Toggle'
    ],

    config: {
        scrollable: true,
        xtype: 'formpanel',
        items: [
            {
                xtype: 'fieldset',
                defaults: {
                    labelWidth: '35%',
                    labelAlign: 'top'
                },

                listeners : {
                    painted: function(element, options) {

                        /*
                         @[scrap
                         @@name GoBack_FormPanel
                         @@run@ slidersManager
                         @@sencha nestedlistBack("mainNestedList");
                         ]@
                         */


                        /*
                         @[scrap
                         @@name GoToBottomTabs
                         @@run@ slidersManager
                         @@sencha nestedlistSelect("mainNestedList", 9);
                         ]@
                         */

                        /*
                         @[scrap
                         @@name slidersManager
                         @@perform[
                         @@setSimpleSlider repeat(1)
                         @@setMultiSlider repeat(1)
                         @@setToggleSlider repeat(1)
                         @@GoBack_FormPanel repeat(1)
                         @@GoToBottomTabs repeat(1)
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
                        xtype: 'sliderfield',
                        itemId: 'singleSlider',
                        name: 'thumb',
                        value: 20,
                        listeners : {
                            painted: function (element, options) {
                                /*
                                 @[scrap
                                 @@run@ slidersManager
                                 @@name setSimpleSlider
                                 @@sencha setSliderValue("singleSlider", 85);
                                 ]@
                                 */
                            }
                        },
                        label: 'Single Thumb'
                    },
                    {
                        xtype: 'sliderfield',
                        name: 'thumb',
                        value: 30,
                        disabled: true,
                        label: 'Disabled Single Thumb'
                    },
                    {
                        xtype: 'sliderfield',
                        itemId: 'multiSlider',
                        name: 'multithumb',
                        label: 'Multiple Thumbs',
                        listeners : {
                            painted: function (element, options) {
                                /*
                                 @[scrap
                                 @@name setMultiSlider
                                 @@run@ slidersManager
                                 @@sencha setSliderValues("multiSlider", 20, 50);
                                 ]@
                                 */
                            }
                        },
                        values: [10, 70]
                    },
                    {
                        xtype: 'togglefield',
                        itemId: 'toggleSlider',
                        listeners : {
                            painted: function (element, options) {
                                /*
                                 @[scrap
                                 @@name setToggleSlider
                                 @@run@ slidersManager
                                 @@sencha setToggle("toggleSlider", true);
                                 ]@
                                 */
                            }
                        },
                        name: 'toggle',
                        label: 'Toggle'
                    }
                ]
            }
        ]
    }
});
