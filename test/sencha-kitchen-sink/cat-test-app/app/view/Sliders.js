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
                                 @@name setSimpleSlider
                                 @@sencha setSliderValues("singleSlider", 20, 85);
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
                                 @@name setSimpleSlider
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
